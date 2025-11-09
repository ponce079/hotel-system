// backend/src/controllers/huespedesController.js
const { pool } = require('../config/database');

// ✅ Obtener perfil del huésped logueado
exports.obtenerMiPerfil = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const [huespedes] = await pool.query(
      `SELECT * FROM huespedes WHERE usuario_id = ?`,
      [usuario_id]
    );

    if (huespedes.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'No se encontró perfil de huésped'
      });
    }

    res.json({
      success: true,
      data: huespedes[0]
    });
  } catch (error) {
    console.error('Error al obtener perfil del huésped:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil del huésped',
      error: error.message
    });
  }
};

// ✅ Actualizar mi perfil de huésped
exports.actualizarMiPerfil = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const usuario_id = req.user.id;
    const {
      nombre,
      apellido,
      tipo_documento,
      numero_documento,
      telefono,
      email,
      direccion,
      ciudad,
      pais,
      fecha_nacimiento,
      nacionalidad
    } = req.body;

    // Verificar si ya existe un huésped
    const [huespedesExistentes] = await connection.query(
      'SELECT id FROM huespedes WHERE usuario_id = ?',
      [usuario_id]
    );

    if (huespedesExistentes.length === 0) {
      // Crear nuevo huésped
      await connection.query(
        `INSERT INTO huespedes 
         (usuario_id, nombre, apellido, tipo_documento, numero_documento, 
          telefono, email, direccion, ciudad, pais, fecha_nacimiento, nacionalidad)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [usuario_id, nombre, apellido, tipo_documento, numero_documento,
         telefono, email, direccion, ciudad, pais, fecha_nacimiento, nacionalidad]
      );
    } else {
      // Actualizar huésped existente
      await connection.query(
        `UPDATE huespedes 
         SET nombre = ?, apellido = ?, tipo_documento = ?, numero_documento = ?,
             telefono = ?, email = ?, direccion = ?, ciudad = ?, pais = ?,
             fecha_nacimiento = ?, nacionalidad = ?
         WHERE usuario_id = ?`,
        [nombre, apellido, tipo_documento, numero_documento,
         telefono, email, direccion, ciudad, pais, fecha_nacimiento, nacionalidad, usuario_id]
      );
    }

    // Actualizar también el nombre en la tabla usuarios
    await connection.query(
      'UPDATE usuarios SET nombre = ?, apellido = ? WHERE id = ?',
      [nombre, apellido, usuario_id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Obtener todos los huéspedes (admin)
exports.obtenerHuespedes = async (req, res) => {
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
};

// Obtener huésped por ID
exports.obtenerHuespedPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [huespedes] = await pool.query(
      `SELECT h.*, COUNT(DISTINCT r.id) as total_reservas
       FROM huespedes h
       LEFT JOIN reservas r ON h.id = r.huesped_id
       WHERE h.id = ?
       GROUP BY h.id`,
      [id]
    );

    if (huespedes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huésped no encontrado'
      });
    }

    res.json({
      success: true,
      data: huespedes[0]
    });
  } catch (error) {
    console.error('Error al obtener huésped:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener huésped'
    });
  }
};

// Crear huésped (admin)
exports.crearHuesped = async (req, res) => {
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
};

// Actualizar huésped (admin)
exports.actualizarHuesped = async (req, res) => {
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
};

// Eliminar huésped (admin)
exports.eliminarHuesped = async (req, res) => {
  try {
    const { id } = req.params;

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
};