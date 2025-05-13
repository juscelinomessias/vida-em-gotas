const pool = require('../../config/conexao');
const path = require('path');

// Rota para a página listar notícias
const listarDepoimentosWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_depoimentos', 'listar_depoimento.html'));
};

const listarDepoimentosController = async (req, res) => {
    try {
        // Força o cabeçalho Content-Type para JSON
        res.setHeader('Content-Type', 'application/json');
        
        const { page = 1, limit = 6 } = req.query;
        const offset = (page - 1) * limit;

        // Consulta de teste simplificada
        const result = await pool.query(
            `SELECT id, titulo FROM noticias LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        res.json({
            success: true,
            noticias: result.rows,
            paginaAtual: parseInt(page),
            totalPaginas: 1, // Ajuste depois
            totalOrientacoes: result.rows.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({  // IMPORTANTE: Mantenha como JSON
            success: false,
            message: 'Erro interno no servidor'
        });
    }
};





// Lista depoimentos no Admin - LINO
const listarDepoimentosAdminController = async (req, res) => {
    try {
        // Parâmetros de paginação e busca
        const pagina = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limit) || 10;
        const offset = (pagina - 1) * limite;
        const busca = req.query.busca || '';

        const baseUrl = process.env.STORAGE_URL || 'https://vida-em-gotas.s3.us-east-2.amazonaws.com/';

        // Consulta para buscar depoimentos
        const query = `
            SELECT 
                id, 
                nome_mae, 
                nome_crianca, 
                imagem_mae, 
                depoimento, 
                destacado,
                created_at,
                updated_at
            FROM depoimentos
            WHERE $1 = '' OR nome_mae ILIKE $2 OR nome_crianca ILIKE $3 OR depoimento ILIKE $4
            ORDER BY created_at DESC
            LIMIT $5 OFFSET $6;
        `;

        // Consulta para contar total
        const countQuery = `
            SELECT COUNT(*) 
            FROM depoimentos
            WHERE $1 = '' OR nome_mae ILIKE $2 OR nome_crianca ILIKE $3 OR depoimento ILIKE $4;
        `;

        const searchParam = `%${busca}%`;
        const params = [busca, searchParam, searchParam, searchParam, limite, offset];

        const [result, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, params.slice(0, 4))
        ]);

        const totalDepoimentos = parseInt(countResult.rows[0].count);
        const totalPaginas = Math.ceil(totalDepoimentos / limite);

        // Monta URL completa da imagem
        const depoimentos = result.rows.map(dep => {
            const imagem = dep.imagem_mae 
                ? `${baseUrl}${dep.imagem_mae.replace(/^\//, '')}` 
                : null;

            return {
                ...dep,
                imagem_mae_url: imagem
            };
        });

        res.json({
            success: true,
            data: depoimentos,
            paginaAtual: pagina,
            totalPaginas: totalPaginas,
            totalDepoimentos: totalDepoimentos
        });

    } catch (error) {
        console.error('Erro ao buscar depoimentos:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao buscar depoimentos',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    listarDepoimentosAdminController
};





// Controller
const listarDepoimentos = async (req, res) => {
    try {
        const { busca, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        let queryBase = `
            SELECT 
                o.*,
                (
                    SELECT array_agg(
                        json_build_object(
                            'id', oi.id,
                            'url', oi.imagem
                        )
                    )
                    FROM noticia_imagens oi
                    WHERE oi.noticia_id = o.id
                ) AS imagens
            FROM orientacoes o
        `;
        
        let queryCount = `SELECT COUNT(*) FROM orientacoes o`;
        const params = [];
        let whereClause = '';
        
        if (busca) {
            whereClause = ` WHERE o.titulo ILIKE $1 OR o.descricao ILIKE $1`;
            params.push(`%${busca}%`);
        }
        
        const queryData = `
            ${queryBase}
            ${whereClause}
            ORDER BY o.created_at DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;
        
        const queryTotal = `${queryCount} ${whereClause}`;
        
        const resultData = await pool.query(queryData, [...params, limit, offset]);
        const resultTotal = await pool.query(queryTotal, params);
        
        const total = parseInt(resultTotal.rows[0].count);
        const totalPaginas = Math.ceil(total / limit);
        
        // Formata os dados para o frontend
        const noticias = resultData.rows.map(noticia => {
            if (noticia.imagens) {
                noticia.imagens = noticia.imagens.map(img => ({
                    ...img,
                    url: process.env.STORAGE_URL + img.url // Adiciona URL base se necessário
                }));
            }
            return noticia;
        });
        
        res.json({
            success: true,
            data: {  // Estrutura que o frontend espera
                noticias,
                totalPaginas,
                totalOrientacoes: total
            }
        });
        
    } catch (error) {
        console.error('Erro ao buscar notícias:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar notícias',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  };



  // No seu controller de depoimentos
const listarDepoimentosFrontController = async (req, res) => {
    const { busca, destacado, limit = 10, offset = 0 } = req.query;

    try {
        let query = 'SELECT * FROM depoimentos';
        let params = [];
        let countQuery = 'SELECT COUNT(*) FROM depoimentos';
        let countParams = [];

        // Filtro por destaque
        if (destacado === 'true') {
            query += ' WHERE destacado = true';
            countQuery += ' WHERE destacado = true';
        }

        // Filtro por busca
        if (busca) {
            query += query.includes('WHERE') ? ' AND' : ' WHERE';
            query += ' (nome_mae ILIKE $1 OR depoimento ILIKE $1)';
            params.push(`%${busca}%`);
            
            countQuery += countQuery.includes('WHERE') ? ' AND' : ' WHERE';
            countQuery += ' (nome_mae ILIKE $1 OR depoimento ILIKE $1)';
            countParams.push(`%${busca}%`);
        }

        query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(parseInt(limit), parseInt(offset));

        const [depoimentos, total] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, countParams)
        ]);

        return res.status(200).json({
            success: true,
            data: depoimentos.rows,
            total: parseInt(total.rows[0].count)
        });

    } catch (err) {
        console.error('Erro ao listar depoimentos:', err);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao listar depoimentos'
        });
    }
};




module.exports = {
    listarDepoimentosWeb,
    listarDepoimentosController,
    listarDepoimentosAdminController,
    listarDepoimentos,
    listarDepoimentosFrontController
};














