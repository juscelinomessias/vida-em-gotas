const pool = require('../../config/conexao');

const obterNoticiasDetalharPorIdWeb = async (req, res) => {
    try {
        // Extrai o ID corretamente da query string
        const { id } = req.query;
    
        // Validação robusta
        if (!id || id === 'obterNoticiaPorId') {
            return res.status(400).json({
                success: false,
                message: 'ID da notícia não fornecido ou inválido'
            });
        }

        // Converte para número
        const noticiaId = parseInt(id);
        
        if (isNaN(noticiaId)) {
            return res.status(400).json({
                success: false,
                message: 'ID deve ser um número válido'
            });
        }

        // Busca no banco de dados
        const noticiaQuery = await pool.query(
            `SELECT * FROM noticias WHERE id = $1`, 
            [noticiaId]
        );

        if (noticiaQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notícia não encontrada'
            });
        }

        const noticia = noticiaQuery.rows[0];
        
        // Busca imagens relacionadas
        const imagensQuery = await pool.query(
            `SELECT id, imagem as url FROM noticia_imagens 
             WHERE noticia_id = $1`,
            [noticiaId]
        );

        // Formata resposta
        res.json({
            success: true,
            data: {
                ...noticia,
                imagens: imagensQuery.rows,
                created_at: noticia.created_at.toISOString(),
                updated_at: noticia.updated_at.toISOString()
            }
        });

    } catch (error) {
        console.error('Erro completo:', {
            message: error.message,
            stack: error.stack,
            query: error.query,
            parameters: req.query
        });
        
        res.status(500).json({
            success: false,
            message: 'Erro interno no servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

const obterNoticiaDestacada = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                o.*, 
                (
                    SELECT COALESCE(
                        json_agg(
                            json_build_object(
                                'id', oi.id,
                                'url', 'https://vida-em-gotas.s3.us-east-2.amazonaws.com/' || oi.imagem,
                                'nome_arquivo', oi.imagem
                            )
                        ), 
                        '[]'::json
                    )
                    FROM noticia_imagens oi
                    WHERE oi.noticia_id = o.id
                ) AS imagens
            FROM noticias o
            WHERE o.destacada = true
            ORDER BY o.created_at DESC;
        `);

        if (!result.rows.length) {
            return res.status(404).json({ 
                success: false, 
                message: 'Nenhuma notícia destacada encontrada' 
            });
        }

        const noticias = result.rows.map(noticia => ({
            ...noticia,
            imagens: (noticia.imagens || []).map(img => ({
                ...img,
                url: img.url.includes('http') 
                    ? img.url 
                    : `https://vida-em-gotas.s3.us-east-2.amazonaws.com/${img.nome_arquivo}`
            }))
        }));

        res.json({ 
            success: true, 
            data: noticias 
        });

    } catch (error) {
        console.error('Erro ao obter notícia destacada:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno no servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};



module.exports = {
    obterNoticiasDetalharPorIdWeb,
    obterNoticiaDestacada
};