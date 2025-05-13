const bcrypt = require("bcrypt");
const pool = require("../config/conexao");  // Caminho para o arquivo de conexão com o banco

async function criarUsuario(nome, email, senha) {
    try {
        // Gera o hash da senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Insere no banco de dados e retorna os dados do usuário criado
        const resultado = await pool.query(
            "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *",
            [nome, email, senhaHash]
        );

        console.log("✅ Usuário criado com sucesso!", resultado.rows[0]);
    } catch (error) {
        console.error("❌ Erro ao criar usuário:", error.message);
    }
}

// Verifica se o script está sendo executado diretamente
if (require.main === module) {
    (async () => {
        await criarUsuario("admin", "admin@email.com", "123");
        // Fecha a conexão após execução
        await pool.end();
    })();
}


// Rodando o Script
// Para rodar o script e criar o usuário no banco de dados, execute o seguinte comando no terminal:

// node src/scripts/createUser.js