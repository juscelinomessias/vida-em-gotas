const pool = require('../../../config/conexao');

const listarDoadorasAtivas = async (req, res) => {
    try {
        const query = `
            SELECT COUNT(*) AS total 
            FROM doadoras 
            WHERE situacao = TRUE
        `;
        const { rows } = await pool.query(query);
        res.json({ total: rows[0].total });
    } catch (error) {
        console.error('Erro ao buscar doadoras ativas:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const listarTotalLeiteHumano = async (req, res) => {
    try {
        const query = `
            SELECT COALESCE(SUM(quantidade_leite_mL), 0) AS total 
            FROM doadoras
            WHERE situacao = TRUE
        `;
        const { rows } = await pool.query(query);
        res.json({ total: rows[0].total });
    } catch (error) {
        console.error('Erro ao buscar total de leite humano:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

module.exports = {
    listarDoadorasAtivas,
    listarTotalLeiteHumano
}