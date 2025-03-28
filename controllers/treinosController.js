const Treino = require('../models/Treinos');
<<<<<<< HEAD

// Função para criar treino
exports.criarTreino = async (req, res) => {
  try {
    const novoTreino = await Treino.create(req.body);
    res.status(201).json({
      success: true,
      data: novoTreino,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Função para alterar um treino
=======
const Athlete = require('../models/Athlete');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configuração do multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('fotoTreino');

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: 'df6jf1tux',
  api_key: '653415176186939',
  api_secret: 'yJrfipebj0AEn67wGvVIHW-4MCg',
});

// Função para upload da imagem
const uploadImageToCloudinary = (fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    console.log(`📤 Uploading image: ${filename} to Cloudinary...`);
    cloudinary.uploader.upload_stream(
      { folder: 'treinos', public_id: filename },
      (error, result) => {
        if (error) {
          console.error('❌ Erro no upload da imagem:', error);
          return reject(error);
        }
        console.log(`✅ Imagem enviada com sucesso: ${result.secure_url}`);
        resolve(result);
      }
    ).end(fileBuffer);
  });
};

// Criar treino
exports.criarTreino = async (req, res) => {
  console.log('🆕 Criando novo treino...');
  upload(req, res, async (err) => {
    if (err) {
      console.error('❌ Erro ao fazer upload da imagem:', err.message);
      return res.status(400).json({ success: false, message: 'Erro ao fazer upload da imagem', error: err.message });
    }

    try {
      let fotoUrl = null;
      if (req.file) {
        console.log(`📸 Imagem recebida: ${req.file.originalname}`);
        const result = await uploadImageToCloudinary(req.file.buffer, `${Date.now()}-${req.file.originalname}`);
        fotoUrl = result.secure_url;
      }

      const { fases, ...treinoData } = req.body;
      console.log(`📋 Dados do treino recebidos:`, treinoData);

      const novoTreino = await Treino.create({
        ...treinoData,
        fotoTreino: fotoUrl || req.body.fotoTreino,
        fases: fases ? JSON.parse(fases) : [],
      });
      console.log(`✅ Treino criado com ID: ${novoTreino._id}`);

      const atletasParaAtualizar = await Athlete.find({ nivel: { $gte: novoTreino.nivel } });
      if (!novoTreino.polo) {
        await Athlete.updateMany(
          { nivel: { $gte: novoTreino.nivel } },
          { $push: { treinosPendentes: novoTreino._id } }
        );
        console.log(`📢 Treino adicionado a ${atletasParaAtualizar.length} atletas pendentes.`);
      }

      res.status(201).json({ success: true, data: novoTreino, message: 'Treino criado com sucesso' });
    } catch (error) {
      console.error('❌ Erro ao criar treino:', error);
      res.status(400).json({ success: false, message: 'Erro ao criar treino', error: error.message });
    }
  });
};

// Alterar treino
>>>>>>> 83aa3e6 (Salvando alterações locais antes do pull)
exports.alterarTreino = async (req, res) => {
  console.log('🔄 Atualizando treino...');
  const { id } = req.params;
  console.log(`📌 ID do treino: ${id}`);
  const atualizacoes = req.body;
  console.log(`✏️ Novos dados:`, atualizacoes);
  
  try {
    const treinoAtualizado = await Treino.findByIdAndUpdate(id, atualizacoes, { new: true });
    if (!treinoAtualizado) {
      console.warn('⚠️ Treino não encontrado');
      return res.status(404).json({ message: 'Treino não encontrado' });
    }
    console.log('✅ Treino atualizado com sucesso', treinoAtualizado);
    res.status(200).json({ message: 'Treino atualizado com sucesso', treino: treinoAtualizado });
  } catch (error) {
    console.error('❌ Erro ao atualizar treino:', error);
    res.status(500).json({ message: 'Erro ao atualizar treino', error });
  }
};

// Buscar treinos com filtros
exports.buscarTreinos = async (req, res) => {
  console.log('🔍 Buscando treinos...');
  console.log('📊 Filtros recebidos:', req.body);
  try {
<<<<<<< HEAD
    // Extrai os filtros da query string (parâmetros da URL)
    const { nivel, tipo, duracao } = req.query;

    // Cria um objeto de filtros com base nos parâmetros fornecidos
    let filtros = {};

    if (nivel) {
      filtros.nivel = nivel; // Filtra pelo nível, caso esteja presente
    }
    if (tipo) {
      filtros.tipo = tipo; // Filtra pelo tipo de treino, caso esteja presente
    }
    if (duracao) {
      filtros.duracao = { $lte: duracao }; // Filtra pela duração (menor ou igual a)
    }

    // Realiza a busca no banco de dados com os filtros aplicados
    const treinos = await Treino.find(filtros);

    // Retorna os treinos encontrados
    res.status(200).json(treinos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar os treinos' });
  }
};
=======
    const treinos = await Treino.find(req.body);
    console.log(`✅ ${treinos.length} treinos encontrados`);
    res.status(200).json(treinos);
  } catch (error) {
    console.error('❌ Erro ao buscar treinos:', error);
    res.status(500).json({ message: 'Erro ao buscar os treinos', error });
  }
};

// Buscar um treino pelo ID
exports.buscarTreino = async (req, res) => {
  console.log('🔍 Buscando treino específico...');
  const { treinoId } = req.params;
  console.log(`📌 ID do treino: ${treinoId}`);
  try {
    const treino = await Treino.findById(treinoId);
    if (!treino) {
      console.warn('⚠️ Treino não encontrado');
      return res.status(404).json({ message: 'Treino não encontrado' });
    }
    console.log('✅ Treino encontrado:', treino);
    res.status(200).json(treino);
  } catch (error) {
    console.error('❌ Erro ao buscar treino:', error);
    res.status(500).json({ message: 'Erro ao buscar treino', error });
  }
};

// Deletar treino
exports.deletarTreino = async (req, res) => {
  console.log('🗑️ Deletando treino...');
  const { treinoId } = req.params;
  console.log(`📌 ID do treino: ${treinoId}`);
  try {
    const treinoDeletado = await Treino.findByIdAndDelete(treinoId);
    if (!treinoDeletado) {
      console.warn('⚠️ Treino não encontrado');
      return res.status(404).json({ message: 'Treino não encontrado' });
    }
    console.log('✅ Treino deletado com sucesso');
    await Athlete.updateMany({}, { $pull: { treinosPendentes: treinoId, treinosConcluidos: treinoId } });
    console.log('🧹 Treino removido dos atletas');
    res.status(200).json({ message: 'Treino deletado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar treino:', error);
    res.status(500).json({ message: 'Erro ao deletar treino', error });
  }
};
>>>>>>> 83aa3e6 (Salvando alterações locais antes do pull)
