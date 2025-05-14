class MenuFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
			<footer>
				<div class="pull-right">
					 2025 - Vida em Gotas - Todos os direitos reservados
				</div>
				<div class="clearfix"></div>
			</footer>
        `
    }
}

customElements.define('menu-footer', MenuFooter);
