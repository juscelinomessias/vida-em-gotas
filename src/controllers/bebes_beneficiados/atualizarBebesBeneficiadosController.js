const pool = require('../../config/conexao');

const atualizarBebesBeneficiados = async (req, res) => {
    const { id } = req.params;
    const { total_bebes_beneficiados } = req.body;

    if (!total_bebes_beneficiados) {
        return res.status(400).json({ mensagem: 'O total de bebês beneficiados é obrigatório' });
    }

    try {
        const query = `
            UPDATE bebes_beneficiados
            SET 
                total_bebes_beneficiados = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING *;
        `;

        const values = [total_bebes_beneficiados, id];
        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return res.status(404).json({ mensagem: 'Registro não encontrado' });
        }

        res.status(200).json({ 
            mensagem: 'Registro atualizado com sucesso!',
            bebe: rows[0]
        });

    } catch (err) {
        console.error('Erro ao atualizar bebês beneficiados:', err.message);
        res.status(500).json({ mensagem: 'Erro ao atualizar registro' });
    }
};

const ajustarBebes = async (req, res) => {
    const { id } = req.params;
    const { operacao, quantidade_bebes } = req.body;

    if (!['adicionar', 'remover'].includes(operacao)) {
        return res.status(400).json({ 
            success: false,
            message: 'Operação inválida' 
        });
    }

    if (!quantidade_bebes || isNaN(quantidade_bebes) || quantidade_bebes <= 0) {
        return res.status(400).json({ 
            success: false,
            message: 'Quantidade inválida' 
        });
    }

    try {
        // 1. Busca o registro atual
        const checkQuery = 'SELECT * FROM bebes_beneficiados WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [id]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Registro não encontrado' 
            });
        }

        // 2. Calcula o novo valor
        const atual = checkResult.rows[0].total_bebes_beneficiados || 0;
        const ajuste = parseInt(quantidade_bebes);
        let novoTotal = atual;
        
        if (operacao === 'adicionar') {
            novoTotal = atual + ajuste;
        } else {
            novoTotal = Math.max(0, atual - ajuste);
        }

        // 3. Atualiza no banco
        const updateQuery = `
            UPDATE bebes_beneficiados 
            SET total_bebes_beneficiados = $1, 
                updated_at = NOW()
            WHERE id = $2
            RETURNING *
        `;
        const updateResult = await pool.query(updateQuery, [novoTotal, id]);

        // 4. Retorna resposta
        res.status(200).json({
            success: true,
            message: `Bebês ${operacao === 'adicionar' ? 'adicionados' : 'removidos'} com sucesso`,
            data: {
                operacao,
                quantidade_ajustada: ajuste,
                total_anterior: atual,
                total_atual: novoTotal,
                registro: updateResult.rows[0]
            }
        });

    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro interno',
            error: error.message
        });
    }
};
module.exports = { 
    atualizarBebesBeneficiados,
    ajustarBebes
};