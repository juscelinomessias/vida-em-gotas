const express = require('express');
const path = require('path');

// Importa o middleware de autenticação
const { handleUpload, processarImagens } = require('../middleware/multerConfig');
const handleUploadSingle = require('../middleware/uploadSingle');
const multer = require('../middleware/multer');


// Importa os Controllers usuários
const { logarUsuariosWeb, logarUsuariosController } = require('../controllers/usuarios/logarUsuariosController');
const { criarUsuariosController } = require('../controllers/usuarios/criarUsuariosController');

// Importa os Controllers doadoras
const { criarDoadorasController, criarDoadorasWeb } = require('../controllers/doadoras/criarDoadorasController');
const { listarDoadorasWeb, listarDoadorasController } = require('../controllers/doadoras/listarDoadorasController');
const { alternarStatusDoadora, atualizarDoadorControllerModal, adicionarLeite, editarDoadoraWeb,  atualizarDoadorasController } = require('../controllers/doadoras/atualizarDoadorController');
const { obterDoadorasController, obterDoadoraPorId, obterDoadoraController } = require('../controllers/doadoras/obterDoadorasController');
const { deletarDoadoraController } = require('../controllers/doadoras/deletarDoadoraController');

// Importa os Controllers Orientacao
const { criarOrientacoesController, criarOrientacoesWeb } = require('../controllers/orientacoes/criarOrientacoesController');
const { listarOrientacoesController, listarOrientacoesWeb, listarOrientacoesVideoController, listarOrientacoes } = require('../controllers/orientacoes/listarOrientacoesController');
const { buscarOrientacaoController, obterOrientacaoPorId, atualizarOrientacao, obterOrientacaoPorIdWeb } = require('../controllers/orientacoes/buscarOrientacaoController');
const { atualizarOrientacaoController, atualizarOrientacaoDestacada } = require('../controllers/orientacoes/atualizarOrientacaoController');
const { excluirOrientacaoController } = require('../controllers/orientacoes/excluirOrientacaoController');

// Importa os Controllers Depoimentos
const { criarDepoimentosController, criarDepoimentosWeb } = require('../controllers/depoimentos/criarDepoimentosController');
const { obterDepoimentoPorId, buscarDepoimentoController } = require('../controllers/depoimentos/buscarDepoimentoController');
const { listarDepoimentosWeb, listarDepoimentosAdminController, listarDepoimentosFrontController } = require('../controllers/depoimentos/listarDepoimentosController');
const { atualizarDepoimentoController, atualizarDepoimentoDestacada } = require('../controllers/depoimentos/atualizarDepoimentoController');

const { obterDepoimentoDestacada } = require('../controllers/depoimentos/DepoimentoController');

//  Importa os Controllers Dúvidas
const { listarDuvidasController, listarDuvidasWeb } = require('../controllers/duvidas/listarDuvidasController');
const { buscarDuvidas } = require('../controllers/duvidas/buscarDuvidasController');
const { criarDuvidasController, criarDuvidasWeb } = require('../controllers/duvidas/criarDuvidasController');
const { deletarDuvidasController } = require('../controllers/duvidas/deletarDuvidasController');
const { destacarDuvidaController } = require('../controllers/duvidas/destacarBooleanoController');
const { atualizarDuvida } = require('../controllers/duvidas/atualizarDuvidasController');
const { obterDuvidaPorId } = require('../controllers/duvidas/obterDuvidaController');

// Importa os Controllers BebesBeneficiados
const { criarBebesBeneficiadosController, criarBebesBeneficiadosWeb } = require('../controllers/bebes_beneficiados/criarBebesBeneficiadosController');
const { listarBebesBeneficiadosController, listarBebesBeneficiadosWeb } = require('../controllers/bebes_beneficiados/listarBebesBeneficiadosController');
const { obterBebesBeneficiados } = require('../controllers/bebes_beneficiados/obterBebesBeneficiadosController');
const { atualizarBebesBeneficiados, ajustarBebes } = require('../controllers/bebes_beneficiados/atualizarBebesBeneficiadosController');

