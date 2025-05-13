const pool = require('../../config/conexao');

const obterDoacoesMensais = async (req, res) => {
    try {
        // Consulta para obter as doações mensais dos últimos 12 meses
        const query = `
          SELECT 
              TO_CHAR(data_de_cadastro, 'YYYY-MM') AS mes,
              TRIM(TO_CHAR(data_de_cadastro, 'Month')) AS nome_mes,
              COALESCE(SUM(quantidade_leite_mL), 0) AS total_doados_ml
          FROM 
              doadoras
          WHERE 
              data_de_cadastro >= date_trunc('month', CURRENT_DATE - INTERVAL '11 months')
              AND situacao = TRUE 
          GROUP BY 
              mes, nome_mes
          ORDER BY 
              mes ASC;
        `;

        const { rows } = await pool.query(query);
        
        // Criar estrutura para meses completos (mesmo sem dados)
        const mesesCompletos = [];
        const litrosPorMes = {};
        
        // Preencher com os dados existentes
        rows.forEach(row => {
            litrosPorMes[row.mes] = parseFloat(row.total_doados_ml);
        });
      
        // Gerar os últimos 12 meses
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            
            const mes = date.toISOString().slice(0, 7); // Formato YYYY-MM
            const nomeMes = date.toLocaleString('pt-BR', { month: 'long' });
            
            mesesCompletos.push({
                mes,
                nomeMes: nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1),
                litros: litrosPorMes[mes] || 0
            });
        }

        // Preparar dados para o gráfico
        const dadosGrafico = {
            meses: mesesCompletos.map(item => item.nomeMes),
            valores: mesesCompletos.map(item => item.litros)
        };

        res.json(dadosGrafico);

    } catch (error) {
        console.error('Erro ao buscar dados de doações mensais:', error);
        res.status(500).json({ 
            mensagem: 'Erro interno do servidor ao buscar dados de doações mensais',
            detalhes: error.message 
        });
    }
};

