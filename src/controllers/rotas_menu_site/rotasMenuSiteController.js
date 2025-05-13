const path = require('path');
const pool = require('../../config/conexao');

// Rota para a página criar Categorias Parceiros
const exibirPaginaAdminSite = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/admin', 'index.html'));
};

// Rota para a página criar Categorias Parceiros
const exibirPaginaOrientacaoSite = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'orientacoes.html'));
};

// Rota para a página criar Categorias Parceiros
const exibirPaginaOrientacaoDetalhesSite = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'orientacoes-detalhes.html'));
};

// Rota para a página criar Categorias Parceiros
const exibirPaginaInicioSite = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'index.html'));
};

// Rota para a página criar Categorias Parceiros
const exibirPaginaDoarLeiteSite = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'doar-leite.html'));
};

// Rota para a página criar Categorias Parceiros
const exibirPaginaDoacaoSite = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'doar-pote.html'));
};

// Rota para a página criar Categorias Parceiros
const exibirPaginaPerguntasSite = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'perguntas.html'));
};

// Rota para a página criar Categorias Parceiros
const exibirPaginaNoticiasSite = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'noticias.html'));
};

// Rota para a página criar Categorias Parceiros
const exibirPaginaNoticiasDetalhesSite = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'noticias-detalhes.html'));
};

// Rota para a página criar Categorias Parceiros
const exibirPaginaVitaEmGotaDetalhesSite = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'vida-em-gota.html'));
};

module.exports = {
    exibirPaginaOrientacaoSite,
    exibirPaginaInicioSite,
    exibirPaginaDoarLeiteSite,
    exibirPaginaDoacaoSite,
    exibirPaginaPerguntasSite,
    exibirPaginaNoticiasSite,
    exibirPaginaNoticiasDetalhesSite,
    exibirPaginaOrientacaoDetalhesSite,
    exibirPaginaAdminSite,
    exibirPaginaVitaEmGotaDetalhesSite
};
