const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
// Obtener todos los tipos de habitación
router.get('/', authenticate, async (req, res) => {
  try {
    const [tipos] = await pool.query(
      'SELECT * FROM tipos_habitacion WHERE activo = TRUE ORDER BY nombre'
    );

    res.json({ success: true, data: tipos });
  } catch (error) {
    console.error('Error al obtener tipos de habitación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener tipos de habitación' 
    });
  }
});

module.exports = router;