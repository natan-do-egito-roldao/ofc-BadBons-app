// backend/app.js
const express = require('express');
const mongoose = require('./config/database');
require('dotenv').config();

const Ranking = require('./routes/rankingRoutes');
const athleteRoutes = require('./routes/athleteRoutes');
const authRoutes = require('./routes/authRoutes');
const filialRoutes = require('./routes/filialRoutes'); // Importa as rotas de Filial
const adminAuthRoutes = require('./routes/adminAuthRoutes'); // Rotas de login do admin
const treinoRoutes = require('./routes/treinosRoutes'); // Rotas de Treinos
const verifyAdminToken = require('./middleware/adminAuthMiddleware'); // Middleware para verificar o token do admin
const iniciarScheduler = require('./Scheduler'); // Certifique-se de usar o caminho correto
const Desafio = require('./routes/desafioRoutes');


const app = express();

// Permitir envio de dados JSON no corpo das requisições
app.use(express.json());

// Inicia o scheduler
iniciarScheduler();

// Rotas públicas
app.use('/api', adminAuthRoutes); // Login do admin
app.use('/api', authRoutes); // Autenticação do usuário

// Rotas protegidas por autenticação de admin
app.use('/api/ranking', Ranking);
app.use('/api/atletas', athleteRoutes);
app.use('/api/filiais', verifyAdminToken, filialRoutes);
app.use('/api/treinos', verifyAdminToken, treinoRoutes); 
app.use('/api/desafios', Desafio);

// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
