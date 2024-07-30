require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do pool de conexão com o banco de dados
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // URL do banco de dados
    ssl: { rejectUnauthorized: false }
});

// Configuração do transporte de e-mail
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Rota de login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 AND password = $2',
            [username, password]
        );

        if (result.rows.length > 0) {
            res.status(200).send('Login bem-sucedido');
        } else {
            res.status(401).send('Usuário ou senha incorretos');
        }
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).send('Erro ao processar login');
    }
});

// Rota para processar o envio do formulário
app.post('/submit', async (req, res) => {
    const {
        nome,
        chapa,
        data,
        ordem_de_servico,
        tipo_ocorrencia,
        local_observado,
        descricao_evento,
        acao_tomada,
        recomendacao,
        status
    } = req.body;

    // Inserir dados no banco de dados
    try {
        const query = `
            INSERT INTO reports (
                nome, chapa, data, ordem_de_servico, tipo_ocorrencia,
                local_observado, descricao_evento, acao_tomada, recomendacao, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;
        const values = [
            nome, chapa, data, ordem_de_servico, tipo_ocorrencia,
            local_observado, descricao_evento, acao_tomada, recomendacao, status
        ];

        await pool.query(query, values);
        console.log('Dados inseridos com sucesso no banco de dados.');

        // Enviar e-mail
        const mailOptions = {
            from: `"Sistema de Ocorrências" <${process.env.EMAIL_USER}>`,
            to: 'iago.assis@convaco.com.br, raquel.silva@convaco.com.br',
            subject: 'Novo Relatório de Ocorrência',
            text: `Um novo relatório foi submetido:\n\nNome: ${nome}\nChapa: ${chapa}\nData: ${data}\nOrdem de Serviço: ${ordem_de_servico}\nTipo de Ocorrência: ${tipo_ocorrencia}\nLocal Observado: ${local_observado}\nDescrição: ${descricao_evento}\nAção Tomada: ${acao_tomada}\nRecomendação: ${recomendacao}\nStatus: ${status}`
        };

        await transporter.sendMail(mailOptions);
        console.log('E-mail enviado com sucesso.');

        res.status(200).send('Relatório salvo e e-mail enviado.');
    } catch (err) {
        console.error('Erro ao processar o relatório:', err);
        res.status(500).send('Erro ao processar o relatório.');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
