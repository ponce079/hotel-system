const { pool } = require('../config/database');

// Generar código único de reserva
const generarCodigoReserva = () => {
  const fecha = new Date();
  const año = fecha.getFullYear().toString().slice(-2);
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RES${año}${mes}${random}`;
};

// Calcular precio total de reserva
const calcularPrecioTotal = (precioBase, fechaEntrada, fechaSalida) => {
  const entrada = new Date(fechaEntrada);
  const salida = new Date(fechaSalida);
  const dias = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
  return precioBase * dias;
};

// Obtener todas las reservas
exports.getAllReservas = async (req, res) => {
  try {
    const { estado, fecha_desde, fecha_hasta, huesped_id } = req.query;

    let query = `
      SELECT r.*, 
             h.nombre as huesped_nombre, h.apellido as huesped_apellido,
             h.numero_documento, h.telefono as huesped_telefono,
             hab.numero as habitacion_numero, hab.piso,
             t.nombre as tipo_habitacion,
             u.nombre as usuario_nombre
      FROM reservas r
      JOIN huespedes h ON r.huesped_id = h.id
      JOIN habitaciones hab ON r.habitacion_id = hab.id
      JOIN tipos_habitacion t ON hab.tipo_habitacion_id = t.id
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (estado) {
      query += ' AND r.estado = ?';
      params.push(estado);
    }

    if (fecha_desde) {
      query += ' AND r.fecha_entrada >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND r.fecha_salida <= ?';
      params.push(fecha_hasta);
    }

    if (huesped_id) {
      query += ' AND r.huesped_id = ?';
      params.push(huesped_id);
    }

    query += ' ORDER BY r.fecha_creacion DESC';

    const [reservas] = await pool.query(query, params);

    res.json({
      success: true,
      data: reservas
    });

  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservas',
      error: error.message
    });
  }
};

