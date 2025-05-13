// Controller (listarTodasAsDuvidasFront.js)
const pool = require('../../../config/conexao');

const listarTodasDuvidasFront = async (req, res) => {
    try {
        const { pagina = 1, limite = 10 } = req.query;
        const offset = (pagina - 1) * limite;
        
        
        // Query para buscar as perguntas
        const query = `
            SELECT id, pergunta, resposta 
            FROM duvidas
            WHERE pergunta IS NOT NULL AND resposta IS NOT NULL
            ORDER BY id
            LIMIT $1 OFFSET $2
        `;
        
        // Query para contar o total de perguntas
        const countQuery = `SELECT COUNT(*) FROM duvidas WHERE pergunta IS NOT NULL AND resposta IS NOT NULL`;
        
        // Executa as queries em paralelo
        const [result, countResult] = await Promise.all([
            pool.query(query, [limite, offset]),
            pool.query(countQuery)
        ]);
        
        const total = parseInt(countResult.rows[0].count);
        const totalPaginas = Math.ceil(total / limite);
        
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                mensagem: 'Nenhuma pergunta encontrada',
                perguntas: [],
                paginacao: {
                    paginaAtual: parseInt(pagina),
                    totalPaginas: 0,
                    totalPerguntas: 0
                }
            });
        }
        
        res.json({
            perguntas: result.rows,
            paginacao: {
                paginaAtual: parseInt(pagina),
                totalPaginas: totalPaginas,
                totalPerguntas: total
            }
        });
    } catch (error) {
        console.error('Erro ao buscar perguntas frequentes:', error);
        res.status(500).json({ 
            mensagem: 'Erro interno do servidor',
            error: error.message
        });
    }
};

module.exports = {
    listarTodasDuvidasFront
}