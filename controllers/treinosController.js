const Treino = require('../models/Treinos');

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
exports.alterarTreino = async (req, res) => {
  const { id } = req.params; // ID do treino a ser alterado
  const atualizacoes = req.body; // Dados enviados no corpo da requisição

  try {
      // Busca o treino pelo ID e atualiza com os dados fornecidos
      const treinoAtualizado = await Treino.findByIdAndUpdate(id, atualizacoes, { new: true });

      // Verifica se o treino foi encontrado
      if (!treinoAtualizado) {
          return res.status(404).json({ message: 'Treino não encontrado' });
      }

      // Retorna o treino atualizado
      res.status(200).json({ message: 'Treino atualizado com sucesso', treino: treinoAtualizado });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar o treino', error });
  }
};

// Função para buscar treinos com filtros
exports.buscarTreinos = async (req, res) => {
  try {
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
