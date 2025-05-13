const pool = require('../../config/conexao');

const deletarDoadoraController = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id } = req.params;

        // Validação básica do ID
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ 
                success: false,
                message: 'ID inválido'
            });
        }

        await client.query('BEGIN');

        // Verifica se a doadora existe
        const doadoraExistente = await client.query(
            'SELECT id FROM doadoras WHERE id = $1',
            [id]
        );

        if (doadoraExistente.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ 
                success: false,
                message: 'Doadora não encontrada'
            });
        }

        // Deleta a doadora (isso automaticamente deletará enderecos e telefones)
        const result = await client.query(
            'DELETE FROM doadoras WHERE id = $1 RETURNING id, nome',
            [id]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(500).json({
                success: false,
                message: 'Falha ao deletar doadora'
            });
        }

        await client.query('COMMIT');
        
        return res.status(200).json({ 
            success: true,
            message: 'Doadora e dados relacionados removidos com sucesso',
            deletedDoadora: result.rows[0]
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao deletar doadora:', err);
        
        return res.status(500).json({
            success: false,
            message: 'Erro interno no servidor',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    } finally {
        client.release();
    }
};

module.exports = { deletarDoadoraController };