// Obtener reserva por ID
exports.getReservaById = async (req, res) => {
  try {
    const { id } = req.params;

    const [reservas] = await pool.query(
      `SELECT r.*, 
              h.*, h.id as huesped_id,
              hab.numero as habitacion_numero, hab.piso, hab.estado as habitacion_estado,
              t.nombre as tipo_habitacion, t.precio_base,
              u.nombre as usuario_nombre
       FROM reservas r
       JOIN huespedes h ON r.huesped_id = h.id
       JOIN habitaciones hab ON r.habitacion_id = hab.id
       JOIN tipos_habitacion t ON hab.tipo_habitacion_id = t.id
       LEFT JOIN usuarios u ON r.usuario_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    if (reservas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Obtener servicios adicionales de la reserva
    const [servicios] = await pool.query(
      `SELECT rs.*, s.nombre as servicio_nombre, s.categoria
       FROM reserva_servicios rs
       JOIN servicios s ON rs.servicio_id = s.id
       WHERE rs.reserva_id = ?`,
      [id]
    );

    const reserva = reservas[0];
    reserva.servicios = servicios;

    res.json({
      success: true,
      data: reserva
    });

  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reserva',
      error: error.message
    });
  }
};

// Crear nueva reserva
exports.createReserva = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      huesped_id,
      habitacion_id,
      fecha_entrada,
      fecha_salida,
      numero_huespedes,
      anticipo,
      observaciones
    } = req.body;

    // Validar campos requeridos
    if (!huesped_id || !habitacion_id || !fecha_entrada || !fecha_salida || !numero_huespedes) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Todos los campos requeridos deben ser proporcionados'
      });
    }

    // Verificar disponibilidad de la habitación
    const [conflictos] = await connection.query(
      `SELECT id FROM reservas 
       WHERE habitacion_id = ? 
       AND estado IN ('confirmada', 'check_in')
       AND (
         (fecha_entrada <= ? AND fecha_salida >= ?)
         OR (fecha_entrada <= ? AND fecha_salida >= ?)
         OR (fecha_entrada >= ? AND fecha_salida <= ?)
       )`,
      [habitacion_id, fecha_salida, fecha_entrada, fecha_entrada, fecha_entrada, fecha_entrada, fecha_salida]
    );

    if (conflictos.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'La habitación no está disponible para las fechas seleccionadas'
      });
    }

    // Obtener precio base de la habitación
    const [habitacion] = await connection.query(
      `SELECT t.precio_base 
       FROM habitaciones h
       JOIN tipos_habitacion t ON h.tipo_habitacion_id = t.id
       WHERE h.id = ?`,
      [habitacion_id]
    );

    if (habitacion.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Habitación no encontrada'
      });
    }

    const precio_total = calcularPrecioTotal(habitacion[0].precio_base, fecha_entrada, fecha_salida);
    const codigo_reserva = generarCodigoReserva();

    // Crear reserva
    const [result] = await connection.query(
      `INSERT INTO reservas 
       (codigo_reserva, huesped_id, habitacion_id, fecha_entrada, fecha_salida, 
        numero_huespedes, precio_total, anticipo, observaciones, usuario_id, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmada')`,
      [codigo_reserva, huesped_id, habitacion_id, fecha_entrada, fecha_salida,
       numero_huespedes, precio_total, anticipo || 0, observaciones, req.user.id]
    );

    // Actualizar estado de la habitación
    await connection.query(
      'UPDATE habitaciones SET estado = "reservada" WHERE id = ?',
      [habitacion_id]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      id: result.insertId,
      codigo_reserva,
      precio_total
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al crear reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear reserva',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Check-in
exports.checkIn = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [reservas] = await connection.query(
      'SELECT * FROM reservas WHERE id = ? AND estado = "confirmada"',
      [id]
    );

    if (reservas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada o no está en estado confirmada'
      });
    }

    // Actualizar reserva a check_in
    await connection.query(
      'UPDATE reservas SET estado = "check_in", fecha_check_in = NOW() WHERE id = ?',
      [id]
    );

    // Actualizar habitación a ocupada
    await connection.query(
      'UPDATE habitaciones SET estado = "ocupada" WHERE id = ?',
      [reservas[0].habitacion_id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Check-in realizado exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error en check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Error en check-in',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Check-out
exports.checkOut = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [reservas] = await connection.query(
      'SELECT * FROM reservas WHERE id = ? AND estado = "check_in"',
      [id]
    );

    if (reservas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada o no está en estado check-in'
      });
    }

    // Actualizar reserva a check_out
    await connection.query(
      'UPDATE reservas SET estado = "check_out", fecha_check_out = NOW() WHERE id = ?',
      [id]
    );

    // Actualizar habitación a limpieza
    await connection.query(
      'UPDATE habitaciones SET estado = "limpieza" WHERE id = ?',
      [reservas[0].habitacion_id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Check-out realizado exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error en check-out:', error);
    res.status(500).json({
      success: false,
      message: 'Error en check-out',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Cancelar reserva
exports.cancelarReserva = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [reservas] = await connection.query(
      'SELECT * FROM reservas WHERE id = ? AND estado IN ("pendiente", "confirmada")',
      [id]
    );

    if (reservas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada o no puede ser cancelada'
      });
    }

    // Actualizar reserva a cancelada
    await connection.query(
      'UPDATE reservas SET estado = "cancelada" WHERE id = ?',
      [id]
    );

    // Liberar habitación
    await connection.query(
      'UPDATE habitaciones SET estado = "disponible" WHERE id = ?',
      [reservas[0].habitacion_id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Reserva cancelada exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar reserva',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Agregar servicio a reserva
exports.agregarServicio = async (req, res) => {
  try {
    const { reserva_id, servicio_id, cantidad } = req.body;

    // Obtener precio del servicio
    const [servicios] = await pool.query(
      'SELECT precio FROM servicios WHERE id = ?',
      [servicio_id]
    );

    if (servicios.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    const precio_unitario = servicios[0].precio;
    const precio_total = precio_unitario * (cantidad || 1);

    await pool.query(
      'INSERT INTO reserva_servicios (reserva_id, servicio_id, cantidad, precio_unitario, precio_total) VALUES (?, ?, ?, ?, ?)',
      [reserva_id, servicio_id, cantidad || 1, precio_unitario, precio_total]
    );

    res.status(201).json({
      success: true,
      message: 'Servicio agregado exitosamente'
    });

  } catch (error) {
    console.error('Error al agregar servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar servicio',
      error: error.message
    });
  }
};
