const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const multer = require('multer');

// 1. Configuração do Multer para múltiplos arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por arquivo
    files: 3, // Permite até 3 arquivos
    parts: 100, // Aumente conforme necessário
    headerPairs: 100 // Aumente conforme necessário
  }
}).array('imagens', 3); // 'imagens' deve bater com o name do input

const handleUpload = (req, res, next) => {

  upload(req, res, (err) => {
    if (err) {
      console.error('Erro detalhado no upload:', {
        message: err.message,
        code: err.code,
        stack: err.stack,
        reqHeaders: req.headers,
        reqBody: req.body
      });

      let message = 'Erro no processamento do formulário';
      if (err.code === 'LIMIT_FILE_SIZE') message = 'Arquivo muito grande (máx. 10MB)';
      if (err.code === 'LIMIT_FILE_COUNT') message = 'Máximo de 3 arquivos permitidos';
      if (err.message.includes('Unexpected end')) message = 'Formulário incompleto - verifique os dados';

      return res.status(400).json({ 
        success: false,
        message,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    // Adiciona os arquivos processados ao req para o controller
    req.uploadedFiles = req.files;
    
    next();
  });
};



const processarImagens = async (req, res, next) => {

  try {
    if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
      return next();
    }

    const imagensProcessadas = [];

    for (const arquivo of req.uploadedFiles) {
      const nomeBase = path.parse(arquivo.originalname).name;
      const novoNome = `${nomeBase}-${Date.now()}.webp`;

      const bufferConvertido = await sharp(arquivo.buffer)
        .resize(800, 600)
        .webp({ quality: 80 })
        .toBuffer();

      imagensProcessadas.push({
        nomeOriginal: arquivo.originalname,
        nomeFinal: novoNome,
        buffer: bufferConvertido,
        contentType: 'image/webp'
      });
    }

    req.imagensProcessadas = imagensProcessadas;
    next();
  } catch (erro) {
    console.error("Erro ao processar imagens:", erro);
    res.status(500).json({ success: false, message: "Erro ao otimizar imagens." });
  }
};




module.exports = {
  handleUpload,
  processarImagens
}