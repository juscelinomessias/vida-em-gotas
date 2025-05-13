const pool = require('../../config/conexao');
const path = require('path');
const s3 = require('../../config/s3Config');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp'); // para processar imagem

// Rota Web
const criarMomentomamaeWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_momentomamae', 'criar_momentosmamae.html'));
};

// Controller
const criarMomentoMaeController = async (req, res) => {
    const { destacada } = req.body;
    const arquivo = req.file;

    if (!arquivo) {
        return res.status(400).json({
            success: false,
            message: 'A imagem é obrigatória.'
        });
    }

    try {
        await pool.query('BEGIN');

        const nomeFinalImagem = `${uuidv4()}.webp`;

        // Processar imagem com sharp: converter e comprimir
        const imagemConvertida = await sharp(arquivo.buffer)
            .webp({ quality: 80 })
            .toBuffer();

        const params = {
            Bucket: 'vida-em-gotas',
            Key: nomeFinalImagem,
            Body: imagemConvertida,
            ContentType: 'image/webp'
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        const destacadaBool = destacada === 'true';

        const novoMomento = await pool.query(
            `INSERT INTO momento_mae (
                imagem, destacada, created_at, updated_at
             ) VALUES ($1, $2, NOW(), NOW()) RETURNING id`,
            [nomeFinalImagem, destacadaBool]
        );

        await pool.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Momento cadastrado com sucesso!',
            data: {
                id: novoMomento.rows[0].id,
                imagem: nomeFinalImagem,
                destacada: destacadaBool
            }
        });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Erro completo ao criar momento_mae:', {
            message: err.message,
            name: err.name,
            stack: err.stack,
            ...(err.code && { code: err.code }),
            ...(err.originalError && { originalError: err.originalError })
        });

        return res.status(500).json({
            success: false,
            message: 'Erro interno ao criar momento',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = {
    criarMomentomamaeWeb,
    criarMomentoMaeController
};
