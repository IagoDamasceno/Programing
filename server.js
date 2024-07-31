require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do pool de conexão com o banco de dados
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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

// Configuração do multer para upload de arquivos
const upload = multer({ dest: path.join(__dirname, 'uploads') });

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
app.post('/submit', upload.single('imagem'), async (req, res) => {
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

    const imagemPath = req.file ? req.file.path : null;
    let imagemBuffer;

    if (imagemPath) {
        try {
            // Converter a imagem para JPEG usando sharp
            imagemBuffer = await sharp(imagemPath)
                .jpeg()
                .toBuffer();
        } catch (err) {
            console.error('Erro ao processar a imagem:', err);
            return res.status(500).send('Erro ao processar a imagem.');
        }
    }

    try {
        const query = `
            INSERT INTO reports (
                nome, chapa, data, ordem_de_servico, tipo_ocorrencia,
                local_observado, descricao_evento, acao_tomada, recomendacao, status, imagem_path
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;
        const values = [
            nome, chapa, data, ordem_de_servico, tipo_ocorrencia,
            local_observado, descricao_evento, acao_tomada, recomendacao, status, imagemPath
        ];

        await pool.query(query, values);
        console.log('Dados inseridos com sucesso no banco de dados.');

        // Configuração do e-mail
        const mailOptions = {
            from: `"Sistema de Ocorrências" <${process.env.EMAIL_USER}>`,
            to: 'iago.assis@convaco.com.br, raquel.silva@convaco.com.br',
            subject: 'Novo Relatório de Ocorrência',
            html: `<p>Um novo relatório foi submetido:</p>
                   <p><strong>Nome:</strong> ${nome}</p>
                   <p><strong>Chapa:</strong> ${chapa}</p>
                   <p><strong>Data:</strong> ${data}</p>
                   <p><strong>Ordem de Serviço:</strong> ${ordem_de_servico}</p>
                   <p><strong>Tipo de Ocorrência:</strong> ${tipo_ocorrencia}</p>
                   <p><strong>Local Observado:</strong> ${local_observado}</p>
                   <p><strong>Descrição:</strong> ${descricao_evento}</p>
                   <p><strong>Ação Tomada:</strong> ${acao_tomada}</p>
                   <p><strong>Recomendação:</strong> ${recomendacao}</p>
                   <p><strong>Status:</strong> ${status}</p>`,
            attachments: imagemBuffer ? [{ filename: 'imagem.jpeg', content: imagemBuffer, cid: 'unique@image' }] : []
        };

        await transporter.sendMail(mailOptions);
        console.log('E-mail enviado com sucesso.');

        // Remove a imagem temporária após processamento
        if (imagemPath) {
            fs.unlink(imagemPath, (err) => {
                if (err) console.error('Erro ao remover a imagem temporária:', err);
            });
        }

        res.status(200).send('Relatório salvo e e-mail enviado.');
    } catch (err) {
        console.error('Erro ao processar o relatório:', err);
        res.status(500).send('Erro ao processar o relatório.');
    }
});

// Rota de logout
app.post('/logout', (req, res) => {
    // Lógica para encerrar a sessão do usuário
    res.status(200).send('Logout efetuado com sucesso.');
});

// Inicie o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
