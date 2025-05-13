const pool = require('../../config/conexao');

const listarEstatisticasDashboard = async (req, res) => {
    try {
        // Todas as consultas serão executadas em paralelo
        const [
            bancosLeiteResult,
            doadorasAtivasResult,
            doadorasInativasResult,
            totalDoacoesResult,
            bebesBeneficiadosResult,
            doadorasExclusivasResult,
            coletaDomiciliarResult,
            variacaoMensalResult
        ] = await Promise.all([
            // 1. Contagem de bancos de leite distintos
            pool.query(`
                SELECT COUNT(DISTINCT receptor) AS total 
                FROM doadoras 
                WHERE receptor IS NOT NULL
            `),
            
            // 2. Contagem de doadoras ativas (situacao = TRUE)
            pool.query(`
                SELECT COUNT(*) AS total 
                FROM doadoras 
                WHERE situacao = TRUE
            `),
            
            // 3. Nova consulta: Contagem de doadoras inativas (situacao = FALSE)
            pool.query(`
                SELECT COUNT(*) AS total 
                FROM doadoras 
                WHERE situacao = FALSE
            `),
            
            // 4. Soma total de leite doado
            pool.query(`
                SELECT COALESCE(SUM(quantidade_leite_mL), 0) AS total 
                FROM doadoras
                WHERE situacao = TRUE
            `),
            
            // 5. Total de bebês beneficiados
            pool.query(`
                SELECT COALESCE(SUM(total_bebes_beneficiados), 0) AS total 
                FROM bebes_beneficiados
            `),
            
            // 6. Doadoras exclusivas
            pool.query(`
                SELECT COUNT(*) AS total 
                FROM doadoras 
                WHERE doadora_exclusiva = TRUE AND situacao = TRUE
            `),
            
            // 7. Coleta domiciliar
            pool.query(`
                SELECT COUNT(*) AS total 
                FROM doadoras 
                WHERE coleta_domiciliar = TRUE AND situacao = TRUE
            `),
            
            // 8. Variação mensal
            pool.query(`
                WITH doacoes_mes_atual AS (
                    SELECT COALESCE(SUM(quantidade_leite_mL), 0) AS total
                    FROM doadoras
                    WHERE created_at >= date_trunc('month', CURRENT_DATE)
                    AND situacao = TRUE
                ),
                doacoes_mes_anterior AS (
                    SELECT COALESCE(SUM(quantidade_leite_mL), 0) AS total
                    FROM doadoras
                    WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
                    AND created_at < date_trunc('month', CURRENT_DATE)
                    AND situacao = TRUE
                )
                SELECT 
                    ma.total AS total_atual,
                    man.total AS total_anterior,
                    (ma.total - man.total) AS diferenca,
                    CASE 
                        WHEN man.total = 0 AND ma.total = 0 THEN 0
                        WHEN man.total = 0 THEN 100
                        ELSE ROUND(((ma.total::numeric - man.total::numeric) / man.total::numeric) * 100, 2)
                    END AS percentual
                FROM doacoes_mes_atual ma, doacoes_mes_anterior man;
            `)
        ]);

        // Extraindo e convertendo os valores
        const bancosLeite = parseInt(bancosLeiteResult.rows[0]?.total || 0);
        const doadorasAtivas = parseInt(doadorasAtivasResult.rows[0]?.total || 0);
        const doadorasInativas = parseInt(doadorasInativasResult.rows[0]?.total || 0); // Novo dado
        const totalDoacoesLitros = parseFloat(totalDoacoesResult.rows[0]?.total || 0) / 1000;
        const bebesBeneficiados = parseInt(bebesBeneficiadosResult.rows[0]?.total || 0);
        const doadorasExclusivas = parseInt(doadorasExclusivasResult.rows[0]?.total || 0);
        const coletaDomiciliar = parseInt(coletaDomiciliarResult.rows[0]?.total || 0);
        
        // Cálculo da média por doadora (em litros)
        const mediaPorDoadora = doadorasAtivas > 0 
            ? totalDoacoesLitros / doadorasAtivas 
            : 0;

        // Varição mensal
        const variacaoRow = variacaoMensalResult.rows[0] || {};
        const totalAtual = parseFloat(variacaoRow.total_atual || 0);
        const totalAnterior = parseFloat(variacaoRow.total_anterior || 0);
        const diferenca = parseFloat(variacaoRow.diferenca || 0);
        const percentual = parseFloat(variacaoRow.percentual || 0);

        // Retornando todos os dados consolidados
        res.json({
            bancosLeite,
            doadorasAtivas,
            doadorasInativas, // Incluindo doadoras inativas
            totalDoacoesLitros: parseFloat(totalDoacoesLitros.toFixed(2)),
            bebesBeneficiados,
            mediaPorDoadora: parseFloat(mediaPorDoadora.toFixed(2)),
            doadorasExclusivas,
            coletaDomiciliar,
            variacaoMensal: {
                totalAtual,
                totalAnterior,
                diferenca,
                percentual
            },
            outrasEstatisticas: {
                percentualExclusivas: doadorasAtivas > 0 
                    ? parseFloat(((doadorasExclusivas / doadorasAtivas) * 100).toFixed(2))
                    : 0,
                percentualDomiciliar: doadorasAtivas > 0 
                    ? parseFloat(((coletaDomiciliar / doadorasAtivas) * 100).toFixed(2))
                    : 0,
                totalDoadoras: doadorasAtivas + doadorasInativas,
                percentualAtivas: doadorasAtivas + doadorasInativas > 0 
                    ? parseFloat(((doadorasAtivas / (doadorasAtivas + doadorasInativas)) * 100).toFixed(2))
                    : 0
            }
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas do dashboard:', error);
        res.status(500).json({ 
            mensagem: 'Erro interno do servidor',
            detalhes: error.message 
        });
    }
};

module.exports = {
    listarEstatisticasDashboard
};