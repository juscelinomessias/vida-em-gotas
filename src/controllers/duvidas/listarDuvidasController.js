const pool = require('../../config/conexao');
const path = require('path');

// Rota para a página web
const listarDuvidasWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_duvidas', 'listar_duvidas.html'));
};

// Controlador para listar dúvidas com paginação
const listarDuvidasController = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Query para contar o total de dúvidas
        const countQuery = 'SELECT COUNT(*) AS total FROM duvidas';
        const countResult = await pool.query(countQuery);

        // Query para buscar as dúvidas
        const query = `
            SELECT * FROM duvidas 
            ORDER BY destacada DESC, created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(query, [limit, offset]);

        // Calcula o total de páginas
        const totalPaginas = Math.ceil(countResult.rows[0].total / limit);

        res.status(200).json({
            duvidas: result.rows,
            totalPaginas,
            paginaAtual: Number(page),
            totalDuvidas: countResult.rows[0].total
        });

    } catch (err) {
        console.error('Erro ao listar dúvidas:', err.message);
        res.status(500).json({ mensagem: 'Erro ao listar dúvidas' });
    }
};

module.exports = {
    listarDuvidasController,
    listarDuvidasWeb
};