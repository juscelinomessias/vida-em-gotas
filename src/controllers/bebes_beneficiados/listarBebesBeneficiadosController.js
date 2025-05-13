const pool = require('../../config/conexao');
const path = require('path');

// Rota para a página web
const listarBebesBeneficiadosWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_bebes_beneficiados', 'listar_bebes_beneficiados.html'));
};

// Controlador para listar bebês beneficiados com paginação
const listarBebesBeneficiadosController = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM bebes_beneficiados ORDER BY id DESC LIMIT 1'
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Nenhum registro encontrado' });
        }
        
        // Retorna diretamente o objeto, sem encapsular
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    listarBebesBeneficiadosController,
    listarBebesBeneficiadosWeb
};