const MIN_DRAG_OVERLAP_PIXELS = 20;
const MIN_COMPONENT_SIZE_PIXELS = 20;
const CLICK_VS_DRAG_THRESHOLD_PIXELS = 4;

export function makeInteractive(element, component, vistaActiva, onUpdate) {
  let isDragging = false;
  let isResizing = false;
  let offsetX = 0;
  let offsetY = 0;
  let startX = 0;
  let startY = 0;
  const canvas = document.getElementById('canvasBox');

  const onMouseDown = (e) => {
    const targetElement = e.target;
    const isInteractiveContent = ['INPUT', 'TEXTAREA', 'SELECT'].includes(targetElement.tagName) || targetElement.isContentEditable;
    if (isInteractiveContent && element.contains(targetElement) && targetElement !== element) {
      return;
    }
    e.stopPropagation();    
    startX = e.clientX;
    startY = e.clientY;
    const isResizeHandle = e.offsetX > element.offsetWidth - 14 && e.offsetY > element.offsetHeight - 14;
    if (isResizeHandle && element.classList.contains('resizable')) {
      isResizing = true;
    } else {
      isDragging = true;
      offsetX = e.clientX - element.getBoundingClientRect().left;
      offsetY = e.clientY - element.getBoundingClientRect().top;
    }
    element.style.zIndex = 1000;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp, { once: true });
  };

  const onMouseMove = (e) => {
    e.preventDefault();
    const parentElement = document.getElementById(component.parentId) || canvas;
    const parentRect = parentElement.getBoundingClientRect();
    if (isDragging) {
      const newX_px = e.clientX - parentRect.left - offsetX;
      const newY_px = e.clientY - parentRect.top - offsetY;
      let newX_percent = (newX_px / parentRect.width) * 100;
      let newY_percent = (newY_px / parentRect.height) * 100;
      const elWidthPercent = (element.offsetWidth / parentRect.width) * 100;
      const elHeightPercent = (element.offsetHeight / parentRect.height) * 100;
      component.x = Math.max(0, Math.min(newX_percent, 100 - elWidthPercent));
      component.y = Math.max(0, Math.min(newY_percent, 100 - elHeightPercent));      
      element.style.left = `${component.x}%`;
      element.style.top = `${component.y}%`;
    }
    if (isResizing) {
      const newWidth_px = Math.max(MIN_COMPONENT_SIZE_PIXELS, e.clientX - element.getBoundingClientRect().left);
      const newHeight_px = Math.max(MIN_COMPONENT_SIZE_PIXELS, e.clientY - element.getBoundingClientRect().top);
      element.style.width = `${newWidth_px}px`;
      element.style.height = `${newHeight_px}px`;
      component.props.width = `${((newWidth_px / parentRect.width) * 100).toFixed(2)}%`;
      component.props.height = `${((newHeight_px / parentRect.height) * 100).toFixed(2)}%`;
    }
    vistaActiva.gestor.propertyPanel.render(component); 
  };

  const onMouseUp = (e) => {
    document.removeEventListener('mousemove', onMouseMove);
    const movedX = Math.abs(e.clientX - startX);
    const movedY = Math.abs(e.clientY - startY);
    const wasDragged = movedX > CLICK_VS_DRAG_THRESHOLD_PIXELS || movedY > CLICK_VS_DRAG_THRESHOLD_PIXELS;
    if (isDragging && wasDragged) {
      handleReparenting(e);
    }
    isDragging = false;
    isResizing = false;
    element.style.zIndex = component.parentId ? 10 : 5;    
    if (wasDragged || isResizing) {
        onUpdate();
        vistaActiva.gestor.renderizarVista();
    }
  };

  const handleReparenting = (e) => {
    const elRect = element.getBoundingClientRect();
    let bestPotentialParent = null;
    let smallestArea = Infinity;
    vistaActiva.obtenerComponentes().forEach(otherComp => {
      if (otherComp.id === component.id || otherComp.id === component.parentId || isAncestor(component, otherComp.id, vistaActiva)) return;
      const otherEl = document.getElementById(otherComp.id);
      if (!otherEl) return;
      const otherRect = otherEl.getBoundingClientRect();
      const overlapX = Math.max(0, Math.min(elRect.right, otherRect.right) - Math.max(elRect.left, otherRect.left));
      const overlapY = Math.max(0, Math.min(elRect.bottom, otherRect.bottom) - Math.max(elRect.top, otherRect.top));
      if (overlapX > MIN_DRAG_OVERLAP_PIXELS && overlapY > MIN_DRAG_OVERLAP_PIXELS) {
        const area = otherRect.width * otherRect.height;
        if (area < smallestArea) {
          smallestArea = area;
          bestPotentialParent = { comp: otherComp, rect: otherRect };
        }
      }
    });
    if (bestPotentialParent) {
      changeParent(component, bestPotentialParent.comp, bestPotentialParent.rect, vistaActiva);
    } else {
      const canvasRect = canvas.getBoundingClientRect();
      const elCenter = { x: elRect.left + elRect.width / 2, y: elRect.top + elRect.height / 2 };
      if (component.parentId && elCenter.x >= canvasRect.left && elCenter.x <= canvasRect.right && elCenter.y >= canvasRect.top && elCenter.y <= canvasRect.bottom) {
        changeParent(component, null, canvasRect, vistaActiva);
      }
    }
  };

  const changeParent = (childComp, newParentComp, newParentRect, vista) => {
    if (childComp.parentId) {
      const oldParent = vista.obtenerComponentePorId(childComp.parentId);
      if (oldParent) {
        oldParent.childrenIds = oldParent.childrenIds.filter(id => id !== childComp.id);
      }
    }
    childComp.parentId = newParentComp ? newParentComp.id : null;
    if (newParentComp) {
      if (!newParentComp.childrenIds) newParentComp.childrenIds = [];
      if (!newParentComp.childrenIds.includes(childComp.id)) {
        newParentComp.childrenIds.push(childComp.id);
      }
    }
    const elRect = element.getBoundingClientRect();
    const newX_px = elRect.left - newParentRect.left;
    const newY_px = elRect.top - newParentRect.top;
    childComp.x = (newX_px / newParentRect.width) * 100;
    childComp.y = (newY_px / newParentRect.height) * 100;
  };

  const isAncestor = (potentialChild, potentialParentId, vista) => {
    let current = vista.obtenerComponentePorId(potentialParentId);
    while (current) {
      if (current.parentId === potentialChild.id) return true;
      current = vista.obtenerComponentePorId(current.parentId);
    }
    return false;
  };
  element.addEventListener('mousedown', onMouseDown);
}
