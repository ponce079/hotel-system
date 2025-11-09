// backend/src/routes/servicios.routes.js
const express = require('express');
const router = express.Router();
const serviciosController = require('../controllers/serviciosController');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

// Rutas públicas/cliente
router.get('/', serviciosController.obtenerServicios);

// ✅ RUTAS ADMIN PRIMERO (más específicas)
router.get('/admin/contrataciones', 
  authenticate, 
  checkRole(['administrador', 'admin']),  // ✅ Acepta ambos roles
  serviciosController.obtenerTodasContrataciones
);

router.patch('/admin/contratacion/:id/estado', 
  authenticate, 
  checkRole(['administrador', 'admin']),  // ✅ Acepta ambos roles
  serviciosController.cambiarEstadoContratacion
);

// Rutas para clientes - Contratar servicios sin reserva
router.post('/contratar', authenticate, serviciosController.contratarServiciosSinReserva);
router.get('/mis-servicios', authenticate, serviciosController.obtenerMisServicios);
router.get('/contratacion/:contratacion_id/detalle', authenticate, serviciosController.obtenerDetalleContratacion);
router.patch('/contratacion/:contratacion_id/cancelar', authenticate, serviciosController.cancelarContratacion);
router.get('/reserva/:reservaId', authenticate, serviciosController.obtenerServiciosReserva);

// Ruta por ID (menos específica, va después)
router.get('/:id', serviciosController.obtenerServicioPorId);

// Rutas administrativas de servicios (CRUD)
router.post('/', authenticate, checkRole(['administrador', 'admin']), serviciosController.crearServicio);
router.put('/:id', authenticate, checkRole(['administrador', 'admin']), serviciosController.actualizarServicio);
router.delete('/:id', authenticate, checkRole(['administrador', 'admin']), serviciosController.eliminarServicio);

module.exports = router;