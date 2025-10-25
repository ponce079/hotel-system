const { pool } = require('../config/database');

// Obtener todos los servicios
exports.getAllServicios = async (req, res) => {
  try {
    const { categoria, activo = true } = req.query;

    let query = 'SELECT * FROM servicios WHERE 1=1';
    const params = [];

    if (activo !== undefined) {
      query += ' AND activo = ?';
      params.push(activo === 'true' || activo === true);
    }

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    query += ' ORDER BY categoria, nombre';

    const [servicios] = await pool.query(query, params);

    res.json({
      success: true,
      data: servicios
    });

  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios',
      error: error.message
    });
  }
};

// Obtener servicio por ID
exports.getServicioById = async (req, res) => {
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

    res.json({
      success: true,
      data: servicios[0]
    });

  } catch (error) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicio',
      error: error.message
    });
  }
};

// Crear nuevo servicio
exports.createServicio = async (req, res) => {
  try {
    const { nombre, descripcion, categoria, precio } = req.body;

    if (!nombre || !categoria || !precio) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, categoría y precio son requeridos'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO servicios (nombre, descripcion, categoria, precio) VALUES (?, ?, ?, ?)',
      [nombre, descripcion, categoria, precio]
    );

    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      id: result.insertId
    });

  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear servicio',
      error: error.message
    });
  }
};

// Actualizar servicio
exports.updateServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, categoria, precio, activo } = req.body;

    const [result] = await pool.query(
      `UPDATE servicios SET 
       nombre = ?, descripcion = ?, categoria = ?, precio = ?, activo = ?
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
      message: 'Error al actualizar servicio',
      error: error.message
    });
  }
};

// Eliminar servicio (soft delete)
exports.deleteServicio = async (req, res) => {
  try {
    const { id } = req.params;

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
      message: 'Error al eliminar servicio',
      error: error.message
    });
  }
};
