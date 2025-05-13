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
        ContentType: mimetype || 'image/webp',
    };
    await s3.send(new PutObjectCommand(uploadParams));
};

// Página de edição
const editarDoadoraWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_doadoras', 'editar_doadoras.html'));
};

const atualizarOrientacaoController = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: 'ID da orientação é obrigatório' });
        }

        const titulo = req.body.titulo?.trim();
        const descricao = req.body.descricao?.trim();
        const video = req.body.video?.trim();
        const destacada = req.body.destacada === 'true' || req.body.destacada === true;

        if (!titulo || !descricao) {
            return res.status(400).json({ success: false, message: 'Título e descrição são obrigatórios' });
        }

        const updateQuery = `
            UPDATE orientacoes 
            SET 
                titulo = $1,
                descricao = $2,
                video = $3,
                destacada = $4,
                updated_at = NOW()
            WHERE id = $5
            RETURNING *
        `;

        const result = await client.query(updateQuery, [
            titulo,
            descricao,
            video || null,
            destacada,
            id
        ]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Orientação não encontrada' });
        }

        const orientacaoAtualizada = result.rows[0];

        // SE NOVAS IMAGENS FOREM ENVIADAS, REMOVE AS ANTIGAS DO S3 E DO BANCO
        if (req.files && req.files.length > 0 && req.body.imagensParaRemover === 'todas') {
            // Deletar imagens antigas do banco e do S3
            const imagensAntigas = await client.query(
                'SELECT imagem FROM orientacao_imagens WHERE orientacao_id = $1',
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

            await client.query('DELETE FROM orientacao_imagens WHERE orientacao_id = $1', [id]);

            // Upload das novas imagens com UUID e compactação
            for (const imagem of req.files) {
                try {
                    const nomeFinalImagem = `${uuidv4()}.webp`;

                    const imagemCompactada = await sharp(imagem.buffer)
                        .resize({ width: 1200 })       // Redimensiona para no máximo 1200px de largura (opcional)
                        .webp({ quality: 70 })         // Qualidade ajustável (menor valor = menor tamanho)
                        .toBuffer();

                    await uploadParaS3(imagemCompactada, nomeFinalImagem, 'image/webp');

                    await client.query(
                        `INSERT INTO orientacao_imagens (imagem, orientacao_id) VALUES ($1, $2)`,
                        [nomeFinalImagem, id]
                    );
                } catch (error) {
                    console.error('Erro ao processar imagem:', error);
                }
            }
        }

        const imagensResult = await client.query(
            'SELECT id, imagem FROM orientacao_imagens WHERE orientacao_id = $1',
            [id]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Orientação atualizada com sucesso',
            data: {
                ...orientacaoAtualizada,
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
const atualizarOrientacaoDestacada = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const { destacada } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({ 
                success: false,
                message: 'ID da orientação é inválido'
            });
        }

        if (typeof destacada !== 'boolean') {
            return res.status(400).json({ 
                success: false,
                message: 'O campo "destacada" deve ser booleano'
            });
        }

        await client.query('BEGIN');

        if (destacada) {
            // Remove destaque de todas as orientações antes de destacar a nova
            await client.query(`
                UPDATE orientacoes 
                SET destacada = FALSE, updated_at = NOW()
                WHERE destacada = TRUE
            `);
        }

        // Atualiza o destaque da orientação atual
        const result = await client.query(`
            UPDATE orientacoes 
            SET destacada = $1, updated_at = NOW()
            WHERE id = $2 
            RETURNING *
        `, [destacada, id]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ 
                success: false,
                message: 'Orientação não encontrada'
            });
        }

        await client.query('COMMIT');

        res.json({ 
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao atualizar destaque:', error);

        res.status(500).json({ 
            success: false,
            message: 'Erro interno ao atualizar destaque',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });

    } finally {
        client.release();
    }
};




module.exports = {
    editarDoadoraWeb,
    atualizarOrientacaoController,
    atualizarOrientacaoDestacada
};
