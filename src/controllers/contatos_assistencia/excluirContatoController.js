const pool = require('../../config/conexao');

// Excluir um contato
const excluirContatoController = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM contatos_assistencia WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Contato não encontrado.' });
        }

        res.json({ message: 'Contato excluído com sucesso.' });
    } catch (err) {
        console.error('Erro ao excluir contato:', err.message);
        res.status(500).json({ 
            message: 'Erro ao excluir contato.', 
            error: err.message 
        });
    }
};

module.exports = {
    excluirContatoController
};