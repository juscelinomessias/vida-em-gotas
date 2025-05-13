const pool = require('../../config/conexao');
const path = require('path');

// Rota para a página de criação de contatos
const criarContatosWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_contatos_assistencia', 'criar_contatos.html'));
};

// Função para validar email
const validarEmail = (email) => {
    if (!email) return true; // Campo não obrigatório
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Criar um novo contato
const criarContatoController = async (req, res) => {
    const { 
        numero_whatsapp, 
        nome_hospital,
        email,
        maps_link, 
        logradouro, 
        numero, 
        bairro, 
        cidade, 
        estado, 
        setor 
    } = req.body;

    // Validações de campos obrigatórios
    if (!numero_whatsapp || !numero_whatsapp.trim()) {
        return res.status(400).json({ 
            success: false,
            message: 'O campo Número do WhatsApp é obrigatório.' 
        });
    }
    
    if (!nome_hospital || !nome_hospital.trim()) {
        return res.status(400).json({ 
            success: false,
            message: 'O campo Nome do Hospital é obrigatório.' 
        });
    }

    // Validação do email
    if (email && !validarEmail(email)) {
        return res.status(400).json({ 
            success: false,
            message: 'Formato de email inválido.' 
        });
    }

    // Validação do número de WhatsApp
    const numeroLimpo = numero_whatsapp.replace(/\D/g, '');
    
    if (numeroLimpo.length !== 12 && numeroLimpo.length !== 13) {
        return res.status(400).json({ 
            success: false,
            message: 'Número de WhatsApp inválido. Deve conter 12 ou 13 dígitos (incluindo código do país 55).' 
        });
    }

    if (!numeroLimpo.startsWith('55')) {
        return res.status(400).json({ 
            success: false,
            message: 'O número deve incluir o código do Brasil (55). Exemplo: 5584999999999' 
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO contatos_assistencia (
                numero_whatsapp, 
                nome_hospital,
                email,
                maps_link,
                logradouro, 
                numero, 
                bairro, 
                cidade, 
                estado, 
                setor
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [
                numeroLimpo, // Já limpo e validado
                nome_hospital.trim(),
                email ? email.trim() : null,
                maps_link ? maps_link.trim() : null,
                logradouro ? logradouro.trim() : null,
                numero ? numero.trim() : null,
                bairro ? bairro.trim() : null,
                cidade ? cidade.trim() : null,
                estado ? estado.trim() : null,
                setor ? setor.trim() : null
            ]
        );

        return res.status(201).json({ 
            success: true,
            message: 'Contato cadastrado com sucesso!',
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Erro ao criar contato:', err);
        
        // Tratamento para erros específicos do PostgreSQL
        switch (err.code) {
            case '23505': // Violação de chave única
                return res.status(400).json({
                    success: false,
                    message: 'Este número de WhatsApp já está cadastrado.'
                });
            case '22001': // Valor muito longo para o tipo de coluna
                return res.status(400).json({
                    success: false,
                    message: 'Algum campo excede o tamanho máximo permitido.'
                });
            case '23502': // Violação de not-null
                return res.status(400).json({
                    success: false,
                    message: 'Campo obrigatório não informado.'
                });
            default:
                return res.status(500).json({ 
                    success: false,
                    message: 'Erro ao criar contato.', 
                    error: err.message 
                });
        }
    }
};

module.exports = {
    criarContatosWeb,
    criarContatoController
};