const pool = require('../../config/conexao');

const listarUsuariosController = async (req, res) => {
    try {
        // Consulta para obter todos os usuários ordenador por nome
        const usuarios = await pool.query(
            'SELECT nome, email FROM usuarios ORDER BY nome'
        );

        // Retorna a lista de usuários
        return res.status(200).json(usuarios.rows);

    } catch (err) {
        console.error('Erro ao listar Usuários:', err.message);
        return res.status(500).json({ message: 'Erro ao listar Usuários'});
    }
};

module.exports = {
    listarUsuariosController
}