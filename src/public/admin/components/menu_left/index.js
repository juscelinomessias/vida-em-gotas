class MenuLeft extends HTMLElement {
  constructor() {
      super();
      this.handleLogout = this.handleLogout.bind(this);
  }

  connectedCallback() {
      this.render();
      this.addEventListener('click', this.handleLogout);
  }

  disconnectedCallback() {
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

  render() {
      this.innerHTML = `
         <!-- sidebar menu -->
      <div id="sidebar-menu" class="main_menu_side hidden-print main_menu">
        <div class="menu_section">
          <ul class="nav side-menu">
            

            <!-- Doadoras -->
            <li>
              <a>
                <i class="menu-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </i>
                Doadoras <span class="fa fa-chevron-down"></span>
              </a>
              <ul class="nav child_menu">
                <li><a href="/admin/doadoras/listar-doadoras">Listar Doadoras</a></li>
              </ul>
            </li>


            <!-- Bebes beneficiados -->
            <li>
              <a>
                <i class="menu-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5z"></path>
                    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path>
                    <circle cx="7" cy="5" r="1"></circle>
                  </svg>
                </i>
                Bebês beneficiados <span class="fa fa-chevron-down"></span>
              </a>
              <ul class="nav child_menu">
                <li><a href="/admin/bebes-beneficiados/listar">Listar Bebês Beneficiados</a></li>
              </ul>
            </li>


            <!-- Notícias -->
            <li>
              <a>
                <i class="menu-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                </i>
                Notícias <span class="fa fa-chevron-down"></span>
              </a>
              <ul class="nav child_menu">
                <li><a href="/admin/noticias/listar-noticias">Listar Notícias</a></li>
              </ul>
            </li>


            <!-- Orientação -->
            <li>
              <a>
                <i class="menu-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </i>
                Orientações <span class="fa fa-chevron-down"></span>
              </a>
              <ul class="nav child_menu">
                <li><a href="/admin/orientacoes/listar-orientacoes">Listar Orientações</a></li>
              </ul>
            </li>

            
            <!-- Duvidas -->
            <li>
              <a>
                <i class="menu-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </i>
                Dúvidas <span class="fa fa-chevron-down"></span>
              </a>
              <ul class="nav child_menu">
                <li><a href="/admin/duvidas/listar-duvidas">Listar Dúvidas</a></li>
              </ul>
            </li>


            <!-- Depoimentos -->
            <li>
              <a>
                <i class="menu-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </i>
                Depoimentos <span class="fa fa-chevron-down"></span>
              </a>
              <ul class="nav child_menu">
                <li><a href="/admin/depoimentos/listar-depoimentos">Listar Depoimentos</a></li>
              </ul>
            </li>


            <!-- Momento Mamãe -->
            <li>
              <a>
                <i class="menu-icon">
                  <svg width="22" height="22" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </i>
                Momento Mamãe <span class="fa fa-chevron-down"></span>
              </a>
              <ul class="nav child_menu">
                <li><a href="/admin/momento-mae/listar">Listar Momento Mamãe</a></li>
              </ul>
            </li>


            <!-- Configurações -->
            <li>
              <a>
                <i class="menu-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </i>
                Configurações <span class="fa fa-chevron-down"></span>
              </a>
              <ul class="nav child_menu">
                <li><a href="/admin/contatos/listar-contatos">Configurações Gerais</a></li>
                <li><a href="/admin/gerenciar-usuario-adm">Gerenciar Usuários</a></li>
              </ul>
            </li>


          </ul>
        </div>
      </div>
      <!-- /sidebar menu -->

      <!-- /menu footer buttons -->
      <div class="sidebar-footer hidden-small" style="
          display: flex !important;
          align-items: center !important;
          height: 50px !important;
          border-top: 1px solid #2A3F54 !important;
      ">
        <a href="/admin/gerenciar-usuario-adm" style="
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex: 1 !important;
            height: 100% !important;
        ">
          <i class="fa fa-cog" style="font-size: 1.2em;"></i>
        </a>
      <a href="/login" class="logout-button" style="
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex: 1 !important;
          height: 100% !important;
      ">
          <i class="fa fa-sign-out" style="font-size: 1.2em;"></i>
      </a>
      </div>
      <!-- /menu footer buttons -->
      `;
  }
}

customElements.define('menu-left', MenuLeft);