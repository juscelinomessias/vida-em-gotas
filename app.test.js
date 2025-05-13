const request = require('supertest');
const app = require('./src/config/servidor');

describe('Testes da API - Criar Categoria Parceiro', () => {
  
  it('criarCategoriaParceiro - Deve retornar 400 se o Nome não for fornecido', async () => {
    const res = await request(app)
      .post('/categorias/parceiros')
      .send({ imagem: 'imagem.png' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Nome é obrigatório.');
  });

  it('criarCategoriaParceiro - Deve retornar 400 se o Nome for vazio', async () => {
    const res = await request(app)
      .post('/categorias/parceiros')
      .send({ nome: '', imagem: 'imagem.png' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Nome é obrigatório.');
  });

  it('criarCategoriaParceiro - Deve retornar 400 se o Nome for apenas espaços em branco', async () => {
    const res = await request(app)
      .post('/categorias/parceiros')
      .send({ nome: '   ', imagem: 'imagem.png' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Nome é obrigatório.');
  });

  it('criarCategoriaParceiro - Deve retornar 400 se a Imagem não for fornecida', async () => {
    const res = await request(app)
      .post('/categorias/parceiros')
      .send({ nome: 'categoria' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Imagem é obrigatório.');
  });
  
  it('criarCategoriaParceiro - Deve retornar 400 se a Imagem for vazia', async () => {
    const res = await request(app)
      .post('/categorias/parceiros')
      .send({ nome: 'categoria', imagem: '' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Imagem é obrigatório.');
  });

  it('criarCategoriaParceiro - Deve retornar 400 se a Imagem for apenas espaços em branco', async () => {
    const res = await request(app)
      .post('/categorias/parceiros')
      .send({ nome: 'categoria', imagem: '   ' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Imagem é obrigatório.');
  });

});





describe('Testes da API - Criar Categoria Ponto', () => {
  
  it('criarCategoriaParceiro - Deve retornar 400 se o Nome não for fornecido', async () => {
    const res = await request(app)
      .post('/categorias/pontos')
      .send({ imagem: 'imagem.png' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Nome é obrigatório.');
  });

  it('criarCategoriaParceiro - Deve retornar 400 se o Nome for vazio', async () => {
    const res = await request(app)
      .post('/categorias/pontos')
      .send({ nome: '', imagem: 'imagem.png' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Nome é obrigatório.');
  });

  it('criarCategoriaParceiro - Deve retornar 400 se o Nome for apenas espaços em branco', async () => {
    const res = await request(app)
      .post('/categorias/pontos')
      .send({ nome: '   ', imagem: 'imagem.png' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Nome é obrigatório.');
  });

  it('criarCategoriaParceiro - Deve retornar 400 se a Imagem não for fornecida', async () => {
    const res = await request(app)
      .post('/categorias/pontos')
      .send({ nome: 'categoria' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Imagem é obrigatório.');
  });
  
  it('criarCategoriaParceiro - Deve retornar 400 se a Imagem for vazia', async () => {
    const res = await request(app)
      .post('/categorias/pontos')
      .send({ nome: 'categoria', imagem: '' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Imagem é obrigatório.');
  });

  it('criarCategoriaParceiro - Deve retornar 400 se a Imagem for apenas espaços em branco', async () => {
    const res = await request(app)
      .post('/categorias/pontos')
      .send({ nome: 'categoria', imagem: '   ' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Imagem é obrigatório.');
  });

});





describe('Testes da API - Criar Categoria Roteiro', () => {
  
  it('criarCategoriaParceiro - Deve retornar 400 se o Nome não for fornecido', async () => {
    const res = await request(app)
      .post('/categorias/roteiros')
      .send({ imagem: 'imagem.png' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Nome é obrigatório.');
  });

  it('criarCategoriaParceiro - Deve retornar 400 se o Nome for vazio', async () => {
    const res = await request(app)
      .post('/categorias/roteiros')
      .send({ nome: '', imagem: 'imagem.png' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Nome é obrigatório.');
  });

  it('criarCategoriaParceiro - Deve retornar 400 se o Nome for apenas espaços em branco', async () => {
    const res = await request(app)
      .post('/categorias/roteiros')
      .send({ nome: '   ', imagem: 'imagem.png' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Nome é obrigatório.');
  });

  it('criarCategoriaParceiro - Deve retornar 400 se a Imagem não for fornecida', async () => {
    const res = await request(app)
      .post('/categorias/roteiros')
      .send({ nome: 'categoria' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Imagem é obrigatório.');
  });
  
  it('criarCategoriaParceiro - Deve retornar 400 se a Imagem for vazia', async () => {
    const res = await request(app)
      .post('/categorias/roteiros')
      .send({ nome: 'categoria', imagem: '' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Imagem é obrigatório.');
  });

  it('criarCategoriaParceiro - Deve retornar 400 se a Imagem for apenas espaços em branco', async () => {
    const res = await request(app)
      .post('/categorias/roteiros')
      .send({ nome: 'categoria', imagem: '   ' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Imagem é obrigatório.');
  });

});





describe('Testes da API - Criar Categoria Serviço', () => {
  
  it('criarCategoriaParceiro - Deve retornar 400 se o Nome não for fornecido', async () => {
    const res = await request(app)
      .post('/categorias/servicos')
      .send({ imagem: 'imagem.png' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Nome é obrigatório.');
  });

  it('criarCategoriaParceiro - Deve retornar 400 se o Nome for vazio', async () => {
    const res = await request(app)
      .post('/categorias/servicos')
      .send({ nome: '', imagem: 'imagem.png' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Nome é obrigatório.');
  });

  it('criarCategoriaParceiro - Deve retornar 400 se o Nome for apenas espaços em branco', async () => {
    const res = await request(app)
      .post('/categorias/servicos')
      .send({ nome: '   ', imagem: 'imagem.png' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Nome é obrigatório.');
  });

  it('criarCategoriaParceiro - Deve retornar 400 se a Imagem não for fornecida', async () => {
    const res = await request(app)
      .post('/categorias/servicos')
      .send({ nome: 'categoria' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Imagem é obrigatório.');
  });
  
  it('criarCategoriaParceiro - Deve retornar 400 se a Imagem for vazia', async () => {
    const res = await request(app)
      .post('/categorias/servicos')
      .send({ nome: 'categoria', imagem: '' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Imagem é obrigatório.');
  });

  it('criarCategoriaParceiro - Deve retornar 400 se a Imagem for apenas espaços em branco', async () => {
    const res = await request(app)
      .post('/categorias/servicos')
      .send({ nome: 'categoria', imagem: '   ' });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('O campo Imagem é obrigatório.');
  });

});