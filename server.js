const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors());

// 1. CONEXÃO COM O BANCO DE DADOS
// Substitua 'SEU_USUARIO', 'SUA_SENHA' e o 'LINK_DO_CLUSTER' pelo que você copiou do MongoDB
const dbURI = "mongodb+srv://supergodmodeo_db_user:QE47pW7qv5IEAPjE@nexusgames.96iuubq.mongodb.net/?appName=nexusgames";

mongoose.connect(dbURI)
  .then(() => console.log("✅ Conectado ao MongoDB Atlas!"))
  .catch(err => console.error("❌ Erro ao conectar ao MongoDB:", err));

// 2. DEFINIÇÃO DO MODELO DE USUÁRIO
const userSchema = new mongoose.Schema({
    usuario: { type: String, unique: true, required: true },
    senha: { type: String, required: true },
    conquistas: { type: Object, default: { explorer: false, secret: false, lucky: false } }
});

const User = mongoose.model('User', userSchema);

// Modelo de backup
const Backup = mongoose.model('Backup', new mongoose.Schema({
  usuario: String,
  dados: String,
  atualizadoEm: { type: Date, default: Date.now }
}));

// Rota para salvar backup
app.post('/salvarBackup', async (req, res) => {
  const { usuario, backup } = req.body;
  if (!usuario) return res.status(400).send("Usuário não informado");

  await Backup.updateOne(
    { usuario },
    { dados: backup, atualizadoEm: new Date() },
    { upsert: true } // cria se não existir
  );

  res.send("Backup salvo no servidor!");
});

// Rota para carregar backup
app.get('/carregarBackup', async (req, res) => {
  const usuario = req.query.usuario;
  const backup = await Backup.findOne({ usuario });
  if (!backup) return res.send("{}");
  res.send(backup.dados);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));