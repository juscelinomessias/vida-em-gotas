const pool = require('../../config/conexao');

// Obter um contato específico
const obterContatoController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM contatos_assistencia WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Contato não encontrado' 
            });
        }

        res.json({
            success: true,
            message: 'Contato encontrado',
            data: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar contato'
        });
    }
};

// Obter o número de WhatsApp da tabela de configurações
const obterWhatsAppController = async (req, res) => {
    try {
        const result = await pool.query(`
           SELECT numero_whatsapp as numero FROM contatos_assistencia LIMIT 1
        `);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Número não configurado' 
            });
        }

        const numero = result.rows[0].numero;
        const numeroLimpo = numero.replace(/\D/g, '');
        
        if (numeroLimpo.length < 12) {
            return res.status(400).json({
                success: false,
                message: 'Número de WhatsApp inválido'
            });
        }

        res.json({
            success: true,
            message: 'Número encontrado',
            data: { 
                numero: numero,
                numero_formatado: `(${numeroLimpo.substring(2, 4)}) ${numeroLimpo.substring(4, 8)}-${numeroLimpo.substring(8, 12)}`
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar número'
        });
    }
};

const getFooterData = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        nome_hospital,
        email,
        maps_link,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        setor,
        numero_whatsapp
      FROM contatos_assistencia
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Nenhum dado de contato encontrado' 
      });
    }

    const contato = result.rows[0];
    
    // Formata os dados para o footer
    const footerData = {
      nomeHospital: contato.nome_hospital || 'Hospital Dr. José Pedro Bezerra (Hospital Santa Catarina)',
      enderecoCompleto: formatarEndereco(contato),
      localizacao: `${contato.bairro || 'Centro'}, ${contato.cidade || 'Natal'}/${contato.estado || 'RN'}`,
      mapsLink: contato.maps_link || formatarMapsLink(contato),
      telefone: formatarTelefone(contato.numero_whatsapp) || '(84) 3232-7728 ',
      email: contato.email || 'blh.hjpb@gmail.com',
      whatsapp: contato.numero_whatsapp ? `55${contato.numero_whatsapp.replace(/\D/g, '')}` : '55843232-7728'
    };

    res.json({
      success: true,
      data: footerData
    });

  } catch (err) {
    console.error('Erro ao buscar dados do footer:', err);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar dados do footer'
    });
  }
};

// Funções auxiliares
function formatarEndereco(contato) {
  const parts = [];
  if (contato.logradouro) parts.push(contato.logradouro);
  if (contato.numero) parts.push(contato.numero);
  if (contato.setor) parts.push(`- ${contato.setor}`);
  return parts.join(', ') || 'Av. Marechal Deodoro da Fonseca, 730';
}

function formatarMapsLink(contato) {
  if (contato.maps_link) return contato.maps_link;
  
  const endereco = [
    contato.logradouro || 'Av. Marechal Deodoro da Fonseca',
    contato.numero || '730',
    contato.bairro || 'Centro',
    contato.cidade || 'Natal',
    contato.estado || 'RN'
  ].join(', ');
  
  return `https://www.google.com/maps/search/${encodeURIComponent(endereco)}`;
}

function formatarTelefone(numeroWhatsapp) {
  if (!numeroWhatsapp) return null;
  const limpo = numeroWhatsapp.replace(/\D/g, '');
  return `(${limpo.substring(2, 4)}) ${limpo.substring(4, 8)}-${limpo.substring(8)}`;
}

const obterLocalLeiteController = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        nome_hospital,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        setor,
        maps_link
      FROM contatos_assistencia
      ORDER BY created_at DESC
    `);

    // Se não encontrar resultados, retorna o padrão como array
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: [
          {
            nome_hospital: 'Hospital Dr. José Pedro Bezerra (Hospital Santa Catarina)',
            logradouro: 'Rua Araquari',
            numero: 'S/N',
            bairro: 'Potengi',
            cidade: 'Natal',
            estado: 'RN',
            setor: 'Banco de Leite Humano',
            maps_link: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3969.716484069302!2d-35.25860372417601!3d-5.753888556830602!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7b255516fdeca71%3A0x2fdce5fe2acf05d6!2sHospital%20Dr.%20Jos%C3%A9%20Pedro%20Bezerra%20(Santa%20Catarina)!5e0!3m2!1spt-PT!2sbr!4v1743253809101!5m2!1spt-PT!2sbr'
          }
        ]
      });
    }

    // Garante que todos os campos necessários existam em cada registro
    const dadosFormatados = result.rows.map(item => ({
      nome_hospital: item.nome_hospital || 'Hospital Dr. José Pedro Bezerra (Hospital Santa Catarina)',
      logradouro: item.logradouro || 'Rua Araquari',
      numero: item.numero || 'S/N',
      bairro: item.bairro || 'Potengi',
      cidade: item.cidade || 'Natal',
      estado: item.estado || 'RN',
      setor: item.setor || 'Banco de Leite Humano',
      maps_link: item.maps_link || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3969.716484069302!2d-35.25860372417601!3d-5.753888556830602!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7b255516fdeca71%3A0x2fdce5fe2acf05d6!2sHospital%20Dr.%20Jos%C3%A9%20Pedro%20Bezerra%20(Santa%20Catarina)!5e0!3m2!1spt-PT!2sbr!4v1743253809101!5m2!1spt-PT!2sbr'
    }));

    res.json({
      success: true,
      data: dadosFormatados
    });

  } catch (err) {
    console.error('Erro no controller obterLocalLeite:', err);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar locais de entrega de leite',
      error: err.message
    });
  }
};

module.exports = {
    obterContatoController,
    obterWhatsAppController,
    getFooterData,
    obterLocalLeiteController
};