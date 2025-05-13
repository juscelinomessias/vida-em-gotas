const pool = require('../../config/conexao');

const destacarDuvidaController = async (req, res) => {
    const { id } = req.params;

    try {
        // Primeiro busca a dúvida para obter o valor atual de 'destacada'
        const duvida = await pool.query('SELECT destacada FROM duvidas WHERE id = $1', [id]);
        
        if (duvida.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Dúvida não encontrada' 
            });
        }

        // Inverte o valor booleano
        const novoStatus = !duvida.rows[0].destacada;

        // Atualiza no banco de dados
        const resultado = await pool.query(
            'UPDATE duvidas SET destacada = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [novoStatus, id]
        );

        return res.status(200).json({
            success: true,
            duvida: resultado.rows[0],
            message: `Dúvida ${novoStatus ? 'destacada' : 'removida dos destaques'} com sucesso`
        });

    } catch (error) {
        console.error('Erro ao destacar dúvida:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Erro interno no servidor ao destacar dúvida'
        });
    }
};

module.exports = {
    destacarDuvidaController
};