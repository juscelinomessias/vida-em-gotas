// services/awsService.js
require('dotenv').config(); // Carrega variáveis do .env
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Configuração do cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


/**
 * Faz upload de uma imagem para o S3
 * @param {Buffer} fileBuffer - Buffer do arquivo
 * @param {string} fileName - Nome do arquivo
 * @param {string} mimetype - Tipo do arquivo (ex: 'image/jpeg')
 * @returns {Promise<string>} URL pública da imagem
 */
const uploadImagemS3 = async (fileBuffer, fileName, mimetype) => {
    const BUCKET = process.env.AWS_BUCKET_NAME || 'testevida'; // fallback
    
    if (!BUCKET) throw new Error('Nome do bucket não configurado');
  
    const params = {
      Bucket: BUCKET, // <-- Usa a variável corrigida
      Key: `depoimentos/${Date.now()}-${fileName}`,
      Body: fileBuffer,
      ContentType: mimetype,
      ACL: 'public-read'
    };
  
  
    try {
      await s3Client.send(new PutObjectCommand(params));
      return params.Key; // só a key vai pro banco
    } catch (err) {
      console.error('Erro detalhado do S3:', {
        message: err.message,
        stack: err.stack,
        params: params // Mostra os parâmetros usados
      });
      throw new Error('Falha no upload: ' + err.message);
    }
  };

/**
 * Deleta uma imagem do S3
 * @param {string} imageKey - Chave da imagem no S3
 * @returns {Promise<boolean>} True se deletado com sucesso
 */
const deletarImagemS3 = async (imageKey) => {
    if (!imageKey || !process.env.AWS_BUCKET_NAME) {
        console.log('Configuração incompleta para deletar imagem');
        return false;
    }

    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imageKey
        });

        await s3Client.send(command);
        return true;
    } catch (err) {
        console.error('Erro ao deletar imagem do S3:', err.message);
        return false;
    }
};

module.exports = {
    uploadImagemS3,
    deletarImagemS3
};