// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware para verificar o token JWT
const protect = (req, res, next) => {
  let token;

  // Verificando o token no cabeçalho da requisição
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Pegando o token do cabeçalho
      token = req.headers.authorization.split(' ')[1];

      // Verificando o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Adicionando o id do usuário à requisição
      req.user = decoded;

      // Passando o controle para a próxima função
      next();
    } catch (err) {
      res.status(401).json({ message: 'Não autorizado. Token inválido.' });
    }
  }

  // Se não houver token
  if (!token) {
    res.status(401).json({ message: 'Não autorizado. Nenhum token fornecido.' });
  }
};

module.exports = { protect };


