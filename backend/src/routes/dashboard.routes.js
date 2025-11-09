const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

// Obtener estadísticas del dashboard
router.get('/estadisticas', authenticate, async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    // Total de habitaciones por estado
    const [habitaciones] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END) as disponibles,
        SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as ocupadas,
        SUM(CASE WHEN estado = 'limpieza' THEN 1 ELSE 0 END) as limpieza,
        SUM(CASE WHEN estado = 'mantenimiento' THEN 1 ELSE 0 END) as mantenimiento,
        SUM(CASE WHEN estado = 'reservada' THEN 1 ELSE 0 END) as reservadas
      FROM habitaciones
      WHERE activo = TRUE
    `);

    // Porcentaje de ocupación
    const totalHabitaciones = habitaciones[0].total;
    const habitacionesOcupadas = habitaciones[0].ocupadas + habitaciones[0].reservadas;
    const porcentajeOcupacion = totalHabitaciones > 0 
      ? ((habitacionesOcupadas / totalHabitaciones) * 100).toFixed(2)
      : 0;

    // Check-ins de hoy
    const [checkInsHoy] = await pool.query(`
      SELECT COUNT(*) as total
      FROM reservas
      WHERE DATE(fecha_entrada) = ? AND estado IN ('confirmada', 'check_in')
    `, [hoy]);

    // Check-outs de hoy
    const [checkOutsHoy] = await pool.query(`
      SELECT COUNT(*) as total
      FROM reservas
      WHERE DATE(fecha_salida) = ? AND estado = 'check_in'
    `, [hoy]);

    // Ingresos del mes actual
    const [ingresosMes] = await pool.query(`
      SELECT 
        COALESCE(SUM(total), 0) as total,
        COALESCE(SUM(CASE WHEN estado = 'pagada' THEN total ELSE 0 END), 0) as pagado,
        COALESCE(SUM(CASE WHEN estado = 'pendiente' THEN total ELSE 0 END), 0) as pendiente
      FROM facturas
      WHERE YEAR(fecha_emision) = YEAR(CURDATE()) 
      AND MONTH(fecha_emision) = MONTH(CURDATE())
    `);

    // Reservas del mes
    const [reservasMes] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) as confirmadas,
        SUM(CASE WHEN estado = 'check_in' THEN 1 ELSE 0 END) as activas,
        SUM(CASE WHEN estado = 'check_out' THEN 1 ELSE 0 END) as finalizadas,
        SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas
      FROM reservas
      WHERE YEAR(fecha_creacion) = YEAR(CURDATE()) 
      AND MONTH(fecha_creacion) = MONTH(CURDATE())
    `);

    // Próximas llegadas (próximos 7 días)
    const [proximasLlegadas] = await pool.query(`
      SELECT 
        r.codigo_reserva,
        r.fecha_entrada,
        r.numero_huespedes,
        CONCAT(h.nombre, ' ', h.apellido) as huesped,
        hab.numero as habitacion,
        th.nombre as tipo_habitacion
      FROM reservas r
      JOIN huespedes h ON r.huesped_id = h.id
      JOIN habitaciones hab ON r.habitacion_id = hab.id
      JOIN tipos_habitacion th ON hab.tipo_habitacion_id = th.id
      WHERE r.estado IN ('confirmada', 'pendiente')
      AND r.fecha_entrada BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      ORDER BY r.fecha_entrada ASC
      LIMIT 5
    `);

    // Ocupación por tipo de habitación
    const [ocupacionPorTipo] = await pool.query(`
      SELECT 
        th.nombre,
        COUNT(h.id) as total,
        SUM(CASE WHEN h.estado = 'ocupada' OR h.estado = 'reservada' THEN 1 ELSE 0 END) as ocupadas
      FROM tipos_habitacion th
      LEFT JOIN habitaciones h ON th.id = h.tipo_habitacion_id AND h.activo = TRUE
      GROUP BY th.id, th.nombre
    `);

    res.json({
      success: true,
      data: {
        habitaciones: habitaciones[0],
        ocupacion: {
          porcentaje: parseFloat(porcentajeOcupacion),
          total: totalHabitaciones,
          ocupadas: habitacionesOcupadas,
          disponibles: habitaciones[0].disponibles
        },
        hoy: {
          check_ins: checkInsHoy[0].total,
          check_outs: checkOutsHoy[0].total
        },
        ingresos_mes: {
          total: parseFloat(ingresosMes[0].total),
          pagado: parseFloat(ingresosMes[0].pagado),
          pendiente: parseFloat(ingresosMes[0].pendiente)
        },
        reservas_mes: reservasMes[0],
        proximas_llegadas: proximasLlegadas,
        ocupacion_por_tipo: ocupacionPorTipo
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

// Obtener ingresos por mes (últimos 6 meses)
router.get('/ingresos-mensuales', authenticate, async (req, res) => {
  try {
    const [ingresos] = await pool.query(`
      SELECT 
        DATE_FORMAT(fecha_emision, '%Y-%m') as mes,
        SUM(total) as total_ingresos,
        SUM(CASE WHEN estado = 'pagada' THEN total ELSE 0 END) as pagado,
        COUNT(*) as total_facturas
      FROM facturas
      WHERE fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(fecha_emision, '%Y-%m')
      ORDER BY mes ASC
    `);

    res.json({
      success: true,
      data: ingresos
    });
  } catch (error) {
    console.error('Error al obtener ingresos mensuales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ingresos mensuales'
    });
  }
});

// Obtener ocupación diaria del mes actual
router.get('/ocupacion-diaria', authenticate, async (req, res) => {
  try {
    const [ocupacion] = await pool.query(`
      SELECT 
        DATE(fecha_entrada) as fecha,
        COUNT(*) as reservas_activas
      FROM reservas
      WHERE estado IN ('confirmada', 'check_in')
      AND fecha_entrada >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
      AND fecha_entrada < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
      GROUP BY DATE(fecha_entrada)
      ORDER BY fecha ASC
    `);

    res.json({
      success: true,
      data: ocupacion
    });
  } catch (error) {
    console.error('Error al obtener ocupación diaria:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ocupación diaria'
    });
  }
});

module.exports = router;