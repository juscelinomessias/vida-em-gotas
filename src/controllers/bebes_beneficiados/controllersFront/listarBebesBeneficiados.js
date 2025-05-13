const pool = require('../../../config/conexao');

const listarBebesBeneficiadosFront = async (req, res) => {
    try {
        const query = `
            SELECT COALESCE(SUM(total_bebes_beneficiados), 0) AS total 
            FROM bebes_beneficiados
        `;
        const { rows } = await pool.query(query);
        res.json({ total: rows[0].total });
    } catch (error) {
        console.error('Erro ao buscar bebês beneficiados:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

module.exports = {
    listarBebesBeneficiadosFront
}