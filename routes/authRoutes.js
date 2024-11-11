const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Supondo que seu modelo de usuário esteja em models/User.js
require('dotenv').config();

const router = express.Router();

// Rota de login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Verifica se o usuário existe
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Email ou senha incorretos' });
      }
  
      // Verifica se a senha está correta
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Email ou senha incorretos' });
      }
  
      // Gera o JWT
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      // Retorna o token no corpo da resposta
      res.status(200).json({
        message: 'Login bem-sucedido!',
        token,
      });
    } catch (err) {
      console.error('Erro no login:', err);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

module.exports = router;
