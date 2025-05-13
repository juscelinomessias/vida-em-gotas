const pool = require('../../config/conexao');

// Obter o único registro
const obterBebesBeneficiados = async (req, res) => {
    try {
        const query = `
            SELECT 
                id, 
                total_bebes_beneficiados,
                created_at,
                updated_at
            FROM bebes_beneficiados
            LIMIT 1;
        `;

        const result = await pool.query(query);

        if (result.rows.length === 0) {
            // Retorna um objeto vazio se não existir registro
            return res.status(200).json({
                id: null,
                total_bebes_beneficiados: 0,
                created_at: null,
                updated_at: null
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Erro ao obter bebês beneficiados:', error);
        res.status(500).json({ mensagem: 'Erro ao buscar registro' });
    }
};

module.exports = {
    obterBebesBeneficiados
};