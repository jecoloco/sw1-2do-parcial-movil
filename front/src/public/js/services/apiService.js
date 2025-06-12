const API_URL = 'http://localhost:8080';

class ApiService {
  async getRoomData(roomId) {
    const response = await fetch(`${API_URL}/apis/sala/${roomId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(`Error al obtener sala: ${response.statusText}`);
    return response.json();
  }

  async updateRoomData(roomId, data) {
    const payload = { xml: JSON.stringify(data) };
    const response = await fetch(`${API_URL}/apis/sala/${roomId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Fallo en sincronización con el servidor");
  }

  async exportMobile(roomId) {
    console.log(`✉️ Solicitud POST para exportar a la sala: ${roomId}`);
    const id = roomId;
    try {
      const response = await fetch(`${API_URL}/crearPagina/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `Error en servidor: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `proyecto_sala_${roomId}.zip`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      console.log("✅ Descarga del proyecto iniciada.");      
    } catch(error) {
        console.error("Error al exportar a móvil:", error);
        alert(`Error al exportar a móvil: ${error.message}`);
        throw error; 
    }
  }

  async uploadImage(roomId, file) {
    console.log(`🖼️ Subiendo imagen a la sala: ${roomId}`);
    const formData = new FormData();
    formData.append('imagen', file);
    try {
        const response = await fetch(`${API_URL}/crearPagina/imagen/${roomId}`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });
        if (!response.ok) throw new Error(`Error al subir imagen: ${response.statusText}`);
        console.log("Imagen subida con éxito.");
        return await response.json();
    } catch (error) {
        console.error("Error al subir la imagen:", error);
        alert(`Error al subir la imagen: ${error.message}`);
    }
  }

  async sendChatMessage(roomId, message) {
    console.log(`💬 Enviando mensaje de chat a la sala: ${roomId}`);
    try {
        const response = await fetch(`${API_URL}/crearPagina/chat/${roomId}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: message }),
        });
        if (!response.ok) throw new Error(`Error en el chat: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Error al enviar mensaje de chat:", error);
        return { error: true, respuesta: "No se pudo conectar con el asistente." };
    }
  }
}

export const apiService = new ApiService();