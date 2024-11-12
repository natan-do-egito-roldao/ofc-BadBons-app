// backend/app.js
const express = require('express');
const mongoose = require('./config/database');
const athleteRoutes = require('./routes/athleteRoutes');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const filialRoutes = require('./routes/filialRoutes'); // importa as rotas de Filial
const adminAuthRoutes = require('./routes/adminAuthRoutes');  // Rota de login do admin
const verifyAdminToken = require('./middleware/adminAuthMiddleware'); // Middleware para verificar o token do admin



const app = express();
app.use(express.json()); // Para permitir o envio de dados JSON no corpo das requisições


// Rotas públicas de login do admin
app.use('/api', adminAuthRoutes);

app.use('/api/atletas', verifyAdminToken, athleteRoutes);  // Rota para criação e gestão de atletas

// Rota de autenticação (login)
app.use('/api', authRoutes);

app.use('/api/filiais', verifyAdminToken,  filialRoutes); // define o prefixo para as rotas de filial

const PORT = process.env.PORT || 3000; // Se não houver a variável de ambiente, usa 3000
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
