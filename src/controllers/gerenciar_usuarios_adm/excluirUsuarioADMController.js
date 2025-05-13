const pool = require('../../config/conexao');

// Excluir um usuário
const excluirUsuarioADMController = async (req, res) => {
    const { id } = req.params;

    try {
        // Verifica se o usuário existe e obtém seus dados
        const usuarioExistente = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        
        if (usuarioExistente.rowCount === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuário não encontrado.' 
            });
        }

        const usuario = usuarioExistente.rows[0];

        // Verifica se é o usuário admin padrão (pelo email)
        if (usuario.email === 'admin@email.com') {
            return res.status(400).json({ 
                success: false,
                message: 'Não é possível excluir o usuário administrador padrão do sistema.' 
            });
        }

        // Verifica quantos usuários existem
        const totalUsuarios = await pool.query('SELECT COUNT(*) FROM usuarios');
        const count = parseInt(totalUsuarios.rows[0].count);

        // Se houver apenas 1 usuário, não permite excluir
        if (count <= 1) {
            return res.status(400).json({ 
                success: false,
                message: 'Não é possível excluir o único usuário do sistema.' 
            });
        }

        // Exclui o usuário
        const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id, nome, email', [id]);

        return res.status(200).json({ 
            success: true,
            message: 'Usuário excluído com sucesso.',
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        return res.status(500).json({ 
            success: false,
            message: 'Erro ao excluir usuário.', 
            error: err.message 
        });
    }
};

module.exports = {
    excluirUsuarioADMController
};