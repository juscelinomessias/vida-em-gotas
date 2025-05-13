const pool = require('../../config/conexao');
const path = require('path');

// Rota para a página de edição de Doadora
const editarDoadoraWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_doadoras', 'editar_doadoras.html'));
};

// Alternar status da doadora (Ativo/Inativo)
const alternarStatusDoadora = async (req, res) => {
    const { id } = req.params;
    const { situacao } = req.body; // Recebe o novo status (true/false)

    try {
        // Atualiza o status da doadora no banco de dados
        const resultado = await pool.query(
            'UPDATE doadoras SET situacao = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [situacao, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Doadora não encontrada.' });
        }

        res.json({ mensagem: 'Status atualizado com sucesso.', situacao: resultado.rows[0].situacao });
    } catch (error) {
        console.error('Erro ao alternar status da doadora:', error.message);
        res.status(500).json({ mensagem: 'Erro ao alternar status da doadora.' });
    }
};

// Atualizar uma doadora
const atualizarDoadoraController = async (req, res) => {
    const { id } = req.params;
    const { 
        nome, 
        nome_da_mae, 
        data_de_cadastro, 
        data_de_nascimento, 
        naturalidade, 
        profissao, 
        quantidade_leite_mL, 
        coleta_domiciliar, 
        doadora_exclusiva, 
        receptor, 
        situacao, 
        cep, 
        logradouro, 
        numero, 
        bairro, 
        ponto_de_referencia, 
        municipio, 
        latitude, 
        longitude, 
        telefones 
    } = req.body;

    const client = await pool.connect(); // Iniciar conexão com o banco

    try {
        await client.query('BEGIN'); // Iniciar transação

        // Atualizar a tabela doadoras
        const resultadoDoadora = await client.query(
            `UPDATE doadoras 
             SET nome = $1, nome_da_mae = $2, data_de_cadastro = $3, data_de_nascimento = $4, 
                 naturalidade = $5, profissao = $6, quantidade_leite_mL = $7, coleta_domiciliar = $8, 
                 doadora_exclusiva = $9, receptor = $10, situacao = $11, updated_at = NOW()
             WHERE id = $12 RETURNING *`,
            [nome, nome_da_mae, data_de_cadastro, data_de_nascimento, naturalidade, profissao, 
             quantidade_leite_mL, coleta_domiciliar, doadora_exclusiva, receptor, situacao, id]
        );

        if (resultadoDoadora.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ mensagem: 'Doadora não encontrada.' });
        }

        // Atualizar a tabela enderecos
        await client.query(
            `UPDATE enderecos 
             SET cep = $1, logradouro = $2, numero = $3, bairro = $4, ponto_de_referencia = $5, 
                 municipio = $6, latitude = $7, longitude = $8, updated_at = NOW()
             WHERE doadoras_id = $9`,
            [cep, logradouro, numero, bairro, ponto_de_referencia, municipio, latitude, longitude, id]
        );

        // Atualizar a tabela telefones
        if (telefones && Array.isArray(telefones)) {
            // Remove os telefones antigos
            await client.query('DELETE FROM telefones WHERE doadoras_id = $1', [id]);

            // Insere os novos telefones
            for (const telefone of telefones) {
                await client.query(
                    'INSERT INTO telefones (telefone, doadoras_id, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
                    [telefone, id]
                );
            }
        }

        await client.query('COMMIT'); // Confirma a transação

        res.json({ mensagem: 'Doadora atualizada com sucesso.' });
    } catch (error) {
        await client.query('ROLLBACK'); // Reverte alterações em caso de erro
        console.error('Erro ao atualizar doadora:', error.message);
        res.status(500).json({ mensagem: 'Erro ao atualizar doadora.' });
    } finally {
        client.release(); // Libera conexão
    }
};

