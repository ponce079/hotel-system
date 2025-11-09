const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');


// Obtener todas las facturas
router.get('/', authenticate, async (req, res) => {
  try {
    const { rol } = req.user;
    const { estado, fecha_desde, fecha_hasta } = req.query;

    let query = `
      SELECT 
        f.*,
        r.codigo_reserva,
        h.numero as habitacion_numero,
        CONCAT(hu.nombre, ' ', hu.apellido) as huesped_nombre,
        hu.email as huesped_email,
        u.nombre as usuario_nombre
      FROM facturas f
      JOIN reservas r ON f.reserva_id = r.id
      JOIN habitaciones h ON r.habitacion_id = h.id
      JOIN huespedes hu ON f.huesped_id = hu.id
      LEFT JOIN usuarios u ON f.usuario_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (estado) {
      query += ' AND f.estado = ?';
      params.push(estado);
    }

    if (fecha_desde) {
      query += ' AND f.fecha_emision >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND f.fecha_emision <= ?';
      params.push(fecha_hasta);
    }

    query += ' ORDER BY f.fecha_emision DESC';

    const [facturas] = await pool.query(query, params);
    res.json({ success: true, data: facturas });
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener facturas' 
    });
  }
});

// Obtener una factura por ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        f.*,
        r.codigo_reserva,
        r.fecha_entrada,
        r.fecha_salida,
        r.numero_huespedes,
        h.numero as habitacion_numero,
        th.nombre as tipo_habitacion,
        CONCAT(hu.nombre, ' ', hu.apellido) as huesped_nombre,
        hu.email as huesped_email,
        hu.telefono as huesped_telefono,
        hu.tipo_documento,
        hu.numero_documento,
        u.nombre as usuario_nombre
      FROM facturas f
      JOIN reservas r ON f.reserva_id = r.id
      JOIN habitaciones h ON r.habitacion_id = h.id
      JOIN tipos_habitacion th ON h.tipo_habitacion_id = th.id
      JOIN huespedes hu ON f.huesped_id = hu.id
      LEFT JOIN usuarios u ON f.usuario_id = u.id
      WHERE f.id = ?
    `;

    const [facturas] = await pool.query(query, [id]);

    if (facturas.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Factura no encontrada' 
      });
    }

    // Obtener servicios adicionales
    const [servicios] = await pool.query(
      `SELECT 
        rs.*,
        s.nombre as servicio_nombre,
        s.categoria
       FROM reserva_servicios rs
       JOIN servicios s ON rs.servicio_id = s.id
       WHERE rs.reserva_id = ?`,
      [facturas[0].reserva_id]
    );

    // Obtener pagos realizados
    const [pagos] = await pool.query(
      `SELECT 
        p.*,
        u.nombre as usuario_nombre
       FROM pagos p
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.factura_id = ?
       ORDER BY p.fecha_pago DESC`,
      [id]
    );

    res.json({ 
      success: true, 
      data: {
        ...facturas[0],
        servicios,
        pagos
      }
    });
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener factura' 
    });
  }
});

