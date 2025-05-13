const pool = require('../../config/conexao');
const path = require('path');

// Rota para a página de criação de Doadoras
const criarDoadorasWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_doadoras', 'criar_doadoras.html'));
};

// Rota para criar uma nova Doadora
const criarDoadorasController = async (req, res) => {
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

    // Validações de campos obrigatórios
    if (!nome || !nome.trim()) {
        return res.status(400).json({ message: 'O campo Nome é obrigatório.' });
    }
    if (!nome_da_mae || !nome_da_mae.trim()) {
        return res.status(400).json({ message: 'O campo Nome da Mãe é obrigatório.' });
    }
    if (!data_de_nascimento || !data_de_nascimento.trim()) {
        return res.status(400).json({ message: 'O campo Data de Nascimento é obrigatório.' });
    }

    try {
        // Iniciar uma transação
        await pool.query('BEGIN');

        // Converter valores de string para boolean
        const coletaDomiciliarBool = coleta_domiciliar === 'Sim' ? true : false;
        const doadoraExclusivaBool = doadora_exclusiva === 'Sim' ? true : false;
        const situacaoBool = situacao === 'true' ? true : false;

        // Inserir na tabela "doadoras" e retornar o ID gerado
        const novaDoadora = await pool.query(
            `INSERT INTO doadoras (
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
                created_at, 
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) RETURNING id`,
            [
                nome, 
                nome_da_mae, 
                data_de_cadastro, 
                data_de_nascimento, 
                naturalidade, 
                profissao, 
                quantidade_leite_mL || 0,
                coletaDomiciliarBool, 
                doadoraExclusivaBool, 
                receptor, 
                situacaoBool
            ]
        );

        const doadora_id = novaDoadora.rows[0].id;

        // Inserir na tabela "enderecos"
        await pool.query(
            `INSERT INTO enderecos (
                cep, 
                logradouro, 
                numero, 
                bairro, 
                ponto_de_referencia, 
                municipio, 
                latitude, 
                longitude, 
                doadoras_id, 
                created_at, 
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
            [
                cep, 
                logradouro, 
                numero, 
                bairro, 
                ponto_de_referencia, 
                municipio, 
                latitude, 
                longitude, 
                doadora_id
            ]
        );

        // Inserir telefones (aceitando um ou múltiplos números)
        if (telefones && Array.isArray(telefones)) {
            for (const telefone of telefones) {
                if (telefone && telefone.trim()) {
                    await pool.query(
                        `INSERT INTO telefones (telefone, doadoras_id, created_at, updated_at) 
                         VALUES ($1, $2, NOW(), NOW())`,
                        [telefone.trim(), doadora_id]
                    );
                }
            }
        } else if (telefones && telefones.trim()) {
            await pool.query(
                `INSERT INTO telefones (telefone, doadoras_id, created_at, updated_at) 
                 VALUES ($1, $2, NOW(), NOW())`,
                [telefones.trim(), doadora_id]
            );
        }

        // Confirmar a transação
        await pool.query('COMMIT');

        // Redirecionar para o formulário com indicação de sucesso
        return res.redirect('/admin/doadoras/criar-doadoras?success=true');

    } catch (err) {
        // Reverter a transação em caso de erro
        await pool.query('ROLLBACK');
        console.error('Erro ao criar Doadora e Endereço:', err.message);
        return res.status(500).json({ 
            message: 'Erro ao criar Doadora e Endereço.', 
            error: err.message 
        });
    }
};

module.exports = {
    criarDoadorasWeb,
    criarDoadorasController
};