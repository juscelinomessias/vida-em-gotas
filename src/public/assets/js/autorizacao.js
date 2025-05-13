function checarAutorizacao() {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = '/login';
        return;
    }

    // Decodifica o token e verifica a expiração
    const tokenExpirado = verificarExpiracaoToken(token);
    if (tokenExpirado) {
        alert('Sua sessão expirou. Faça login novamente.');
        logout();
    }
}

// Função para verificar se o token expirou
function verificarExpiracaoToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica o payload
        const exp = payload.exp * 1000; // Converte para milissegundos
        return Date.now() > exp; // Retorna true se o token já expirou
    } catch (error) {
        return true; // Se houver erro ao decodificar, considera como expirado
    }
}

// Faz logout e limpa o token
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}











// function checarAutorizacao() {
//     const token = localStorage.getItem('token');

//     if (!token) {
//         alert('Você precisa estar logado para acessar esta página.');
//         window.location.href = '/login';
//         return;
//     }

//     // Verifica se o token expirou
//     const tokenExpirado = verificarExpiracaoToken(token);
//     if (tokenExpirado) {
//         alert('Sua sessão expirou. Faça login novamente.');
//         logout();
//     }
// }

// // Função para verificar se o token expirou
// function verificarExpiracaoToken(token) {
//     try {
//         const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica o payload
//         const exp = payload.exp * 1000; // Converte para milissegundos
//         return Date.now() > exp; // Retorna true se o token já expirou
//     } catch (error) {
//         console.error('Erro ao decodificar o token:', error);
//         return true; // Se houver erro ao decodificar, considera como expirado
//     }
// }

// // Faz logout e limpa o token
// function logout() {
//     localStorage.removeItem('token');
//     localStorage.removeItem('userName'); // Limpa o nome do usuário também
//     window.location.href = '/login';
// }

// export function buscarNomeUsuario(userId) {
//     return fetch(`/admin/usuarios/${userId}/nome`, {
//         headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}` // Envia o token no cabeçalho
//         }
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Erro ao buscar nome do usuário');
//         }
//         return response.json();
//     })
//     .then(data => {
//         if (data.success) {
//             const userName = data.nome;
//             localStorage.setItem('userName', userName); // Armazena o nome no localStorage
//             return userName;
//         } else {
//             throw new Error(data.message);
//         }
//     })
//     .catch(error => {
//         console.error('Erro na requisição:', error);
//         throw error;
//     });
// }