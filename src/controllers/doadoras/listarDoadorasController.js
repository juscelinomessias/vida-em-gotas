const pool = require('../../config/conexao');
const path = require('path');

// Rota para a página de listar doadoras
const listarDoadorasWeb = (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/admin/admin_view_doadoras', 'listar_doadoras.html'));
};

// Controlador para listar todas as doadoras com paginação e filtro por situação
const listarDoadorasController = async (req, res) => {
  try {
    const { page = 1, limit = 5, situacao } = req.query;
    const offset = (page - 1) * limit;

    // Base da query para buscar as doadoras com telefones e endereços
    let query = `
      SELECT 
          d.id, 
          d.nome, 
          d.nome_da_mae,
          d.data_de_cadastro,
          d.data_de_nascimento,
          d.naturalidade,
          d.profissao,
          d.quantidade_leite_mL,
          d.coleta_domiciliar,
          d.doadora_exclusiva,
          d.receptor,
          d.situacao,
          ARRAY_AGG(DISTINCT tel.telefone) AS telefones,
          json_agg(
              json_build_object(
                  'cep', e.cep,
                  'logradouro', e.logradouro,
                  'numero', e.numero,
                  'bairro', e.bairro,
                  'ponto_de_referencia', e.ponto_de_referencia,
                  'municipio', e.municipio,
                  'latitude', e.latitude,
                  'longitude', e.longitude
              )
          ) AS enderecos
      FROM doadoras d
      LEFT JOIN telefones tel ON d.id = tel.doadoras_id
      LEFT JOIN enderecos e ON d.id = e.doadoras_id
    `;

    // Filtro por situação (se fornecido)
    let whereClause = '';
    if (situacao !== undefined) {
      whereClause = ` WHERE d.situacao = ${situacao === 'true'}`; // Converte 'true'/'false' para booleano
    }

    // Completa a query com o filtro, agrupamento e paginação
    query += `
      ${whereClause}
      GROUP BY d.id
      LIMIT $1 OFFSET $2
    `;

    // Query para contar o total de doadoras (com filtro, se aplicável)
    let countQuery = `SELECT COUNT(*) AS total FROM doadoras d`;
    if (situacao !== undefined) {
      countQuery += ` WHERE d.situacao = ${situacao === 'true'}`;
    }

    // Executa as consultas
    const result = await pool.query(query, [Number(limit), Number(offset)]);
    const totalResult = await pool.query(countQuery);

    // Calcula o total de páginas
    const totalPaginas = Math.ceil(totalResult.rows[0].total / limit);

    // Retorna os resultados
    res.status(200).json({
      doadoras: result.rows,
      totalPaginas,
      paginaAtual: Number(page),
      totalDoadoras: totalResult.rows[0].total
    });

  } catch (err) {
    console.error('Erro ao listar doadoras:', err.message);
    res.status(500).json({ mensagem: 'Erro ao listar doadoras' });
  }
};

module.exports = {
  listarDoadorasController,
  listarDoadorasWeb  
};