import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(serverUrl) {
    this.socket = io(serverUrl, {
      transports: ["websocket"],
      credentials: true
    });
    this.socket.on("connect", () => console.log("✅ Conectado al Socket", this.socket.id));
    this.socket.on("disconnect", () => console.log("🔴 Desconectado del Socket"));
    this.socket.on("connect_error", (err) => console.error("❌ Error conexión Socket", err.message));
  }

  joinRoom(salaId) {
    if (this.socket && salaId) {
      this.socket.emit("unirseSala", { salaId });
      console.log(`✉️ Solicitud para unirse a la sala: ${salaId}`);
    }
  }

  onUpdate(callback) {
    if (this.socket) {
      this.socket.on("salaActualizada", (data) => {
        callback(data);
      });
    } else {
        console.error("Intento de registrar 'onUpdate' antes de conectar el socket.");
    }
  }
}

export const socketService = new SocketService();