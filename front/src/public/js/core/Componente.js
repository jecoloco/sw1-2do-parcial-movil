import { componentRegistry } from '../components/componentRegistry.js';

export class Componente {
  constructor(tipo) {
    this.id = 'cmp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    this.tipo = tipo;
    this.x = 5;
    this.y = 5;
    this.props = { ...(componentRegistry[tipo]?.defaultProps || { contenido: 'Error' }) };
    this.parentId = null;
    this.childrenIds = [];
  }
}