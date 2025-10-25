const { pool } = require('../config/database');

// Dashboard - Estadísticas generales
exports.getDashboard = async (req, res) => {
  try {
    // Habitaciones por estado
    const [habitacionesEstado] = await pool.query(`
      SELECT estado, COUNT(*) as cantidad
      FROM habitaciones
      WHERE activo = TRUE
      GROUP BY estado
    `);

    // Reservas por estado (mes actual)
    const [reservasEstado] = await pool.query(`
      SELECT estado, COUNT(*) as cantidad
      FROM reservas
      WHERE MONTH(fecha_creacion) = MONTH(CURRENT_DATE())
      AND YEAR(fecha_creacion) = YEAR(CURRENT_DATE())
      GROUP BY estado
    `);

    // Ocupación actual
    const [ocupacion] = await pool.query(`
      SELECT 
        COUNT(DISTINCT CASE WHEN estado = 'ocupada' THEN id END) as ocupadas,
        COUNT(*) as total
      FROM habitaciones
      WHERE activo = TRUE
    `);

    const porcentajeOcupacion = ocupacion[0].total > 0 
      ? ((ocupacion[0].ocupadas / ocupacion[0].total) * 100).toFixed(2)
      : 0;

    // Ingresos del mes
    const [ingresos] = await pool.query(`
      SELECT 
        COALESCE(SUM(total), 0) as total_mes,
        COALESCE(SUM(CASE WHEN estado = 'pagada' THEN total ELSE 0 END), 0) as pagado,
        COALESCE(SUM(CASE WHEN estado = 'pendiente' THEN total ELSE 0 END), 0) as pendiente
      FROM facturas
      WHERE MONTH(fecha_emision) = MONTH(CURRENT_DATE())
      AND YEAR(fecha_emision) = YEAR(CURRENT_DATE())
    `);

    // Check-ins y check-outs de hoy
    const [movimientosHoy] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN fecha_entrada = CURDATE() AND estado IN ('confirmada', 'check_in') THEN 1 END) as checkins_hoy,
        COUNT(CASE WHEN fecha_salida = CURDATE() AND estado = 'check_in' THEN 1 END) as checkouts_hoy
      FROM reservas
    `);

    // Próximas llegadas (próximos 7 días)
    const [proximasLlegadas] = await pool.query(`
      SELECT r.*, h.nombre, h.apellido, hab.numero as habitacion_numero
      FROM reservas r
      JOIN huespedes h ON r.huesped_id = h.id
      JOIN habitaciones hab ON r.habitacion_id = hab.id
      WHERE r.fecha_entrada BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      AND r.estado = 'confirmada'
      ORDER BY r.fecha_entrada
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        habitaciones: {
          por_estado: habitacionesEstado,
          ocupacion: {
            ocupadas: ocupacion[0].ocupadas,
            total: ocupacion[0].total,
            porcentaje: porcentajeOcupacion
          }
        },
        reservas: {
          por_estado: reservasEstado,
          movimientos_hoy: movimientosHoy[0]
        },
        ingresos: ingresos[0],
        proximas_llegadas: proximasLlegadas
      }
    });

  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// Reporte de ocupación por período
exports.getReporteOcupacion = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        success: false,
        message: 'Fecha de inicio y fin son requeridas'
      });
    }

    const [ocupacion] = await pool.query(`
      SELECT 
        DATE(fecha_entrada) as fecha,
        COUNT(DISTINCT habitacion_id) as habitaciones_ocupadas,
        (SELECT COUNT(*) FROM habitaciones WHERE activo = TRUE) as total_habitaciones
      FROM reservas
      WHERE estado IN ('check_in', 'check_out')
      AND fecha_entrada <= ?
      AND fecha_salida >= ?
      GROUP BY DATE(fecha_entrada)
      ORDER BY fecha
    `, [fecha_fin, fecha_inicio]);

    res.json({
      success: true,
      data: ocupacion
    });

  } catch (error) {
    console.error('Error al obtener reporte de ocupación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte',
      error: error.message
    });
  }
};

