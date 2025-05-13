class MenuTop extends HTMLElement {
    constructor() {
        super();
        this.handleLogout = this.handleLogout.bind(this);
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    disconnectedCallback() {
        this.removeEventListeners();
    }

    async getUserNameFromToken() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return 'Usuário';
            
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.nome || payload.name || 'Usuário';
            } catch (e) {
                console.warn('Could not get name from token:', e);
            }
            
            return 'Usuário';
        } catch (error) {
            console.error('Error getting user name:', error);
            return 'Usuário';
        }
    }

    setupEventListeners() {
        this.addEventListener('click', this.handleLogout);
    }

    removeEventListeners() {
        this.removeEventListener('click', this.handleLogout);
    }

    async handleLogout(event) {
        const logoutButton = event.target.closest('.logout-button');
        if (!logoutButton) return;

        event.preventDefault();
        
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao realizar logout');
            }

            // Remove os dados do usuário
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            
            // Redireciona para a página de login
            window.location.href = '/login';
            
        } catch (error) {
            console.error('Logout error:', error);
            alert('Ocorreu um erro ao tentar sair. Por favor, tente novamente.');
        }
    }

    async render() {
        const userName = await this.getUserNameFromToken();

        this.innerHTML = `
            <div class="top_nav">
                <div class="nav_menu">
                    <div class="nav toggle">
                        <a id="menu_toggle"><i class="fa fa-bars"></i></a>
                    </div>
                    <nav class="nav navbar-nav">
                        <ul class="navbar-right">
                            <li class="nav-item dropdown open" style="padding-left: 15px;">
                                <a href="javascript:;" class="user-profile dropdown-toggle" aria-haspopup="true" id="navbarDropdown" data-toggle="dropdown" aria-expanded="false">
                                    Bem-vindo, ${userName}
                                </a>
                                <div class="dropdown-menu dropdown-usermenu pull-right" aria-labelledby="navbarDropdown">
                                    <a class="dropdown-item" href="/admin/gerenciar-usuario-adm">
                                        <span>Configurações</span>
                                    </a>
                                    <a class="dropdown-item logout-button" href="/login">
                                        <i class="fa fa-sign-out pull-right"></i>Sair
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        `;
    }

    updateUserName() {
        this.render();
    }
}

customElements.define('menu-top', MenuTop);