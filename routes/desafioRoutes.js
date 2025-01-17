const express = require('express');
const router = express.Router();
const verifyAdminTok = require('../middleware/adminAuthMiddleware');
const { criarDesafio, alterarDesafio, buscarDesafio, concluirDesafio } = require('../controllers/desafioController');

// Rota para criar um Desafio
router.post('/criar', criarDesafio, verifyAdminTok);

// Rota para buscar Desafio com filtros
router.get('/buscar', buscarDesafio, verifyAdminTok);

// Rota para alterar um Desafio
router.put('/:id', alterarDesafio, verifyAdminTok);

// rota para concluir desafio
router.post('/concluir-desafio', concluirDesafio);

module.exports = router;
