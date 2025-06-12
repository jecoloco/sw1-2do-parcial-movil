export class PropertyPanel {
  constructor(panelElement, appManager) {
    this.panel = panelElement;
    this.app = appManager;
    this.contentDiv = this.panel.querySelector('#panelContenido');
  }

  render(component) {
    if (!component) {
      this.clear();
      return;
    }
    let html = `<h3>Propiedades de ${component.tipo}</h3>`;
    html += `<small style="display:block; margin-bottom:10px; color:#666;">ID: ${component.id}</small>`;
    html += `<div class="prop-line"><label>Parent ID:</label><input type="text" readonly value="${component.parentId || 'Ninguno'}"></div>`;
        for (const key in component.props) {
      html += `
        <div class="prop-line">
          <label for="prop-${key}">${key}</label>
          <input type="text" id="prop-${key}" data-prop-key="${key}" value="${component.props[key]}" />
        </div>`;
    }
    this.contentDiv.innerHTML = html;
    this.contentDiv.querySelectorAll('input[data-prop-key]').forEach(input => {
      input.addEventListener('change', (e) => {
        const key = e.target.dataset.propKey;
        const value = isNaN(e.target.value) ? e.target.value : Number(e.target.value);
        component.props[key] = value;
        this.app.renderizarVista();
        this.app.sincronizarConBackend();
      });
    });
  }

  clear() {
    this.contentDiv.innerHTML = '<p>Ningún componente seleccionado.</p>';
  }
}
