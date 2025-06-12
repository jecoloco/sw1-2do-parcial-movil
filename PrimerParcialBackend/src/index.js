import app from './config/app.js';
import pool from './config/db.js';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import errorHandler from './middlewares/catchedAsync.js';
import { getSalaById } from './models/sala.model.js';

pool.connect()
    .then(() => console.log("✅ Conectado exitosamente a la base de datos"))
    .catch(err => console.error("❌ Error conectando a la base de datos", err.stack));

const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: 'http://localhost:5000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log('🟢 Nuevo cliente conectado:', socket.id);
    socket.on('unirseSala', async ({ salaId }) => {
        try {
            console.log(`👤 Cliente ${socket.id} intenta unirse a la sala ${salaId}`);
            const roomName = `sala_${salaId}`;
            socket.join(roomName);
            console.log(`✅ Cliente ${socket.id} se unió a la habitación: ${roomName}`);
            const sala = await getSalaById(salaId);
            console.log(`Enviando estado actual de la sala ${salaId} al cliente ${sala.title}`);
            if (sala && sala.xml) {
                console.log(`Enviando estado actual de la sala ${salaId} al cliente ${socket.id}`);
                socket.emit('salaActualizada', { xml: sala.xml });
            } else {
                console.log(`Sala ${salaId} no encontrada o vacía. Enviando estado inicial vacío.`);
                socket.emit('salaActualizada', { xml: '[]' });
            }
        } catch (error) {
            console.error(`Error al unir al cliente ${socket.id} a la sala ${salaId}:`, error);
            socket.emit('errorSala', { message: 'No se pudo cargar el estado de la sala.' });
        }
    });

    socket.on('disconnect', () => {
        console.log('🔴 Cliente desconectado:', socket.id);
    });
});

app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});
app.use(errorHandler);

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`🚀 Servidor Express + Socket.IO corriendo en puerto ${PORT}`);
});
