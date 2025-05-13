const pool = require('../../config/conexao');

const obterDoadorasRecentes = async (req, res) => {
  try {
    const query = `
      SELECT nome, data_de_cadastro, quantidade_leite_mL, coleta_domiciliar
      FROM doadoras
      WHERE situacao = true
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    const { rows } = await pool.query(query);
    res.json(rows);
    
  } catch (error) {
    console.error('Erro ao buscar doadoras recentes:', error);
    res.status(500).json({ mensagem: 'Erro interno', detalhes: error.message });
  }
};

const obterDepoimentosRecentes = async (req, res) => {
  try {
    const query = `
      SELECT nome_mae, depoimento, imagem_mae, created_at
      FROM depoimentos
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    const { rows } = await pool.query(query);
    res.json(rows);
    
  } catch (error) {
    console.error('Erro ao buscar depoimentos recentes:', error);
    res.status(500).json({ mensagem: 'Erro interno', detalhes: error.message });
  }
};

module.exports = {
  obterDoadorasRecentes,
  obterDepoimentosRecentes
};