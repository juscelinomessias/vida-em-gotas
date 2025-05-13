const pool = require('../../config/conexao');
const path = require('path');

// Rota para carregar a página do formulário (mantida exatamente como estava)
const criarDuvidasWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_duvidas', 'criar_duvidas.html'));
};

// Controller para criar dúvidas
const criarDuvidasController = async (req, res) => {
    const { tituloDaPergunta, descricaoDaPergunta } = req.body;

    // Validação dos campos de entrada
    if (!tituloDaPergunta || !tituloDaPergunta.trim()) {
        return res.status(400).json({ 
            success: false,
            message: 'O campo título da pergunta é obrigatório.',
            field: 'tituloDaPergunta'
        });
    }

    if (!descricaoDaPergunta || !descricaoDaPergunta.trim()) {
        return res.status(400).json({ 
            success: false,
            message: 'O campo descrição da pergunta é obrigatório.',
            field: 'descricaoDaPergunta'
        });
    }

    // Verifica tamanho dos campos conforme a tabela
    if (tituloDaPergunta.length > 500) {
        return res.status(400).json({
            success: false,
            message: 'O título não pode exceder 500 caracteres.',
            field: 'tituloDaPergunta'
        });
    }

    if (descricaoDaPergunta.length > 1000) {
        return res.status(400).json({
            success: false,
            message: 'A resposta não pode exceder 1000 caracteres.',
            field: 'descricaoDaPergunta'
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Insere a nova dúvida no banco de dados
        const resultado = await client.query(
            'INSERT INTO duvidas (pergunta, resposta) VALUES ($1, $2) RETURNING *',
            [tituloDaPergunta.trim(), descricaoDaPergunta.trim()]
        );

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Dúvida cadastrada com sucesso!',
            data: resultado.rows[0]
        });

    } catch (err) {
        await client.query('ROLLBACK');
        
        console.error('Erro ao criar dúvida:', err.message);
        
        // Verifica se é um erro de duplicidade
        if (err.code === '23505') {
            return res.status(400).json({ 
                success: false,
                message: 'Já existe uma dúvida com este título.',
                field: 'tituloDaPergunta'
            });
        }
        
        return res.status(500).json({ 
            success: false,
            message: 'Erro interno ao processar a solicitação.'
        });
    } finally {
        client.release();
    }
};

module.exports = {
    criarDuvidasController,
    criarDuvidasWeb
};