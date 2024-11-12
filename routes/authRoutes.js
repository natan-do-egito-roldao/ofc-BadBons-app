// backend/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/Athlete'); // Modelo do usuário
const router = express.Router();

// Rota de login que valida email e senha
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verifica se o usuário existe no banco de dados
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Verifica se a senha do usuário está disponível para comparação
        if (!user.password) {
            return res.status(400).json({ message: 'Senha do usuário não está definida.' });
        }

        // Verifica se a senha corresponde à senha criptografada
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Senha incorreta' });
        }

        // Retorna uma mensagem de sucesso caso o email e a senha estejam corretos
        res.status(200).json({ message: 'Login realizado com sucesso', user: { id: user._id, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao fazer login' });
    }
});

module.exports = router;
