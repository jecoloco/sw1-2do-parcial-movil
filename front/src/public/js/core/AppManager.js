import { Vista } from './Vista.js';
import { Componente } from './Componente.js';
import { apiService } from '../services/apiService.js';
import { CanvasManager } from '../ui/CanvasManager.js';
import { PropertyPanel } from '../ui/PropertyPanel.js';
import { UIManager } from '../ui/UIManager.js';
import { debounce } from '../utils/debounce.js';

export class AppManager {
  constructor(salaId) {
    this.salaId = salaId;
    this.vistas = [];
    this.vistaActiva = null;
    this.componenteSeleccionado = null;
    this.isApplyingServerUpdate = false;
    this.canvasManager = new CanvasManager(document.getElementById('canvasBox'), this);
    this.propertyPanel = new PropertyPanel(document.getElementById('propiedadesPanel'), this);
    this.uiManager = new UIManager(this);
    if (!this.uiManager) {
      console.error("¡ERROR CRÍTICO! UIManager no se pudo instanciar.");
    }
    this.sincronizarConBackendDebounced = debounce(() => this.sincronizarConBackend(), 500);
  }

  inicializar() {
    console.log("[AppManager] Inicializando...");
    this.uiManager.showLoading(true);
    this.uiManager.bindEventListeners();
    console.log("[AppManager] UI preparada. Esperando estado del servidor...");
  }

  importarDesdeJSON(dataArray, mostrarAlerta = false) {
    this.isApplyingServerUpdate = true;
    const selectedId = this.componenteSeleccionado?.id;
    try {
      this.vistas = [];
      this.vistaActiva = null;
      this.componenteSeleccionado = null;
      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        this.crearNuevaVista("Principal", false);
      } else {
        dataArray.forEach(vistaData => {
          const vista = Vista.fromJSON(vistaData, this);
          this.vistas.push(vista);
        });
        if (this.vistas.length > 0) {
          this.activarVista(this.vistas[0], false);
        }
      }
      if (selectedId && this.vistaActiva) {
        const reselectedComp = this.vistaActiva.obtenerComponentePorId(selectedId);
        if (reselectedComp) {
          this.componenteSeleccionado = reselectedComp;
        }
      }
    } catch (error) {
      console.error("[AppManager] ERROR durante importación:", error);
      this.crearNuevaVista("Principal", false);
    } finally {
      this.renderizarVista();
      this.propertyPanel.render(this.componenteSeleccionado);
      this.uiManager.showLoading(false);

      setTimeout(() => {
        this.isApplyingServerUpdate = false;
      }, 100);
    }
  }

  async sincronizarConBackend() { if (this.isApplyingServerUpdate) return; if (!this.salaId) return; const data = this.vistas.map(v => v.toJSON()); try { await apiService.updateRoomData(this.salaId, data); } catch (error) { console.error(`Error al guardar: ${error.message}`); } }
  crearNuevaVista(nombreOpcional = null, sincronizar = true) { const nombre = nombreOpcional || prompt('Nombre de la nueva vista:'); if (!nombre) return; if (this.vistas.some(v => v.nombre === nombre)) { return; } const nuevaVista = new Vista(nombre, this); this.vistas.push(nuevaVista); this.activarVista(nuevaVista); if (sincronizar) { this.sincronizarConBackend(); } }
  eliminarComponenteActivo() { if (!this.componenteSeleccionado || !this.vistaActiva) return; this.vistaActiva.eliminarComponente(this.componenteSeleccionado.id, true); this.deseleccionarComponente(); this.sincronizarConBackend(); }
  seleccionarComponente(comp) {
    if (this.componenteSeleccionado?.id === comp?.id) return;
    this.componenteSeleccionado = comp;
    this.canvasManager.updateSelectionStyle(comp);
    this.propertyPanel.render(comp);
  }

  deseleccionarComponente() {
    if (!this.componenteSeleccionado) return;
    this.componenteSeleccionado = null;
    this.canvasManager.updateSelectionStyle(null);
    this.propertyPanel.clear();
  }

  renderizarVista() { this.canvasManager.render(this.vistaActiva, this.componenteSeleccionado); this.uiManager.actualizarPestanasVistas(this.vistas, this.vistaActiva); }
  activarVista(vista, render = true) {
    if (this.vistaActiva?.nombre === vista.nombre) return;
    this.vistaActiva = vista;
    this.deseleccionarComponente();
    if (render) {
      this.renderizarVista();
    }
  }

  agregarComponente(tipo) { if (!this.vistaActiva) { alert('Por favor, crea o selecciona una vista primero.'); return; } const nuevo = new Componente(tipo); this.vistaActiva.agregarComponente(nuevo); this.seleccionarComponente(nuevo); this.sincronizarConBackend(); }
  exportarJSON() { if (this.vistas.length === 0) { alert("No hay nada que exportar."); return; } const dataStr = JSON.stringify(this.vistas.map(v => v.toJSON()), null, 2); const blob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `pizarra_sala_${this.salaId}.json`; a.click(); URL.revokeObjectURL(url); }
  
  async manejarImportacionImagen(file) {
    if (!this.vistaActiva) {
      alert('Por favor, selecciona una vista antes de añadir una imagen.');
      return;
    }
    this.uiManager.showLoading(true);
    try {
      const respuestaApi = await apiService.uploadImage(this.salaId, file);
      if (respuestaApi && respuestaApi.xml) {
        try {
          const vistasData = JSON.parse(respuestaApi.xml);
          this.importarDesdeJSON(vistasData, false);
        } catch (e) {
          console.error("Error al parsear el XML/JSON recibido del servidor:", e);
          alert("El servidor devolvió un formato de datos inesperado.");
        }
      } else {
        alert("Problemas con el servidor o conexión a internet. No se pudo añadir la imagen.");
      }
    } catch (error) {
      console.error("Error en la llamada API para subir imagen:", error);
      alert("Problemas con el servidor o conexión a internet. No se pudo añadir la imagen.");
    } finally {
      this.uiManager.showLoading(false);
    }
  }

  resetearSala() { if (confirm("¿Seguro que deseas borrar todo y reiniciar? Esto afectará a todos los usuarios en la sala.")) { this.vistas = []; this.vistaActiva = null; this.componenteSeleccionado = null; this.crearNuevaVista("Principal", true); } }
  
  async exportarMovil() {
    if (!this.salaId) {
        alert("Error: No se ha podido identificar la sala para exportar. Refresca la página.");
        console.error("Intento de exportar sin salaId.");
        return;
    }
    alert("Iniciando exportación del proyecto móvil. El proceso puede tardar un momento...");
    this.uiManager.showLoading(true);
    try {
      await apiService.exportMobile(this.salaId);
    } catch (error) {
      console.error("La exportación móvil falló:", error);
    } finally {
      this.uiManager.showLoading(false);
    }
  }
}