const pool = require('../../config/conexao');
const s3 = require('../../config/s3Config');
const { v4: uuidv4 } = require('uuid');
const path = require('path');


const obterNoticiaPorIdWeb = (req, res) => {
 res.sendFile(path.join(__dirname, '../../public', 'noticias-detalhes.html'));};


const buscarNoticiaController = async (req, res) => {
    try {
        const { busca, destacada, limit = 10, offset = 0 } = req.query;
        const baseUrl = process.env.STORAGE_URL || 'https://defaultstorage.com/';
        
        // Query para contar o total de registros
        let countQuery = 'SELECT COUNT(*) FROM noticias o';
        let query = `
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
            FROM noticias o
        `;
        
        const params = [];
        let whereClauses = [];
        
        if (busca) {
            whereClauses.push(`(o.titulo ILIKE $${params.length + 1} OR o.descricao ILIKE $${params.length + 2})`);
            params.push(`%${busca}%`, `%${busca}%`);
        }
        
        if (destacada !== undefined) {
            whereClauses.push(`o.destacada = $${params.length + 1}`);
            params.push(destacada === 'true');
        }
        
        if (whereClauses.length > 0) {
            const whereClause = ` WHERE ${whereClauses.join(' AND ')}`;
            query += whereClause;
            countQuery += whereClause;
        }
        
        query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(parseInt(limit, 10), parseInt(offset, 10));
        
        // Executa ambas as queries em paralelo
        const [result, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, params.slice(0, -2)) // Remove os parâmetros de LIMIT e OFFSET
        ]);
        
        const total = parseInt(countResult.rows[0].count, 10);
        const noticias = result.rows.map(noticia => {
            if (noticia.imagens) {
                noticia.imagens = noticia.imagens.map(img => ({
                    ...img,
                    url: baseUrl + img.url
                }));
            }
            return noticia;
        });
        
        res.json({
            success: true,
            data: noticias,
            total,
            totalPages: Math.ceil(total / limit)
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


// Obter orientação por ID
const obterNoticiaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                o.id, 
                o.titulo, 
                o.descricao,
                o.destacada,
                o.created_at,
                o.updated_at,
                oi.id as imagem_id,
                oi.imagem
            FROM noticias o
            LEFT JOIN noticia_imagens oi ON oi.noticia_id = o.id
            WHERE o.id = $1;
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Notícia não encontrada' 
            });
        }

        // Organizar os dados
        const noticia = {
            id: result.rows[0].id,
            titulo: result.rows[0].titulo,
            descricao: result.rows[0].descricao,
            destacada: result.rows[0].destacada,
            created_at: result.rows[0].created_at,
            updated_at: result.rows[0].updated_at,
            imagens: result.rows
                .filter(row => row.imagem_id)  // Filtra apenas linhas com imagens
                .map(row => ({
                    id: row.imagem_id,
                    url: row.imagem  // Já é a URL completa do S3
                }))
        };

        res.status(200).json({
            success: true,
            data: noticia
        });

    } catch (error) {
        console.error('Erro ao obter noticia:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao buscar noticia',
            error: error.message
        });
    }
};

// Atualizar notícia (com upload de imagens para S3)
const atualizarNoticia = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descricao, destacada } = req.body;
        const files = req.files;

        // Validar campos obrigatórios
        if (!titulo || !descricao) {
            return res.status(400).json({
                success: false,
                message: 'Título e descrição são obrigatórios'
            });
        }

        // Atualizar dados básicos da notícia
        const updateQuery = `
            UPDATE noticias
            SET 
                titulo = $1,
                descricao = $2,
                destacada = $3,
                updated_at = NOW()
            WHERE id = $4
            RETURNING *;
        `;

        const result = await pool.query(updateQuery, [
            titulo,
            descricao,
            destacada,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Orientação não encontrada'
            });
        }

        // Processar upload de novas imagens para S3
        if (files && files.length > 0) {
            await Promise.all(
                files.map(async (file) => {
                    const key = `noticias/${id}/${uuidv4()}${path.extname(file.originalname)}`;
                    
                    // Upload para S3
                    await s3.upload({
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: key,
                        Body: file.buffer,
                        ContentType: file.mimetype,
                        ACL: 'public-read'  // Tornar o arquivo publicamente acessível
                    }).promise();

                    // URL pública do arquivo no S3
                    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

                    // Salvar URL completa no banco
                    await pool.query(
                        `INSERT INTO noticia_imagens (noticia_id, imagem) VALUES ($1, $2)`,
                        [id, url]
                    );
                })
            );
        }

        res.status(200).json({
            success: true,
            message: 'Notícia atualizada com sucesso',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao atualizar notícia:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar notícia',
            error: error.message
        });
    }
};

// Remover imagem
const removerImagemNoticia = async (req, res) => {
    try {
        const { id, imagemId } = req.params;

        // Obter a URL da imagem para extrair a chave S3
        const result = await pool.query(
            `SELECT imagem FROM noticia_imagens WHERE id = $1 AND noticia_id = $2`,
            [imagemId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Imagem não encontrada'
            });
        }

        const imagemUrl = result.rows[0].imagem;
        // Extrair a chave S3 da URL
        const key = imagemUrl.replace(`https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/`, '');

        // Remover do S3
        await s3.deleteObject({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key
        }).promise();

        // Remover do banco
        await pool.query(
            `DELETE FROM noticia_imagens WHERE id = $1`,
            [imagemId]
        );

        res.status(200).json({
            success: true,
            message: 'Imagem removida com sucesso'
        });

    } catch (error) {
        console.error('Erro ao remover imagem:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao remover imagem',
            error: error.message
        });
    }
};

module.exports = {
  buscarNoticiaController,
  obterNoticiaPorId ,
  atualizarNoticia,
  removerImagemNoticia ,
  obterNoticiaPorIdWeb
};
