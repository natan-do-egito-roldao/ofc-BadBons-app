const express = require('express');
const router = express.Router();

const { criarTreino, alterarTreino, buscarTreinos } = require('../controllers/treinosController');

// Rota para criar um treino
router.post('/', criarTreino);

// Rota para buscar treinos com filtros
router.get('/buscar', buscarTreinos);

// Rota para alterar um treino
router.put('/:id', alterarTreino);

module.exports = router;
