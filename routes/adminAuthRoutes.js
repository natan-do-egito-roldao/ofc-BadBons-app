// backend/routes/adminAuthRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

router.post('/admin-login', async (req, res) => {
    const { email, password } = req.body;

    // Verifica se o email e a senha são iguais aos definidos para o admin
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        // Gera o token JWT com a identificação de administrador
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ message: 'Login de administrador bem-sucedido', token });
    } else {
        return res.status(401).json({ message: 'Credenciais inválidas' });
    }
});

module.exports = router;
