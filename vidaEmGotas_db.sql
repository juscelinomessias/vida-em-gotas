-- Criação do banco de dados
CREATE DATABASE vidaemgotas_db;

-- Criando a tabela de usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criando a tabela de doadoras (com campos booleanos)
CREATE TABLE doadoras (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    nome_da_mae VARCHAR(255) NOT NULL,
    data_de_cadastro DATE,
    data_de_nascimento DATE,
    naturalidade VARCHAR(100),
    profissao VARCHAR(100),
    quantidade_leite_mL INT DEFAULT 0,
    coleta_domiciliar BOOLEAN DEFAULT FALSE,
    doadora_exclusiva BOOLEAN DEFAULT FALSE,
    receptor VARCHAR(255) DEFAULT NULL,
    situacao BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criando a tabela de endereços
CREATE TABLE enderecos (
    id SERIAL PRIMARY KEY,
    cep VARCHAR(10) NOT NULL,
    logradouro VARCHAR(100),
    numero INTEGER,
    bairro VARCHAR(50),
    ponto_de_referencia VARCHAR(100),
    municipio VARCHAR(100), 
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    doadoras_id INTEGER REFERENCES doadoras(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criando a tabela de telefones
CREATE TABLE telefones (
    id SERIAL PRIMARY KEY,
    telefone VARCHAR(15) NOT NULL,
    doadoras_id INTEGER REFERENCES doadoras(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criando a tabela de bebês beneficiados
CREATE TABLE bebes_beneficiados (
    id SERIAL PRIMARY KEY,
    total_bebes_beneficiados INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criando a tabela de orientações
CREATE TABLE orientacoes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    video VARCHAR(255),
    destacada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criando a tabela de orientações imagens
CREATE TABLE orientacao_imagens (
    id SERIAL PRIMARY KEY,
    imagem VARCHAR(255) NOT NULL,
    orientacao_id INTEGER REFERENCES orientacoes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criando a tabela de dúvidas frequentes
CREATE TABLE duvidas (
    id SERIAL PRIMARY KEY,
    pergunta VARCHAR(500) NOT NULL,
    resposta VARCHAR(1000) NOT NULL,
    destacada BOOLEAN DEFAULT FALSE,  -- NOVA COLUNA
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


-- Criando a tabela de depoimentos
CREATE TABLE depoimentos (
    id SERIAL PRIMARY KEY,
    nome_mae VARCHAR(255) NOT NULL,
    nome_crianca VARCHAR(255),
    imagem_mae VARCHAR(255),
    depoimento TEXT NOT NULL,
    destacado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criando a tabela de momentos da mãe
CREATE TABLE momento_mae (
    id SERIAL PRIMARY KEY,
    imagem VARCHAR(255) NOT NULL,
    destacada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criando a tabela de contatos de WhatsApp
CREATE TABLE contatos_assistencia (
    id SERIAL PRIMARY KEY,
    numero_whatsapp VARCHAR(20) NOT NULL,
    nome_hospital VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    maps_link VARCHAR(500),
    logradouro VARCHAR(100),
    numero VARCHAR(10),
    bairro VARCHAR(50),
    cidade VARCHAR(50),
    estado VARCHAR(2),
    setor VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


-- Tabela de notícias (similar à tabela 'orientacoes', mas sem vídeo)
CREATE TABLE noticias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    destacada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de imagens das notícias (1 notícia pode ter N imagens)
CREATE TABLE noticia_imagens (
    id SERIAL PRIMARY KEY,
    imagem VARCHAR(255) NOT NULL,
    noticia_id INTEGER REFERENCES noticias(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);












