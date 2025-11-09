const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');
const { enviarConfirmacionReserva } = require('../services/emailService');

// Obtener todas las reservas (admin) o solo las del usuario (cliente)
router.get('/', authenticate, async (req, res) => {
  try {
    const { rol, id: userId } = req.user;

    let query = `
      SELECT 
        r.*,
        h.numero as habitacion_numero,
        th.nombre as tipo_habitacion,
        th.precio_base,
        CONCAT(hu.nombre, ' ', hu.apellido) as huesped_nombre,
        hu.email as huesped_email,
        hu.telefono as huesped_telefono
      FROM reservas r
      JOIN habitaciones h ON r.habitacion_id = h.id
      JOIN tipos_habitacion th ON h.tipo_habitacion_id = th.id
      JOIN huespedes hu ON r.huesped_id = hu.id
    `;

    // Si es cliente, solo ver sus propias reservas
    if (rol === 'cliente') {
      query += ` WHERE r.usuario_id = ?`;
      const [reservas] = await pool.query(query, [userId]);
      return res.json({ success: true, data: reservas });
    }

    // Si es admin/staff, ver todas
    const [reservas] = await pool.query(query);
    res.json({ success: true, data: reservas });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener reservas' 
    });
  }
});

// Obtener una reserva por ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    let query = `
      SELECT 
        r.*,
        h.numero as habitacion_numero,
        h.piso,
        th.nombre as tipo_habitacion,
        th.descripcion as tipo_descripcion,
        th.precio_base,
        th.capacidad_personas,
        th.amenidades,
        CONCAT(hu.nombre, ' ', hu.apellido) as huesped_nombre,
        hu.email as huesped_email,
        hu.telefono as huesped_telefono,
        hu.tipo_documento,
        hu.numero_documento
      FROM reservas r
      JOIN habitaciones h ON r.habitacion_id = h.id
      JOIN tipos_habitacion th ON h.tipo_habitacion_id = th.id
      JOIN huespedes hu ON r.huesped_id = hu.id
      WHERE r.id = ?
    `;

    if (rol === 'cliente') {
      query += ` AND r.usuario_id = ?`;
      const [reservas] = await pool.query(query, [id, userId]);
      
      if (reservas.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Reserva no encontrada' 
        });
      }

      return res.json({ success: true, data: reservas[0] });
    }

    const [reservas] = await pool.query(query, [id]);
    
    if (reservas.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reserva no encontrada' 
      });
    }

    res.json({ success: true, data: reservas[0] });
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener reserva' 
    });
  }
});

// Obtener habitaciones disponibles
router.get('/disponibilidad/habitaciones', authenticate, async (req, res) => {
  try {
    const { fecha_entrada, fecha_salida } = req.query;

    if (!fecha_entrada || !fecha_salida) {
      return res.status(400).json({ 
        success: false, 
        message: 'Fechas de entrada y salida son requeridas' 
      });
    }

    const query = `
      SELECT 
        h.id,
        h.numero,
        h.piso,
        th.nombre as tipo_habitacion,
        th.descripcion,
        th.capacidad_personas,
        th.numero_camas,
        th.tipo_camas,
        th.precio_base,
        th.metros_cuadrados,
        th.amenidades
      FROM habitaciones h
      JOIN tipos_habitacion th ON h.tipo_habitacion_id = th.id
      WHERE h.activo = TRUE
      AND h.estado = 'disponible'
      AND h.id NOT IN (
        SELECT habitacion_id 
        FROM reservas 
        WHERE estado IN ('confirmada', 'check_in')
        AND (
          (fecha_entrada <= ? AND fecha_salida >= ?)
          OR (fecha_entrada <= ? AND fecha_salida >= ?)
          OR (fecha_entrada >= ? AND fecha_salida <= ?)
        )
      )
      ORDER BY th.precio_base ASC
    `;

    const [habitaciones] = await pool.query(query, [
      fecha_salida, fecha_entrada,
      fecha_entrada, fecha_entrada,
      fecha_entrada, fecha_salida
    ]);

    res.json({ success: true, data: habitaciones });
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener disponibilidad' 
    });
  }
});

// Crear una nueva reserva
router.post('/', authenticate, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { 
      huesped, 
      habitacion_id, 
      fecha_entrada, 
      fecha_salida, 
      numero_huespedes, 
      observaciones 
    } = req.body;

    const userId = req.user.id;

    // Validaciones
    if (!huesped || !habitacion_id || !fecha_entrada || !fecha_salida || !numero_huespedes) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos obligatorios deben ser completados' 
      });
    }

    // Verificar disponibilidad
    const [habitacionCheck] = await connection.query(
      `SELECT h.*, th.precio_base 
       FROM habitaciones h
       JOIN tipos_habitacion th ON h.tipo_habitacion_id = th.id
       WHERE h.id = ? AND h.activo = TRUE`,
      [habitacion_id]
    );

    if (habitacionCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Habitación no encontrada' 
      });
    }

    // Verificar que no haya reservas conflictivas
    const [conflictos] = await connection.query(
      `SELECT id FROM reservas 
       WHERE habitacion_id = ? 
       AND estado IN ('confirmada', 'check_in', 'pendiente')
       AND (
         (fecha_entrada <= ? AND fecha_salida >= ?)
         OR (fecha_entrada <= ? AND fecha_salida >= ?)
         OR (fecha_entrada >= ? AND fecha_salida <= ?)
       )`,
      [
        habitacion_id,
        fecha_salida, fecha_entrada,
        fecha_entrada, fecha_entrada,
        fecha_entrada, fecha_salida
      ]
    );

    if (conflictos.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'La habitación no está disponible para las fechas seleccionadas' 
      });
    }

    // Crear o buscar huésped
    let huespedId;
    
    const [huespedExistente] = await connection.query(
      'SELECT id FROM huespedes WHERE numero_documento = ?',
      [huesped.numero_documento]
    );

    if (huespedExistente.length > 0) {
      huespedId = huespedExistente[0].id;
      
      // Actualizar información del huésped
      await connection.query(
        `UPDATE huespedes SET 
          nombre = ?, apellido = ?, email = ?, telefono = ?, 
          direccion = ?, ciudad = ?, pais = ?
         WHERE id = ?`,
        [
          huesped.nombre, huesped.apellido, huesped.email, 
          huesped.telefono, huesped.direccion, huesped.ciudad, 
          huesped.pais, huespedId
        ]
      );
    } else {
      // Crear nuevo huésped
      const [resultHuesped] = await connection.query(
        `INSERT INTO huespedes 
         (nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, 
          nacionalidad, email, telefono, direccion, ciudad, pais) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          huesped.nombre, huesped.apellido, huesped.tipo_documento,
          huesped.numero_documento, huesped.fecha_nacimiento, 
          huesped.nacionalidad, huesped.email, huesped.telefono,
          huesped.direccion, huesped.ciudad, huesped.pais
        ]
      );
      huespedId = resultHuesped.insertId;
    }

    // Calcular precio total
    const precioBase = habitacionCheck[0].precio_base;
    const fechaIn = new Date(fecha_entrada);
    const fechaOut = new Date(fecha_salida);
    const dias = Math.ceil((fechaOut - fechaIn) / (1000 * 60 * 60 * 24));
    const precioTotal = precioBase * dias;

    // Generar código de reserva único
    const codigoReserva = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Crear reserva
    const [resultReserva] = await connection.query(
      `INSERT INTO reservas 
       (codigo_reserva, huesped_id, habitacion_id, fecha_entrada, fecha_salida, 
        numero_huespedes, estado, precio_total, observaciones, usuario_id) 
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente', ?, ?, ?)`,
      [
        codigoReserva, huespedId, habitacion_id, fecha_entrada, 
        fecha_salida, numero_huespedes, precioTotal, observaciones, userId
      ]
    );

    // Actualizar estado de la habitación
    await connection.query(
      `UPDATE habitaciones SET estado = 'reservada' WHERE id = ?`,
      [habitacion_id]
    );

    await connection.commit();

    // ✅ AGREGAR ENVÍO DE EMAIL 
    console.log('📧 [RESERVA] Preparando envío de email...');
    
    try {
      const [huespedData] = await connection.query(
        'SELECT nombre, apellido, email FROM huespedes WHERE id = ?',
        [huespedId]
      );

      const [habitacionData] = await connection.query(
        `SELECT h.numero, th.nombre as tipo
         FROM habitaciones h
         JOIN tipos_habitacion th ON h.tipo_habitacion_id = th.id
         WHERE h.id = ?`,
        [habitacion_id]
      );

      const nombreCompleto = huespedData[0].apellido 
        ? `${huespedData[0].nombre} ${huespedData[0].apellido}` 
        : huespedData[0].nombre;

      await enviarConfirmacionReserva({
        email: huespedData[0].email,
        nombre: nombreCompleto,
        reserva_id: resultReserva.insertId,
        habitacion: `${habitacionData[0].tipo} - Habitación Nº ${habitacionData[0].numero}`,
        fecha_entrada,
        fecha_salida,
        noches: dias,
        precio_por_noche: precioBase,
        total: precioTotal,
        servicios: []
      });

      console.log('✅ Email de confirmación de reserva enviado a:', huespedData[0].email);
    } catch (emailError) {
      console.error('❌ Error al enviar email (no crítico):', emailError);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Reserva creada exitosamente. Se ha enviado un email de confirmación.',
      data: {
        id: resultReserva.insertId,
        codigo_reserva: codigoReserva,
        precio_total: precioTotal,
        dias: dias
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Reserva creada exitosamente',
      data: {
        id: resultReserva.insertId,
        codigo_reserva: codigoReserva,
        precio_total: precioTotal,
        dias: dias
      }
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
});

