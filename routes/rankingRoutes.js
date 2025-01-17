// routes/ranking.js
const express = require('express');
const Ranking = require('../models/RankingSchema'); // Importar o modelo de Ranking
const router = express.Router();
const Athlete = require('../models/Athlete');
const Configuracao = require('../models/Configuracao');
const mongoose = require('mongoose');
const verifyAdminToken = require('../middleware/adminAuthMiddleware');

// 2. Rota para cadastrar um jogador em um ranking
router.post('/adicionar-atleta', async (req, res) => {
  try {
    const { category, modality, athleteId } = req.body;
    console.log('Dados recebidos:', { category, modality, athleteId });

    // Encontrar o ranking correspondente
    const ranking = await Ranking.findOne({ category, modality });
    if (!ranking) {
      console.log('Ranking não encontrado.');
      return res.status(404).json({ message: 'Ranking não encontrado.' });
    }
    console.log('Ranking encontrado:', ranking);

    // Encontrar o atleta correspondente
    const athlete = await Athlete.findById(athleteId);
    if (!athlete) {
      console.log('Atleta não encontrado.');
      return res.status(404).json({ message: 'Atleta não encontrado.' });
    }
    console.log('Atleta encontrado:', athlete);

    // Verificar se o jogador já está no ranking
    const existingPlayer = ranking.players.find(player => player.athlete && player.athlete.toString() === athleteId);
    if (existingPlayer) {
      console.log('Jogador já cadastrado no ranking.');
      return res.status(400).json({ message: 'Jogador já cadastrado no ranking.' });
    }

    // Verificar a idade do jogador em relação à categoria
    const ageLimits = {
      'Master 55+': 55,
      'Master 45+': 45,
      'Master 35+': 35,
      'Principal': 18
    };
    if (athlete.idade < ageLimits[category]) {
      console.log(`Jogador não pode se cadastrar na categoria ${category} devido à idade.`);
      return res.status(400).json({ message: `Jogador não pode se cadastrar na categoria ${category} devido à idade.` });
    }

    // Verificar a modalidade e o sexo do jogador
    const modalitySexRestrictions = {
      'SM': 'Masculino',
      'SF': 'Feminino',
      'DM': 'Masculino',
      'DF': 'Feminino',
      'DX': 'MF'
    };
    const allowedSex = modalitySexRestrictions[modality];
    console.log(`Verificando sexo: athlete.sexo=${athlete.sexo}, allowedSex=${allowedSex}`);
    if (allowedSex !== 'MF' && athlete.sexo !== allowedSex) {
      console.log(`Jogador não pode se cadastrar na modalidade ${modality} devido ao sexo. ${athlete.sexo}`);
      return res.status(400).json({ message: `Jogador não pode se cadastrar na modalidade ${modality} devido ao sexo.` });
    }

    // Adicionar jogador
    const athleteObjectId = new mongoose.Types.ObjectId(athleteId);
    console.log(`Adicionando jogador com athleteObjectId=${athleteObjectId}`);
    ranking.players.push({ 
      athlete: athleteObjectId,
      nome: athlete.nome  
    });
    try {
      await ranking.save();
      console.log('Jogador adicionado ao ranking.');
    } catch (saveError) {
      console.error('Erro ao salvar o ranking:', saveError);
      return res.status(500).json({ message: 'Erro ao salvar o ranking.', error: saveError });
    }

    // Popular o ranking com os dados do schema Athlete
    await ranking.populate('players.athlete', 'nome id');
    console.log('Ranking populado com os dados do atleta.');

    // adiciona id do ranking a variavel ranking correspondente no schema de athlete
    if (allowedSex !== 'MF') {
      athlete.rankingCorrespondente = ranking._id;
      await athlete.save();
    } else {
      athlete.rankingDuplaCorrespondente = ranking._id;
      await athlete.save();
    }

    res.status(201).json({ message: 'Jogador adicionado ao ranking com sucesso!', ranking });
  } catch (error) {
    console.error('Erro ao adicionar jogador:', error);
    res.status(500).json({ message: 'Erro ao adicionar jogador.', error });
  }
});

// 3. Rota para desafiar adversários aleatórios
router.post('/desafiar', async (req, res) => {
  try {
    const { category, modality, athleteId } = req.body;

    // Encontrar o ranking correspondente
    const ranking = await Ranking.findOne({ category, modality }).populate('players.athlete', 'nome');
    if (!ranking) return res.status(404).json({ message: 'Ranking não encontrado.' });

    // Encontrar o desafiador
    const challenger = ranking.players.find(player => player.athlete._id.toString() === athleteId);
    if (!challenger) return res.status(404).json({ message: 'Desafiador não encontrado no ranking.' });

    // Verificar se o desafiador já está em um desafio
    if (challenger.inChallenge) {
      return res.status(400).json({ message: 'Você já está em um desafio.' });
    }

    // Selecionar adversário aleatório (diferente do desafiador, que não esteja em um desafio e que não seja o último oponente)
    const opponents = ranking.players.filter(player => 
      player.athlete._id.toString() !== athleteId && 
      !player.inChallenge && 
      player.nome !== challenger.lastOpponent
    );
    if (opponents.length === 0) return res.status(400).json({ message: 'Sem adversários disponíveis.' });

    const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];

    // Marcar ambos como em desafio
    challenger.inChallenge = true;
    randomOpponent.inChallenge = true;
    await ranking.save();

    res.json({
      message: 'Desafio iniciado.',
      challenger: challenger.nome,
      opponent: randomOpponent.athlete.nome,
    });
  } catch (error) {
    console.error('Erro ao iniciar o desafio:', error);
    res.status(500).json({ message: 'Erro ao iniciar o desafio.', error });
  }
});

