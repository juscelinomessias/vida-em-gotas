const pool = require('../../config/conexao');

const buscarNomeUsuarioController = async (req, res) => {
    const { id } = req.params; // O ID do usuário é passado como parâmetro na URL

    // Validação do ID
    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'ID do usuário inválido.' });
    }

    try {
        // Busca o nome do usuário no banco de dados
        const resultado = await pool.query(
            'SELECT nome FROM usuarios WHERE id = $1',
            [id]
        );

        // Verifica se o usuário foi encontrado
        if (resultado.rowCount === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Retorna o nome do usuário
        const nomeUsuario = resultado.rows[0].nome;
        return res.status(200).json({ success: true, nome: nomeUsuario });

    } catch (err) {
        console.error('Erro ao buscar nome do usuário:', err.message);
        return res.status(500).json({ message: 'Erro ao buscar nome do usuário.' });
    }
};

module.exports = {
    buscarNomeUsuarioController,
};