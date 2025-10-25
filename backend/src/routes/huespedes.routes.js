const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

// Obtener todos los huéspedes
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT 
        h.*,
        COUNT(DISTINCT r.id) as total_reservas
      FROM huespedes h
      LEFT JOIN reservas r ON h.id = r.huesped_id
    `;

    const params = [];

    if (search) {
      query += ` WHERE 
        h.nombre LIKE ? OR 
        h.apellido LIKE ? OR 
        h.email LIKE ? OR 
        h.numero_documento LIKE ?
      `;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    query += ' GROUP BY h.id ORDER BY h.fecha_registro DESC';

    const [huespedes] = await pool.query(query, params);
    res.json({ success: true, data: huespedes });
  } catch (error) {
    console.error('Error al obtener huéspedes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener huéspedes' 
    });
  }
});

// Obtener un huésped por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        h.*,
        COUNT(DISTINCT r.id) as total_reservas
      FROM huespedes h
      LEFT JOIN reservas r ON h.id = r.huesped_id
      WHERE h.id = ?
      GROUP BY h.id
    `;

    const [huespedes] = await pool.query(query, [id]);

    if (huespedes.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Huésped no encontrado' 
      });
    }

    // Obtener historial de reservas del huésped
    const [reservas] = await pool.query(
      `SELECT 
        r.*,
        h.numero as habitacion_numero,
        th.nombre as tipo_habitacion
       FROM reservas r
       JOIN habitaciones h ON r.habitacion_id = h.id
       JOIN tipos_habitacion th ON h.tipo_habitacion_id = th.id
       WHERE r.huesped_id = ?
       ORDER BY r.fecha_entrada DESC`,
      [id]
    );

    res.json({ 
      success: true, 
      data: {
        ...huespedes[0],
        reservas
      }
    });
  } catch (error) {
    console.error('Error al obtener huésped:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener huésped' 
    });
  }
});

// Crear un nuevo huésped
router.post('/', auth, async (req, res) => {
  try {
    const { 
      nombre, 
      apellido, 
      tipo_documento, 
      numero_documento, 
      fecha_nacimiento,
      nacionalidad,
      email, 
      telefono, 
      direccion,
      ciudad,
      pais,
      notas
    } = req.body;

    if (!nombre || !apellido || !tipo_documento || !numero_documento) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre, apellido, tipo y número de documento son requeridos' 
      });
    }

    // Verificar que no exista el documento
    const [existente] = await pool.query(
      'SELECT id FROM huespedes WHERE numero_documento = ?',
      [numero_documento]
    );

    if (existente.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un huésped con ese número de documento' 
      });
    }

    const [result] = await pool.query(
      `INSERT INTO huespedes 
       (nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, 
        nacionalidad, email, telefono, direccion, ciudad, pais, notas) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento,
        nacionalidad, email, telefono, direccion, ciudad, pais, notas
      ]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Huésped creado exitosamente',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error al crear huésped:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear huésped' 
    });
  }
});

// Actualizar un huésped
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, 
      apellido, 
      tipo_documento, 
      numero_documento, 
      fecha_nacimiento,
      nacionalidad,
      email, 
      telefono, 
      direccion,
      ciudad,
      pais,
      notas
    } = req.body;

    const [result] = await pool.query(
      `UPDATE huespedes 
       SET nombre = ?, apellido = ?, tipo_documento = ?, numero_documento = ?, 
           fecha_nacimiento = ?, nacionalidad = ?, email = ?, telefono = ?, 
           direccion = ?, ciudad = ?, pais = ?, notas = ?
       WHERE id = ?`,
      [
        nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento,
        nacionalidad, email, telefono, direccion, ciudad, pais, notas, id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Huésped no encontrado' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Huésped actualizado exitosamente' 
    });
  } catch (error) {
    console.error('Error al actualizar huésped:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar huésped' 
    });
  }
});

// Eliminar un huésped
router.delete('/:id', auth, async (req, res) => {
  try {
    const { rol } = req.user;
    const { id } = req.params;

    if (!['admin', 'gerente'].includes(rol)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para eliminar huéspedes' 
      });
    }

    // Verificar que no tenga reservas
    const [reservas] = await pool.query(
      'SELECT COUNT(*) as total FROM reservas WHERE huesped_id = ?',
      [id]
    );

    if (reservas[0].total > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se puede eliminar un huésped con reservas registradas' 
      });
    }

    const [result] = await pool.query(
      'DELETE FROM huespedes WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Huésped no encontrado' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Huésped eliminado exitosamente' 
    });
  } catch (error) {
    console.error('Error al eliminar huésped:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar huésped' 
    });
  }
});

module.exports = router;