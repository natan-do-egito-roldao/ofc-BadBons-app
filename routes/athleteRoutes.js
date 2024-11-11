// backend/routes/athleteRoutes.js
const express = require('express');
const Athlete = require('../models/Athlete');
const { protect } = require('../middleware/authMiddleware'); // Middleware de proteção
const router = express.Router();
const AthleteController = require('../controllers/AthleteController');
const User = require('../models/User'); // Importando o modelo de usuário
const bcrypt = require('bcrypt'); // Certifique-se de ter importado o bcrypt para o hash de senha


// Rota para criar um atleta e um usuário ao mesmo tempo
// Rota para criar um atleta e um usuário ao mesmo tempo
router.post('/', async (req, res) => {
    try {
      const { nome, idade, email, telefone, sexo, nivel, filial, password } = req.body;
  
      // Verificando se o email do usuário já existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Este email já está em uso.' });
      }
      
        // Log para mostrar a senha antes de ser criptografada
        console.log('Senha original:', password);

      // CRIPTOGRAFANDO SENHA
      //const hashedPassword = await bcrypt.hash(password, 10);  // 10 é o número de salt rounds

      // Criando o usuário com o email e senha fornecidos
      const newUser = new User({
        email,
        password, //: hashedPassword // Salvando a senha criptografada no banco de dados
      });
  
      await newUser.save(); // Salvando o usuário  
  
      // Criando o atleta com os dados fornecidos e associando ao usuário
      const newAthlete = new Athlete({
        nome,
        idade,
        email,
        telefone,
        sexo,
        nivel,
        filial,
        userId: newUser._id, // Associando o atleta ao usuário
      });
  
      await newAthlete.save(); // Salvando o atleta
  
      // Retornando a resposta com os dados do atleta e usuário
      res.status(201).json({
        message: 'Atleta e usuário criados com sucesso!',
        athlete: newAthlete,
        user: newUser,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao criar o atleta e o usuário.' });
    }
  });
  

// Rota para obter atletas com filtros e paginação
router.get('/', protect, async (req, res) => {
    try {
      // Paginação
      const page = parseInt(req.query.page) || 1; // Padrão: página 1
      const limit = parseInt(req.query.limit) || 10; // Padrão: 10 itens por página
      const skip = (page - 1) * limit;
  
      // Filtros (por exemplo, por nível ou idade)
      const filters = {};
      if (req.query.nivel) {
        filters.nivel = req.query.nivel;
      }
      if (req.query.idade) {
        filters.idade = { $gte: req.query.idade }; // Maior ou igual à idade fornecida
      }
  
      // Buscando atletas no banco de dados com os filtros e a paginação
      const athletes = await Athlete.find(filters)
        .skip(skip) // Pulando os primeiros 'skip' itens
        .limit(limit); // Limitando a quantidade de itens retornados
  
      // Contando o total de atletas para calcular o número de páginas
      const totalAthletes = await Athlete.countDocuments(filters);
  
      // Calculando o número total de páginas
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
