const pool = require('../../config/conexao');

// Obter uma dúvida específica por ID (para o modal de edição)
const obterDuvidaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                id, 
                pergunta, 
                resposta, 
                destacada,
                created_at,
                updated_at
            FROM duvidas
            WHERE id = $1;
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Dúvida não encontrada' });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Erro ao obter dúvida:', error);
        res.status(500).json({ mensagem: 'Erro ao buscar dúvida' });
    }
};

module.exports = {
    obterDuvidaPorId
};