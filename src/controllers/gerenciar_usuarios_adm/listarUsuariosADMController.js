const pool = require('../../config/conexao');
const path = require('path');

// Rota para a página de listagem de usuários
const listarUsuariosADMWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_contatos_assistencia', 'listar_usuariosADM.html'));
};

// Controller para listagem administrativa
const listarUsuariosADMController = async (req, res) => {
    try {
        const { busca, limit, offset } = req.query;
        
        let query = 'SELECT id, nome, email, created_at, updated_at FROM usuarios';
        let whereClauses = [];
        let params = [];
        let paramIndex = 1;

        // Filtro por busca
        if (busca && busca.trim() !== '') {
            const searchTerm = `%${busca}%`;
            whereClauses.push(
                `(nome ILIKE $${paramIndex} OR 
                 email ILIKE $${paramIndex})`
            );
            params.push(searchTerm);
            paramIndex++;
        }

        // Adiciona WHERE se houver filtros
        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        // Ordenação padrão
        query += ' ORDER BY nome ASC';

        // Query para contar o total (sem paginação)
        const countQuery = `SELECT COUNT(*) FROM (${query}) AS total`;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        // Adiciona paginação
        if (limit && offset) {
            query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(parseInt(limit), parseInt(offset));
        }

        // Executa a query principal
        const result = await pool.query(query, params);

        return res.status(200).json({
            success: true,
            data: result.rows,
            total: total
        });

    } catch (err) {
        console.error('Erro ao listar usuários:', err);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao listar usuários'
        });
    }
};

// Controller para frontend (sem paginação)
const listarUsuariosADMFrontController = async (req, res) => {
    try {
        const { busca } = req.query;
        
        let query = 'SELECT id, nome, email, created_at, updated_at FROM usuarios';
        let params = [];

        // Filtro por busca
        if (busca && busca.trim() !== '') {
            query += ' WHERE (nome ILIKE $1 OR email ILIKE $1)';
            params.push(`%${busca}%`);
        }

        // Ordenação padrão
        query += ' ORDER BY nome ASC';

        // Executa a query
        const result = await pool.query(query, params);

        return res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (err) {
        console.error('Erro ao listar usuários:', err);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao listar usuários'
        });
    }
};

// Controller para buscar usuários específicos
const buscarUsuariosADMController = async (req, res) => {
    try {
        const { q: termoBusca } = req.query;
        
        if (!termoBusca || termoBusca.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Termo de busca não fornecido'
            });
        }

        const searchTerm = `%${termoBusca}%`;
        
        const query = `
            SELECT id, nome, email, created_at, updated_at FROM usuarios
            WHERE (nome ILIKE $1 OR email ILIKE $1)
            ORDER BY nome ASC
        `;

        const result = await pool.query(query, [searchTerm]);

        return res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao buscar usuários'
        });
    }
};

module.exports = {
    listarUsuariosADMWeb,
    listarUsuariosADMController,
    listarUsuariosADMFrontController,
    buscarUsuariosADMController
};