// Crear factura desde una reserva
router.post('/generar-desde-reserva/:reservaId', authenticate, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { reservaId } = req.params;
    const { impuestos = 0, descuentos = 0, observaciones = '' } = req.body;
    const userId = req.user.id;

    // Verificar que la reserva existe
    const [reservas] = await connection.query(
      `SELECT r.*, r.precio_total as subtotal_base, r.huesped_id
       FROM reservas r
       WHERE r.id = ?`,
      [reservaId]
    );

    if (reservas.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Reserva no encontrada' 
      });
    }

    const reserva = reservas[0];

    // Verificar si ya existe una factura para esta reserva
    const [facturaExistente] = await connection.query(
      'SELECT id FROM facturas WHERE reserva_id = ?',
      [reservaId]
    );

    if (facturaExistente.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe una factura para esta reserva',
        data: { factura_id: facturaExistente[0].id }
      });
    }

    // Obtener servicios adicionales
    const [servicios] = await connection.query(
      'SELECT SUM(precio_total) as total_servicios FROM reserva_servicios WHERE reserva_id = ?',
      [reservaId]
    );

    const totalServicios = parseFloat(servicios[0].total_servicios || 0);
    const subtotal = parseFloat(reserva.subtotal_base) + totalServicios;
    const impuestosValor = (subtotal * parseFloat(impuestos)) / 100;
    const descuentosValor = parseFloat(descuentos);
    const total = subtotal + impuestosValor - descuentosValor;

    // Generar número de factura
    const [ultimaFactura] = await connection.query(
      'SELECT numero_factura FROM facturas ORDER BY id DESC LIMIT 1'
    );

    let numeroFactura;
    if (ultimaFactura.length > 0) {
      const ultimoNumero = parseInt(ultimaFactura[0].numero_factura.split('-')[1]);
      numeroFactura = `FAC-${String(ultimoNumero + 1).padStart(6, '0')}`;
    } else {
      numeroFactura = 'FAC-000001';
    }

    // Crear factura
    const [result] = await connection.query(
      `INSERT INTO facturas 
       (numero_factura, reserva_id, huesped_id, fecha_emision, subtotal, 
        impuestos, descuentos, total, metodo_pago, estado, observaciones, usuario_id) 
       VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?, 'pendiente', 'pendiente', ?, ?)`,
      [
        numeroFactura, 
        reservaId, 
        reserva.huesped_id, 
        subtotal,
        impuestosValor,
        descuentosValor,
        total,
        observaciones,
        userId
      ]
    );

    await connection.commit();

    res.status(201).json({ 
      success: true, 
      message: 'Factura generada exitosamente',
      data: {
        id: result.insertId,
        numero_factura: numeroFactura,
        total: total
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al crear factura:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear factura',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Registrar pago en una factura
router.post('/:id/pagos', authenticate, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { 
      monto, 
      metodo_pago, 
      referencia = '', 
      notas = '',
      // Datos de tarjeta (simulados)
      numero_tarjeta,
      nombre_titular,
      fecha_vencimiento,
      cvv
    } = req.body;

    const userId = req.user.id;

    if (!monto || !metodo_pago) {
      return res.status(400).json({ 
        success: false, 
        message: 'Monto y método de pago son requeridos' 
      });
    }

    // Validar datos de tarjeta si el método es tarjeta
    if (metodo_pago === 'tarjeta') {
      if (!numero_tarjeta || !nombre_titular || !fecha_vencimiento || !cvv) {
        await connection.rollback();
        return res.status(400).json({ 
          success: false, 
          message: 'Datos de tarjeta incompletos' 
        });
      }

      // Simulación de validación de tarjeta
      if (numero_tarjeta.length < 13 || numero_tarjeta.length > 19) {
        await connection.rollback();
        return res.status(400).json({ 
          success: false, 
          message: 'Número de tarjeta inválido' 
        });
      }

      if (cvv.length !== 3 && cvv.length !== 4) {
        await connection.rollback();
        return res.status(400).json({ 
          success: false, 
          message: 'CVV inválido' 
        });
      }
    }

    // Obtener información de la factura
    const [facturas] = await connection.query(
      'SELECT * FROM facturas WHERE id = ?',
      [id]
    );

    if (facturas.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Factura no encontrada' 
      });
    }

    const factura = facturas[0];

    if (factura.estado === 'pagada') {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'La factura ya está pagada' 
      });
    }

    if (factura.estado === 'anulada') {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'La factura está anulada' 
      });
    }

    // Calcular total pagado hasta ahora
    const [pagosPrevios] = await connection.query(
      'SELECT SUM(monto) as total_pagado FROM pagos WHERE factura_id = ?',
      [id]
    );

    const totalPagado = parseFloat(pagosPrevios[0].total_pagado || 0);
    const totalFactura = parseFloat(factura.total);
    const saldoPendiente = totalFactura - totalPagado;

    if (parseFloat(monto) > saldoPendiente) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: `El monto excede el saldo pendiente ($${saldoPendiente.toFixed(2)})` 
      });
    }

    // Generar referencia de transacción simulada
    let referenciaFinal = referencia;
    if (metodo_pago === 'tarjeta') {
      // Simular aprobación de pago
      const transaccionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      referenciaFinal = `${transaccionId} - **** **** **** ${numero_tarjeta.slice(-4)}`;
    }

    // Registrar pago
    const [resultPago] = await connection.query(
      `INSERT INTO pagos 
       (factura_id, monto, metodo_pago, referencia, notas, usuario_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, monto, metodo_pago, referenciaFinal, notas, userId]
    );

    // Actualizar estado de factura si está completamente pagada
    const nuevoTotalPagado = totalPagado + parseFloat(monto);
    
    if (nuevoTotalPagado >= totalFactura) {
      await connection.query(
        'UPDATE facturas SET estado = "pagada", metodo_pago = ? WHERE id = ?',
        [metodo_pago, id]
      );
    }

    await connection.commit();

    res.status(201).json({ 
      success: true, 
      message: 'Pago registrado exitosamente',
      data: {
        id: resultPago.insertId,
        referencia: referenciaFinal,
        monto_pagado: monto,
        total_factura: totalFactura,
        total_pagado: nuevoTotalPagado,
        saldo_pendiente: totalFactura - nuevoTotalPagado,
        factura_pagada: nuevoTotalPagado >= totalFactura
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar pago:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al registrar pago',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Anular factura
router.post('/:id/anular', authenticate, async (req, res) => {
  try {
    const { rol } = req.user;
    const { id } = req.params;
    const { motivo } = req.body;

    if (!['admin', 'gerente', 'contador'].includes(rol)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para anular facturas' 
      });
    }

    // Verificar que no tenga pagos
    const [pagos] = await pool.query(
      'SELECT COUNT(*) as total FROM pagos WHERE factura_id = ?',
      [id]
    );

    if (pagos[0].total > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se puede anular una factura con pagos registrados' 
      });
    }

    const [result] = await pool.query(
      'UPDATE facturas SET estado = "anulada", observaciones = CONCAT(observaciones, " - ANULADA: ", ?) WHERE id = ?',
      [motivo, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Factura no encontrada' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Factura anulada exitosamente' 
    });
  } catch (error) {
    console.error('Error al anular factura:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al anular factura' 
    });
  }
});

// Obtener resumen de pagos de una factura
router.get('/:id/resumen-pagos', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [factura] = await pool.query(
      'SELECT total FROM facturas WHERE id = ?',
      [id]
    );

    if (factura.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Factura no encontrada' 
      });
    }

    const [pagos] = await pool.query(
      'SELECT SUM(monto) as total_pagado, COUNT(*) as numero_pagos FROM pagos WHERE factura_id = ?',
      [id]
    );

    const totalFactura = parseFloat(factura[0].total);
    const totalPagado = parseFloat(pagos[0].total_pagado || 0);
    const saldoPendiente = totalFactura - totalPagado;

    res.json({ 
      success: true, 
      data: {
        total_factura: totalFactura,
        total_pagado: totalPagado,
        saldo_pendiente: saldoPendiente,
        numero_pagos: pagos[0].numero_pagos,
        esta_pagada: totalPagado >= totalFactura
      }
    });
  } catch (error) {
    console.error('Error al obtener resumen de pagos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener resumen de pagos' 
    });
  }
});

module.exports = router;