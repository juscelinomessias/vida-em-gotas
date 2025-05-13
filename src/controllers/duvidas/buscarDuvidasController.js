const pool = require('../../config/conexao');

const buscarDuvidas = async (req, res) => {
    try {
        const { termo } = req.query;
        
        // Validação do termo de busca
        if (!termo || termo.trim() === '') {
            return res.status(400).json({ 
                success: false,
                message: 'Por favor, informe um termo para busca' 
            });
        }

        // Query de busca melhorada
        const query = `
            SELECT 
                id,
                pergunta,
                resposta,
                destacada,
                to_char(created_at, 'DD/MM/YYYY') as data_criacao,
                -- Adiciona peso para resultados mais relevantes primeiro
                CASE 
                    WHEN pergunta ILIKE $1 THEN 1 
                    ELSE 2 
                END as relevancia
            FROM duvidas
            WHERE 
                pergunta ILIKE $1 OR
                resposta ILIKE $1
            ORDER BY 
                relevancia ASC,
                destacada DESC,
                created_at DESC
        `;

        const resultado = await pool.query(query, [`%${termo}%`]);
        
        if (resultado.rows.length === 0) {
            return res.status(200).json([]); // Retorna array vazio se não encontrar
        }

        // Retorna os dados encontrados
        return res.status(200).json(resultado.rows);
        
    } catch (error) {
        console.error('Erro na busca:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Erro interno no servidor ao buscar dúvidas'
        });
    }
};

module.exports = {
    buscarDuvidas
};