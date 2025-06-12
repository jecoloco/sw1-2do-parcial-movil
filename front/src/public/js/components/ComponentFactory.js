import { componentRegistry } from './componentRegistry.js';
import { makeInteractive } from '../ui/DOMInteraction.js';

export function createDOMElement(component, vistaActiva, onUpdate, onSelect) {
  const definition = componentRegistry[component.tipo];
  if (!definition) return null;
  const el = document.createElement('div');
  el.className = 'componente resizable';
  el.id = component.id;
  el.style.left = `${component.x}%`;
  el.style.top = `${component.y}%`;
  const { width, height, backgroundColor, ...otherProps } = component.props;
  if (width) el.style.width = width;
  if (height) el.style.height = height;
  if (backgroundColor) el.style.backgroundColor = backgroundColor;
  const content = definition.render(component.props, onUpdate);
  if (content) el.appendChild(content);
  makeInteractive(el, component, vistaActiva, onUpdate);

  el.addEventListener('click', (ev) => {
    ev.stopPropagation();
    onSelect(component, el);
  });
  return el;
}
