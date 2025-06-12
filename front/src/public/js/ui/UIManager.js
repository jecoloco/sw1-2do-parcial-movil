export class UIManager {
  constructor(appManager) {
    this.app = appManager;
    this.loadingIndicator = document.getElementById('loading-indicator');
    this.zonaInferior = document.getElementById('zonaInferior');
    this.componentForm = document.getElementById('componentForm');
  }

  showLoading(isLoading) {
    this.loadingIndicator.style.display = isLoading ? 'flex' : 'none';
  }

  bindEventListeners() {
    document.getElementById('btnNuevaVista')?.addEventListener('click', () => this.app.crearNuevaVista());
    document.getElementById('btnAñadirComponente')?.addEventListener('click', () => this.mostrarFormularioComponente());
    document.getElementById('btnExportarJSON')?.addEventListener('click', () => this.app.exportarJSON());
    document.getElementById('btnReset')?.addEventListener('click', () => this.app.resetearSala());
    document.getElementById('btnExportarMovil')?.addEventListener('click', () => this.app.exportarMovil());

    this.componentForm?.addEventListener('submit', e => {
      e.preventDefault();
      const tipo = e.target.tipo.value;
      this.app.agregarComponente(tipo);
      this.componentForm.classList.add('hidden');
    });
    document.getElementById('btnAñadirImagenLienzo')?.addEventListener('click', () => {
      document.getElementById('inputAñadirImagenLienzo').click();
    });
    document.getElementById('inputAñadirImagenLienzo')?.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) this.app.manejarImportacionImagen(file);
      event.target.value = '';
    });
    document.getElementById('btnImportarJSON')?.addEventListener('click', () => {
      document.getElementById('inputImportarJSON').click();
    });
    document.getElementById('inputImportarJSON')?.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        this.app.importarDesdeJSON(data, true);
        this.app.sincronizarConBackend();
      } catch (err) {
        alert("Error al importar el archivo JSON.");
        console.error(err);
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key !== 'Backspace' && e.key !== 'Delete') {
        return;
      }
      const componenteSeleccionado = this.app.componenteSeleccionado;
      if (!componenteSeleccionado) {
        return;
      }
      const activeEl = document.activeElement;
      const noBorrarComponente =
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable ||
        activeEl.id === 'chatInputPanel';
      if (noBorrarComponente) {
        return;
      }
      e.preventDefault();
      this.app.eliminarComponenteActivo();
    });
  }

  mostrarFormularioComponente() {
    if (!this.app.vistaActiva) {
      alert('Primero crea o selecciona una vista.');
      return;
    }
    this.componentForm.classList.remove('hidden');
  }

  actualizarPestanasVistas(vistas, vistaActiva) {
    this.zonaInferior.innerHTML = '';
    vistas.forEach(vista => {
      const vistaBox = document.createElement('div');
      vistaBox.className = 'vista-box';
      vistaBox.innerText = vista.nombre;
      vistaBox.classList.toggle('active', vista.nombre === vistaActiva?.nombre);
      vistaBox.addEventListener('click', () => this.app.activarVista(vista));
      this.zonaInferior.appendChild(vistaBox);
    });
  }
}