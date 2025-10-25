const { pool } = require('../config/database');

// Obtener todos los huéspedes
exports.getAllHuespedes = async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM huespedes';
    let params = [];

    if (search) {
      query += ' WHERE nombre LIKE ? OR apellido LIKE ? OR numero_documento LIKE ? OR email LIKE ?';
      const searchTerm = `%${search}%`;
      params = [searchTerm, searchTerm, searchTerm, searchTerm];
    }

    query += ' ORDER BY fecha_registro DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [huespedes] = await pool.query(query, params);

    // Contar total de registros
    let countQuery = 'SELECT COUNT(*) as total FROM huespedes';
    let countParams = [];

    if (search) {
      countQuery += ' WHERE nombre LIKE ? OR apellido LIKE ? OR numero_documento LIKE ? OR email LIKE ?';
      const searchTerm = `%${search}%`;
      countParams = [searchTerm, searchTerm, searchTerm, searchTerm];
    }

    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: huespedes,
      total: countResult[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error al obtener huéspedes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener huéspedes',
      error: error.message
    });
  }
};

// Obtener un huésped por ID
exports.getHuespedById = async (req, res) => {
  try {
    const { id } = req.params;

    const [huespedes] = await pool.query(
      'SELECT * FROM huespedes WHERE id = ?',
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
      message: 'Error al obtener huésped',
      error: error.message
    });
  }
};

// Crear nuevo huésped
exports.createHuesped = async (req, res) => {
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

    // Validar campos requeridos
    if (!nombre || !apellido || !tipo_documento || !numero_documento) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, apellido, tipo de documento y número de documento son requeridos'
      });
    }

    // Verificar si el documento ya existe
    const [existing] = await pool.query(
      'SELECT id FROM huespedes WHERE numero_documento = ?',
      [numero_documento]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un huésped con este número de documento'
      });
    }

    // Insertar nuevo huésped
    const [result] = await pool.query(
      `INSERT INTO huespedes 
      (nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, 
       nacionalidad, email, telefono, direccion, ciudad, pais, notas) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento,
       nacionalidad, email, telefono, direccion, ciudad, pais, notas]
    );

    res.status(201).json({
      success: true,
      message: 'Huésped creado exitosamente',
      id: result.insertId
    });

  } catch (error) {
    console.error('Error al crear huésped:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear huésped',
      error: error.message
    });
  }
};

// Actualizar huésped
exports.updateHuesped = async (req, res) => {
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

    // Verificar si el huésped existe
    const [existing] = await pool.query(
      'SELECT id FROM huespedes WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huésped no encontrado'
      });
    }

    // Actualizar huésped
    await pool.query(
      `UPDATE huespedes SET 
       nombre = ?, apellido = ?, tipo_documento = ?, numero_documento = ?,
       fecha_nacimiento = ?, nacionalidad = ?, email = ?, telefono = ?,
       direccion = ?, ciudad = ?, pais = ?, notas = ?
       WHERE id = ?`,
      [nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento,
       nacionalidad, email, telefono, direccion, ciudad, pais, notas, id]
    );

    res.json({
      success: true,
      message: 'Huésped actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar huésped:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar huésped',
      error: error.message
    });
  }
};

// Eliminar huésped (soft delete - desactivar)
exports.deleteHuesped = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si tiene reservas activas
    const [reservas] = await pool.query(
      'SELECT id FROM reservas WHERE huesped_id = ? AND estado IN ("pendiente", "confirmada", "check_in")',
      [id]
    );

    if (reservas.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el huésped porque tiene reservas activas'
      });
    }

    // Eliminar huésped
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
      message: 'Error al eliminar huésped',
      error: error.message
    });
  }
};
