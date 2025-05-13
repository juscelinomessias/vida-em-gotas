const app = require("./app");


// Configurações do servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// Aumentando o timeout para uploads grandes
server.timeout = 60000; // 60 segundos

// Tratamento de erros de inicialização
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`⚠️  A porta ${PORT} já está em uso!`);
    } else {
        console.error('Erro no servidor:', error);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Processo terminado');
    });
});