import { Router } from 'express';
import CrearPaginaController from '../controllers/crearPagina.controller.js';

const router = Router();

router.post('/', CrearPaginaController.crear);
router.post('/:id', CrearPaginaController.exportar);
router.post('/imagen/:id', CrearPaginaController.uploadImage);
router.post('/chat/:id', CrearPaginaController.sendChatMessage);

export default router;