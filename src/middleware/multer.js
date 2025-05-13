const multer = require('multer');

// Configuração do Multer para upload único
const multerConfig = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1 // Aceita apenas 1 arquivo
  }
};

// Middleware para upload único (campo 'imagem_mae')
const uploadSingle = multer(multerConfig).single('imagem_mae');

const handleUploadSingle = (req, res, next) => {
  console.log('Iniciando upload único...', {
    headers: req.headers['content-type'],
    bodyFields: Object.keys(req.body)
  });

  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Erro no upload único:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });

      let message = 'Erro no processamento do arquivo';
      if (err.code === 'LIMIT_FILE_SIZE') message = 'Arquivo muito grande (máx. 10MB)';
      if (err.message.includes('Unexpected field')) message = 'Campo de upload inválido (esperado: imagem_mae)';

      return res.status(400).json({ 
        success: false,
        message,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    
    next();
  });
};

module.exports = handleUploadSingle;