// Actualizar estado de reserva
router.patch('/:id/estado', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const { rol, id: userId } = req.user;

    const estadosValidos = ['pendiente', 'confirmada', 'check_in', 'check_out', 'cancelada'];
    
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Estado inválido' 
      });
    }

    // Verificar permisos
    if (rol === 'cliente' && estado !== 'cancelada') {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para cambiar el estado' 
      });
    }

    let query = 'UPDATE reservas SET estado = ?';
    let params = [estado];

    if (estado === 'check_in') {
      query += ', fecha_check_in = NOW()';
    } else if (estado === 'check_out') {
      query += ', fecha_check_out = NOW()';
    }

    query += ' WHERE id = ?';
    params.push(id);

    if (rol === 'cliente') {
      query += ' AND usuario_id = ?';
      params.push(userId);
    }

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reserva no encontrada o sin permisos' 
      });
    }

    // Si se cancela o finaliza, liberar la habitación
    if (estado === 'cancelada' || estado === 'check_out') {
      await pool.query(
        `UPDATE habitaciones h
         JOIN reservas r ON h.id = r.habitacion_id
         SET h.estado = 'disponible'
         WHERE r.id = ?`,
        [id]
      );
    }

    res.json({ 
      success: true, 
      message: 'Estado actualizado exitosamente' 
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar estado' 
    });
  }
});

// Cancelar reserva
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    let query = 'UPDATE reservas SET estado = "cancelada" WHERE id = ?';
    let params = [id];

    if (rol === 'cliente') {
      query += ' AND usuario_id = ? AND estado = "pendiente"';
      params.push(userId);
    }

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reserva no encontrada o no se puede cancelar' 
      });
    }

    // Liberar la habitación
    await pool.query(
      `UPDATE habitaciones h
       JOIN reservas r ON h.id = r.habitacion_id
       SET h.estado = 'disponible'
       WHERE r.id = ?`,
      [id]
    );

    res.json({ 
      success: true, 
      message: 'Reserva cancelada exitosamente' 
    });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al cancelar reserva' 
    });
  }
});

module.exports = router;