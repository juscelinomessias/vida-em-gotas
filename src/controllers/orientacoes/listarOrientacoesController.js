const pool = require('../../config/conexao');
const path = require('path');

// Rota para a página listar orientações
const listarOrientacoesWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_orientacoes', 'listar_orientacoes.html'));
};

const listarOrientacoesController = async (req, res) => {
    try {
        // Força o cabeçalho Content-Type para JSON
        res.setHeader('Content-Type', 'application/json');
        
        const { page = 1, limit = 6 } = req.query;
        const offset = (page - 1) * limit;

        // Consulta de teste simplificada
        const result = await pool.query(
            `SELECT id, titulo FROM orientacoes LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        res.json({
            success: true,
            orientacoes: result.rows,
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

const listarOrientacoesVideoController = async (req, res) => {
    try {
        // Parâmetros de paginação e busca
        const pagina = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limit) || 10;
        const offset = (pagina - 1) * limite;
        const busca = req.query.busca || '';
        
        // DEFINA A BASE URL CORRETA PARA O S3
        const baseUrl = process.env.STORAGE_URL || 'https://vida-em-gotas.s3.us-east-2.amazonaws.com/';

        // Consulta principal (mantida igual)
        const query = `
             SELECT 
                o.id, 
                o.titulo, 
                o.descricao, 
                o.video, 
                o.destacada,
                o.created_at,
                o.updated_at,
                (
                SELECT array_agg(
                    json_build_object(
                        'id', oi.id,
                        'url', oi.imagem
                    )
                )
                FROM orientacao_imagens oi
                WHERE oi.orientacao_id = o.id
            ) AS imagens
                FROM orientacoes o
                WHERE $1 = '' OR o.titulo ILIKE $2 OR o.descricao ILIKE $3
                ORDER BY o.created_at DESC
                LIMIT $4 OFFSET $5;
        `;

        // Consulta para contar o total de orientações (com filtro de busca)
        const countQuery = `
            SELECT COUNT(*) 
            FROM orientacoes
            WHERE $1 = '' OR titulo ILIKE $2 OR descricao ILIKE $3;
        `;

        // Parâmetros para ambas as consultas
        const searchParam = `%${busca}%`;
        const params = [busca, searchParam, searchParam, limite, offset];

        // Executa as consultas em paralelo
        const [result, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, params.slice(0, 3)) // Usa apenas os 3 primeiros parâmetros
        ]);

        const totalOrientacoes = parseInt(countResult.rows[0].count);
        const totalPaginas = Math.ceil(totalOrientacoes / limite);

        // Processa as imagens para incluir a URL completa
        // Processamento das imagens - CORREÇÃO PRINCIPAL
        const orientacoes = result.rows.map(orientacao => {
            if (orientacao.imagens) {
                orientacao.imagens = orientacao.imagens.map(img => {
                    // Se a imagem já for uma URL completa, não modifica
                    if (/^https?:\/\//i.test(img.url)) {
                        return img;
                    }
                    
                    // Remove barras extras acidentais no caminho
                    const caminhoLimpo = img.url.replace(/^\//, '');
                    
                    return {
                        ...img,
                        url: baseUrl + caminhoLimpo,
                        // Adiciona também o key para compatibilidade
                        key: caminhoLimpo
                    };
                });
            }
            return orientacao;
        });

        // Retorna os dados formatados
        res.json({
            success: true,
            data: orientacoes,
            paginaAtual: pagina,
            totalPaginas: totalPaginas,
            totalOrientacoes: totalOrientacoes
        });

    } catch (error) {
        console.error('Erro ao buscar orientações:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao buscar orientações',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Controller
const listarOrientacoes = async (req, res) => {
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
                    FROM orientacao_imagens oi
                    WHERE oi.orientacao_id = o.id
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
        const orientacoes = resultData.rows.map(orientacao => {
            if (orientacao.imagens) {
                orientacao.imagens = orientacao.imagens.map(img => ({
                    ...img,
                    url: process.env.STORAGE_URL + img.url // Adiciona URL base se necessário
                }));
            }
            return orientacao;
        });
        
        res.json({
            success: true,
            data: {  // Estrutura que o frontend espera
                orientacoes,
                totalPaginas,
                totalOrientacoes: total
            }
        });
        
    } catch (error) {
        console.error('Erro ao buscar orientações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar orientações',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  };
module.exports = {
    listarOrientacoesWeb,
    listarOrientacoesController,
    listarOrientacoesVideoController,
    listarOrientacoes
};