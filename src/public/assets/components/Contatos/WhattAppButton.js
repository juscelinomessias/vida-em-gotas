class WhatsAppButton extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.numeroPadrao = '558432327728';
      this.endpoint = '/api/configuracoes/whatsapp';
    }
  
    connectedCallback() {
      this.render();
      this.carregarNumero();
    }
  
    async carregarNumero() {
        try {
          const response = await fetch(this.endpoint);
          if (!response.ok) throw new Error('Erro na requisição');
          
          const data = await response.json();
          
          // Acesse o número corretamente baseado na estrutura da sua resposta
          const numero = data.data?.numero || this.numeroPadrao;
          this.atualizarLink(numero);
        } catch (error) {
          console.error('Falha ao carregar WhatsApp:', error);
          this.atualizarLink(this.numeroPadrao);
        }
      }
  
    atualizarLink(numero) {
      const link = this.shadowRoot.getElementById('whatsappLink');
      link.href = `https://wa.me/${numero}`;
      link.title = `Chat WhatsApp: ${this.formatarNumero(numero)}`;
    }
  
    formatarNumero(numero) {
      const limpo = numero.replace(/\D/g, '');
      return limpo.length >= 12 
        ? `(${limpo.substring(2, 4)}) ${limpo.substring(4, 8)}-${limpo.substring(8, 12)}`
        : numero;
    }
  
    render() {
      this.shadowRoot.innerHTML = `
        <style>
          .whatsapp-float {
            position: fixed;
            width: 60px;
            height: 60px;
            bottom: 20px;
            right: 20px;
            background-color: #25d366;
            color: #FFF;
            border-radius: 50px;
            text-align: center;
            box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.2);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }
          .whatsapp-float:hover {
            background-color: #128C7E;
            transform: scale(1.1);
          }
          .whatsapp-icon {
            width: 30px;
            height: 30px;
            fill: white;
          }
          @media (max-width: 768px) {
            .whatsapp-float {
              width: 50px;
              height: 50px;
            }
            .whatsapp-icon {
              width: 25px;
              height: 25px;
            }
          }
        </style>
        <a href="#" id="whatsappLink" class="whatsapp-float" target="_blank">
          <svg class="whatsapp-icon" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      `;
    }
  }
  
  customElements.define('whatsapp-button', WhatsAppButton);