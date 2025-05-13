const pool = require('../../config/conexao');

// Função para tratar valores infinitos
const tratarInfinito = (valor) => {
  if (!isFinite(valor)) return valor > 0 ? 1000 : -1000;
  return valor;
};

const calcularVariacoes = async () => {
    const query = `
        SELECT 
        -- Bancos de leite
        (SELECT COUNT(DISTINCT receptor) 
            FROM doadoras 
            WHERE created_at >= date_trunc('month', CURRENT_DATE)) AS bancos_atual,
            
        (SELECT COUNT(DISTINCT receptor) 
            FROM doadoras 
            WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
            AND created_at < date_trunc('month', CURRENT_DATE)) AS bancos_anterior,
        
        -- Doadoras
        (SELECT COUNT(*) 
            FROM doadoras 
            WHERE situacao = TRUE 
            AND created_at >= date_trunc('month', CURRENT_DATE)) AS doadoras_atual,
            
        (SELECT COUNT(*) 
            FROM doadoras 
            WHERE situacao = TRUE 
            AND created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
            AND created_at < date_trunc('month', CURRENT_DATE)) AS doadoras_anterior,
        
        -- Doações (mL)
        (SELECT COALESCE(SUM(quantidade_leite_mL), 0)
            FROM doadoras
            WHERE created_at >= date_trunc('month', CURRENT_DATE)) AS doacoes_atual,
            
        (SELECT COALESCE(SUM(quantidade_leite_mL), 0)
            FROM doadoras
            WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
            AND created_at < date_trunc('month', CURRENT_DATE)) AS doacoes_anterior,
        
        -- Bebês beneficiados
        (SELECT COALESCE(SUM(total_bebes_beneficiados), 0)
            FROM bebes_beneficiados
            WHERE created_at >= date_trunc('month', CURRENT_DATE)) AS bebes_atual,
            
        (SELECT COALESCE(SUM(total_bebes_beneficiados), 0)
            FROM bebes_beneficiados
            WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
            AND created_at < date_trunc('month', CURRENT_DATE)) AS bebes_anterior
    `;

    try {
        const { rows } = await pool.query(query);
        const dados = rows[0];
        
        const calcularPorcentagem = (atual, anterior) => {
            if (anterior === 0) return atual === 0 ? 0 : 1000; // 1000% para indicar crescimento de zero
            return ((atual - anterior) / anterior) * 100;
        };

        const variacoes = {
            variacaoBanco: tratarInfinito(calcularPorcentagem(dados.bancos_atual, dados.bancos_anterior)),
            variacaoDoadoras: tratarInfinito(calcularPorcentagem(dados.doadoras_atual, dados.doadoras_anterior)),
            variacaoDoacoes: tratarInfinito(calcularPorcentagem(dados.doacoes_atual, dados.doacoes_anterior)),
            variacaoBebes: tratarInfinito(calcularPorcentagem(dados.bebes_atual, dados.bebes_anterior)),
            variacaoMedia: tratarInfinito(calcularPorcentagem(
                dados.doadoras_atual > 0 ? dados.doacoes_atual / dados.doadoras_atual : 0,
                dados.doadoras_anterior > 0 ? dados.doacoes_anterior / dados.doadoras_anterior : 0
            ))
        };

        return variacoes;

    } catch (error) {
        console.error('Erro ao calcular variações:', error);
        throw error;
    }
};

module.exports = {
    calcularVariacoes
};