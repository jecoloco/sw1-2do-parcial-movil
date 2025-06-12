import { createDOMElement } from '../components/ComponentFactory.js';

export class CanvasManager {
  constructor(canvasBoxElement, appManager) {
    this.canvasBox = canvasBoxElement;
    this.app = appManager;
    this.currentSelectedElement = null;
    this.canvasBox.addEventListener('click', (e) => {
        if (e.target === this.canvasBox) {
            this.app.deseleccionarComponente();
        }
    });
  }
  
  updateSelectionStyle(componenteSeleccionado) {
    if (this.currentSelectedElement) {
        this.currentSelectedElement.classList.remove('selected');
    }
    if (componenteSeleccionado) {
        const newSelectedElement = document.getElementById(componenteSeleccionado.id);
        if (newSelectedElement) {
            newSelectedElement.classList.add('selected');
            this.currentSelectedElement = newSelectedElement;
        }
    } else {
        this.currentSelectedElement = null;
    }
  }

  render(vista, componenteSeleccionado) {
    this.canvasBox.innerHTML = '';
    if (!vista) {
      this.canvasBox.innerHTML = '<p style="text-align: center; margin-top: 20px;">No hay vista activa.</p>';
      return;
    }
    const onUpdate = () => this.app.sincronizarConBackendDebounced();
    const onSelect = (component) => this.app.seleccionarComponente(component);
    const renderComponenteRecursivo = (componente, parentElement) => {
      const el = createDOMElement(componente, vista, onUpdate, onSelect);
      if (!el) return;
      parentElement.appendChild(el);
      componente.childrenIds?.forEach(childId => {
        const childComp = vista.obtenerComponentePorId(childId);
        if (childComp) {
          renderComponenteRecursivo(childComp, el);
        }
      });
    };
    const componentesRaiz = vista.obtenerComponentes().filter(c => !c.parentId);
    componentesRaiz.forEach(comp => renderComponenteRecursivo(comp, this.canvasBox));
    this.updateSelectionStyle(componenteSeleccionado);
  }
}
