const pool = require('../../config/conexao');
const bcrypt = require('bcrypt');

// Atualizar um usuário existente
const atualizarUsuarioADMController = async (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
        return res.status(400).json({ 
            success: false,
            message: 'ID inválido' 
        });
    }

    const { nome, email, senha } = req.body;

    // Validações básicas
    const errors = [];
    if (!nome?.trim()) errors.push('Nome é obrigatório');
    if (!email?.trim()) errors.push('E-mail é obrigatório');
    
    if (errors.length > 0) {
        return res.status(400).json({ 
            success: false,
            message: 'Validação falhou',
            errors 
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Por favor, insira um e-mail válido'
        });
    }

    try {
        // Verifica se o usuário existe
        const usuarioExistente = await pool.query(
            'SELECT * FROM usuarios WHERE id = $1', 
            [id]
        );

        if (usuarioExistente.rowCount === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuário não encontrado' 
            });
        }

        // Verifica se o novo email já está em uso por outro usuário
        const emailExistente = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1 AND id != $2',
            [email, id]
        );

        if (emailExistente.rowCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Este e-mail já está em uso por outro usuário'
            });
        }

        // Prepara os dados para atualização
        let updateQuery = `
            UPDATE usuarios SET 
                nome = $1, 
                email = $2,
                updated_at = NOW()
        `;
        
        let queryParams = [
            nome.trim(),
            email.trim()
        ];

        // Se uma nova senha foi fornecida, criptografa e adiciona à atualização
        if (senha && senha.trim()) {
            if (senha.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'A senha deve ter pelo menos 6 caracteres'
                });
            }
            
            const senhaHash = await bcrypt.hash(senha, 10);
            updateQuery += `, senha = $${queryParams.length + 1}`;
            queryParams.push(senhaHash);
        }

        // Completa a query
        updateQuery += ` WHERE id = $${queryParams.length + 1} RETURNING id, nome, email, created_at, updated_at`;
        queryParams.push(id);

        // Executa a atualização
        const result = await pool.query(updateQuery, queryParams);

        return res.status(200).json({
            success: true,
            message: 'Usuário atualizado com sucesso',
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
        return res.status(500).json({ 
            success: false,
            message: 'Erro no servidor ao atualizar usuário',
            error: err.message 
        });
    }
};

module.exports = {
    atualizarUsuarioADMController
};