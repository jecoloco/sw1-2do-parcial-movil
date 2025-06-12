export const componentRegistry = {
    input: {
        defaultProps: { type: 'text', placeholder: 'Ingrese texto...', contenido: '', width: '30%', height: 'auto' },
        render: (props, onUpdate) => {
            const input = document.createElement('input');
            input.type = props.type || 'text';
            input.placeholder = props.placeholder || '';
            input.value = props.contenido || '';
            input.style.width = '100%';
            input.style.height = '100%';
            input.style.boxSizing = 'border-box';
            input.addEventListener('input', () => {
                props.contenido = input.value;
                onUpdate();
            });
            return input;
        }
    },

    textarea: {
        defaultProps: { contenido: '', placeholder: 'Escriba aquí...', rows: 4, width: '40%', height: '100px' },
        render: (props, onUpdate) => {
            const textarea = document.createElement('textarea');
            textarea.value = props.contenido || '';
            textarea.placeholder = props.placeholder || '';
            textarea.rows = props.rows || 4;
            textarea.style.width = '100%';
            textarea.style.height = '100%';
            textarea.style.resize = 'none';
            textarea.style.boxSizing = 'border-box';
            textarea.addEventListener('input', () => {
                props.contenido = textarea.value;
                onUpdate();
            });
            return textarea;
        }
    },

    select: {
        defaultProps: { opciones: 'Opción 1, Opción 2, Opción 3', seleccionado: '', width: '25%', height: 'auto' },
        render: (props, onUpdate) => {
            const select = document.createElement('select');
            select.style.width = '100%';
            select.style.height = '100%';
            const opciones = typeof props.opciones === 'string' ? props.opciones.split(',') : (props.opciones || []);
            opciones.forEach(optText => {
                const option = document.createElement('option');
                const trimmedText = optText.trim();
                option.value = trimmedText;
                option.innerText = trimmedText;
                select.appendChild(option);
            });
            select.value = props.seleccionado || (opciones[0] ? opciones[0].trim() : '');
            select.addEventListener('change', () => {
                props.seleccionado = select.value;
                onUpdate();
            });
            return select;
        }
    },

    checkbox: {
        defaultProps: { label: 'Aceptar términos', checked: false, width: 'auto', height: 'auto' },
        render: (props, onUpdate) => {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = props.checked === true;
            const label = document.createElement('label');
            label.innerText = ' ' + (props.label || 'Checkbox');
            label.style.cursor = 'pointer';
            checkbox.addEventListener('change', () => {
                props.checked = checkbox.checked;
                onUpdate();
            });
            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            return wrapper;
        }
    },

    checklist: {
        defaultProps: { items: 'Item 1, Item 2, Item 3', width: '30%', height: 'auto' },
        render: (props) => {
            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '5px';
            const items = typeof props.items === 'string' ? props.items.split(',') : (props.items || []);
            items.forEach(itemText => {
                const trimmedText = itemText.trim();
                const label = document.createElement('label');
                label.style.display = 'flex';
                label.style.alignItems = 'center';
                label.innerHTML = `<input type="checkbox" value="${trimmedText}" style="margin-right: 5px;"> ${trimmedText}`;
                container.appendChild(label);
            });

            return container;
        }
    },

    radiogroup: {
        defaultProps: { grupo: 'grupo1', opciones: 'Sí, No, Tal vez', width: '30%', height: 'auto' },
        render: (props, onUpdate) => {
            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '5px';
            const opciones = typeof props.opciones === 'string' ? props.opciones.split(',') : (props.opciones || []);
            const groupName = props.grupo || `radio_${Date.now()}`;
            opciones.forEach((optText, index) => {
                const trimmedText = optText.trim();
                const label = document.createElement('label');
                label.style.display = 'flex';
                label.style.alignItems = 'center';
                const radioInput = document.createElement('input');
                radioInput.type = 'radio';
                radioInput.name = groupName;
                radioInput.value = trimmedText;
                radioInput.style.marginRight = '5px';
                if (props.seleccionado === trimmedText || (!props.seleccionado && index === 0)) {
                    radioInput.checked = true;
                }
                radioInput.addEventListener('change', () => {
                    if (radioInput.checked) {
                        props.seleccionado = radioInput.value;
                        onUpdate();
                    }
                });
                label.appendChild(radioInput);
                label.appendChild(document.createTextNode(trimmedText));
                container.appendChild(label);
            });
            return container;
        }
    },

    button: {
        defaultProps: { contenido: 'Botón', accion: '¡Botón presionado!', backgroundColor: '#007bff', color: '#ffffff', width: '25%', height: 'auto' },
        render: (props) => {
            const button = document.createElement('button');
            button.innerText = props.contenido || 'Botón';
            button.style.width = '100%';
            button.style.height = '100%';
            button.style.backgroundColor = props.backgroundColor;
            button.style.color = props.color;
            button.style.border = 'none';
            return button;
        }
    },

    label: {
        defaultProps: { contenido: 'Etiqueta de texto', fontSize: '16px', width: '20%', height: 'auto' },
        render: (props, onUpdate) => {
            const span = document.createElement('span');
            span.innerText = props.contenido || 'Texto';
            span.style.fontSize = props.fontSize;
            span.style.display = 'inline-block';
            span.contentEditable = true;
            span.style.cursor = 'text';
            span.addEventListener('blur', () => {
                if (props.contenido !== span.innerText) {
                    props.contenido = span.innerText;
                    onUpdate();
                }
            });
            return span;
        }
    },

    image: {
        defaultProps: { src: 'https://via.placeholder.com/150', alt: 'Imagen de prueba', width: '30%', height: 'auto' },
        render: (props) => {
            const img = document.createElement('img');
            img.src = props.src || 'https://via.placeholder.com/150';
            img.alt = props.alt || 'Imagen';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.draggable = false;
            return img;
        }
    },

    tabla: {
        defaultProps: { filas: 3, columnas: 3, encabezados: 'Nombre,Edad,Ciudad', borderWidth: '1', borderCollapse: 'collapse', width: '80%', height: 'auto' },
        render: (props, onUpdate) => {
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.height = '100%';
            table.border = props.borderWidth || '1';
            table.style.borderCollapse = props.borderCollapse || 'collapse';
            const headers = (props.encabezados || '').split(',').map(h => h.trim());
            const filas = parseInt(props.filas || 0);
            const columnas = parseInt(props.columnas || 0);
            if (!props.contenidoTabla || props.contenidoTabla.length !== filas || (filas > 0 && props.contenidoTabla[0].length !== columnas)) {
                props.contenidoTabla = Array.from({ length: filas }, () => Array(columnas).fill(''));
            }
            if (headers.length > 0 && headers[0] !== '' && columnas > 0) {
                const thead = table.createTHead();
                const tr = thead.insertRow();
                for (let i = 0; i < columnas; i++) {
                    const th = document.createElement('th');
                    th.innerText = headers[i] || `Col ${i + 1}`;
                    tr.appendChild(th);
                }
            }
            const tbody = table.createTBody();
            for (let i = 0; i < filas; i++) {
                const tr = tbody.insertRow();
                for (let j = 0; j < columnas; j++) {
                    const td = tr.insertCell();
                    td.innerText = props.contenidoTabla[i]?.[j] || '';
                    td.contentEditable = true;
                    td.addEventListener('blur', () => {
                        if (props.contenidoTabla[i][j] !== td.innerText) {
                            props.contenidoTabla[i][j] = td.innerText;
                            onUpdate();
                        }
                    });
                }
            }
            return table;
        }
    },

    clock: {
        defaultProps: { formato: 'HH:mm:ss', width: '20%', height: 'auto' },
        render: (props) => {
            const clockDiv = document.createElement('div');
            clockDiv.style.fontSize = '1.5em';
            clockDiv.style.textAlign = 'center';
            let intervalId = null;
            const updateClock = () => {
                if (clockDiv.isConnected) {
                    clockDiv.innerText = new Date().toLocaleTimeString([], { hour12: false });
                } else {
                    clearInterval(intervalId);
                }
            };
            updateClock();
            intervalId = setInterval(updateClock, 1000);
            return clockDiv;
        }
    },
};