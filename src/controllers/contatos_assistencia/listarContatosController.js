const pool = require('../../config/conexao');
const path = require('path');

// Rota para a página de listagem de contatos
const listarContatosWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_contatos_assistencia', 'listar_contatos.html'));
};

// Controller para listagem administrativa
const listarContatosController = async (req, res) => {
    try {
        const { busca, limit, offset } = req.query;
        
        let query = 'SELECT * FROM contatos_assistencia';
        let whereClauses = [];
        let params = [];
        let paramIndex = 1;

        // Filtro por busca
        if (busca && busca.trim() !== '') {
            const searchTerm = `%${busca}%`;
            whereClauses.push(
                `(nome_hospital ILIKE $${paramIndex} OR 
                 setor ILIKE $${paramIndex} OR 
                 cidade ILIKE $${paramIndex} OR 
                 estado ILIKE $${paramIndex})`
            );
            params.push(searchTerm);
            paramIndex++;
        }

        // Adiciona WHERE se houver filtros
        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        // Ordenação padrão
        query += ' ORDER BY nome_hospital ASC';

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
        console.error('Erro ao listar contatos:', err);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao listar contatos'
        });
    }
};

// Controller para frontend (sem paginação)
const listarContatosFrontController = async (req, res) => {
    try {
        const { busca } = req.query;
        
        let query = 'SELECT * FROM contatos_assistencia';
        let params = [];

        // Filtro por busca
        if (busca && busca.trim() !== '') {
            query += ' WHERE (nome_hospital ILIKE $1 OR setor ILIKE $1 OR cidade ILIKE $1)';
            params.push(`%${busca}%`);
        }

        // Ordenação padrão
        query += ' ORDER BY nome_hospital ASC';

        // Executa a query
        const result = await pool.query(query, params);

        return res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (err) {
        console.error('Erro ao listar contatos:', err);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao listar contatos'
        });
    }
};

// Controller para buscar contatos específicos
const buscarContatosController = async (req, res) => {
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
            SELECT * FROM contatos_assistencia
            WHERE (nome_hospital ILIKE $1 OR 
                  setor ILIKE $1 OR 
                  cidade ILIKE $1 OR 
                  estado ILIKE $1 OR 
                  logradouro ILIKE $1 OR 
                  bairro ILIKE $1)
            ORDER BY nome_hospital ASC
        `;

        const result = await pool.query(query, [searchTerm]);

        return res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (err) {
        console.error('Erro ao buscar contatos:', err);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao buscar contatos'
        });
    }
};

module.exports = {
    listarContatosWeb,
    listarContatosController,
    listarContatosFrontController,
    buscarContatosController
};