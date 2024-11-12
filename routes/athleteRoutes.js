// backend/routes/athleteRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const Athlete = require('../models/Athlete');
const Filial = require('../models/Filial');
const verifyAdminToken = require('../middleware/adminAuthMiddleware'); // Middleware para autenticação do admin
const router = express.Router();

// Aplicando o middleware de verificação do admin em todas as rotas
router.use(verifyAdminToken); // Agora todas as rotas desta rota estarão protegidas

// Rota para criar um atleta com autenticação de admin
router.post('/', verifyAdminToken, async (req, res) => {
    console.log("Requisição POST para criar atleta chegou!");

    try {
        // Desestruturando os dados enviados na requisição
        const { nome, idade, email, telefone, sexo, nivel, filial, password } = req.body;

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
            password: hashedPassword // Salva a senha criptografada
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
