const pool = require('../../config/conexao');

const obterOrientacaoDetalharPorIdWeb = async (req, res) => {
    try {
        // Extrai o ID corretamente da query string
        const { id } = req.query;
    
        // Validação robusta
        if (!id || id === 'obterOrientacaoPorId') {
            return res.status(400).json({
                success: false,
                message: 'ID da orientação não fornecido ou inválido'
            });
        }

        // Converte para número
        const orientacaoId = parseInt(id);
        
        if (isNaN(orientacaoId)) {
            return res.status(400).json({
                success: false,
                message: 'ID deve ser um número válido'
            });
        }

        // Busca no banco de dados
        const orientacaoQuery = await pool.query(
            `SELECT * FROM orientacoes WHERE id = $1`, 
            [orientacaoId]
        );

        if (orientacaoQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Orientação não encontrada'
            });
        }

        const orientacao = orientacaoQuery.rows[0];
        
        // Busca imagens relacionadas
        const imagensQuery = await pool.query(
            `SELECT id, imagem as url FROM orientacao_imagens 
             WHERE orientacao_id = $1`,
            [orientacaoId]
        );

        // Formata resposta
        res.json({
            success: true,
            data: {
                ...orientacao,
                imagens: imagensQuery.rows,
                created_at: orientacao.created_at.toISOString(),
                updated_at: orientacao.updated_at.toISOString()
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

const obterOrientacaoDestacada = async (req, res) => {
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
                    FROM orientacao_imagens oi
                    WHERE oi.orientacao_id = o.id
                ) AS imagens,
                CASE 
                    WHEN o.video LIKE '%youtube.com%' OR o.video LIKE '%youtu.be%' THEN
                        'https://www.youtube.com/embed/' || 
                        substring(o.video from 'youtube.com/watch?v=([^&]+)') 
                    WHEN o.video LIKE '%vimeo.com%' THEN
                        'https://player.vimeo.com/video/' || 
                        substring(o.video from 'vimeo.com/([0-9]+)')
                    ELSE o.video
                END AS video_embed_url
            FROM orientacoes o
            WHERE o.destacada = true
            ORDER BY o.created_at DESC
            LIMIT 1;
        `);

        if (!result.rows.length) {
            return res.status(404).json({ 
                success: false, 
                message: 'Nenhuma orientação destacada encontrada' 
            });
        }

        const orientacao = result.rows[0];
        
        // Formatar os dados para o frontend
        const responseData = {
            ...orientacao,
            video: orientacao.video_embed_url || orientacao.video,
            imagens: orientacao.imagens.map(img => ({
                ...img,
                url: img.url.includes('http') ? img.url : `https://vida-em-gotas.s3.us-east-2.amazonaws.com/${img.nome_arquivo}`
            }))
        };

        res.json({ 
            success: true, 
            data: responseData 
        });

    } catch (error) {
        console.error('Erro ao obter orientação destacada:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno no servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    obterOrientacaoDetalharPorIdWeb,
    obterOrientacaoDestacada
};