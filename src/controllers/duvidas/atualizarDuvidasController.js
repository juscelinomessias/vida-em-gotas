const pool = require('../../config/conexao');

const atualizarDuvida = async (req, res) => {
    const { id } = req.params;
    const { pergunta, resposta } = req.body;

    if (!pergunta || !resposta) {
        return res.status(400).json({ mensagem: 'Pergunta e resposta são obrigatórias' });
    }

    try {
        const query = `
            UPDATE duvidas
            SET 
                pergunta = $1,
                resposta = $2,
                updated_at = NOW()
            WHERE id = $3
            RETURNING *;
        `;

        const values = [pergunta, resposta, id];
        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return res.status(404).json({ mensagem: 'Dúvida não encontrada' });
        }

        res.status(200).json({ 
            mensagem: 'Dúvida atualizada com sucesso!',
            duvida: rows[0]
        });

    } catch (err) {
        console.error('Erro ao atualizar dúvida:', err.message);
        res.status(500).json({ mensagem: 'Erro ao atualizar dúvida' });
    }
};

module.exports = { 
    atualizarDuvida
};