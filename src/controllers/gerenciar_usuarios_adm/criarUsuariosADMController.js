const pool = require('../../config/conexao');
const path = require('path');
const bcrypt = require('bcrypt');

// Rota para a página de criação de usuários
const criarUsuariosADMWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_contatos_assistencia', 'criar_usuariosADM.html'));
};

// Criar um novo usuário
const criarUsuariosADMController = async (req, res) => {
    const { nome, email, senha } = req.body;

    // Validações de campos obrigatórios
    if (!nome || !nome.trim()) {
        return res.status(400).json({ 
            success: false,
            message: 'O campo Nome é obrigatório.' 
        });
    }
    
    if (!email || !email.trim()) {
        return res.status(400).json({ 
            success: false,
            message: 'O campo E-mail é obrigatório.' 
        });
    }

    if (!senha || senha.length < 6) {
        return res.status(400).json({ 
            success: false,
            message: 'A senha deve ter pelo menos 6 caracteres.' 
        });
    }

    try {
        // Verifica se o e-mail já está cadastrado
        const emailExistente = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );

        if (emailExistente.rowCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Este e-mail já está cadastrado.'
            });
        }

        // Criptografa a senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Insere o novo usuário no banco de dados
        const result = await pool.query(
            `INSERT INTO usuarios (nome, email, senha) 
             VALUES ($1, $2, $3) RETURNING id, nome, email, created_at`,
            [nome.trim(), email.trim(), senhaHash]
        );

        return res.status(201).json({ 
            success: true,
            message: 'Usuário criado com sucesso!',
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Erro ao criar usuário:', err);
        
        return res.status(500).json({ 
            success: false,
            message: 'Erro ao criar usuário.', 
            error: err.message 
        });
    }
};

module.exports = {
    criarUsuariosADMWeb,
    criarUsuariosADMController
};