// 4. Rota para concluir desafio e atualizar pontos
router.post('/concluir-desafio', async (req, res) => {
  try {
    const { category, modality, athleteId, winnerName, loserName } = req.body;

    // Encontrar o ranking correspondente
    const ranking = await Ranking.findOne({ category, modality });
    if (!ranking) return res.status(404).json({ message: 'Ranking não encontrado.' });

    // Encontrar o jogador correspondente
    const player = ranking.players.find(player => player.athlete._id.toString() === athleteId);
    if (!player) return res.status(404).json({ message: 'Jogador não encontrado no ranking.' });

    // Atualizar a resposta do jogador
    if (player.nome === winnerName) {
      player.winnerResponse = true;
      player.loserResponse = false;
    } else if (player.nome === loserName) {
      player.loserResponse = true;
      player.winnerResponse = false;
    } else {
      return res.status(400).json({ message: 'Nome do jogador não corresponde ao vencedor ou perdedor.' });
    }

    // Verificar se ambos os jogadores responderam
    const opponent = ranking.players.find(p => p.athlete._id.toString() !== athleteId && p.inChallenge);
    if (!opponent) return res.status(404).json({ message: 'Adversário não encontrado no ranking.' });

    // Verificar se ambos os jogadores responderam e se as respostas coincidem
    if (player.winnerResponse !== null && opponent.winnerResponse !== null) {
      if (player.winnerResponse && opponent.loserResponse) {
        // Atualizar pontuações
        player.points += 2;
        opponent.points -= 2;
        player.inChallenge = false;
        opponent.inChallenge = false;
        player.winnerResponse = null;
        opponent.loserResponse = null;
        player.lastOpponent = opponent.nome;
        opponent.lastOpponent = player.nome;
        await ranking.save();
        return res.json({ message: 'Desafio concluído com sucesso.', updatedRanking: ranking });
      } else if (player.loserResponse && opponent.winnerResponse) {
        // Atualizar pontuações
        opponent.points += 2;
        player.points -= 2;
        player.inChallenge = false;
        opponent.inChallenge = false;
        player.loserResponse = null;
        opponent.winnerResponse = null;
        player.lastOpponent = opponent.nome;
        opponent.lastOpponent = player.nome;
        await ranking.save();
        return res.json({ message: 'Desafio concluído com sucesso.', updatedRanking: ranking });
      } else {
        // Resetar respostas se não houver concordância
        player.winnerResponse = null;
        player.loserResponse = null;
        opponent.winnerResponse = null;
        opponent.loserResponse = null;
        return res.status(400).json({ message: 'As respostas não coincidem. Por favor, tente novamente.' });
      }
    }

    await ranking.save();
    res.json({ message: 'Resposta registrada. Aguardando resposta do adversário.' });
  } catch (error) {
    console.error('Erro ao concluir o desafio:', error);
    res.status(500).json({ message: 'Erro ao concluir o desafio.', error });
  }
});

// adicionando necessidade de token para acessar as rotas
router.use(verifyAdminToken);

// 1. Rota para criar um novo ranking
router.post('/criar', async (req, res) => {
  try {
    const { category, modality } = req.body;

    // Criar um novo ranking
    const ranking = new Ranking({ category, modality });
    await ranking.save();

    res.status(201).json({ message: 'Ranking criado com sucesso!', ranking });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar o ranking.', error });
  }
});

// 5. Atualiza o dia de reinício do ranking
router.post('/configurar-ranking', async (req, res) => {
  try {
    const { dia } = req.body;

    if (dia < 1 || dia > 31) {
      return res.status(400).json({ success: false, message: 'O dia deve estar entre 1 e 31.' });
    }

    // Atualiza ou cria a configuração no banco de dados
    const configuracao = await Configuracao.findOneAndUpdate(
      { chave: 'rankingDia' },
      { valor: dia },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: 'Dia de reinício configurado com sucesso!', configuracao });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao configurar o dia de reinício.', error: error.message });
  }
});

// 6. rota para ativar e desativar a rota de desafiar atleta
router.patch('/atualiza-status', async (req, res) => {
  try {
      const { rankingId, status } = req.body;

      const ranking = await Ranking.findById(rankingId);
      if (!ranking) {
          return res.status(404).json({ success: false, message: ' ranking não encontrado'});
      }

      ranking.status = status;
      await ranking. save();
      res.status(200).json({ success: true, message: `Ranking ${status ? 'ativado' : 'desativado'} com sucesso`});
  } catch (error) {
      res.status(500).json({ success: false, message: 'error ao atualizar status do ranking', error: error.message});
  }
});

module.exports = router;
