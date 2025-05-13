const pool = require('../../config/conexao');
const bcrypt = require('bcrypt');

const criarUsuariosController = async (req, res) => {
    const { nome, email, senha } = req.body;

    // Validação dos campos de entrada
    if(!nome || !nome.trim()){
        return res.status(400).json({ message: 'O campo Nome é obrigatório.' })
    };

    if(!email || !email.trim()){
        return res.status(400).json({ message: 'O campo E-mail é obrigatório.' })
    };

    if(!senha || !senha.trim()){
        return res.status(400).json({ message: 'O campo Senha é obrigatório.' })
    };

    try {
        // Verificar se o e-mail já está cadastrado
        const consultaEmail = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );

        if(consultaEmail.rowCount !== 0){
            return res.status(409).json({ message: 'O E-mail informado já está em uso.'});
        };

        // Criptografa a senha
        const senhaEncriptada = await bcrypt.hash(senha, 10);

        // Insere o novo Usuário do banco de dados
        const resultado = await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *',
            [nome, email, senhaEncriptada]
        );

        // Remover a senha do retorno usando spread
        const { senha: _, ...usuarioSemSenha } = resultado.rows[0];

        // Retorana o usuário criado
        return res.status(201).json(usuarioSemSenha)

    } catch (err) {
        console.error('Erro ao criar Usuário:', err.message);
        return res.status(500).json({ message: 'Erro ao criar Usuário'});
    }

};

module.exports = {
    criarUsuariosController
};