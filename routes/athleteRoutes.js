// backend/routes/athleteRoutes.js
const express = require('express');
const Athlete = require('../models/Athlete');

const router = express.Router();

// Criar um novo atleta
router.post('/', async (req, res) => {
    try {
        const novoAtleta = new Athlete(req.body);
        await novoAtleta.save();
        res.status(201).json(novoAtleta);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Buscar atletas com paginação e filtros
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, nome, nivel, sexo } = req.query; // Recebe parâmetros de consulta
        const query = {};

        if (nome) query.nome = { $regex: nome, $options: 'i' }; // Filtro por nome (case-insensitive)
        if (nivel) query.nivel = nivel;
        if (sexo) query.sexo = sexo;

        const atletas = await Athlete.find(query)
            .skip((page - 1) * limit) // Pular para a página solicitada
            .limit(limit) // Limitar o número de resultados por página
            .exec();

        const total = await Athlete.countDocuments(query); // Conta o total de atletas para a paginação

        res.json({
            atletas,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ler um atleta específico pelo ID
router.get('/:id', async (req, res) => {
    try {
        const atleta = await Athlete.findById(req.params.id);
        if (!atleta) return res.status(404).json({ error: 'Atleta não encontrado' });
        res.status(200).json(atleta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Atualizar um atleta pelo ID
router.put('/:id', async (req, res) => {
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

// Deletar um atleta pelo ID
router.delete('/:id', async (req, res) => {
    try {
        const atletaDeletado = await Athlete.findByIdAndDelete(req.params.id);
        if (!atletaDeletado) return res.status(404).json({ error: 'Atleta não encontrado' });
        res.status(200).json({ message: 'Atleta deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
