const pool = require('../../config/conexao');
const path = require('path');

// Rota para criar momento mamae
const  listarMomentoMaeWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_momentomamae', 'listar_momentomamae.html'));
};

// API para retornar os dados em JSON
const listarMomentosMaeController = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, imagem, destacada, created_at FROM momento_mae ORDER BY created_at DESC');
        
        // Garante que o campo destacada seja boolean
        const momentos = result.rows.map(momento => ({
            ...momento,
            destacada: Boolean(momento.destacada) // Conversão explícita
        }));

        return res.status(200).json({
            success: true,
            data: momentos
        });
    } catch (err) {
        console.error('Erro ao listar momentos:', err);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao listar momentos'
        });
    }
};

const listarMomentosMaeFrontController = async (req, res) => {
    try {
        // Query que filtra APENAS os momentos destacados
        const query = `
            SELECT id, imagem, destacada, created_at 
            FROM momento_mae 
            WHERE destacada = true
            ORDER BY created_at DESC
        `;

        const result = await pool.query(query);

        return res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (err) {
        console.error('Erro ao listar momentos destacados:', err);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao listar momentos destacados'
        });
    }
};

module.exports = {
    listarMomentoMaeWeb,
    listarMomentosMaeController,
    listarMomentosMaeFrontController
};
