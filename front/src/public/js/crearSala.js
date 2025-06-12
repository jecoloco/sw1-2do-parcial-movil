document.getElementById('create-room-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const xml = document.getElementById('xml').value;
    const description = document.getElementById('description').value;
    const roomData = {
        title: title,
        xml: xml,
        description: description
    };
    try {
        const response = await fetch(`${API_URL}/apis/sala/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(roomData)
        });
        if (response.ok) {
            const data = await response.json();
            mostrarPantallaEspera();
            await fetch(`${API_URL}/crearPagina`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ titulo: title })
            })
            .then(async response => {
                if (!response.ok) throw new Error('Error al crear página');
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title}.zip`; // nombre del archivo descargado
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Error al llamar a crearPagina:', error);
            });            
            let segundosRestantes = 20;
            const contadorElemento = document.getElementById('contador');
            const intervalo = setInterval(() => {
                segundosRestantes--;
                contadorElemento.textContent = segundosRestantes;
                if (segundosRestantes <= 0) {
                    clearInterval(intervalo);
                    window.location.href = './dashboard.html';
                }
            }, 1000);
        } else {
            const errorData = await response.json();
            alert('Error al crear sala: ' + errorData.message);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
        alert('Error en la solicitud: ' + error.message);
    }
});

function mostrarPantallaEspera() {
    const overlay = document.createElement('div');
    overlay.id = 'espera-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    overlay.style.color = '#fff';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.fontSize = '28px';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.8s ease-out';
    overlay.style.animation = 'fadeIn 1.5s ease-in-out forwards';
    overlay.innerHTML = `
        <p style="margin-bottom: 10px;">Espere <span id="contador">50</span> segundos...</p>
        <p style="font-size: 20px;">Estamos creando el proyecto...</p>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 100);
}

if (!document.getElementById('espera-style')) {
    const estilo = document.createElement('style');
    estilo.id = 'espera-style';
    estilo.innerHTML = `
        @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }

        #espera-overlay p {
            animation: moveText 5s infinite alternate ease-in-out;
        }

        @keyframes moveText {
            0% { transform: translateX(-10px); }
            50% { transform: translateX(10px); }
            100% { transform: translateX(-10px); }
        }
    `;
    document.head.appendChild(estilo);
}
