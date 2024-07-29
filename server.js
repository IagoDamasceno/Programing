const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { Pool } = require('pg'); // Cliente PostgreSQL

const app = express();

// Configuração do pool de conexão com o PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Use a variável de ambiente fornecida pelo Render
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(bodyParser.json());
app.use(express.static('public'));

// Rota de login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = $1 AND password = $2';
    pool.query(query, [username, password], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao verificar credenciais.' });
        }

        if (result.rows.length > 0) {
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
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;

    pool.query(query, [nome, chapa, data, ordem, tipoOcorrencia, subtipo, local, descricao, acao, recomendacao, status], (err) => {
        if (err) {
            return res.json({ message: 'Erro ao salvar o relatório.' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'iago.assis@convaco.com.br, raquel.silva@convaco.com.br',
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

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Use variáveis de ambiente para segurança
        pass: process.env.EMAIL_PASS
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
