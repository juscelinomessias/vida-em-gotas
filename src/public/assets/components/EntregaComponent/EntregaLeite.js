
  class EntregaComponent extends HTMLElement {
    async connectedCallback() {
      try {
        const response = await fetch('/api/contatos/pontos-entrega');
        if (!response.ok) throw new Error('Erro na requisição');
        
        const { data } = await response.json();

        
        this.render(data);
      } catch (error) {
        console.error('Erro ao carregar pontos de entrega:', error);
        this.renderFallback();
      }
    }
  
    render(locais = []) {
      const local = locais[0] || {};
      const mapsUrl = this.formatMapsUrl(local);

      
      
      this.innerHTML = `
        <section class="entregar">
          <div class="container section-title" data-aos="fade-up">
            <h2>Onde entregar o pote?</h2>
          </div>
          
          <div class="mapa">
            <div class="mb-5" data-aos="fade-up" data-aos-delay="200">
             <iframe 
                src="${this.formatMapsUrl(local)}"
                style="border:0; width: 100%; height: 370px;"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
            
            <div class="container section-title" data-aos="fade-up">
              <p>${local.nome_hospital || 'Hospital Dr. José Pedro Bezerra (Hospital Santa Catarina)'}</p>
              <p>${this.formatEndereco(local)}</p>
            </div>
          </div>
        </section>
        ${this.getStyles()}
      `;
    }
  
 
    formatMapsUrl(local) {
      const DEFAULT_MAP = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3969.716484069302!2d-35.2586037!3d-5.7538886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7b255516fdeca71%3A0x2fdce5fe2acf05d6!2sHospital%20Santa%20Catarina!5e0!3m2!1spt-BR!2sbr!4v1234567890';
    
      if (!local?.maps_link) return DEFAULT_MAP;
    
      // Se for um iframe completo, extrai apenas a URL
      if (local.maps_link.includes('<iframe')) {
        const srcMatch = local.maps_link.match(/src="([^"]+)"/);
        return srcMatch ? srcMatch[1] : DEFAULT_MAP;
      }
    
      // Se já for uma URL embed, usa diretamente
      if (local.maps_link.includes('embed')) {
        return local.maps_link;
      }
    
      return DEFAULT_MAP;
    }
  
    formatEndereco(local) {
      if (!local.logradouro) {
        return 'Rua Araquari, S/N. Bairro: Potengi. Natal / RN Setor Banco de Leite Humano';
      }
      
      const parts = [
        `${local.logradouro}, ${local.numero || 'S/N'}`,
        `Bairro: ${local.bairro || 'Potengi'}`,
        `${local.cidade || 'Natal'} / ${local.estado || 'RN'}`,
        local.setor ? `Setor ${local.setor}` : ''
      ];
      
      
      return parts.filter(Boolean).join('. ');
    }
  
    getStyles() {
        return `
          <style>
            .localizacao-bancos {
  display: flex;
  width: 100vw;
  height: 100vh;
  padding: 59px 291.5px 60px 291.5px;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  background-color: #ffffff
}

.titulo {
  padding: 20px;
  color: #5B3101;
  text-align: center;
  font-family: Forum;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  /* 100% */
  display: flex;
  width: 306px;
  padding: 25px 41px 5.19px 42px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.marcadores {
  display: flex;
  width: 320px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 50px;
  gap: var(--item-spacing-20, -0.19px);
  border-radius: 25px;
  background: var(--bootstrapmade-com-white, #BAA67A3D);
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.10);
}

.btn-container-mapa {
  display: flex;
  justify-content: center;
  margin-top: 2%;
  margin-bottom: 2%;
}
.btn-container-mapa a{
  background: #baa67a;
  text-decoration: none;
  font-size: 16px; 
  padding: 8px 40px;
  border-radius: 4px;
  transition: 0.3s;
  font-weight: 500; 
}

.btn-container-mapa a:hover{
  border: 1px solid var(--accent-color);
  color: var(--background-txt-color);
  background: color-mix(in srgb, var(--background-houver-btn-color), transparent 15%);
}


@media (max-width: 1024px) {
  .localizacao-bancos {
    padding: 40px;
  }

  .marcadores {
    width: 90%;
    margin: 20px auto;
  }

  .titulo {
    width: 100%;
    padding: 15px;
    font-size: 18px;
  }

  .btn-container {
    width: 100%;
    height: auto;
  }

  .btn-marcadores {
    width: 120px;
    height: 45px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .localizacao-bancos {
    padding: 20px;
    height: auto;
  }

  .row {
    flex-direction: column;
    align-items: center;
  }

  .marcadores {
    width: 100%;
    margin: 15px 0;
  }

  .mapas-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .btn-container {
    width: 100%;
  }

  .btn-marcadores {
    width: 100px;
    height: 40px;
    font-size: 12px;
  }
}
        `;
      }
  
      renderFallback() {
        this.innerHTML = `
          <section class="entregar">
            <div class="container section-title" data-aos="fade-up">
              <h2>Onde entregar o pote?</h2>
            </div>
            
            <div class="mapa">
              <div class="mb-5" data-aos="fade-up" data-aos-delay="200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3969.716484069302!2d-35.25860372417601!3d-5.753888556830602!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7b255516fdeca71%3A0x2fdce5fe2acf05d6!2sHospital%20Dr.%20Jos%C3%A9%20Pedro%20Bezerra%20(Santa%20Catarina)!5e0!3m2!1spt-PT!2sbr!4v1743253809101!5m2!1spt-PT!2sbr"
                  style="border:0; width: 100%; height: 370px;"
                  allowfullscreen
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade">
                </iframe>
              </div>
              
              <div class="container section-title" data-aos="fade-up">
                <p>Hospital Dr. José Pedro Bezerra (Hospital Santa Catarina)</p>
                <p>Rua Araquari, S/N. Bairro: Potengi. Natal / RN Setor Banco de Leite Humano</p>
              </div>
            </div>
          </section>
          ${this.getStyles()}
        `;
      }
  }
  
  customElements.define('entrega-component', EntregaComponent);