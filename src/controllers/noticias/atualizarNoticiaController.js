const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pool = require('../../config/conexao');
const s3 = require('../../config/s3Config');
const sharp = require('sharp');
const { DeleteObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

// Função para upload para o S3
const uploadParaS3 = async (buffer, fileName, mimetype) => {
    const uploadParams = {
        Bucket: 'vida-em-gotas',
        Key: fileName,
        Body: buffer,
        ContentType: mimetype,
        // ACL: 'public-read'
    };

    await s3.send(new PutObjectCommand(uploadParams));
};

// Página de edição
const editarDoadoraWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_doadoras', 'editar_doadoras.html'));
};

const atualizarNoticiaController = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: 'ID da orientação é obrigatório' });
        }

        const titulo = req.body.titulo?.trim();
        const descricao = req.body.descricao?.trim();
        const destacada = req.body.destacada === 'true' || req.body.destacada === true;

        if (!titulo || !descricao) {
            return res.status(400).json({ success: false, message: 'Título e descrição são obrigatórios' });
        }

        const updateQuery = `
            UPDATE noticias 
            SET 
                titulo = $1,
                descricao = $2,
                destacada = $3,
                updated_at = NOW()
            WHERE id = $4
            RETURNING *
        `;

        const result = await client.query(updateQuery, [
            titulo,
            descricao,
            destacada,
            id
        ]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Notícia não encontrada' });
        }

        const noticiaAtualizada = result.rows[0];

        // SE NOVAS IMAGENS FOREM ENVIADAS, REMOVE AS ANTIGAS DO S3 E DO BANCO
        if (req.files && req.files.length > 0 && req.body.imagensParaRemover === 'todas') {
            // Deletar imagens antigas do banco e do S3
            const imagensAntigas = await client.query(
                'SELECT imagem FROM noticia_imagens WHERE noticia_id = $1',
                [id]
            );
        
            for (const img of imagensAntigas.rows) {
                const deleteParams = {
                    Bucket: 'vida-em-gotas',
                    Key: img.imagem
                };
        
                try {
                    await s3.send(new DeleteObjectCommand(deleteParams));
                } catch (err) {
                    console.warn(`Erro ao deletar imagem antiga (${img.imagem}):`, err.message);
                }
            }
        
            await client.query('DELETE FROM noticia_imagens WHERE noticia_id = $1', [id]);

            for (const imagem of req.files) {
                try {
                    const nomeFinalImagem = `${uuidv4()}.webp`;

                    const imagemCompactada = await sharp(imagem.buffer)
                        .resize({ width: 1200 })       // Redimensiona para no máximo 1200px de largura
                        .webp({ quality: 70 })         // Comprime com qualidade ajustável
                        .toBuffer();

                    await uploadParaS3(imagemCompactada, nomeFinalImagem, 'image/webp');

                    await client.query(
                        `INSERT INTO noticia_imagens (imagem, noticia_id) VALUES ($1, $2)`,
                        [nomeFinalImagem, id]
                    );
                } catch (error) {
                    console.error('Erro ao processar imagem:', error);
                }
            }


        }
        

        // Busca imagens atualizadas
        const imagensResult = await client.query(
            'SELECT id, imagem FROM noticia_imagens WHERE noticia_id = $1',
            [id]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Notícia atualizada com sucesso',
            data: {
                ...noticiaAtualizada,
                imagens: imagensResult.rows.map(img => ({
                    id: img.id,
                    url: `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${img.imagem}`
                }))
            }
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao atualizar orientação:', err);

        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar orientação',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    } finally {
        client.release();
    }
};





// controllers/orientacaoController.js
const atualizarNoticiaDestacada = async (req, res) => {

    try {
        const { id } = req.params;
        const { destacada } = req.body;

        // 1. Validação dos parâmetros
        if (!id || isNaN(id)) {
            console.error('ID inválido:', id);
            return res.status(400).json({ 
                success: false,
                message: 'ID da notícia é inválido'
            });
        }

        if (typeof destacada !== 'boolean') {
            console.error('Valor de destaque inválido:', destacada);
            return res.status(400).json({ 
                success: false,
                message: 'O campo "destacada" deve ser booleano'
            });
        }

        // 2. Executa a query com verificação de resultados
        const result = await pool.query(
            'UPDATE noticias SET destacada = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [destacada, id]
        );

        // 3. Verifica se algum registro foi atualizado
        if (result.rowCount === 0) {
            console.error('Nenhum registro atualizado para o ID:', id);
            return res.status(404).json({ 
                success: false,
                message: 'Notícia não encontrada'
            });
        }

        res.json({ 
            success: true,
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Erro completo ao atualizar:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date()
        });
        
        res.status(500).json({ 
            success: false,
            message: 'Erro interno ao atualizar notícia',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    editarDoadoraWeb,
    atualizarNoticiaController,
    atualizarNoticiaDestacada
};