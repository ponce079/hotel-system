const express = require('express');
const router = express.Router();

const reservasRoutes = require('./reservas.routes');
const serviciosRoutes = require('./servicios.routes');
const habitacionesRoutes = require('./habitaciones.routes');
const tiposHabitacionRoutes = require('./tipos-habitacion.routes');
const facturasRoutes = require('./facturas.routes');
const huespedesRoutes = require('./huespedes.routes'); // ✅ Nuevo
const dashboardRoutes = require('./dashboard.routes');
// ============ RUTAS DE RESERVAS ============
router.use('/reservas', reservasRoutes);

// ============ RUTAS DE SERVICIOS ============
router.use('/servicios', serviciosRoutes);

// ============ RUTAS DE HABITACIONES ============
router.use('/habitaciones', habitacionesRoutes);

// ============ RUTAS DE TIPOS DE HABITACIÓN ============
router.use('/tipos-habitacion', tiposHabitacionRoutes);

// ============ RUTAS DE FACTURAS ============
router.use('/facturas', facturasRoutes);

// ============ RUTAS DE HUÉSPEDES ============
router.use('/huespedes', huespedesRoutes); 
// ============ RUTAS DEL DASHBOARD ============
router.use('/dashboard', dashboardRoutes); 

module.exports = router;
