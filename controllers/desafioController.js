const Desafio = require('../models/Desafios');
const Ranking = require('../models/RankingSchema');
const Athlete = require('../models/Athlete');


// Função para criar treino
exports.criarDesafio = async (req, res) => {
  try {
    const novoDesafio = await Desafio.create(req.body);
    res.status(201).json({
      success: true,
      data: novoDesafio,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Função para alterar um treino
exports.alterarDesafio = async (req, res) => {
  const { id } = req.params; // ID do treino a ser alterado
  const atualizacoes = req.body; // Dados enviados no corpo da requisição

  try {
      // Busca o treino pelo ID e atualiza com os dados fornecidos
      const desafioAtualizado = await Desafio.findByIdAndUpdate(id, atualizacoes, { new: true });

      // Verifica se o treino foi encontrado
      if (!desafioAtualizado) {
          return res.status(404).json({ message: 'Desafio não encontrado' });
      }

      // Retorna o treino atualizado
      res.status(200).json({ message: 'Desafio atualizado com sucesso', Desafio: desafioAtualizado });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar o Desafio', error });
  }
};

// Função para buscar treinos com filtros
exports.buscarDesafio = async (req, res) => {
  try {
    // Extrai os filtros da query string (parâmetros da URL)
    const { nivel, tipo, duracao } = req.query;

    // Cria um objeto de filtros com base nos parâmetros fornecidos
    let filtros = {};

    if (nivel) {
      filtros.nivel = nivel; // Filtra pelo nível, caso esteja presente
    }
    if (tipo) {
      filtros.tipo = tipo; // Filtra pelo tipo de Desafio, caso esteja presente
    }
    if (duracao) {
      filtros.duracao = { $lte: duracao }; // Filtra pela duração (menor ou igual a)
    }

    // Realiza a busca no banco de dados com os filtros aplicados
    const desafios = await Desafio.find(filtros);

    // Retorna os treinos encontrados
    res.status(200).json(desafios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar os Desafios' });
  }
};

// função para declarar conclusão de desafio e adicionar pontos ao atleta

exports.concluirDesafio = async (req, res) => {
    try {
        const { desafiosId, atletaId } = req.body;

        // Encontrar o desafio correspondente
        const desafio = await Desafio.findById(desafiosId);
        if (!desafio) {
            return res.status(404).json({ success: false, message: 'Desafio não encontrado' });
        }

        // Encontrar o atleta correspondente
        const atleta = await Athlete.findById(atletaId);
        if (!atleta) {
            return res.status(404).json({ success: false, message: 'Atleta não encontrado' });
        }

        // Encontrar o ranking correspondente
        const ranking = await Ranking.findById(atleta.rankingCorrespondente);
        const rankingDupla = await Ranking.findById(atleta.rankingDuplaCorrespondente);

        // Encontrar o jogador correspondente no ranking individual
        const player = ranking.players.find(player => player.athlete.toString() === atletaId);

        // Encontrar o jogador correspondente no ranking de duplas
        const playerDupla = rankingDupla.players.find(player => player.athlete.toString() === atletaId);

        // Adicionar pontos ao jogador
        if (player) {
          player.points += 2; // Adiciona 2 pontos ao jogador no ranking individual
      }

      if (playerDupla) {
          playerDupla.points += 2; // Adiciona 2 pontos ao jogador no ranking de duplas
      }

        if (!ranking && !rankingDupla) {
            return res.status(404).json({ message: 'Ranking não encontrado.' });
        }

        if (!player && !playerDupla) {
            return res.status(404).json({ message: 'Jogador não encontrado no ranking.' });
        }

        // adiciona o desafio concluído como ultimo desafio concluido no atleta

        // VERIFICA SE O DESAFIO JÁ FOI CONCLUÍDO
        const desafioConcluido = atleta.desafiosConcluidos.some(d => d.toString() === desafiosId);
        if (desafioConcluido) {
          return res.status(404).json({ message: 'Desafio já concluído.' });
        }
        
        // Adiciona o desafio concluído ao atleta
        atleta.desafiosConcluidos.push(desafio);

        // Salvar as atualizações no ranking
        await atleta.save();
        await ranking.save();
        await rankingDupla.save();

        res.json({ success: true, message: 'Desafio concluído com  e adicionado a lista.', updatedRanking: ranking, updatedRankingDupla: rankingDupla, updateDesafios: atleta.desafiosConcluidos });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao concluir o desafio.', error: error.message });
    }
};


