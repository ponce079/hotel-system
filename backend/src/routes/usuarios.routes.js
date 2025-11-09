const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');
const bcrypt = require('bcrypt');

// Obtener todos los usuarios (solo admin)
router.get('/', authenticate, checkRole(['admin', 'administrador']), async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      'SELECT id, nombre, apellido, email, rol, telefono, tipo_documento, numero_documento, activo, fecha_creacion FROM usuarios ORDER BY id DESC'
    );
    res.json({ success: true, data: usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
});

// Crear usuario (solo admin)
router.post('/', authenticate, checkRole(['admin', 'administrador']), async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol, telefono, tipo_documento, numero_documento } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }

    // Verificar si el email ya existe
    const [existente] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existente.length > 0) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, email, password, rol, telefono, tipo_documento, numero_documento, activo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [nombre, apellido || '', email, hashedPassword, rol, telefono || null, tipo_documento || 'DNI', numero_documento || null]
    );

    res.status(201).json({ success: true, message: 'Usuario creado exitosamente', data: { id: result.insertId } });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ success: false, message: 'Error al crear usuario' });
  }
});

// Actualizar usuario (solo admin)
router.put('/:id', authenticate, checkRole(['admin', 'administrador']), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, password, rol, telefono, tipo_documento, numero_documento } = req.body;

    let query = 'UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, rol = ?, telefono = ?, tipo_documento = ?, numero_documento = ?';
    let params = [nombre, apellido || '', email, rol, telefono || null, tipo_documento || 'DNI', numero_documento || null];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({ success: true, message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario (solo admin)
router.delete('/:id', authenticate, checkRole(['admin', 'administrador']), async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir eliminar el usuario admin principal
    if (id === '1') {
      return res.status(400).json({ success: false, message: 'No se puede eliminar el administrador principal' });
    }

    const [result] = await pool.query('UPDATE usuarios SET activo = 0 WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({ success: true, message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
  }
});

module.exports = router;