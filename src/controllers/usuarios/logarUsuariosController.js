require('dotenv').config();
const path = require('path');
const pool = require('../../config/conexao');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

// Rota para carregar a página do formulário
const logarUsuariosWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'login.html'));
};

const logarUsuariosController = async (req, res) => {
    const { email, senha } = req.body;

    // Validação dos campos de entrada
    if (!email || !email.trim()) {
        return res.status(400).json({ message: 'O campo E-mail é obrigatório.' });
    }

    if (!senha || !senha.trim()) {
        return res.status(400).json({ message: 'O campo Senha é obrigatório.' });
    }

    try {
        // Verifica se o e-mail já está cadastrado
        const consultaEmail = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );

        if (consultaEmail.rowCount === 0) {
            return res.status(400).json({ message: 'Usuário ou Senha inválidos' });
        }

        // Compara a Senha enviada pelo usuário com a senha do Banco de dados
        const senhaValida = await bcrypt.compare(senha, consultaEmail.rows[0].senha);

        if (!senhaValida) {
            return res.status(400).json({ message: 'Usuário ou Senha inválidos' });
        }

        const { senha: _, ...usuarioSemSenha } = consultaEmail.rows[0];

        // Gerando o token com expiração de 1 minuto
        const token = jwt.sign({ 
            id: usuarioSemSenha.id,
            nome: usuarioSemSenha.nome
        }, jwtSecret, { expiresIn: '4h' });

        // console.log('Token gerado:', token); // Log do token gerado

        // Decodificando o token para verificar a data de expiração
        const decoded = jwt.decode(token);
        // console.log('Token decodificado:', decoded); // Verificando a data de expiração

        // Retornando o token ao frontend
        return res.json({ token });

    } catch (err) {
        console.error('Erro ao logar Usuário:', err.message);
        return res.status(500).json({ message: 'Erro ao logar Usuário' });
    }
};

module.exports = {
    logarUsuariosController,
    logarUsuariosWeb
};
