const pool = require('../../../config/conexao');

const listarDuvidasFront = async (req, res) => {
    try {
        const query = `
            SELECT pergunta, resposta 
            FROM duvidas
            WHERE destacada = TRUE
            ORDER BY id
            LIMIT 6
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar perguntas frequentes:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

module.exports = {
    listarDuvidasFront
}