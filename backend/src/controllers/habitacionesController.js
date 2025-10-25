const { pool } = require('../config/database');

// Obtener todas las habitaciones con su tipo
exports.getAllHabitaciones = async (req, res) => {
  try {
    const { estado, tipo, piso } = req.query;

    let query = `
      SELECT h.*, t.nombre as tipo_nombre, t.descripcion as tipo_descripcion,
             t.capacidad_personas, t.precio_base, t.amenidades
      FROM habitaciones h
      JOIN tipos_habitacion t ON h.tipo_habitacion_id = t.id
      WHERE h.activo = TRUE
    `;
    
    const params = [];

    if (estado) {
      query += ' AND h.estado = ?';
      params.push(estado);
    }

    if (tipo) {
      query += ' AND h.tipo_habitacion_id = ?';
      params.push(tipo);
    }

    if (piso) {
      query += ' AND h.piso = ?';
      params.push(piso);
    }

    query += ' ORDER BY h.piso, h.numero';

    const [habitaciones] = await pool.query(query, params);

    res.json({
      success: true,
      data: habitaciones
    });

  } catch (error) {
    console.error('Error al obtener habitaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener habitaciones',
      error: error.message
    });
  }
};

// Obtener habitaciones disponibles para fechas específicas
exports.getHabitacionesDisponibles = async (req, res) => {
  try {
    const { fecha_entrada, fecha_salida, tipo_habitacion_id } = req.query;

    if (!fecha_entrada || !fecha_salida) {
      return res.status(400).json({
        success: false,
        message: 'Fecha de entrada y salida son requeridas'
      });
    }

    let query = `
      SELECT h.*, t.nombre as tipo_nombre, t.descripcion as tipo_descripcion,
             t.capacidad_personas, t.precio_base, t.amenidades
      FROM habitaciones h
      JOIN tipos_habitacion t ON h.tipo_habitacion_id = t.id
      WHERE h.activo = TRUE
      AND h.estado IN ('disponible', 'limpieza')
      AND h.id NOT IN (
        SELECT habitacion_id FROM reservas
        WHERE estado IN ('confirmada', 'check_in')
        AND (
          (fecha_entrada <= ? AND fecha_salida >= ?)
          OR (fecha_entrada <= ? AND fecha_salida >= ?)
          OR (fecha_entrada >= ? AND fecha_salida <= ?)
        )
      )
    `;

    const params = [
      fecha_salida, fecha_entrada,
      fecha_entrada, fecha_entrada,
      fecha_entrada, fecha_salida
    ];

    if (tipo_habitacion_id) {
      query += ' AND h.tipo_habitacion_id = ?';
      params.push(tipo_habitacion_id);
    }

    query += ' ORDER BY t.precio_base, h.numero';

    const [habitaciones] = await pool.query(query, params);

    res.json({
      success: true,
      data: habitaciones
    });

  } catch (error) {
    console.error('Error al obtener habitaciones disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener habitaciones disponibles',
      error: error.message
    });
  }
};

// Obtener una habitación por ID
exports.getHabitacionById = async (req, res) => {
  try {
    const { id } = req.params;

    const [habitaciones] = await pool.query(
      `SELECT h.*, t.nombre as tipo_nombre, t.descripcion as tipo_descripcion,
              t.capacidad_personas, t.numero_camas, t.tipo_camas, t.precio_base,
              t.metros_cuadrados, t.amenidades
       FROM habitaciones h
       JOIN tipos_habitacion t ON h.tipo_habitacion_id = t.id
       WHERE h.id = ?`,
      [id]
    );

    if (habitaciones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Habitación no encontrada'
      });
    }

    res.json({
      success: true,
      data: habitaciones[0]
    });

  } catch (error) {
    console.error('Error al obtener habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener habitación',
      error: error.message
    });
  }
};

// Crear nueva habitación
exports.createHabitacion = async (req, res) => {
  try {
    const { numero, piso, tipo_habitacion_id, estado, notas } = req.body;

    if (!numero || !piso || !tipo_habitacion_id) {
      return res.status(400).json({
        success: false,
        message: 'Número, piso y tipo de habitación son requeridos'
      });
    }

    // Verificar si el número ya existe
    const [existing] = await pool.query(
      'SELECT id FROM habitaciones WHERE numero = ?',
      [numero]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una habitación con este número'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO habitaciones (numero, piso, tipo_habitacion_id, estado, notas) VALUES (?, ?, ?, ?, ?)',
      [numero, piso, tipo_habitacion_id, estado || 'disponible', notas]
    );

    res.status(201).json({
      success: true,
      message: 'Habitación creada exitosamente',
      id: result.insertId
    });

  } catch (error) {
    console.error('Error al crear habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear habitación',
      error: error.message
    });
  }
};

// Actualizar habitación
exports.updateHabitacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, piso, tipo_habitacion_id, estado, notas } = req.body;

    const [result] = await pool.query(
      `UPDATE habitaciones SET 
       numero = ?, piso = ?, tipo_habitacion_id = ?, estado = ?, notas = ?
       WHERE id = ?`,
      [numero, piso, tipo_habitacion_id, estado, notas, id]
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
      message: 'Error al actualizar habitación',
      error: error.message
    });
  }
};

// Cambiar estado de habitación
exports.cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        success: false,
        message: 'Estado es requerido'
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
      message: 'Error al cambiar estado',
      error: error.message
    });
  }
};

// Obtener tipos de habitación
exports.getTiposHabitacion = async (req, res) => {
  try {
    const [tipos] = await pool.query(
      'SELECT * FROM tipos_habitacion WHERE activo = TRUE ORDER BY precio_base'
    );

    res.json({
      success: true,
      data: tipos
    });

  } catch (error) {
    console.error('Error al obtener tipos de habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipos de habitación',
      error: error.message
    });
  }
};
