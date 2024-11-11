// backend/routes/userRoutes.js
const express = require('express');
const User = require('../models/User');
const Athlete = require('../models/Athlete');
const router = express.Router();

// Rota para criar usuário e perfil de atleta juntos
router.post('/createUserAndAthlete', async (req, res) => {
  try {
    // Desestruturando os dados da requisição
    const { email, password, nome, idade, telefone, sexo, nivel, filial } = req.body;

    // Verificando se o email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Este email já está em uso.' });
    }

    // Criando o usuário
    const newUser = new User({ email, password });
    await newUser.save();

    // Criando o perfil de atleta
    const newAthlete = new Athlete({
      userId: newUser._id, // Associando o atleta ao usuário
      nome,
      idade,
      telefone,
      sexo,
      nivel,
      filial,
    });

    // Salvando o perfil de atleta
    await newAthlete.save();

    // Gerando o token JWT para o novo usuário
    const token = newUser.generateToken();

    // Respondendo com sucesso
    res.status(201).json({
      message: 'Usuário e perfil de atleta criados com sucesso!',
      user: newUser,
      athlete: newAthlete,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar usuário e perfil de atleta.' });
  }
});

module.exports = router;
