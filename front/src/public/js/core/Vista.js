import { Componente } from './Componente.js';

export class Vista {
  constructor(nombre, gestor) {
    this.nombre = nombre;
    this.componentes = [];
    this.gestor = gestor;
  }

  agregarComponente(componente) {
    this.componentes.push(componente);
  }

  eliminarComponente(id, eliminarHijos = true) {
    const compToRemove = this.obtenerComponentePorId(id);
    if (!compToRemove) return;
    if (eliminarHijos && compToRemove.childrenIds?.length > 0) {
      [...compToRemove.childrenIds].forEach(childId => {
        this.eliminarComponente(childId, true);
      });
    }
    if (compToRemove.parentId) {
      const parentComp = this.obtenerComponentePorId(compToRemove.parentId);
      if (parentComp) {
        parentComp.childrenIds = parentComp.childrenIds.filter(childId => childId !== id);
      }
    }
    this.componentes = this.componentes.filter(c => c.id !== id);
  }

  obtenerComponentes() {
    return this.componentes;
  }

  obtenerComponentePorId(id) {
    return this.componentes.find(c => c.id === id);
  }

  toJSON() {
    return {
      nombre: this.nombre,
      componentes: this.componentes,
    };
  }

  static fromJSON(data, gestor) {
    const vista = new Vista(data.nombre, gestor);
    vista.componentes = data.componentes.map(cData => {
      const componente = new Componente(cData.tipo);
      Object.assign(componente, cData);
      return componente;
    });
    return vista;
  }
}