// Importa os Controllers MenuSite
const { exibirPaginaOrientacaoSite, exibirPaginaInicioSite, exibirPaginaDoarLeiteSite, exibirPaginaDoacaoSite, exibirPaginaPerguntasSite, exibirPaginaNoticiasSite, exibirPaginaNoticiasDetalhesSite, exibirPaginaAdminSite, exibirPaginaVitaEmGotaDetalhesSite } = require('../controllers/rotas_menu_site/rotasMenuSiteController');


// Importando os JS's para o FRONTEND Números que Fazem SECTION
const { listarBebesBeneficiadosFront } = require('../controllers/bebes_beneficiados/controllersFront/listarBebesBeneficiados');
const { listarDoadorasAtivas, listarTotalLeiteHumano } = require('../controllers/doadoras/controllersFront/SUMTabelDoadoras');

// Importando os JS's para o FRONTEND Perguntas Frequentes SECTION
const { listarDuvidasFront } = require('../controllers/duvidas/controllersFront/listarDuvidasFront');
const { listarTodasDuvidasFront } = require('../controllers/duvidas/controllersFront/listarTodasAsDuvidasFront');

// Importa os Controllers Noticias
const { criarNoticiasWeb, criarNoticiasController } = require('../controllers/noticias/criarNoticiasController');
const { listarNoticiasWeb, listarNoticiasVideoController } = require('../controllers/noticias/listarNoticiasController');



// Importa os Controllers Contatos
const { criarContatosWeb, criarContatoController } = require('../controllers/contatos_assistencia/criarContatoController');
const { listarContatosWeb, listarContatosController } = require('../controllers/contatos_assistencia/listarContatosController');
const { excluirContatoController } = require('../controllers/contatos_assistencia/excluirContatoController');
const { atualizarContatoController } = require('../controllers/contatos_assistencia/atualizarContatoController');
const { obterContatoController, obterWhatsAppController, getFooterData, obterLocalLeiteController } = require('../controllers/contatos_assistencia/obterContatoController');

// Importa os Controllers de doadoras front
const { criarDoadorasFrontController } = require('../controllers/doar_leite_cadastro_front/criarDoardorasFrontController');

// importar os controllers Momento Mamãe 
const { criarMomentoMaeController, criarMomentomamaeWeb } = require('../controllers/momento_mamae/criarMomentoController');
const { listarMomentosMaeFrontController, listarMomentoMaeWeb, listarMomentosMaeController } = require('../controllers/momento_mamae/listarMomentoController');
const { atualizarDestacadoMomentoMaeController } = require('../controllers/momento_mamae/atualizarDestacadoMomentoController');
const { excluirMomentoMaeController } = require('../controllers/momento_mamae/deletarMomentoController');

// Importa os Controllers Dashboard
const { listarEstatisticasDashboard } = require('../controllers/dashboard/estatisticasController');
const { calcularVariacoes } = require('../controllers/dashboard/variacaoController');
const { obterDoacoesMensais, obterDoadorasPorMes, obterEstatisticasTipoColeta, obterDoadorasPorTipo, obterTopProfissoes, obterFaixaEtaria } = require('../controllers/dashboard/obterDoacoesMensais');
const { obterDoadorasRecentes, obterDepoimentosRecentes } = require('../controllers/dashboard/dashboardController');

// Importando os Controllers de Usuarios ADM
const { listarUsuariosADMController, listarUsuariosADMWeb, buscarUsuariosADMController, listarUsuariosADMFrontController } = require('../controllers/gerenciar_usuarios_adm/listarUsuariosADMController')
const { criarUsuariosADMController, criarUsuariosADMWeb } = require('../controllers/gerenciar_usuarios_adm/criarUsuariosADMController')
const { excluirUsuarioADMController } = require('../controllers/gerenciar_usuarios_adm/excluirUsuarioADMController')
const { atualizarUsuarioADMController } = require('../controllers/gerenciar_usuarios_adm/atualizarUsuarioADMController')
const { obterUsuarioADMController } = require('../controllers/gerenciar_usuarios_adm/obterUsuarioADMController')

