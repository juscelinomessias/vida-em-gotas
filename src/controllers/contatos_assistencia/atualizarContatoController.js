const pool = require('../../config/conexao');

const atualizarContatoController = async (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
        return res.status(400).json({ 
            success: false,
            message: 'ID inválido' 
        });
    }

    let { 
        numero_whatsapp, 
        nome_hospital, 
        logradouro, 
        numero, 
        bairro, 
        cidade, 
        estado, 
        setor,
        email,
        maps_link
    } = req.body;
    
    // Validações
    const errors = [];
    if (!numero_whatsapp?.trim()) errors.push('Número do WhatsApp é obrigatório');
    if (!nome_hospital?.trim()) errors.push('Nome do Hospital é obrigatório');
    if (!cidade?.trim()) errors.push('Cidade é obrigatória');
    if (!estado?.trim()) errors.push('Estado é obrigatório');
    
    // Validação de WhatsApp (mínimo 12 dígitos)
    if (numero_whatsapp && numero_whatsapp.replace(/\D/g, '').length < 12) {
        errors.push('WhatsApp deve ter pelo menos 12 dígitos');
    }
    
    // Validação de email
    if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Formato de email inválido');
    }
    
    // Validação do maps_link (aceita tanto URL quanto iframe completo)
    if (maps_link && maps_link.trim()) {
        const isIframe = maps_link.includes('<iframe');
        const isUrl = /^https?:\/\//i.test(maps_link);
        
        if (!isIframe && !isUrl) {
            errors.push('O link do mapa deve ser uma URL válida (http:// ou https://) ou um iframe completo');
        }
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ 
            success: false,
            message: 'Validação falhou',
            errors 
        });
    }
    
    try {
        const result = await pool.query(
            `UPDATE contatos_assistencia SET 
                numero_whatsapp = $1, 
                nome_hospital = $2, 
                logradouro = COALESCE($3, logradouro), 
                numero = COALESCE($4, numero), 
                bairro = COALESCE($5, bairro), 
                cidade = $6, 
                estado = $7, 
                setor = COALESCE($8, setor),
                email = COALESCE($9, email),
                maps_link = COALESCE($10, maps_link),
                updated_at = NOW()
            WHERE id = $11 RETURNING *`,
            [
                numero_whatsapp.replace(/\D/g, ''),
                nome_hospital.trim(),
                logradouro?.trim(),
                numero?.trim(),
                bairro?.trim(),
                cidade.trim(),
                estado.trim(),
                setor?.trim(),
                email?.trim(),
                maps_link?.trim(),
                id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Contato não encontrado' 
            });
        }

        const contatoAtualizado = result.rows[0];
        
        res.status(200).json({
            success: true,
            message: 'Contato atualizado com sucesso',
            data: contatoAtualizado
        });

    } catch (err) {
        console.error('Erro ao atualizar contato:', err);
        res.status(500).json({ 
            success: false,
            message: 'Erro no servidor ao atualizar contato',
            error: err.message 
        });
    }
};

module.exports = {
    atualizarContatoController
};