const pool = require('../../config/conexao');

const deletarDuvidasController = async (req, res) => {
    const { id } = req.params;

    try {
        const deletarDuvida = await pool.query(
            'DELETE FROM duvidas WHERE id = $1 RETURNING *',
            [id]
        );

        if (deletarDuvida.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Dúvida não encontrada' });
        }

        res.status(200).json({ mensagem: 'Dúvida excluída com sucesso' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ mensagem: 'Erro ao excluir dúvida' });
    }
};

module.exports = {
    deletarDuvidasController
};