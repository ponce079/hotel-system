const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

// Obtener todos los servicios
router.get('/', auth, async (req, res) => {
  try {
    const { activo } = req.query;

    let query = 'SELECT * FROM servicios';
    const params = [];

    if (activo !== undefined) {
      query += ' WHERE activo = ?';
      params.push(activo === 'true');
    }

    query += ' ORDER BY categoria, nombre';

    const [servicios] = await pool.query(query, params);
    res.json({ success: true, data: servicios });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener servicios' 
    });
  }
});

// Obtener un servicio por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [servicios] = await pool.query(
      'SELECT * FROM servicios WHERE id = ?',
      [id]
    );

    if (servicios.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Servicio no encontrado' 
      });
    }

    res.json({ success: true, data: servicios[0] });
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener servicio' 
    });
  }
});

// Crear un nuevo servicio (solo admin/gerente)
router.post('/', auth, async (req, res) => {
  try {
    const { rol } = req.user;

    if (!['admin', 'gerente'].includes(rol)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para crear servicios' 
      });
    }

    const { nombre, descripcion, categoria, precio } = req.body;

    if (!nombre || !categoria || !precio) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre, categoría y precio son requeridos' 
      });
    }

    const [result] = await pool.query(
      `INSERT INTO servicios (nombre, descripcion, categoria, precio, activo) 
       VALUES (?, ?, ?, ?, TRUE)`,
      [nombre, descripcion, categoria, precio]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Servicio creado exitosamente',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear servicio' 
    });
  }
});

// Actualizar un servicio (solo admin/gerente)
router.put('/:id', auth, async (req, res) => {
  try {
    const { rol } = req.user;
    const { id } = req.params;

    if (!['admin', 'gerente'].includes(rol)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para actualizar servicios' 
      });
    }

    const { nombre, descripcion, categoria, precio, activo } = req.body;

    const [result] = await pool.query(
      `UPDATE servicios 
       SET nombre = ?, descripcion = ?, categoria = ?, precio = ?, activo = ?
       WHERE id = ?`,
      [nombre, descripcion, categoria, precio, activo, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Servicio no encontrado' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Servicio actualizado exitosamente' 
    });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar servicio' 
    });
  }
});

// Eliminar/Desactivar un servicio (solo admin/gerente)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { rol } = req.user;
    const { id } = req.params;

    if (!['admin', 'gerente'].includes(rol)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para eliminar servicios' 
      });
    }

    // En lugar de eliminar, desactivamos
    const [result] = await pool.query(
      'UPDATE servicios SET activo = FALSE WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Servicio no encontrado' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Servicio desactivado exitosamente' 
    });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar servicio' 
    });
  }
});

// Agregar servicio a una reserva
router.post('/reserva/:reservaId', auth, async (req, res) => {
  try {
    const { reservaId } = req.params;
    const { servicio_id, cantidad, notas } = req.body;

    if (!servicio_id || !cantidad) {
      return res.status(400).json({ 
        success: false, 
        message: 'Servicio y cantidad son requeridos' 
      });
    }

    // Verificar que la reserva existe y está activa
    const [reservas] = await pool.query(
      `SELECT * FROM reservas WHERE id = ? AND estado IN ('confirmada', 'check_in')`,
      [reservaId]
    );

    if (reservas.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reserva no encontrada o no está activa' 
      });
    }

    // Obtener precio del servicio
    const [servicios] = await pool.query(
      'SELECT precio FROM servicios WHERE id = ? AND activo = TRUE',
      [servicio_id]
    );

    if (servicios.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Servicio no encontrado' 
      });
    }

    const precioUnitario = servicios[0].precio;
    const precioTotal = precioUnitario * cantidad;

    // Agregar servicio a la reserva
    const [result] = await pool.query(
      `INSERT INTO reserva_servicios 
       (reserva_id, servicio_id, cantidad, precio_unitario, precio_total, notas) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [reservaId, servicio_id, cantidad, precioUnitario, precioTotal, notas]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Servicio agregado a la reserva',
      data: { 
        id: result.insertId,
        precio_total: precioTotal
      }
    });
  } catch (error) {
    console.error('Error al agregar servicio a reserva:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al agregar servicio a reserva' 
    });
  }
});

// Obtener servicios de una reserva
router.get('/reserva/:reservaId', auth, async (req, res) => {
  try {
    const { reservaId } = req.params;

    const [servicios] = await pool.query(
      `SELECT 
        rs.*,
        s.nombre as servicio_nombre,
        s.categoria,
        s.descripcion
       FROM reserva_servicios rs
       JOIN servicios s ON rs.servicio_id = s.id
       WHERE rs.reserva_id = ?
       ORDER BY rs.fecha_consumo DESC`,
      [reservaId]
    );

    res.json({ success: true, data: servicios });
  } catch (error) {
    console.error('Error al obtener servicios de reserva:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener servicios de reserva' 
    });
  }
});

module.exports = router;