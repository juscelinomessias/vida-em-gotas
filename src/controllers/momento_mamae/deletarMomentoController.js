const pool = require('../../config/conexao');
const s3 = require('../../config/s3Config');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Controller para excluir um momento mãe
const excluirMomentoMaeController = async (req, res) => {
    try {
        const { id } = req.params;

        // Inicia transação
        await pool.query('BEGIN');

        // Busca imagens associadas para exclusão no S3
        const imagensResult = await pool.query(
            'SELECT imagem FROM momento_mae WHERE id = $1',
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

        // Deleta registros no banco
        const result = await pool.query(
            'DELETE FROM momento_mae WHERE id = $1',
            [id]
        );

        if (result.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Momento não encontrado'
            });
        }

        // Commit da transação
        await pool.query('COMMIT');

        res.json({
            success: true,
            message: 'Momento e imagem excluídos com sucesso'
        });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Erro ao excluir momento:', err);
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir momento',
            error: err.message
        });
    }
};

module.exports = {
    excluirMomentoMaeController
};
