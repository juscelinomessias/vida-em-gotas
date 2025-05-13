const pool = require('../../config/conexao');

const criarDoadorasFrontController = async (req, res) => {
    const {
        nome,
        nomeMae,
        dataNascimento,
        naturalidade,
        profissao,
        telefone,
        cep,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        referencia
    } = req.body;

    if (!nome || !nomeMae || !dataNascimento || !telefone || !cep) {
        return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Inserir na tabela doadoras
        const queryDoadora = `
            INSERT INTO doadoras (
                nome, 
                nome_da_mae, 
                data_de_nascimento, 
                naturalidade, 
                profissao,
                data_de_cadastro
            ) 
            VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
            RETURNING id
        `;
        
        const valoresDoadora = [
            nome, 
            nomeMae, 
            dataNascimento, 
            naturalidade, 
            profissao
        ];

        const resultadoDoadora = await client.query(queryDoadora, valoresDoadora);
        const doadoraId = resultadoDoadora.rows[0].id;

        // Inserir na tabela enderecos
        const queryEndereco = `
            INSERT INTO enderecos (
                cep, 
                logradouro, 
                numero,      -- Novo campo
                bairro, 
                municipio, 
                ponto_de_referencia,
                latitude,
                longitude,
                doadoras_id
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, 0, 0, $7)
        `;

        const valoresEndereco = [
            cep, 
            logradouro, 
            numero,
            bairro, 
            cidade, 
            referencia,
            doadoraId
        ];

        await client.query(queryEndereco, valoresEndereco);

        // Inserir na tabela telefones
        const queryTelefone = `
            INSERT INTO telefones (
                telefone, 
                doadoras_id
            ) 
            VALUES ($1, $2)
        `;
        
        const valoresTelefone = [
            telefone, 
            doadoraId
        ];

        await client.query(queryTelefone, valoresTelefone);

        await client.query('COMMIT');

        return res.status(201).json({ mensagem: 'Doadora cadastrada com sucesso', id: doadoraId });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao cadastrar doadora:', error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    } finally {
        client.release();
    }
};

module.exports = {
    criarDoadorasFrontController
};