// Importa o middleware de autenticação
const { verificarLogin } = require('../middleware/verificarLogin');
const { obterOrientacaoDestacada, obterOrientacaoDetalharPorIdWeb } = require('../controllers/orientacoes/orientacaoController');
const { buscarNoticiaController, obterNoticiaPorId, obterNoticiaPorIdWeb } = require('../controllers/noticias/buscarNoticiaController');
const { atualizarNoticiaController, atualizarNoticiaDestacada } = require('../controllers/noticias/atualizarNoticiaController');
const { obterNoticiaDestacada, obterNoticiasDetalharPorIdWeb } = require('../controllers/noticias/NoticiaController');
const { excluirNoticiaController } = require('../controllers/noticias/excluirNoticiaController');
const { excluirDepoimentoController } = require('../controllers/depoimentos/excluirDepoimentoController');





const rotas = express.Router();

// 🔓 Rotas públicas (não exigem login)
rotas.get('/login', logarUsuariosWeb);
rotas.post('/admin/login', logarUsuariosController);

// Rota para carregar a página admin principal
rotas.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin', 'index.html'));
});

// ============ ROTAS WEB (FRONT) ============

// OK - Rotas para páginas HTML (Web)
rotas.get('/', exibirPaginaInicioSite);
rotas.get('/vida-em-gotas', exibirPaginaVitaEmGotaDetalhesSite);
rotas.get('/orientacoes', exibirPaginaOrientacaoSite);
rotas.get('/noticias', exibirPaginaNoticiasSite);
rotas.get('/noticias-detalhes', exibirPaginaNoticiasDetalhesSite);
rotas.get('/duvidas', exibirPaginaPerguntasSite);
rotas.get('/doar-leite', exibirPaginaDoarLeiteSite);
rotas.get('/doar-pote', exibirPaginaDoacaoSite);
rotas.get('/admin', exibirPaginaAdminSite);

//Orientação
rotas.get('/orientacao-detalhe', obterOrientacaoPorIdWeb);
rotas.get('/api/orientacoes/obter-orientacao-por-id', obterOrientacaoDetalharPorIdWeb);

//noticias
rotas.get('/api/noticias/obter-noticia', obterNoticiaPorIdWeb);
rotas.get('/api/noticias/obter-noticia-por-id', obterNoticiasDetalharPorIdWeb);

// Rotas Web - Doadoras
rotas.get('/admin/doadoras/criar-doadoras', criarDoadorasWeb);
rotas.get('/admin/doadora/editar-doadora', editarDoadoraWeb);
rotas.get('/admin/doadoras/listar-doadoras', listarDoadorasWeb);

// Rotas Web - Orientações
rotas.get('/admin/orientacoes/criar-orientacoes', criarOrientacoesWeb);
rotas.get('/admin/orientacoes/listar-orientacoes', listarOrientacoesWeb);

// Rotas Web - Depoimentos
rotas.get('/admin/depoimentos/criar-depoimento', criarDepoimentosWeb);
rotas.get('/admin/depoimentos/listar-depoimentos', listarDepoimentosWeb);

// Rotas Web - Dúvidas
rotas.get('/admin/duvidas/listar-duvidas', listarDuvidasWeb);
rotas.get('/admin/duvidas/criar-duvidas', criarDuvidasWeb)

// Rotas Web - Bebês beneficiados
rotas.get('/admin/bebes-beneficiados/criar', criarBebesBeneficiadosWeb);
rotas.get('/admin/bebes-beneficiados/listar', listarBebesBeneficiadosWeb)

// Rotas Web - Noticias
rotas.get('/admin/noticias/criar-noticias', criarNoticiasWeb);
rotas.get('/admin/noticias/listar-noticias', listarNoticiasWeb);

// Rotas Web - Contatos
rotas.get('/admin/contatos/criar-contatos', criarContatosWeb);
rotas.get('/admin/contatos/listar-contatos', listarContatosWeb)

// Rotas web - Momento Mamae 
rotas.get('/admin/momento-mae/criar', criarMomentomamaeWeb)
rotas.get('/admin/momento-mae/listar', listarMomentoMaeWeb);

// Rotas Web - Gerenciar Usuarios ADM
rotas.get('/admin/criar-usuario-adm', criarUsuariosADMWeb);
rotas.get('/admin/gerenciar-usuario-adm', listarUsuariosADMWeb)



