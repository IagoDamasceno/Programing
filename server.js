const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('./database.sqlite');

app.use(express.static('public'));
app.use(bodyParser.json());

// Configuração do banco de dados
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        chapa TEXT,
        data TEXT,
        ordem TEXT,
        tipoOcorrencia TEXT,
        subtipo TEXT,
        local TEXT,
        descricao TEXT,
        acao TEXT,
        recomendacao TEXT,
        status TEXT
    )`);

    // Insere os usuários Iago e Raquel
    const insertUser = db.prepare(`INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`);
    insertUser.run('Iago', '123');
    insertUser.run('Raquel', '123');
    insertUser.finalize();
});

// Configuração do serviço de e-mail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'projetosdiversos95@gmail.com', // Altere para seu email
        pass: 'oxgl uyva kroa thdk' // Use a senha de aplicativo aqui
    }
});


// Rota de login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.get(query, [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao verificar credenciais.' });
        }

        if (row) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Usuário ou senha incorretos.' });
        }
    });
});

// Rota para envio de formulário
app.post('/submit', (req, res) => {
    const { nome, chapa, data, ordem, tipoOcorrencia, subtipo, local, descricao, acao, recomendacao, status } = req.body;
    
    const query = `INSERT INTO reports (nome, chapa, data, ordem, tipoOcorrencia, subtipo, local, descricao, acao, recomendacao, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [nome, chapa, data, ordem, tipoOcorrencia, subtipo, local, descricao, acao, recomendacao, status], function(err) {
        if (err) {
            return res.json({ message: 'Erro ao salvar o relatório.' });
        }

        const mailOptions = {
            from: 'projetosdiversos95@gmail.com', // Altere para seu email
            to: 'iago.assis@convaco.com.br, raquel.silva@convaco.com.br', // Altere para os emails dos destinatários
            subject: 'Novo Relatório de Ocorrência',
            text: `Nome: ${nome}\nChapa: ${chapa}\nData: ${data}\nOrdem de Serviço: ${ordem}\nTipo de Ocorrência: ${tipoOcorrencia}\nSubtipo: ${subtipo}\nLocal: ${local}\nDescrição: ${descricao}\nAção Tomada: ${acao}\nRecomendação: ${recomendacao}\nStatus: ${status}`
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                return res.json({ message: 'Relatório salvo, mas houve um erro ao enviar o e-mail.' });
            }
            res.json({ message: 'Relatório salvo e e-mail enviado com sucesso!' });
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
