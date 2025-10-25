const { pool } = require('../config/database');

// Generar número de factura
const generarNumeroFactura = async () => {
  const fecha = new Date();
  const año = fecha.getFullYear().toString().slice(-2);
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  
  // Obtener el último número de factura del mes
  const [facturas] = await pool.query(
    `SELECT numero_factura FROM facturas 
     WHERE numero_factura LIKE ? 
     ORDER BY id DESC LIMIT 1`,
    [`FAC${año}${mes}%`]
  );

  let numero = 1;
  if (facturas.length > 0) {
    const ultimoNumero = parseInt(facturas[0].numero_factura.slice(-4));
    numero = ultimoNumero + 1;
  }

  return `FAC${año}${mes}${numero.toString().padStart(4, '0')}`;
};

// Obtener todas las facturas
exports.getAllFacturas = async (req, res) => {
  try {
    const { estado, fecha_desde, fecha_hasta } = req.query;

    let query = `
      SELECT f.*, 
             h.nombre as huesped_nombre, h.apellido as huesped_apellido,
             h.numero_documento,
             r.codigo_reserva,
             u.nombre as usuario_nombre
      FROM facturas f
      JOIN huespedes h ON f.huesped_id = h.id
      JOIN reservas r ON f.reserva_id = r.id
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

    query += ' ORDER BY f.fecha_creacion DESC';

    const [facturas] = await pool.query(query, params);

    res.json({
      success: true,
      data: facturas
    });

  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener facturas',
      error: error.message
    });
  }
};

// Obtener factura por ID
exports.getFacturaById = async (req, res) => {
  try {
    const { id } = req.params;

    const [facturas] = await pool.query(
      `SELECT f.*, 
              h.nombre as huesped_nombre, h.apellido as huesped_apellido,
              h.numero_documento, h.email as huesped_email, h.telefono as huesped_telefono,
              h.direccion as huesped_direccion,
              r.codigo_reserva, r.fecha_entrada, r.fecha_salida,
              r.precio_total as reserva_precio,
              hab.numero as habitacion_numero,
              t.nombre as tipo_habitacion,
              u.nombre as usuario_nombre
       FROM facturas f
       JOIN huespedes h ON f.huesped_id = h.id
       JOIN reservas r ON f.reserva_id = r.id
       JOIN habitaciones hab ON r.habitacion_id = hab.id
       JOIN tipos_habitacion t ON hab.tipo_habitacion_id = t.id
       LEFT JOIN usuarios u ON f.usuario_id = u.id
       WHERE f.id = ?`,
      [id]
    );

    if (facturas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Obtener servicios de la reserva
    const [servicios] = await pool.query(
      `SELECT rs.*, s.nombre as servicio_nombre
       FROM reserva_servicios rs
       JOIN servicios s ON rs.servicio_id = s.id
       WHERE rs.reserva_id = ?`,
      [facturas[0].reserva_id]
    );

    // Obtener pagos de la factura
    const [pagos] = await pool.query(
      `SELECT p.*, u.nombre as usuario_nombre
       FROM pagos p
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.factura_id = ?
       ORDER BY p.fecha_pago DESC`,
      [id]
    );

    const factura = facturas[0];
    factura.servicios = servicios;
    factura.pagos = pagos;

    res.json({
      success: true,
      data: factura
    });

  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener factura',
      error: error.message
    });
  }
};

// Crear factura desde reserva
exports.createFactura = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { reserva_id, metodo_pago, descuentos, observaciones } = req.body;

    // Verificar que la reserva existe y está en check_out
    const [reservas] = await connection.query(
      `SELECT r.*, r.precio_total as reserva_precio, r.huesped_id
       FROM reservas r
       WHERE r.id = ? AND r.estado = 'check_out'`,
      [reserva_id]
    );

    if (reservas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada o no está en estado check-out'
      });
    }

    const reserva = reservas[0];

    // Verificar si ya existe factura para esta reserva
    const [facturaExistente] = await connection.query(
      'SELECT id FROM facturas WHERE reserva_id = ?',
      [reserva_id]
    );

    if (facturaExistente.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Ya existe una factura para esta reserva'
      });
    }

    // Calcular servicios adicionales
    const [servicios] = await connection.query(
      'SELECT SUM(precio_total) as total_servicios FROM reserva_servicios WHERE reserva_id = ?',
      [reserva_id]
    );

    const total_servicios = servicios[0].total_servicios || 0;
    const subtotal = parseFloat(reserva.reserva_precio) + parseFloat(total_servicios);

    // Obtener configuración de impuestos
    const [config] = await connection.query(
      'SELECT valor FROM configuracion WHERE clave = "impuesto_iva"'
    );
    
    const porcentaje_iva = config.length > 0 ? parseFloat(config[0].valor) : 0;
    const impuestos = subtotal * (porcentaje_iva / 100);
    const descuento = descuentos || 0;
    const total = subtotal + impuestos - descuento;

    // Generar número de factura
    const numero_factura = await generarNumeroFactura();

    // Crear factura
    const [result] = await connection.query(
      `INSERT INTO facturas 
       (numero_factura, reserva_id, huesped_id, fecha_emision, subtotal, 
        impuestos, descuentos, total, metodo_pago, estado, observaciones, usuario_id)
       VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, 'pendiente', ?, ?)`,
      [numero_factura, reserva_id, reserva.huesped_id, subtotal, impuestos, 
       descuento, total, metodo_pago, observaciones, req.user.id]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Factura creada exitosamente',
      id: result.insertId,
      numero_factura,
      total
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
};

// Registrar pago
exports.registrarPago = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { factura_id, monto, metodo_pago, referencia, notas } = req.body;

    if (!factura_id || !monto || !metodo_pago) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Factura ID, monto y método de pago son requeridos'
      });
    }

    // Verificar que la factura existe
    const [facturas] = await connection.query(
      'SELECT * FROM facturas WHERE id = ?',
      [factura_id]
    );

    if (facturas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    const factura = facturas[0];

    // Calcular total pagado
    const [pagosAnteriores] = await connection.query(
      'SELECT COALESCE(SUM(monto), 0) as total_pagado FROM pagos WHERE factura_id = ?',
      [factura_id]
    );

    const total_pagado = parseFloat(pagosAnteriores[0].total_pagado) + parseFloat(monto);

    if (total_pagado > parseFloat(factura.total)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'El monto del pago excede el total de la factura'
      });
    }

    // Registrar pago
    await connection.query(
      'INSERT INTO pagos (factura_id, monto, metodo_pago, referencia, notas, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
      [factura_id, monto, metodo_pago, referencia, notas, req.user.id]
    );

    // Actualizar estado de factura si está completamente pagada
    if (total_pagado >= parseFloat(factura.total)) {
      await connection.query(
        'UPDATE facturas SET estado = "pagada" WHERE id = ?',
        [factura_id]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Pago registrado exitosamente',
      total_pagado,
      saldo_pendiente: parseFloat(factura.total) - total_pagado
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
};

// Anular factura
exports.anularFactura = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE facturas SET estado = "anulada" WHERE id = ? AND estado = "pendiente"',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede anular la factura. Verifica que exista y esté en estado pendiente'
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
      message: 'Error al anular factura',
      error: error.message
    });
  }
};
