// backend/app.js
const express = require('express');
const mongoose = require('./config/database');
const athleteRoutes = require('./routes/athleteRoutes');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json()); // Para permitir o envio de dados JSON no corpo das requisições

app.use('/api/atletas', athleteRoutes); // Rotas de atletas

app.use('/api', authRoutes); // Defina o caminho para a rota de login

const PORT = process.env.PORT || 3000; // Se não houver a variável de ambiente, usa 3000
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
