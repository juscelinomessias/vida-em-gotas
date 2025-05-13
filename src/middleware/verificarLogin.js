const pool = require('../config/conexao');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

const verificarLogin = async (req, res, next) => {
    const { authorization } = req.headers;


    // Verifica se o token foi fornecido corretamente
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token não fornecido ou inválido!' });
    }

    // Extrai o token da string "Bearer <token>"
    const token = authorization.split(' ')[1];

    try {
        // Verifica a validade do token e extrai o id
        const decodedToken = jwt.verify(token, jwtSecret);

        // Consulta o banco de dados para verificar se o usuário existe
        const consultaId = await pool.query(
            'SELECT * FROM usuarios WHERE id = $1',
            [decodedToken.id]
        );

        // Verifica se o usuário foi encontrado
        if (consultaId.rowCount === 0) {
            return res.status(403).json({ message: 'Usuário não encontrado!' });
        }

        // Remove a senha do objeto usuário antes de armazená-lo na requisição
        const { senha, ...usuarioSemSenha } = consultaId.rows[0];

        req.usuario = usuarioSemSenha;


        next(); // Prossegue para a próxima função ou rota
    } catch (err) {
        console.error('🚫 Erro de autenticação:', err.message);

        // Verifica se o erro é devido à expiração do token
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado. Por favor, faça login novamente.' });
        }

        // Caso o erro seja outro (token inválido ou qualquer outra falha)
        return res.status(401).json({ message: 'Token inválido ou expirado!' });
    }
};

module.exports = {
    verificarLogin
};