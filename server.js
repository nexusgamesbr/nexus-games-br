const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors()); // Permite que o HTML acesse o servidor

// Simulando um banco de dados (em um projeto real, usaríamos MongoDB ou MySQL)
let usuariosDB = [];

// Rota de Cadastro
app.post('/registrar', async (req, res) => {
    const { usuario, senha } = req.body;

    if (usuariosDB.find(u => u.usuario === usuario)) {
        return res.status(400).json({ erro: "Usuário já existe!" });
    }

    // Criptografando a senha antes de salvar
    const senhaCripto = await bcrypt.hash(senha, 10);
    
    usuariosDB.push({ usuario, senha: senhaCripto });
    res.status(201).json({ mensagem: "Usuário criado com sucesso!" });
});

// Conquistas (exemplo simples, em um projeto real, isso seria mais complexo)
// Rota para salvar conquistas
app.post('/save-achievements', (req, res) => {
    const { usuario, conquistas } = req.body;
    const user = usuariosDB.find(u => u.usuario === usuario);

    if (user) {
        user.conquistas = conquistas;
        console.log(`Conquistas de ${usuario} atualizadas:`, conquistas);
        return res.json({ mensagem: "Sincronizado com sucesso!" });
    }
    res.status(404).json({ erro: "Usuário não encontrado" });
});

// Rota para BUSCAR conquistas (use isso no login)
app.get('/get-achievements/:usuario', (req, res) => {
    const user = usuariosDB.find(u => u.usuario === req.params.usuario);
    if (user) {
        return res.json(user.conquistas || {});
    }
    res.status(404).json({ erro: "Usuário não encontrado" });
});
// Rota de Login
app.post('/login', async (req, res) => {
    const { usuario, senha } = req.body;
    const user = usuariosDB.find(u => u.usuario === usuario);

    if (!user) {
        return res.status(400).json({ erro: "Usuário não encontrado!" });
    }

    // Comparando a senha digitada com a criptografada
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
        return res.status(400).json({ erro: "Senha incorreta!" });
    }

    res.json({ mensagem: `Bem-vindo, ${usuario}!` });
});

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));