// Rota para atualizar uma Doadora existente
const atualizarDoadorasController = async (req, res) => {
    const { id } = req.params;
    const { telefones, ...doadoraData } = req.body; // Separa os telefones dos outros dados
    
    try {
        await pool.query('BEGIN');

        // Função para converter booleanos
        const parseBool = (val) => {
            if (val === null || val === undefined) return null;
            if (typeof val === 'boolean') return val;
            if (typeof val === 'string') {
                const str = val.toLowerCase().trim();
                if (str === 'true' || str === 's' || str === 'sim' || str === '1') return true;
                if (str === 'false' || str === 'n' || str === 'não' || str === '0') return false;
            }
            if (typeof val === 'number') return val !== 0;
            throw new Error(`Valor não booleano: ${val}`);
        };

        // Atualizar dados da doadora
        await pool.query(
            `UPDATE doadoras SET
                nome = $1,
                nome_da_mae = $2,
                data_de_nascimento = $3,
                naturalidade = $4,
                profissao = $5,
                quantidade_leite_ml = $6,
                coleta_domiciliar = $7,
                doadora_exclusiva = $8,
                situacao = $9,
                receptor = $10,
                updated_at = NOW()
            WHERE id = $11`,
            [
                doadoraData.nome,
                doadoraData.nome_da_mae,
                doadoraData.data_de_nascimento,
                doadoraData.naturalidade,
                doadoraData.profissao,
                doadoraData.quantidade_leite_ml || 0,
                parseBool(doadoraData.coleta_domiciliar),
                parseBool(doadoraData.doadora_exclusiva),
                parseBool(doadoraData.situacao),
                doadoraData.receptor,
                id
            ]
        );

        // Atualizar endereço
        await pool.query(
            `UPDATE enderecos SET
                cep = $1,
                logradouro = $2,
                numero = $3,
                bairro = $4,
                ponto_de_referencia = $5,
                municipio = $6,
                latitude = $7,
                longitude = $8,
                updated_at = NOW()
            WHERE doadoras_id = $9`,
            [
                doadoraData.cep,
                doadoraData.logradouro,
                doadoraData.numero,
                doadoraData.bairro,
                doadoraData.ponto_de_referencia,
                doadoraData.municipio,
                doadoraData.latitude,
                doadoraData.longitude,
                id
            ]
        );

        // Atualizar telefones (primeiro remove os existentes, depois insere os novos)
        await pool.query('DELETE FROM telefones WHERE doadoras_id = $1', [id]);
        
        if (telefones && telefones.length > 0) {
            const telefonesArray = Array.isArray(telefones) ? telefones : [telefones];
            
            for (const telefone of telefonesArray) {
                if (telefone && telefone.trim()) {
                    await pool.query(
                        `INSERT INTO telefones (telefone, doadoras_id, created_at, updated_at)
                         VALUES ($1, $2, NOW(), NOW())`,
                        [telefone.trim(), id]
                    );
                }
            }
        }

        await pool.query('COMMIT');
        res.json({ success: true, message: 'Doadora atualizada com sucesso' });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Erro na atualização:', err);
        res.status(500).json({ 
            success: false,
            message: 'Erro na atualização',
            error: err.message
        });
    }
};


const atualizarDoadorControllerModal = async (req, res) => {
    const { id } = req.params;
    const { 
        nome, 
        quantidade_leite_mL, 
        coleta_domiciliar, 
        doadora_exclusiva 
    } = req.body;

    try {
        // Query para atualizar a doadora
        const query = `
            UPDATE doadoras 
            SET 
                nome = $1, 
                quantidade_leite_mL = $2, 
                coleta_domiciliar = $3, 
                doadora_exclusiva = $4 
            WHERE id = $5 
            RETURNING *;
        `;

        // Valores para a query
        const valores = [
            nome, 
            quantidade_leite_mL, 
            coleta_domiciliar, 
            doadora_exclusiva, 
            id
        ];

        // Executa a query
        const resultado = await pool.query(query, valores);

        // Verifica se a doadora foi encontrada e atualizada
        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Doadora não encontrada.' });
        }

        // Retorna a mensagem de sucesso
        res.status(200).json({ 
            mensagem: 'Doadora atualizada com sucesso.', 
            doadora: resultado.rows[0] 
        });
    } catch (error) {
        console.error('Erro ao atualizar doadora:', error.message);
        res.status(500).json({ mensagem: 'Erro ao atualizar doadora.' });
    }
};


const adicionarLeite = async (req, res) => {
    const { id } = req.params;
    const { quantidade_leite_ml } = req.body;

    try {
        // Busca o valor atual de quantidade_leite_ml
        const queryBusca = 'SELECT quantidade_leite_ml FROM doadoras WHERE id = $1';
        const resultadoBusca = await pool.query(queryBusca, [id]);

        if (resultadoBusca.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Doadora não encontrada.' });
        }

        const quantidadeAtual = resultadoBusca.rows[0].quantidade_leite_ml || 0;
        const novaQuantidade = quantidadeAtual + Number(quantidade_leite_ml);

        // Atualiza o valor no banco de dados
        const queryAtualiza = 'UPDATE doadoras SET quantidade_leite_ml = $1 WHERE id = $2 RETURNING *';
        const resultadoAtualiza = await pool.query(queryAtualiza, [novaQuantidade, id]);

        res.status(200).json({
            mensagem: 'Quantidade de leite atualizada com sucesso.',
            doadora: resultadoAtualiza.rows[0],
        });
    } catch (error) {
        console.error('Erro ao adicionar leite:', error.message);
        res.status(500).json({ mensagem: 'Erro ao adicionar leite.' });
    }
};

module.exports = {
    editarDoadoraWeb,
    alternarStatusDoadora,
    atualizarDoadoraController,
    atualizarDoadorasController,
    atualizarDoadorControllerModal,
    adicionarLeite
};