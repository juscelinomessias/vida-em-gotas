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

const atualizarDepoimentoController = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: 'ID do depoimento é obrigatório' });
        }

        const nome_mae = req.body.nome_mae?.trim();
        const nome_crianca = req.body.nome_crianca?.trim();
        const depoimento = req.body.depoimento?.trim();
        const imagem_mae = req.body.imagem_mae?.trim();
        const destacado = req.body.destacado === 'true' || req.body.destacado === true;

        if (!nome_mae || !nome_crianca || !depoimento || destacado === undefined) {
            return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
        }

        // Atualiza dados principais
        const updateQuery = `
            UPDATE depoimentos SET
                nome_mae = $1,
                nome_crianca = $2,
                depoimento = $3,
                destacado = $4,
                imagem_mae = COALESCE($5, imagem_mae),
                updated_at = NOW()
            WHERE id = $6 
            RETURNING *
        `;

        const result = await client.query(updateQuery, [
            nome_mae,
            nome_crianca,
            depoimento,
            destacado,
            imagem_mae,
            id
        ]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Depoimento não encontrado' });
        }

        const depoimentoAtualizado = result.rows[0];

        // SE NOVAS IMAGENS FOREM ENVIADAS, REMOVE A ANTIGA IMAGEM DO S3
        if (req.files && req.files.length > 0 && req.body.imagensParaRemover === 'todas') {
            const imagensAntigas = await client.query(
                'SELECT imagem_mae FROM depoimentos WHERE id = $1',
                [id]
            );

            for (const img of imagensAntigas.rows) {
                if (img.imagem_mae) {
                    const deleteParams = {
                        Bucket: 'vida-em-gotas',
                        Key: img.imagem_mae
                    };

                    try {
                        await s3.send(new DeleteObjectCommand(deleteParams));
                    } catch (err) {
                        console.warn(`Erro ao deletar imagem antiga (${img.imagem_mae}):`, err.message);
                    }
                }
            }

            // Atualiza imagem_mae para null
            await client.query('UPDATE depoimentos SET imagem_mae = NULL WHERE id = $1', [id]);

            // Upload da nova imagem
            const novaImagem = req.files[0];
            const nomeFinalImagem = `${uuidv4()}.webp`;

            try {
                const imagemCompactada = await sharp(novaImagem.buffer)
                    .resize({ width: 1200 })       // Redimensiona para no máximo 1200px de largura
                    .webp({ quality: 70 })         // Comprime com qualidade ajustável
                    .toBuffer();

                await uploadParaS3(imagemCompactada, nomeFinalImagem, 'image/webp');

                await client.query(
                    `UPDATE depoimentos SET imagem_mae = $1 WHERE id = $2`,
                    [nomeFinalImagem, id]
                );
            } catch (error) {
                console.error('Erro ao processar imagem:', error);
            }
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Depoimento atualizado com sucesso',
            data: {
                ...depoimentoAtualizado,
                imagem_mae_url: depoimentoAtualizado.imagem_mae
                    ? `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${depoimentoAtualizado.imagem_mae}`
                    : null
            }
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao atualizar depoimento:', err);

        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar depoimento',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    } finally {
        client.release();
    }
};




const atualizarDepoimentoDestacada = async (req, res) => {
    try {
        const { id } = req.params;
        const { destacada } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({ 
                success: false,
                message: 'ID do depoimento é inválido.'
            });
        }

        if (typeof destacada !== 'boolean') {
            return res.status(400).json({ 
                success: false,
                message: 'O campo "destacada" deve ser booleano.'
            });
        }

        const result = await pool.query(
            'UPDATE depoimentos SET destacado = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [destacada, id] // CORREÇÃO AQUI
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Depoimento não encontrado.'
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'Depoimento atualizado com sucesso.',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao atualizar destaque do depoimento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno ao atualizar o depoimento.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};



module.exports = {
    editarDoadoraWeb,
    atualizarDepoimentoController,
    atualizarDepoimentoDestacada
};