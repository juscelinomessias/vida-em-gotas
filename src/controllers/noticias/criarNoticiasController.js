const pool = require('../../config/conexao');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const s3 = require('../../config/s3Config');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

const criarNoticiasWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_noticias', 'criar_noticias.html'));
};

const criarNoticiasController = async (req, res) => {
    const { titulo, descricao, destacada } = req.body;
    const arquivos = req.uploadedFiles || req.files;
    const imagensProcessadas = req.imagensProcessadas || []; // Adicionado conforme solicitado

    // Validação dos campos obrigatórios
    if (!titulo || !titulo.trim()) {
        return res.status(400).json({ success: false, message: 'O campo Título é obrigatório.' });
    }
    
    if (!descricao || !descricao.trim()) {
        return res.status(400).json({ success: false, message: 'O campo Descrição é obrigatório.' });
    }

    try {
        await pool.query('BEGIN');
    
        const destacadaBool = destacada === 'true';
    
        // Criação da notícia no banco de dados
        const novaNoticia = await pool.query(
            `INSERT INTO noticias (
                titulo, descricao, destacada, created_at, updated_at)
             VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id`,
            [titulo.trim(), descricao.trim(), destacadaBool]
        );
    
        const noticia_id = novaNoticia.rows[0].id;
    
        const imagensProcessadas = req.imagensProcessadas || [];  // Usando imagens processadas conforme solicitado
    
        // Processa as imagens e faz o upload para o S3
        for (const file of imagensProcessadas) {
            if (!file.nomeFinal || !file.buffer) {
                console.error("Imagem inválida:", file);
                continue;  // Se a imagem não for válida, continua com a próxima
            }
    
            // Gerando o nome final da imagem com UUID e forçando o formato .webp
            const nomeFinalImagem = `${uuidv4()}.webp`;
    
            // Configuração do upload para o S3
            const params = {
                Bucket: 'vida-em-gotas',
                Key: nomeFinalImagem,  // Nome final gerado com UUID
                Body: file.buffer,
                ContentType: file.contentType || 'image/webp',  // Se o tipo de conteúdo não for fornecido, assume image/webp
            };
    
            // Envia a imagem para o S3
            const command = new PutObjectCommand(params);
            await s3.send(command);
    
            // Registra o nome da imagem no banco de dados
            await pool.query(
                `INSERT INTO noticia_imagens (
                    imagem, noticia_id, created_at, updated_at
                ) VALUES ($1, $2, NOW(), NOW())`,
                [nomeFinalImagem, noticia_id]
            );
        }
    
        await pool.query('COMMIT');
    
        return res.status(201).json({ 
            success: true,
            message: 'Notícia criada com sucesso!',
            data: { id: noticia_id }
        });
    
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Erro completo ao criar notícia:', {
            message: err.message,
            name: err.name,
            stack: err.stack,
            ...(err.code && { code: err.code }),
            ...(err.originalError && { originalError: err.originalError })
        });
        return res.status(500).json({ 
            success: false,
            message: 'Erro interno ao criar notícia',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
    
};

module.exports = {
    criarNoticiasWeb,
    criarNoticiasController
};