const obterDoadorasPorMes = async (req, res) => {
    const { mes } = req.params;
  
    try {
      const query = `
      SELECT 
        nome, 
        nome_da_mae, 
        quantidade_leite_mL, 
        created_at,
        coleta_domiciliar
      FROM doadoras
      WHERE TO_CHAR(data_de_cadastro, 'YYYY-MM') = $1
        AND situacao = true
      ORDER BY created_at DESC
      `;
      
      const { rows } = await pool.query(query, [mes]);
      
      if (rows.length === 0) {
        return res.status(200).json({
          sucesso: true,
          mensagem: 'Nenhuma doadora encontrada para este mês',
          dados: []
        });
      }
      
      res.status(200).json({
        sucesso: true,
        dados: rows
      });
  
    } catch (error) {
      console.error('Erro ao buscar doadoras por mês:', error);
      res.status(500).json({ 
        sucesso: false,
        mensagem: 'Erro interno no servidor',
        erro: error.message
      });
    }
  };
  

  const obterEstatisticasTipoColeta = async (req, res) => {
    try {
      // Consulta para obter estatísticas de tipo de coleta
      const query = `
        SELECT 
          COUNT(CASE WHEN coleta_domiciliar = true THEN 1 END) AS coleta_domiciliar,
          COUNT(CASE WHEN doadora_exclusiva = true THEN 1 END) AS doadora_exclusiva,
          COUNT(CASE WHEN coleta_domiciliar = false AND doadora_exclusiva = false THEN 1 END) AS outros
        FROM doadoras
        WHERE situacao = true
      `;
  
      const { rows } = await pool.query(query);
      
      if (rows.length === 0) {
        return res.status(200).json({
          coletaDomiciliar: 0,
          doadoraExclusiva: 0,
          outros: 0
        });
      }
  
      res.status(200).json(rows[0]);
  
    } catch (error) {
      console.error('Erro ao buscar estatísticas de tipo de coleta:', error);
      res.status(500).json({ 
        sucesso: false,
        mensagem: 'Erro interno no servidor',
        erro: error.message
      });
    }
  };

  const obterDoadorasPorTipo = async (req, res) => {
    const { tipo } = req.params;
  
    try {
      // Validação do tipo
      const tiposValidos = ['coleta_domiciliar', 'doadora_exclusiva', 'outros'];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Tipo inválido. Valores aceitos: coleta_domiciliar, doadora_exclusiva, outros'
        });
      }
  
      let query;
      if (tipo === 'outros') {
        query = `
          SELECT nome, nome_da_mae, quantidade_leite_mL, created_at, coleta_domiciliar
          FROM doadoras
          WHERE coleta_domiciliar = false 
            AND doadora_exclusiva = false
            AND situacao = true
          ORDER BY created_at DESC
        `;
      } else {
        query = `
          SELECT nome, nome_da_mae, quantidade_leite_mL, created_at, coleta_domiciliar
          FROM doadoras
          WHERE ${tipo} = true
            AND situacao = true
          ORDER BY created_at DESC
        `;
      }
  
      const { rows } = await pool.query(query);
      
      res.status(200).json({
        sucesso: true,
        quantidade: rows.length,
        dados: rows
      });
  
    } catch (error) {
      console.error(`Erro ao buscar doadoras do tipo ${tipo}:`, error);
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno no servidor',
        erro: error.message
      });
    }
  };  
  
  const obterTopProfissoes = async (req, res) => {
    try {
        // Query para obter as top 5 profissões
        const query = `
            SELECT profissao, COUNT(*) as total
            FROM doadoras
            WHERE situacao = true
            GROUP BY profissao
            ORDER BY total DESC
            LIMIT 5
        `;

        const { rows } = await pool.query(query);
        
        // Formata os dados para padronização
        const dadosFormatados = rows.map(item => ({
            profissao: item.profissao || 'Não informado',
            total: parseInt(item.total)
        }));

        res.status(200).json({
            sucesso: true,
            quantidade: dadosFormatados.length,
            dados: dadosFormatados
        });

    } catch (error) {
        console.error('Erro ao buscar top profissões:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao buscar profissões das doadoras',
            erro: error.message
        });
    }
};

const obterFaixaEtaria = async (req, res) => {
  try {
      // Query com faixas etárias pré-definidas
      const query = `
          SELECT
              CASE
                  WHEN AGE(data_de_nascimento) < INTERVAL '20 years' THEN '<20'
                  WHEN AGE(data_de_nascimento) BETWEEN INTERVAL '20 years' AND INTERVAL '29 years' THEN '20-29'
                  WHEN AGE(data_de_nascimento) BETWEEN INTERVAL '30 years' AND INTERVAL '39 years' THEN '30-39'
                  ELSE '40+'
              END AS faixa_etaria,
              COUNT(*) as total
          FROM doadoras
          WHERE situacao = true
          GROUP BY faixa_etaria
          ORDER BY faixa_etaria
      `;

      const { rows } = await pool.query(query);
      
      // Garante a ordem correta das faixas etárias
      const ordemFaixas = ['<20', '20-29', '30-39', '40+'];
      const dadosOrdenados = ordemFaixas.map(faixa => {
          const encontrado = rows.find(item => item.faixa_etaria === faixa);
          return encontrado || { faixa_etaria: faixa, total: 0 };
      });

      res.status(200).json({
          sucesso: true,
          quantidade: rows.length,
          dados: dadosOrdenados
      });

  } catch (error) {
      console.error('Erro ao buscar faixa etária:', error);
      res.status(500).json({
          sucesso: false,
          mensagem: 'Erro interno ao buscar faixa etária das doadoras',
          erro: error.message
      });
  }
};

module.exports = {
    obterDoacoesMensais,
    obterDoadorasPorMes,
    obterEstatisticasTipoColeta,
    obterDoadorasPorTipo,
    obterTopProfissoes,
    obterFaixaEtaria
};