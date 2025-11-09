const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

// Obtener todas las habitaciones
router.get('/', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT 
        h.*,
        th.nombre as tipo_habitacion_nombre,
        th.precio_base,
        th.capacidad_personas,
        th.numero_camas,
        th.tipo_camas
      FROM habitaciones h
      JOIN tipos_habitacion th ON h.tipo_habitacion_id = th.id
      ORDER BY h.numero
    `;

    const [habitaciones] = await pool.query(query);
    res.json({ success: true, data: habitaciones });
  } catch (error) {
    console.error('Error al obtener habitaciones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener habitaciones' 
    });
  }
});

// Obtener habitaciones disponibles
router.get('/disponibles', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT 
        h.*,
        th.nombre as tipo_habitacion_nombre,
        th.precio_base,
        th.capacidad_personas,
        th.numero_camas,
        th.tipo_camas
      FROM habitaciones h
      JOIN tipos_habitacion th ON h.tipo_habitacion_id = th.id
      WHERE h.estado = 'disponible' AND h.activo = TRUE
      ORDER BY h.numero
    `;

    const [habitaciones] = await pool.query(query);
    res.json({ success: true, data: habitaciones });
  } catch (error) {
    console.error('Error al obtener habitaciones disponibles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener habitaciones disponibles' 
    });
  }
});

// Obtener una habitación por ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        h.*,
        th.nombre as tipo_habitacion_nombre,
        th.descripcion as tipo_descripcion,
        th.precio_base,
        th.capacidad_personas,
        th.numero_camas,
        th.tipo_camas,
        th.metros_cuadrados,
        th.amenidades
      FROM habitaciones h
      JOIN tipos_habitacion th ON h.tipo_habitacion_id = th.id
      WHERE h.id = ?
    `;

    const [habitaciones] = await pool.query(query, [id]);

    if (habitaciones.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Habitación no encontrada' 
      });
    }

    res.json({ success: true, data: habitaciones[0] });
  } catch (error) {
    console.error('Error al obtener habitación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener habitación' 
    });
  }
});

// Crear una nueva habitación
router.post('/', authenticate, async (req, res) => {
  try {
    const { rol } = req.user;

    if (!['admin', 'gerente'].includes(rol)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para crear habitaciones' 
      });
    }

    const { numero, piso, tipo_habitacion_id, estado, notas } = req.body;

    if (!numero || !piso || !tipo_habitacion_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Número, piso y tipo de habitación son requeridos' 
      });
    }

    // Verificar que no exista el número
    const [existente] = await pool.query(
      'SELECT id FROM habitaciones WHERE numero = ?',
      [numero]
    );

    if (existente.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe una habitación con ese número' 
      });
    }

    const [result] = await pool.query(
      `INSERT INTO habitaciones (numero, piso, tipo_habitacion_id, estado, notas, activo) 
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [numero, piso, tipo_habitacion_id, estado || 'disponible', notas]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Habitación creada exitosamente',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error al crear habitación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear habitación' 
    });
  }
});

// Actualizar una habitación
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { rol } = req.user;
    const { id } = req.params;

    if (!['admin', 'gerente'].includes(rol)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para actualizar habitaciones' 
      });
    }

    const { numero, piso, tipo_habitacion_id, estado, notas, activo } = req.body;

    const [result] = await pool.query(
      `UPDATE habitaciones 
       SET numero = ?, piso = ?, tipo_habitacion_id = ?, estado = ?, notas = ?, activo = ?
       WHERE id = ?`,
      [numero, piso, tipo_habitacion_id, estado, notas, activo, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Habitación no encontrada' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Habitación actualizada exitosamente' 
    });
  } catch (error) {
    console.error('Error al actualizar habitación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar habitación' 
    });
  }
});

// Cambiar estado de habitación
router.patch('/:id/estado', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['disponible', 'ocupada', 'limpieza', 'mantenimiento', 'reservada'];
    
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Estado inválido' 
      });
    }

    const [result] = await pool.query(
      'UPDATE habitaciones SET estado = ? WHERE id = ?',
      [estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Habitación no encontrada' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Estado actualizado exitosamente' 
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al cambiar estado' 
    });
  }
});

// Obtener tipos de habitación
router.get('/tipos-habitacion/all', authenticate, async (req, res) => {
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