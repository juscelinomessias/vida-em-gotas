const pool = require('../../config/conexao');

// Obter um usuário específico
const obterUsuarioADMController = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({ 
                success: false,
                message: 'ID inválido' 
            });
        }

        const result = await pool.query(
            'SELECT id, nome, email, created_at FROM usuarios WHERE id = $1', 
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Usuário encontrado',
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Erro ao obter usuário:', err);
        return res.status(500).json({
            success: false,
            message: 'Erro no servidor ao obter usuário',
            error: err.message
        });
    }
};

module.exports = {
    obterUsuarioADMController
};