// ============ ROTAS API (BACK) ============



// Usuários 
rotas.post('/admin/usuarios', criarUsuariosController);


// Doadoras 
rotas.get('/api/doadoras/listar', listarDoadorasController);
rotas.post('/api/doadoras/criar', criarDoadorasController);
rotas.get('/api/doadoras/busca', obterDoadorasController);
rotas.get('/api/doadoras/obter/:id', obterDoadoraPorId);
rotas.delete('/api/doadoras/delete/:id',deletarDoadoraController);
rotas.put('/api/doadora/status/:id', alternarStatusDoadora);
rotas.put('/api/doadoras/:id/adicionar-leite', adicionarLeite);
rotas.put('/api/doadora/atualizar-modal/:id', atualizarDoadorControllerModal);
rotas.get('/api/doadoras/obter/editar-doadora/:id', obterDoadoraController);
rotas.put('/api/doadoras/obter/atualizar-doadora/:id', atualizarDoadorasController);


// Criar doadoras front
rotas.post('/web/doadoras/criar', criarDoadorasFrontController)


// Orientações
rotas.post('/api/orientacoes/criar', handleUpload, processarImagens, criarOrientacoesController);
rotas.get('/api/orientacoes/listar', listarOrientacoesVideoController);
rotas.get('/api/orientacoes/buscar', buscarOrientacaoController);
rotas.get('/api/orientacoes/obter/:id', obterOrientacaoPorId);
rotas.put('/api/orientacoes/atualizar/:id', handleUpload, processarImagens, atualizarOrientacaoController);
rotas.get('/api/orientacoes/destaque', obterOrientacaoDestacada);
rotas.put('/api/orientacoes/:id/destacada', atualizarOrientacaoDestacada);
rotas.delete('/api/orientacoes/delete/:id', excluirOrientacaoController);


// Notícias
rotas.post('/api/noticias/criar', handleUpload, processarImagens, criarNoticiasController);
rotas.get('/api/noticias/listar', listarNoticiasVideoController);
rotas.get('/api/noticias/buscar', buscarNoticiaController);
rotas.get('/api/noticias/obter/:id', obterNoticiaPorId);
rotas.put('/api/noticias/atualizar/:id', handleUpload, processarImagens, atualizarNoticiaController);
rotas.get('/api/noticias/destaque', obterNoticiaDestacada);
rotas.put('/api/noticias/:id/destacada', atualizarNoticiaDestacada);
rotas.delete('/api/noticias/delete/:id', excluirNoticiaController);


// Depoimentos
rotas.post('/api/depoimentos/criar', handleUpload, processarImagens, criarDepoimentosController);
rotas.get('/api/depoimentos/listar', listarDepoimentosAdminController);
rotas.get('/api/depoimentos/buscar', buscarDepoimentoController);
rotas.get('/api/depoimentos/obter/:id', obterDepoimentoPorId);
rotas.put('/api/depoimentos/atualizar/:id', handleUpload, processarImagens, atualizarDepoimentoController);
rotas.get('/api/depoimentos/destaque', obterDepoimentoDestacada);
rotas.put('/api/depoimentos/:id/destacada', atualizarDepoimentoDestacada);
rotas.delete('/api/depoimentos/delete/:id', excluirDepoimentoController);

// Rotas FRONTEND depoimentos section 
rotas.get('/web/depoimentos/listar', listarDepoimentosFrontController);

// Dúvidas
rotas.post('/api/duvidas/criar', criarDuvidasController);
rotas.get('/api/duvidas/listar', listarDuvidasController);
rotas.get('/api/duvidas/buscar', buscarDuvidas); 
rotas.delete('/api/duvidas/delete/:id', deletarDuvidasController);
rotas.get('/api/duvidas/obter/:id', obterDuvidaPorId);
rotas.put('/api/duvidas/destacar/:id', destacarDuvidaController);
rotas.put('/api/duvidas/atualizar/:id', atualizarDuvida);


// Rotas FRONTEND Perguntas Frequentes section 
rotas.get('/web/perguntas-frequentes', listarDuvidasFront)


