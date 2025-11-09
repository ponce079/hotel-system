// backend/src/routes/huespedes.routes.js
const express = require('express');
const router = express.Router();
const huespedesController = require('../controllers/huespedesController'); // ✅ IMPORTAR CONTROLADOR
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

// ✅ RUTAS PARA CLIENTES (deben ir PRIMERO, más específicas)
router.get('/mi-perfil', authenticate, huespedesController.obtenerMiPerfil);
router.put('/mi-perfil', authenticate, huespedesController.actualizarMiPerfil);

// ✅ RUTAS ADMINISTRATIVAS
router.get('/', 
  authenticate, 
  checkRole(['administrador', 'admin']), 
  huespedesController.obtenerHuespedes
);

router.get('/:id', 
  authenticate, 
  checkRole(['administrador', 'admin']), 
  huespedesController.obtenerHuespedPorId
);

router.post('/', 
  authenticate, 
  checkRole(['administrador', 'admin']), 
  huespedesController.crearHuesped
);

router.put('/:id', 
  authenticate, 
  checkRole(['administrador', 'admin']), 
  huespedesController.actualizarHuesped
);

router.delete('/:id', 
  authenticate, 
  checkRole(['administrador', 'admin']), 
  huespedesController.eliminarHuesped
);

module.exports = router;