const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes");
const path = require("path");
const multer = require('multer'); // Substituindo o express-fileupload

const app = express();

// Configuração do CORS (Aumentada)
const corsOptions = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: [
        "Content-Type", 
        "Authorization", 
        "X-Requested-With",
        "Content-Disposition" // Importante para uploads
    ],
    credentials: true,
    exposedHeaders: ["Content-Disposition"]
};
app.use(cors(corsOptions));

// Configurações de limite aumentadas
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ 
    extended: true, 
    limit: '50mb',
    parameterLimit: 10000 // Aumentando o limite de parâmetros
}));

// Configuração do Multer para uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1,
        parts: 100 // Aumentando o número de partes
    }
});

// Middleware para disponibilizar o upload em todas as rotas
app.use((req, res, next) => {
    req.upload = upload; // Agora todas as rotas podem acessar req.upload
    next();
});

// Rota de teste para uploads
app.post('/api/upload-test', upload.single('imagem_mae'), (req, res) => {
    console.log('Teste de upload recebido:', {
        file: req.file ? {
            name: req.file.originalname,
            size: req.file.size
        } : null,
        body: req.body
    });
    res.status(200).json({ 
        success: true,
        message: 'Upload testado com sucesso' 
    });
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rotas principais
app.use("/", routes);

// Middleware para erro 404
app.use((req, res, next) => {
    res.status(404).json({ 
        success: false, 
        message: 'Rota não encontrada' 
    });
});

// Middleware para tratamento de erros (melhorado)
app.use((err, req, res, next) => {
    console.error('Erro global:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        originalError: err.originalError || null
    });
    
    res.status(500).json({ 
        success: false, 
        message: 'Erro interno no servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;