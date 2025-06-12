import { AppManager } from './core/AppManager.js';
import { socketService } from './services/socketService.js';
import { apiService } from './services/apiService.js';

function inicializarChatPanelIzquierdo(salaId) {
  const messagesContainer = document.getElementById('chatMessagesPanel');
  const chatInput = document.getElementById('chatInputPanel');
  const sendButton = document.getElementById('chatSendButtonPanel');
  if (!messagesContainer || !chatInput || !sendButton) return;

  const currentUser = "Tú", assistantUser = "Asistente";

  const agregarMensajeAlChat = (texto, remitente, usuarioNombre) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message-panel', remitente);
    messageDiv.innerHTML = `<span class="chat-user-panel">${usuarioNombre}:</span><p>${texto}</p><span class="chat-timestamp-panel">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const enviarMensaje = async () => {
    const msg = chatInput.value.trim();
    if (msg === '') return;
    agregarMensajeAlChat(msg, 'sent', currentUser);
    chatInput.value = '';
    chatInput.disabled = true;
    sendButton.disabled = true;
    const respuestaApi = await apiService.sendChatMessage(salaId, msg);
    const textoRespuesta = respuestaApi.respuesta || "Hubo un problema al procesar tu solicitud.";
    agregarMensajeAlChat(textoRespuesta, 'received', assistantUser);
    chatInput.disabled = false;
    sendButton.disabled = false;
    chatInput.focus();
  };
  sendButton.addEventListener('click', enviarMensaje);
  chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviarMensaje(); });
}

window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const salaId = params.get('id');
  if (!salaId) {
    document.body.innerHTML = '<h1>Error: ID de sala no proporcionado.</h1>';
    return;
  }
  const app = new AppManager(salaId);
  app.inicializar();
  socketService.connect('http://localhost:8080');
  socketService.onUpdate((data) => {
    console.log("[main.js] Evento 'salaActualizada' recibido:", data);
    if (data && data.xml) {
      try {
        const vistasData = JSON.parse(data.xml);
        app.importarDesdeJSON(vistasData, false);
      } catch (e) {
        console.error("[main.js] Error al parsear el XML recibido:", e);
        app.importarDesdeJSON([], false);
      }
    }
  });
  setTimeout(() => {
    socketService.joinRoom(salaId);
  }, 500);
  inicializarChatPanelIzquierdo(salaId);
  window.app = app;
});
