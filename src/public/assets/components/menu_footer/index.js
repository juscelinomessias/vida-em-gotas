
class MenuFooter extends HTMLElement {
  async connectedCallback() {
    try {
      const response = await fetch('/api/contatos/footer-data');
      if (!response.ok) throw new Error('Erro na requisição');
      
      const { data } = await response.json();

      
      
      this.innerHTML = `
        <footer id="footer" class="footer light-background">
          <div class="container footer-top">
            <div class="row d-flex align-items-center justify-content-between text-center">
              <div class="col-lg-2 col-md-3 text-lg-start text-center">
                <a href="https://www.rn.senac.br/" target="_blank" rel="noopener noreferrer">
                  <img src="assets/img/logo/logo-senac.png" alt="Logo Senac" title="Imagem Logo Senac" class="footer-logo">
                </a>
              </div>
      
              <div class="col-lg-4 col-md-6 footer-about">
                <a href="index.html" class="logo d-flex align-items-center justify-content-center">
                  <span class="sitename">Vida em Gotas</span>
                </a>
                <div class="footer-contact pt-3">
                 <p>${ data.nomeHospital || 'Hospital Dr. José Pedro Bezerra (Hospital Santa Catarina)'} 
                  </p> 
                  <p>${data.enderecoCompleto || 'Rua Araquari, S/N.'} 
                  </p> 
                  <p>${data.localizacao || data.cidadeEstado || 'Centro, Natal/RN'}</p>
                  <p class="mt-3"><strong>Telefone:</strong> <span>${data.telefone || '(84) 3232-7728'}</span></p>
                  <p><strong>Email:</strong> <span>${data.email || 'blh.hjpb@gmail.com'}</span></p>
                </div>
              </div>
      
              <div class="col-lg-2 col-md-3 text-lg-end text-center">
                <img src="assets/img/logo/logo-governo-do-estado.png" alt="Logo Governo do RN" title="Imagem Logo Governo do RN" class="footer-logo rn-logo">
              </div>
            </div>
          </div>
      
          <div class="container copyright text-center mt-4">
            <p>© <span>Copyright</span> <strong class="px-1 sitename">Vida em Gotas</strong> 
            <span>${new Date().getFullYear()}</span></p>
          </div>
        </footer>
      `;
      
      // Adiciona o ícone do Font Awesome se não estiver presente
      this.loadFontAwesome();
      
    } catch (error) {
      console.error('Falha ao carregar footer:', error);
      this.renderFallbackFooter();
    }
  }

  loadFontAwesome() {
    if (!document.querySelector('#font-awesome')) {
      const fa = document.createElement('link');
      fa.id = 'font-awesome';
      fa.rel = 'stylesheet';
      fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(fa);
    }
  }

  renderFallbackFooter() {
    this.innerHTML = `
      <footer id="footer" class="footer light-background">
      <div class="container footer-top">
        <div class="row d-flex align-items-center justify-content-between text-center">

          <div class="col-lg-2 col-md-3 text-lg-start text-center">
            <a href="https://www.rn.senac.br/" target="_blank" rel="noopener noreferrer">
              <img src="assets/img/logo/logo-senac.png" alt="Logo Senac" title="Imagem Logo Senac" class="footer-logo">
            </a>
          </div>
 
          <div class="col-lg-4 col-md-6 footer-about">
            <a href="index.html" class="logo d-flex align-items-center justify-content-center">
              <span class="sitename">Vida em Gotas</span>
            </a>
            <div class="footer-contact pt-3">
              <p>Hospital Dr. José Pedro Bezerra (Hospital Santa Catarina)</p>
              <p>Rua Araquari, S/N.</p> 
              <p>Bairro: Potengi, Natal/RN</p>
              <p class="mt-3"><strong>Telefone</strong> <span>(84) 3232-7728</span></p>
              <p><strong>Email:</strong> <span>blh.hjpb@gmail.com</span></p>
            </div>
          </div> 
 
          <div class="col-lg-2 col-md-3 text-lg-end text-center">
            <img src="assets/img/logo/logo-governo-do-estado.png" alt="Logo Governo do RN" title="Imagem Logo Governo do RN" class="footer-logo rn-logo">
          </div>
      </div>
     </div>
 
   
 
    <div class="container copyright text-center mt-4">
      <p>© <span>Copyright</span> <strong class="px-1 sitename">Vida Em Gotas</strong> <span>2025</span></p>
    <div class="credits">
    
   
   </div>
 </div>      
    `;
    this.loadFontAwesome();
  }
}

customElements.define('menu-footer', MenuFooter);











