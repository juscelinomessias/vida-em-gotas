class MenuTop extends HTMLElement {
  constructor() {
    super();
    this.animationFrame = null;
    this.animationPosition = 0;
    this.animationSpeed = 1;
    this.isPaused = false;
    this.whatsappData = {
      link: 'https://wa.me/558432327728',
      isWhatsApp: true
    };
  }

  async connectedCallback() {
    this.render();
    await this.fetchWhatsAppNumber();
    this.updateWhatsAppLink();
    this.initNewsTicker();
    this.setupMobileMenu();
  }

  render() {
    const userName = localStorage.getItem('userName') || 'Usuário';
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;

    this.innerHTML = `
     <header id="header" class="header sticky-top">
      <div class="branding d-flex align-items-center">
        <div class="container position-relative d-flex align-items-center justify-content-end">
          <a href="/" class="logo d-flex align-items-center me-auto">
            <img src="assets/img/nome-vida-em-gotas-menu.png" alt="Nome Vida em Gotas" title="Imagem Nome Vida em Gotas">
          </a>
          <nav id="navmenu" class="navmenu">
            <ul>
              <li><a href="/" class="${currentPath === '/' && currentHash === '' ? 'active' : ''}">INÍCIO</a></li>
              <li><a href="/vida-em-gotas"class="${currentPath === '/vida-em-gotas' && currentHash === '' ? 'active' : ''}">VIDA EM GOTAS</a></li>
              <li><a href="/orientacoes" class="${currentPath === '/orientacoes' ? 'active' : ''}">ORIENTAÇÕES</a></li>
              <li><a href="/noticias" class="${currentPath === '/noticias' ? 'active' : ''}">NOTÍCIAS</a></li>
              <li><a href="/duvidas" class="${currentPath === '/duvidas' ? 'active' : ''}">DÚVIDAS</a></li>
            </ul>
            <i class="mobile-nav-toggle d-xl-none bi bi-list"></i>
          </nav>
          <a class="cta-btn" href="doar-leite">QUERO DOAR</a>
        </div>
      </div>
    </header>

    <main class="main">
      <section class="hero">
        <div class="bg-principal">
          <div class="banner">
            <div class="banner-content">
              <div class="logo">
                <img src="assets/img/logo-vida-em-gotas-dourado.png" alt="Logo Vida em Gotas" title="Imagem Logo Vida em Gotas - Uma mulher segurando um bebê">
              </div>
              <div class="text-content">
                <img src="assets/img/nome-vida-em-gotas.png" alt="Nome Vida em Gotas" title="Imagem Nome Vida em Gotas">
                <a href="doar-leite" class="btn-get-started">DOAR</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Ticker de Notícias -->
        <div id="news-ticker" class="news-ticker">
          <div class="ticker-wrapper">
            <div class="ticker-content">
              <div class="ticker-loading">
                <span>Carregando notícias...</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async fetchWhatsAppNumber() {
    try {
      const response = await fetch('/api/configuracoes/whatsapp');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.numero) {
          const cleanNumber = data.data.numero.replace(/\D/g, '');
          if (cleanNumber.length >= 12) {
            this.whatsappData.link = `https://wa.me/${cleanNumber}`;
            return;
          }
        }
      }
      console.warn('Usando número padrão do WhatsApp');
    } catch (error) {
      console.error('Erro ao buscar WhatsApp:', error);
    }
  }

  updateWhatsAppLink() {
    const whatsappLink = this.querySelector('.whatsapp-link');
    if (whatsappLink) {
      whatsappLink.href = this.whatsappData.link;
    }
  }

  setupMobileMenu() {
    const mobileNavToggle = this.querySelector('.mobile-nav-toggle');
    const navmenu = this.querySelector('#navmenu');
    if (mobileNavToggle && navmenu) {
      mobileNavToggle.addEventListener('click', () => {
        navmenu.classList.toggle('mobile-nav-active');
        mobileNavToggle.classList.toggle('bi-list');
        mobileNavToggle.classList.toggle('bi-x');
      });
    }
  }

  async initNewsTicker() {
    try {
      this.showTickerLoading();
      const response = await fetch('/api/noticias/destaque');

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      const news = Array.isArray(data.data) ? data.data : [];
      this.setupTicker(news);

    } catch (error) {
      console.error('[Ticker] Erro no ticker de notícias:', error);
      this.setupTicker([]);
      this.showTickerError();
    }
  }

  
  showTickerLoading() {
    const tickerContent = this.querySelector('.ticker-content');
    if (tickerContent) {
      tickerContent.innerHTML = `
        <div class="ticker-loading">
          <span>Carregando notícias...</span>
        </div>
      `;
    }
  }

  showTickerError() {
    const tickerContent = this.querySelector('.ticker-content');
    if (tickerContent) {
      const errorElement = document.createElement('div');
      errorElement.className = 'ticker-error';
      errorElement.innerHTML = `
        <span class="error-icon">⚠️</span>
        <span class="error-message">Sistema de notícias temporariamente indisponível</span>
      `;
      tickerContent.appendChild(errorElement);
      setTimeout(() => {
        errorElement.remove();
      }, 5000);
    }
  }

  setupTicker(newsItems) {
    const tickerContent = this.querySelector('.ticker-content');
    if (!tickerContent) return;

    tickerContent.innerHTML = '';

    if (!newsItems || newsItems.length === 0) {
      const emptyMessage = document.createElement('span');
      emptyMessage.className = 'ticker-item';
      emptyMessage.textContent = 'Nenhuma notícia disponível';
      tickerContent.appendChild(emptyMessage);
      return;
    }

    const duplicatedItems = [...newsItems, ...newsItems];

    duplicatedItems.forEach((item, index) => {
      const newsElement = document.createElement('a');
      newsElement.href = item.url || `/noticias-detalhes?id=${item.id}`;
      newsElement.className = 'ticker-item';
      newsElement.innerHTML = `
        <span class="ticker-title">${item.titulo || 'Notícia importante'}</span>
        ${item.resumo ? `<span class="ticker-summary">${item.resumo}</span>` : ''}
      `;
      tickerContent.appendChild(newsElement);

      if (index < duplicatedItems.length - 1) {
        const separator = document.createElement('span');
        separator.className = 'ticker-separator';
        separator.textContent = '•';
        tickerContent.appendChild(separator);
      }
    });

    this.startAnimation();
  }

  startAnimation() {
    const content = this.querySelector('.ticker-content');
    const wrapper = this.querySelector('.ticker-wrapper');
    if (!content || !wrapper) return;

    const contentWidth = content.scrollWidth / 2;
    let lastTimestamp = 0;
    const speed = 0.5;

    wrapper.addEventListener('mouseenter', () => this.isPaused = true);
    wrapper.addEventListener('mouseleave', () => this.isPaused = false);

    const animate = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (!this.isPaused) {
        this.animationPosition -= speed * (delta / 16);
        if (this.animationPosition <= -contentWidth) {
          this.animationPosition = 0;
        }
        content.style.transform = `translateX(${this.animationPosition}px)`;
      }

      this.animationFrame = requestAnimationFrame(animate);
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  disconnectedCallback() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

customElements.define('menu-top', MenuTop);