// Reporte de ingresos
exports.getReporteIngresos = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, agrupado_por = 'dia' } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        success: false,
        message: 'Fecha de inicio y fin son requeridas'
      });
    }

    let formatoFecha = '%Y-%m-%d';
    if (agrupado_por === 'mes') {
      formatoFecha = '%Y-%m';
    } else if (agrupado_por === 'año') {
      formatoFecha = '%Y';
    }

    const [ingresos] = await pool.query(`
      SELECT 
        DATE_FORMAT(fecha_emision, ?) as periodo,
        COUNT(*) as total_facturas,
        SUM(subtotal) as subtotal,
        SUM(impuestos) as impuestos,
        SUM(descuentos) as descuentos,
        SUM(total) as total,
        SUM(CASE WHEN estado = 'pagada' THEN total ELSE 0 END) as total_pagado,
        SUM(CASE WHEN estado = 'pendiente' THEN total ELSE 0 END) as total_pendiente
      FROM facturas
      WHERE fecha_emision BETWEEN ? AND ?
      AND estado != 'anulada'
      GROUP BY periodo
      ORDER BY periodo
    `, [formatoFecha, fecha_inicio, fecha_fin]);

    res.json({
      success: true,
      data: ingresos
    });

  } catch (error) {
    console.error('Error al obtener reporte de ingresos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte',
      error: error.message
    });
  }
};

// Reporte de servicios más consumidos
exports.getReporteServicios = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let query = `
      SELECT 
        s.nombre,
        s.categoria,
        COUNT(*) as veces_consumido,
        SUM(rs.cantidad) as cantidad_total,
        SUM(rs.precio_total) as ingresos_total
      FROM reserva_servicios rs
      JOIN servicios s ON rs.servicio_id = s.id
    `;

    const params = [];

    if (fecha_inicio && fecha_fin) {
      query += ' WHERE DATE(rs.fecha_consumo) BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }

    query += `
      GROUP BY s.id, s.nombre, s.categoria
      ORDER BY ingresos_total DESC
    `;

    const [servicios] = await pool.query(query, params);

    res.json({
      success: true,
      data: servicios
    });

  } catch (error) {
    console.error('Error al obtener reporte de servicios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte',
      error: error.message
    });
  }
};

// Reporte de huéspedes frecuentes
exports.getHuespedesFrecuentes = async (req, res) => {
  try {
    const [huespedes] = await pool.query(`
      SELECT 
        h.id,
        h.nombre,
        h.apellido,
        h.email,
        h.telefono,
        COUNT(r.id) as total_reservas,
        SUM(r.precio_total) as gasto_total,
        MAX(r.fecha_salida) as ultima_visita
      FROM huespedes h
      JOIN reservas r ON h.id = r.huesped_id
      WHERE r.estado IN ('check_out', 'check_in')
      GROUP BY h.id
      HAVING total_reservas > 1
      ORDER BY total_reservas DESC, gasto_total DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      data: huespedes
    });

  } catch (error) {
    console.error('Error al obtener huéspedes frecuentes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte',
      error: error.message
    });
  }
};

// Reporte de tipos de habitación más reservados
exports.getReporteTiposHabitacion = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let query = `
      SELECT 
        t.nombre as tipo_habitacion,
        t.precio_base,
        COUNT(r.id) as total_reservas,
        SUM(r.precio_total) as ingresos_total,
        AVG(DATEDIFF(r.fecha_salida, r.fecha_entrada)) as promedio_noches
      FROM reservas r
      JOIN habitaciones h ON r.habitacion_id = h.id
      JOIN tipos_habitacion t ON h.tipo_habitacion_id = t.id
      WHERE r.estado IN ('check_in', 'check_out')
    `;

    const params = [];

    if (fecha_inicio && fecha_fin) {
      query += ' AND r.fecha_entrada BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }

    query += `
      GROUP BY t.id, t.nombre, t.precio_base
      ORDER BY total_reservas DESC
    `;

    const [tipos] = await pool.query(query, params);

    res.json({
      success: true,
      data: tipos
    });

  } catch (error) {
    console.error('Error al obtener reporte de tipos de habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte',
      error: error.message
    });
  }
};
