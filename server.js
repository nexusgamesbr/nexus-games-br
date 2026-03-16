const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors());

// 1. CONEXÃO COM O BANCO DE DADOS
// Substitua 'SEU_USUARIO', 'SUA_SENHA' e o 'LINK_DO_CLUSTER' pelo que você copiou do MongoDB
const dbURI = "mongodb+srv://supergodmodeo_db_user:GI32EbVXZ86pCVu1@nexusgames.pmdhf78.mongodb.net/?appName=nexusgames";

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

// 3. ROTA DE REGISTRO (CADASTRO)
app.post('/registrar', async (req, res) => {
    const { usuario, senha } = req.body;

    try {
        // Verifica se o usuário já existe no banco
        const usuarioExiste = await User.findOne({ usuario });
        if (usuarioExiste) {
            return res.status(400).json({ erro: "Este nome de usuário já está em uso." });
        }

        // Criptografa a senha
        const senhaCripto = await bcrypt.hash(senha, 10);
        
        // Salva o novo usuário
        const novoUsuario = new User({ usuario, senha: senhaCripto });
        await novoUsuario.save();

        res.status(201).json({ mensagem: "Conta criada com sucesso no banco de dados!" });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao salvar o usuário." });
    }
});

// 4. ROTA DE LOGIN
app.post('/login', async (req, res) => {
    const { usuario, senha } = req.body;

    try {
        const user = await User.findOne({ usuario });
        if (!user) {
            return res.status(400).json({ erro: "Usuário não encontrado." });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            return res.status(400).json({ erro: "Senha incorreta." });
        }

        res.json({ 
            mensagem: `Bem-vindo, ${usuario}!`,
            usuario: user.usuario,
            conquistas: user.conquistas 
        });
    } catch (err) {
        res.status(500).json({ erro: "Erro no servidor." });
    }
});

// 5. ROTA PARA SALVAR/SINCRONIZAR CONQUISTAS
app.post('/save-achievements', async (req, res) => {
    const { usuario, conquistas } = req.body;

    try {
        await User.findOneAndUpdate({ usuario }, { conquistas });
        res.json({ mensagem: "Conquistas sincronizadas na nuvem!" });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao sincronizar." });
    }
});

// 6. ROTA PARA BUSCAR CONQUISTAS
app.get('/get-achievements/:usuario', async (req, res) => {
    try {
        const user = await User.findOne({ usuario: req.params.usuario });
        if (user) {
            res.json(user.conquistas);
        } else {
            res.status(404).json({ erro: "Usuário não encontrado" });
        }
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar dados." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));