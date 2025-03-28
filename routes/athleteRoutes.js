// backend/routes/athleteRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const Athlete = require('../models/Athlete');
const Filial = require('../models/Filial');
const verifyAdminToken = require('../middleware/adminAuthMiddleware'); // Middleware para autenticação do admin
const router = express.Router();
const Treino = require('../models/Treinos');
const { Ranking, Aluno } = require('../models/RankingSchema');

// Rota para aluno declarar conclusão de um treino
router.post('/concluir-treino', async (req, res) => {
    try {
        const { alunoId, treinoId } = req.body;

        // Busca o aluno pelo ID
        const aluno = await Athlete.findById(alunoId);

<<<<<<< HEAD
        if (!aluno) {
            return res.status(404).json({
                success: false,
                message: 'Aluno não encontrado.',
=======
const upload = multer({ storage });

// Agora você pode usar o middleware `upload` em sua rota
router.put('/:id/foto-perfil', upload.single('fotoPerfil'), async (req, res) => {
    try {
      const { id } = req.params;
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Nenhuma imagem enviada.' });
      }
  
      const atleta = await Athlete.findById(id);
      if (!atleta) {
        return res.status(404).json({ success: false, message: 'Atleta não encontrado.' });
      }
  
      // Enviar a imagem para o Cloudinary
      console.log('Enviando imagem para o Cloudinary...', req.file.path);
      const result = await uploadImage(req.file.path, `${id}-foto-perfil`);
  
      // Atualiza a URL da imagem no banco de dados do atleta
      atleta.fotoPerfil = result.secure_url;
      await atleta.save();
  
      console.log('Rankings encontrados:', atleta.rankingCorrespondente);
      const ranking = await rankingSchema.findById(atleta.rankingCorrespondente);
  
      if (ranking) {
        console.log('Ranking encontrado:', ranking);
  
        if (!ranking.players || !Array.isArray(ranking.players)) {
          console.warn(`O ranking ${ranking._id} não tem jogadores ou o campo players não é um array.`);
        } else {
          const aluno = ranking.players.find(aluno => aluno.athlete.toString() === id);
  
          if (aluno) {
            aluno.fotoPerfil = result.secure_url;
            await ranking.save();
            console.log(`Foto de perfil atualizada para o atleta ${id} no ranking ${ranking._id}`);
          } else {
            console.warn(`Atleta ${id} não encontrado no ranking ${ranking._id}`);
          }
        }
      } else {
        console.warn(`Ranking não encontrado para o atleta com ID ${id}. Apenas a foto do atleta foi atualizada.`);
      }
  
      // Responde com a URL da imagem armazenada no Cloudinary
      res.status(200).json({
        success: true,
        message: 'Foto de perfil atualizada com sucesso! (Ranking atualizado se aplicável)',
        fotoPerfil: atleta.fotoPerfil,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Erro ao atualizar foto de perfil.', error: error.message });
    }
});

// Rota para deletar a foto de perfil do atleta
router.delete('/:id/foto-perfil', async (req, res) => {
    try {
        const { id } = req.params;
        const atleta = await Athlete.findById(id);
        if (!atleta) {
            return res.status(404).json({ success: false, message: 'Atleta não encontrado.' });
        }

        if (!atleta.fotoPerfil) {
            return res.status(400).json({ success: false, message: 'Este atleta não possui foto de perfil.' });
        }

        // Remove o arquivo da pasta 'uploads'
        const filePath = path.join(__dirname, '..', atleta.fotoPerfil);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove a referência da foto no banco de dados
        atleta.fotoPerfil = null;
        await atleta.save();

        res.status(200).json({ success: true, message: 'Foto de perfil removida com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao remover foto de perfil.', error: error.message });
    }
});

// Rota para solicitar a prova caso não tenha treinos pendentes
router.post('/:id/solicitar-prova', async (req, res) => {
    try {
        console.log('Solicitando prova...');
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID inválido.' });
        }

        const atleta = await Athlete.findById(id);
        if (!atleta) {
            return res.status(404).json({ success: false, message: 'Atleta não encontrado.' });
        }
        console.log(atleta);
        if (atleta.treinosPendentes.length === 0) {
            atleta.statusNivel = 'Aguardando Prova';
            await atleta.save();
            return res.status(200).json({
                success: true,
                message: 'Solicitação de prova registrada com sucesso.',
                status: atleta.statusNivel
>>>>>>> 83aa3e6 (Salvando alterações locais antes do pull)
            });
        }

        // verifica se o treino está na lista de pendentes ou já foi concluido
        const treinoJaConcluido = aluno.treinosConcluidos.includes(treinoId);
        const treinoPendente = aluno.treinosPendentes.includes(treinoId);

        if (treinoJaConcluido) {
            return res.status(400).json({
                success: false,
                message: 'Este treino já foi concluido',
            });
        }

        if (!treinoPendente) {
            return res.status(400).json({
                success: false,
                message: 'este treino não está na lista de pendentes.'
            });
        }

        // Adiciona o treino aos concluidos  e remove dos pendentes
        aluno.treinosConcluidos.push(treinoId);
        aluno.treinosPendentes = aluno.treinosPendentes.filter(
            (id) => id.toString() !== treinoId
        );

      // se todos os treinos pendens foram concluidos, altera o status para aguardando prova
      if (aluno.treinosPendentes.length === 0 && aluno.statusNivel !== 'Aguardando Prova') {
        aluno.statusNivel = 'Aguardando Prova';
    }

        // salva as alterações no banco de dados 
        await aluno.save();

        res.status(200).json({
            success: true,
            message: 'Treino concluido com sucess!.',
            treinosPendentes: aluno.treinosPendentes,
            treinosConcluidos: aluno.treinosConcluidos,
        });
    }catch (error) {
        res.status(500).json({
            success: false,
            message: 'error ao concluir o treino.',
            error: error.message,
        });
    }
});

// Aplicando o middleware de verificação do admin em todas as rotas apartir daqui
router.use(verifyAdminToken);

// rota para o profeesor avaliar o aluno
router.post('/revisar-aluno', async (req, res) => {
    try {
        const { alunoId, status, treinosReprovados } = req.body;

        //verifica se o aluno existe
        const aluno = await Athlete.findById(alunoId);
        if (!aluno) {
            return res.status(404).json({ success: false, message: 'Aluno não encontrado.'});
        }

        // atualiza o status do nivel do aluno
        aluno.statusNivel = status;

        if (status === 'Aprovado') {
      
            if (aluno.nivel < 3) {
                aluno.nivel += 1;
            }
      
            // Busca treinos do novo nível
            const novosTreinos = await Treino.find({ nivel: aluno.nivel });
      
            // Libera os treinos do novo nível
            const novosTreinosIds = novosTreinos.map((treino) => treino._id);
      
            // Atualiza os treinos pendentes com os novos treinos, sem sobrescrever os concluídos
            aluno.treinosPendentes = [
              ...new Set([...aluno.treinosPendentes, ...novosTreinosIds]), // Garante que não há duplicatas
            ];
      
            // Salva as alterações
            await aluno.save();
      
            return res.status(200).json({
              success: true,
              message: 'Prova concluída com sucesso. Nível atualizado.',
              novoNivel: aluno.nivel,
              treinosLiberados: novosTreinosIds,
            });
          } else {
            return res.status(400).json({ success: false, message: 'Status inválido.' });
          }
      

        // se o aluno for reprovado, move os treinos indicados como reprovado para pendentes
        if (status === 'Reprovado') {
            aluno.treinosPendentes = aluno.treinosPendentes.concat(treinosReprovados); // apenas os treinos reprovados
            // Remove os treinos reprovados dos concluídos
            aluno.treinosConcluidos = aluno.treinosConcluidos.filter(treino => !treinosReprovados.includes(treino.toString())  // Comparação correta entre ObjectId e string
        );
        }
        await aluno.save();
        res.status(200).json({ success: true, message: 'status do aluno atualizado'});
    }catch (error) {
        res.status(500).json({success: false, message: 'error ao revisar o aluno', error: error.message});
    }
});

// Rota para criar um atleta com autenticação de admin
router.post('/', verifyAdminToken, async (req, res) => {
    console.log("Requisição POST para criar atleta chegou!");

    try {
        // Desestruturando os dados enviados na requisição
        const { nome, idade, email, telefone, sexo, nivel = Number(req.body.nivel), filial, password } = req.body;

        if (!nome || !nivel) {
            return res.status(400).json({ success:false, message: 'nome e nivel são obrigatorios'})
        }


        // busca os treinos com base no nivel
        console.log('Nível fornecido:', nivel);
        const treinos = await Treino.find({ nivel: { $lte: nivel } });
        console.log('Treinos encontrados:', treinos);



        if (treinos.length === 0) {
            return res.status(404).json({ message: 'Nenhum treino encontrado' });
        }

        // Verificando se o filial fornecido existe
        const filialExistente = await Filial.findById(filial);
        if (!filialExistente) {
            return res.status(404).json({ error: 'Filial não encontrada' });
        }

        // Criptografando a senha antes de salvar no banco de dados
        const salt = await bcrypt.genSalt(10); // Gera o salt para a criptografia
        const hashedPassword = await bcrypt.hash(password, salt); // Criptografa a senha

        // Criando o atleta com os dados fornecidos
        const newAthlete = new Athlete({
            nome,
            idade,
            email,
            telefone,
            sexo,
            nivel,
            filial,
            password: hashedPassword, // Salva a senha criptografada
            treinosPendentes: treinos.map(treino => treino._id),
        });

        // Salvando o atleta no banco de dados
        await newAthlete.save();

        // Respondendo com sucesso
        res.status(201).json({
            message: 'Atleta criado com sucesso!',
            athlete: newAthlete,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao criar atleta.' });
    }
});

// Rota para obter atletas com filtros e paginação
router.get('/', verifyAdminToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filters = {};
        if (req.query.nivel) {
            filters.nivel = req.query.nivel;
        }
        if (req.query.idade) {
            filters.idade = { $gte: req.query.idade };
        }

        const athletes = await Athlete.find(filters)
            .skip(skip)
            .limit(limit);

        const totalAthletes = await Athlete.countDocuments(filters);
        const totalPages = Math.ceil(totalAthletes / limit);

        res.status(200).json({
            totalPages,
            currentPage: page,
            athletes,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao obter atletas.' });
    }
});

// Rota para obter um atleta específico
router.get('/:id', verifyAdminToken, async (req, res) => {
    try {
        const atleta = await Athlete.findById(req.params.id);
        if (!atleta) return res.status(404).json({ error: 'Atleta não encontrado' });
        res.status(200).json(atleta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para atualizar um atleta pelo ID
router.put('/:id', verifyAdminToken, async (req, res) => {
    try {
        const atletaAtualizado = await Athlete.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!atletaAtualizado) return res.status(404).json({ error: 'Atleta não encontrado' });
        res.status(200).json(atletaAtualizado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Rota para deletar um atleta pelo ID
router.delete('/:id', verifyAdminToken, async (req, res) => {
    try {
        const atletaDeletado = await Athlete.findByIdAndDelete(req.params.id);
        if (!atletaDeletado) return res.status(404).json({ error: 'Atleta não encontrado' });
        res.status(200).json({ message: 'Atleta deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
