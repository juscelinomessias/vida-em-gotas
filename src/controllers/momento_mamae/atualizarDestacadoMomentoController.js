const pool = require('../../config/conexao');

const atualizarDestacadoMomentoMaeController = async (req, res) => {
    const { id } = req.params;
    let { destacada } = req.body;

    // Conversão explícita para boolean
    destacada = Boolean(destacada);

    try {
        const result = await pool.query(
            'UPDATE momento_mae SET destacada = $1 WHERE id = $2 RETURNING *',
            [destacada, id]
        );

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Erro ao atualizar destaque:', err);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao atualizar destaque'
        });
    }
};

module.exports = {
    atualizarDestacadoMomentoMaeController
};