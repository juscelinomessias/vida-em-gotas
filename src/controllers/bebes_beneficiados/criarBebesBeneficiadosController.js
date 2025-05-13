const pool = require('../../config/conexao');
const path = require('path');

// Rota para a página web de criação
const criarBebesBeneficiadosWeb = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin/admin_view_bebes_beneficiados', 'criar_bebes_beneficiados.html'));
};

// Controlador para criar novo registro de bebês beneficiados
const criarBebesBeneficiadosController = async (req, res) => {
    try {
        const { total_bebes_beneficiados } = req.body;

        // Validação simples
        if (!total_bebes_beneficiados || isNaN(total_bebes_beneficiados) || total_bebes_beneficiados < 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Número de bebês beneficiados inválido' 
            });
        }

        // Verifica se já existe um registro
        const checkQuery = 'SELECT * FROM bebes_beneficiados LIMIT 1';
        const checkResult = await pool.query(checkQuery);

        let result;
        if (checkResult.rows.length > 0) {
            // Atualiza o registro existente
            const updateQuery = `
                UPDATE bebes_beneficiados 
                SET total_bebes_beneficiados = $1, updated_at = NOW()
                RETURNING *
            `;
            result = await pool.query(updateQuery, [total_bebes_beneficiados]);
        } else {
            // Cria um novo registro
            const insertQuery = `
                INSERT INTO bebes_beneficiados (total_bebes_beneficiados)
                VALUES ($1)
                RETURNING *
            `;
            result = await pool.query(insertQuery, [total_bebes_beneficiados]);
        }

        res.status(201).json({
            success: true,
            message: 'Registro de bebês beneficiados atualizado com sucesso',
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Erro ao criar/atualizar registro de bebês beneficiados:', err.message);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao processar registro de bebês beneficiados',
            error: err.message
        });
    }
};

module.exports = {
    criarBebesBeneficiadosWeb,
    criarBebesBeneficiadosController
};