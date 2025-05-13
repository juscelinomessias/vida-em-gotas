const pool = require('../../config/conexao');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const s3 = require('../../config/s3Config');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

const criarDepoimentosWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_depoimentos', 'criar_depoimento.html'));
};

const criarDepoimentosController = async (req, res) => {
    const { nome_mae, nome_crianca, depoimento, destacado } = req.body;
    const imagensProcessadas = req.imagensProcessadas || [];

    if (!nome_mae || !nome_mae.trim()) {
        return res.status(400).json({ success: false, message: 'O campo Nome da mãe é obrigatório.' });
    }

    if (!nome_crianca || !nome_crianca.trim()) {
        return res.status(400).json({ success: false, message: 'O campo Nome da criança é obrigatório.' });
    }

    if (!depoimento || !depoimento.trim()) {
        return res.status(400).json({ success: false, message: 'O campo Depoimento é obrigatório.' });
    }

    if (!imagensProcessadas.length) {
        return res.status(400).json({ success: false, message: 'A imagem da mãe é obrigatória.' });
    }

    try {
        await pool.query('BEGIN');

        const imagem = imagensProcessadas[0];  // Apenas uma imagem será usada

        // Gerar nome único para imagem com .webp
        const nomeImagem = `${uuidv4()}.webp`;

        // Upload da imagem processada para o S3
        const params = {
            Bucket: 'vida-em-gotas',
            Key: nomeImagem,
            Body: imagem.buffer,
            ContentType: 'image/webp',
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        const destacadoBool = destacado === 'true';

        // Inserção no banco
        const result = await pool.query(
            `INSERT INTO depoimentos (
                nome_mae, nome_crianca, imagem_mae, depoimento, destacado, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
            [ nome_mae.trim(), nome_crianca.trim(), nomeImagem, depoimento.trim(), destacadoBool ]
        );

        await pool.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Depoimento criado com sucesso!',
            data: { id: result.rows[0].id }
        });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Erro ao criar depoimento:', err);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao criar depoimento',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = {
    criarDepoimentosWeb,
    criarDepoimentosController
};