// Rotas FRONTEND HTML Perguntas Frequentes section 
rotas.get('/web/todas-perguntas-frequentes', listarTodasDuvidasFront);


// Bebês beneficiados
rotas.post('/api/bebes-beneficiados/criar', criarBebesBeneficiadosController);
rotas.get('/api/bebes-beneficiados/listar', listarBebesBeneficiadosController);
rotas.get('/api/bebes-beneficiados/obter', obterBebesBeneficiados);
rotas.put('/api/bebes-beneficiados/atualizar/:id', atualizarBebesBeneficiados)
rotas.put('/api/bebesbeneficiados/:id', ajustarBebes);


// Rotas FRONTEND Números que Fazem section 
rotas.get('/web/total-bebes', listarBebesBeneficiadosFront)
rotas.get('/web/total-doadoras-ativas', listarDoadorasAtivas);
rotas.get('/web/total-leite-humano', listarTotalLeiteHumano);


// Contatos
rotas.post('/api/contatos-assistencia/criar', criarContatoController);
rotas.get('/api/contatos-assistencia/listar',  listarContatosController);
rotas.delete('/api/contatos-assistencia/:id', excluirContatoController);
rotas.get('/api/contatos-assistencia/:id', obterContatoController);
rotas.put('/api/contatos-assistencia/atualizar/:id', atualizarContatoController);


// Rota para obter o número de WhatsApp da tabela de configurações
rotas.get('/api/configuracoes/whatsapp', obterWhatsAppController);
rotas.get('/api/contatos/footer-data', getFooterData);
rotas.get('/api/contatos/pontos-entrega', obterLocalLeiteController);


// Momento Mamãe
rotas.post('/api/momento-mae/criar', handleUploadSingle, criarMomentoMaeController);
rotas.get('/api/momento-mae/listar', listarMomentosMaeController);
rotas.delete('/api/momento-mae/delete/:id', excluirMomentoMaeController);
rotas.put('/api/momento-mae/:id/destacado', atualizarDestacadoMomentoMaeController);


// Rotas FRONTEND momento-mae section 
rotas.get('/web/momento-mae/listar', listarMomentosMaeFrontController);


// Dashboard
rotas.get('/api/dashboard/estatisticas', listarEstatisticasDashboard);
rotas.get('/api/dashboard/variacoes', calcularVariacoes);
rotas.get('/api/dashboard/doacoes-mensais', obterDoacoesMensais);
rotas.get('/api/dashboard/doadoras-por-mes/:mes', obterDoadorasPorMes);
rotas.get('/api/dashboard/doadoras-recentes', obterDoadorasRecentes);
rotas.get('/api/dashboard/depoimentos-recentes', obterDepoimentosRecentes);
rotas.get('/api/dashboard/tipo-coleta', obterEstatisticasTipoColeta);
rotas.get('/api/dashboard/tipo-coleta/:tipo', obterDoadorasPorTipo);
rotas.get('/api/dashboard/profissoes-doadoras', obterTopProfissoes);
rotas.get('/api/dashboard/faixa-etaria-doadoras', obterFaixaEtaria);


// API - Gerenciar usuarios ADM
rotas.post('/api/usuario-adm/criar', criarUsuariosADMController)
rotas.get('/api/usuario-adm/listar', listarUsuariosADMFrontController);
rotas.get('/api/usuario-adm/buscar', buscarUsuariosADMController);
rotas.delete('/api/usuario-adm/delete/:id', excluirUsuarioADMController);
rotas.put('/api/usuario-adm/atualizar/:id', atualizarUsuarioADMController);
rotas.get('/api/usuario-adm/obter/:id', obterUsuarioADMController);


// Menu Usuario ADM Lógicas.
rotas.get('/api/usuario/me', verificarLogin, (req, res) => {
    res.json({
        success: true,
        data: {
            id: req.user.id,
            nome: req.user.nome,
            email: req.user.email
        }
    });
});


// Rota de logout aprimorada
rotas.post('/api/logout', verificarLogin, (req, res) => {
    try {
        res.status(200).json({ 
            success: true,
            message: 'Logout realizado com sucesso'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao realizar logout'
        });
    }
});


module.exports = rotas;