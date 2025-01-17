const mongoose = require("mongoose");

const treinoSchema = new mongoose.Schema({
  nome: { type: String, required: true }, // Nome do treino
  descricao: { type: String, required: true }, // Breve descrição do treino
  nivel: { 
    type: Number, 
    required: true 
  }, // Nível do treino
  duracao: { type: Number, required: true }, // Duração em minutos
  tipo: { 
    type: String, 
    enum: ["ataque", "defesa", "dupla", "movimentação"], 
    required: true 
  }, // Tipo de treino
  videoUrl: { type: String }, // Opcional: link para vídeo explicativo
  dataCriacao: { type: Date, default: Date.now }, // Data de criação
});

module.exports = mongoose.model("Treino", treinoSchema);
