import { createSala, getSalaById, getSala, updateSala, deleteSala } from '../models/sala.model.js';
import { catchedAsync, response } from '../middlewares/catchedAsync.js';

class SalaController {
    constructor() { }

    register = catchedAsync(async (req, res) => {
        const { title, xml, description } = req.body;
        const userId = req.user.id;
        const sala = await createSala(title, xml, description, userId);
        response(res, 201, sala);
    });

    update = catchedAsync(async (req, res) => {
        const { title, xml, description } = req.body;
        const { id } = req.params;
        const sala = await updateSala(id, title, xml, description);
        const io = req.app.get('io');
        const roomName = `sala_${id}`;
        io.to(roomName).emit('salaActualizada', {
            id,
            title: sala.title,
            description: sala.description,
            xml: sala.xml
        });
        console.log(`📢 Actualización emitida a la habitación: ${roomName}`);
        response(res, 200, sala);
    });

    getSalaById = catchedAsync(async (req, res) => {
        const { id } = req.params;
        const sala = await getSalaById(id);
        response(res, 200, sala);
    });

    getSalas = catchedAsync(async (req, res) => {
        const userId = req.user.id;
        const salas = await getSala(userId);
        response(res, 200, salas);
    });

    delete = catchedAsync(async (req, res) => {
        const { id } = req.params;
        const sala = await deleteSala(id);
        response(res, 200, sala);
    });
}

export default new SalaController();
