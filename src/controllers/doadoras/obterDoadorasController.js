const pool = require('../../config/conexao'); // Importa a conexão com o banco

// 🔍 Buscar doadora por ID (para detalhamento)
const obterDoadoraPorId = async (req, res) => {
  try {
      const { id } = req.params;

      const query = `
          SELECT 
              d.id, 
              d.nome, 
              d.nome_da_mae,
              d.data_de_cadastro,
              d.data_de_nascimento,
              d.naturalidade,
              d.profissao,
              d.quantidade_leite_mL, -- Certifique-se de que este campo está incluído
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
          WHERE d.id = $1
          GROUP BY d.id;
      `;

      const resultado = await pool.query(query, [id]);

      if (resultado.rows.length === 0) {
          return res.status(404).json({ mensagem: "Doadora não encontrada" });
      }


      res.status(200).json(resultado.rows[0]);

  } catch (err) {
      console.error("Erro ao buscar doadora por ID:", err.message);
      res.status(500).json({ mensagem: "Erro ao buscar doadora" });
  }
};

// 🔍 Buscar doadoras pelo nome (ou listar todas)
const obterDoadorasController = async (req, res) => {
  try {
    const { nome, limit = 10, offset = 0 } = req.query;

    // Se o nome for vazio ou indefinido, retorna um array vazio
    if (!nome) {
      return res.status(200).json([]);
    }

    // Query para buscar as doadoras pelo nome com paginação
    const query = `
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
      WHERE d.nome ILIKE $1
      GROUP BY d.id
      LIMIT $2 OFFSET $3;
    `;

    const values = [`%${nome}%`, limit, offset];

    // Executa a query para buscar as doadoras
    const resultado = await pool.query(query, values);
     
    res.status(200).json(resultado.rows); // Retorna as doadoras encontradas
  } catch (err) {
    console.error("Erro ao buscar doadoras:", err.message);
    res.status(500).json({ mensagem: "Erro ao buscar doadoras" });
  }
};

// Rota para obter dados de uma doadora específica
const obterDoadoraController = async (req, res) => {
  const { id } = req.params;

  if (!id) {
      return res.status(400).json({ message: 'ID da doadora não fornecido.' });
  }

  try {
      // Obter dados básicos da doadora
      const doadoraQuery = await pool.query(
          `SELECT * FROM doadoras WHERE id = $1`,
          [id]
      );

      if (doadoraQuery.rows.length === 0) {
          return res.status(404).json({ message: 'Doadora não encontrada.' });
      }

      const doadora = doadoraQuery.rows[0];

      // Obter endereço da doadora
      const enderecoQuery = await pool.query(
          `SELECT * FROM enderecos WHERE doadoras_id = $1`,
          [id]
      );

      // Obter telefones da doadora
      const telefonesQuery = await pool.query(
          `SELECT telefone FROM telefones WHERE doadoras_id = $1`,
          [id]
      );

      // Formatar os dados para resposta
      const response = {
          ...doadora,
          endereco: enderecoQuery.rows[0] || {},
          telefones: telefonesQuery.rows.map(t => t.telefone)
      };

      res.json(response);

  } catch (err) {
      console.error('Erro ao obter dados da doadora:', err.message);
      res.status(500).json({ 
          message: 'Erro ao obter dados da doadora.', 
          error: err.message 
      });
  }
};

module.exports = {
  obterDoadoraPorId,       
  obterDoadorasController,
  obterDoadoraController 
};