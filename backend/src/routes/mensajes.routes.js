// backend/src/routes/mensajes.routes.js
const express = require('express');
const router = express.Router();
const mensajesController = require('../controllers/mensajesController');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

// Rutas para clientes
router.post('/', authenticate, mensajesController.crearMensaje);
router.get('/mis-mensajes', authenticate, mensajesController.obtenerMisMensajes);
router.get('/:id', authenticate, mensajesController.obtenerMensajePorId);

// Rutas para administradores
router.get('/admin/todos', 
  authenticate, 
  checkRole(['administrador', 'admin']), 
  mensajesController.obtenerTodosMensajes
);
router.patch('/:id/responder', 
  authenticate, 
  checkRole(['administrador', 'admin']), 
  mensajesController.responderMensaje
);
router.patch('/:id/estado', 
  authenticate, 
  checkRole(['administrador', 'admin']), 
  mensajesController.cambiarEstadoMensaje
);

module.exports = router;