const pool = require('../../config/conexao');
const path = require('path');
const s3 = require('../../config/s3Config');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const criarOrientacoesWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_orientacoes', 'criar_orientacoes.html'));
};

const criarOrientacoesController = async (req, res) => {
    const { titulo, descricao, video, destacada } = req.body;

    if (!titulo || !titulo.trim()) {
        return res.status(400).json({ success: false, message: 'O campo Título é obrigatório.' });
    }

    if (!descricao || !descricao.trim()) {
        return res.status(400).json({ success: false, message: 'O campo Descrição é obrigatório.' });
    }

    try {
        await pool.query('BEGIN');

        const destacadaBool = destacada === 'true';

        const novaOrientacao = await pool.query(
            `INSERT INTO orientacoes (
                titulo, descricao, video, destacada, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`,
            [titulo.trim(), descricao?.trim() || null, video?.trim() || null, destacadaBool]
        );

        const orientacao_id = novaOrientacao.rows[0].id;

        const imagensProcessadas = req.imagensProcessadas || [];

        // Processa as imagens e faz o upload para o S3
        for (const file of imagensProcessadas) {
            if (!file.nomeFinal || !file.buffer) {
                console.error("Imagem inválida:", file);
                continue;
            }

            // Gerar o nome final da imagem com UUID
            const nomeFinalImagem = `${uuidv4()}.webp`;

            const params = {
                Bucket: 'vida-em-gotas',
                Key: nomeFinalImagem, // Nome final gerado com UUID
                Body: file.buffer,
                ContentType: file.contentType || 'image/webp',
            };

            // Envia a imagem para o S3
            const command = new PutObjectCommand(params);
            await s3.send(command);

            // Registra o nome da imagem no banco de dados
            await pool.query(
                `INSERT INTO orientacao_imagens (
                    imagem, orientacao_id, created_at, updated_at
                ) VALUES ($1, $2, NOW(), NOW())`,
                [nomeFinalImagem, orientacao_id]
            );
        }

        await pool.query('COMMIT');

        return res.status(201).json({ 
            success: true,
            message: 'Orientação criada com sucesso!',
            data: { id: orientacao_id }
        });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Erro completo ao criar orientação:', {
            message: err.message,
            name: err.name,
            stack: err.stack,
            ...(err.code && { code: err.code }),
            ...(err.originalError && { originalError: err.originalError })
        });
        return res.status(500).json({ 
            success: false,
            message: 'Erro interno ao criar orientação',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = {
    criarOrientacoesWeb,
    criarOrientacoesController
};