const pool = require('../../config/conexao');
const s3 = require('../../config/s3Config');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const excluirOrientacaoController = async (req, res) => {
    try {
        const { id } = req.params;

        // Inicia transação
        await pool.query('BEGIN');

        // Busca imagens associadas para exclusão no S3
        const imagensResult = await pool.query(
            'SELECT imagem FROM orientacao_imagens WHERE orientacao_id = $1', 
            [id]
        );
        const imagens = imagensResult.rows;

        // Deleta imagens no S3
        for (const img of imagens) {
            const deleteParams = {
                Bucket: 'vida-em-gotas',
                Key: img.imagem
            };

            try {
                await s3.send(new DeleteObjectCommand(deleteParams));
            } catch (s3Err) {
                console.warn(`Erro ao deletar imagem do S3 (${img.imagem}):`, s3Err.message);
                // continua mesmo que uma imagem falhe
            }
        }

        // Deleta registros das imagens no banco
        await pool.query(
            'DELETE FROM orientacao_imagens WHERE orientacao_id = $1', 
            [id]
        );

        // Deleta a orientação
        const result = await pool.query(
            'DELETE FROM orientacoes WHERE id = $1 RETURNING *', 
            [id]
        );

        if (result.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Orientação não encontrada'
            });
        }

        // Commit da transação
        await pool.query('COMMIT');

        res.json({
            success: true,
            message: 'Orientação e imagens excluídas com sucesso'
        });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Erro ao excluir orientação:', err);
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir orientação',
            error: err.message
        });
    }
};

module.exports = { excluirOrientacaoController };
