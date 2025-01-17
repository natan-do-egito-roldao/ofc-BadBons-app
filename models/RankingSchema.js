const mongoose = require('mongoose');

// Schema do jogador dentro do ranking
const playerSchema = new mongoose.Schema({
  athlete: { type: mongoose.Schema.Types.ObjectId, ref: 'Athlete', required: true },
  nome: { type: String, required: true },
  points: { type: Number, default: 5 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  lastOpponent: { type: String, default: '' },
  lastResult: { type: String, default: '' },
  inChallenge: { type: Boolean, default: false }, // Campo para rastrear se o jogador está em um desafio
  winnerResponse: { type: Boolean, default: null }, // Campo para rastrear a resposta do vencedor
  loserResponse: { type: Boolean, default: null } // Campo para rastrear a resposta do perdedor
});

// Schema do ranking
const rankingSchema = new mongoose.Schema({
  category: { 
    type: String, 
    enum: ['Master 55+', 'Master 45+', 'Master 35+', 'Principal'], 
    required: true 
  },
  modality: { 
    type: String, 
    enum: ['SM', 'SF', 'DM', 'DF', 'DX'], 
    required: true 
  },
  players: [playerSchema], // Lista de jogadores com pontuações
  status: { type: Boolean, default: true } // Campo de status booleano
});

module.exports = mongoose.model('Ranking', rankingSchema);