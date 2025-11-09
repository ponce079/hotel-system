const { pool } = require('../config/database');
const { 
  enviarConfirmacionServicio, 
  enviarEmailConfirmacionServicio 
} = require('../services/emailService'); // ✅ Importar ambas funciones



// Obtener todos los servicios
exports.obtenerServicios = async (req, res) => {
  try {
    const [servicios] = await pool.query(
      'SELECT * FROM servicios ORDER BY categoria, nombre'
    );

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
exports.obtenerServicioPorId = async (req, res) => {
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
exports.crearServicio = async (req, res) => {
  try {
    const { nombre, descripcion, categoria, precio, activo } = req.body;

    if (!nombre || !categoria || !precio) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, categoría y precio son requeridos'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO servicios (nombre, descripcion, categoria, precio, activo)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, descripcion, categoria, precio, activo !== false]
    );

    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      data: {
        id: result.insertId,
        nombre,
        descripcion,
        categoria,
        precio,
        activo: activo !== false
      }
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
exports.actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, categoria, precio, activo } = req.body;

    const [result] = await pool.query(
      `UPDATE servicios 
       SET nombre = ?, descripcion = ?, categoria = ?, precio = ?, activo = ?
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

// Eliminar (desactivar) servicio
exports.eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE servicios SET activo = false WHERE id = ?',
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

// Contratar servicios sin reserva
// Actualiza la función contratarServiciosSinReserva
exports.contratarServiciosSinReserva = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      fecha_servicio,
      servicios,
      observaciones,
      total
    } = req.body;

    const usuario_id = req.user.id;
    
    const [huespedes] = await connection.query(
      'SELECT id, nombre, email FROM huespedes WHERE usuario_id = ?',
      [usuario_id]
    );

    if (huespedes.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'No se encontró un huésped asociado a este usuario'
      });
    }

    const huesped_id = huespedes[0].id;
    const nombre = huespedes[0].nombre;
    const email = huespedes[0].email;

    if (!fecha_servicio || !servicios || servicios.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos para la contratación'
      });
    }

    const [resultContratacion] = await connection.query(
      `INSERT INTO contrataciones_servicios 
       (huesped_id, fecha_servicio, fecha_contratacion, estado, total, observaciones)
       VALUES (?, ?, NOW(), 'pendiente', ?, ?)`,
      [huesped_id, fecha_servicio, total, observaciones]
    );

    const contratacionId = resultContratacion.insertId;

    // Insertar detalles y obtener información completa
    const serviciosDetalle = [];
    for (const servicio of servicios) {
      await connection.query(
        `INSERT INTO detalle_contrataciones 
         (contratacion_id, servicio_id, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          contratacionId,
          servicio.servicio_id,
          servicio.cantidad,
          servicio.precio_unitario,
          servicio.cantidad * servicio.precio_unitario
        ]
      );

      // Obtener nombre del servicio
      const [servicioInfo] = await connection.query(
        'SELECT nombre FROM servicios WHERE id = ?',
        [servicio.servicio_id]
      );

      serviciosDetalle.push({
        nombre: servicioInfo[0].nombre,
        cantidad: servicio.cantidad,
        precio_unitario: servicio.precio_unitario,
        subtotal: servicio.cantidad * servicio.precio_unitario
      });
    }

    await connection.commit();

    // 📧 Enviar email de confirmación
    try {
      await enviarConfirmacionServicio({
        email,
        nombre,
        contratacion_id: contratacionId,
        fecha_servicio,
        servicios: serviciosDetalle,
        total,
        observaciones
      });
    } catch (emailError) {
      console.error('Error al enviar email (no crítico):', emailError);
      // No fallar la operación si el email falla
    }

    res.status(201).json({
      success: true,
      message: 'Servicios contratados exitosamente. Se ha enviado un email de confirmación.',
      data: {
        contratacion_id: contratacionId,
        total,
        fecha_servicio
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al contratar servicios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la contratación de servicios',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Obtener servicios contratados por un huésped
exports.obtenerMisServicios = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const [huespedes] = await pool.query(
      'SELECT id FROM huespedes WHERE usuario_id = ?',
      [usuario_id]
    );

    if (huespedes.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const huesped_id = huespedes[0].id;

    const [contrataciones] = await pool.query(
      `SELECT 
        c.id as contratacion_id,
        c.fecha_servicio,
        c.fecha_contratacion,
        c.estado,
        c.total,
        c.observaciones,
        GROUP_CONCAT(
          CONCAT(s.nombre, ' (x', dc.cantidad, ')')
          SEPARATOR ', '
        ) as servicios_contratados
       FROM contrataciones_servicios c
       LEFT JOIN detalle_contrataciones dc ON c.id = dc.contratacion_id
       LEFT JOIN servicios s ON dc.servicio_id = s.id
       WHERE c.huesped_id = ?
       GROUP BY c.id
       ORDER BY c.fecha_contratacion DESC`,
      [huesped_id]
    );

    res.json({
      success: true,
      data: contrataciones
    });

  } catch (error) {
    console.error('Error al obtener servicios contratados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios contratados',
      error: error.message
    });
  }
};

// Obtener detalle de una contratación
exports.obtenerDetalleContratacion = async (req, res) => {
  try {
    const { contratacion_id } = req.params;

    const [detalle] = await pool.query(
      `SELECT 
        dc.*,
        s.nombre as servicio_nombre,
        s.descripcion as servicio_descripcion,
        s.categoria
       FROM detalle_contrataciones dc
       INNER JOIN servicios s ON dc.servicio_id = s.id
       WHERE dc.contratacion_id = ?`,
      [contratacion_id]
    );

    res.json({
      success: true,
      data: detalle
    });

  } catch (error) {
    console.error('Error al obtener detalle de contratación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalle de contratación',
      error: error.message
    });
  }
};

// Cancelar contratación
exports.cancelarContratacion = async (req, res) => {
  try {
    const { contratacion_id } = req.params;
    const usuario_id = req.user.id;

    const [huespedes] = await pool.query(
      'SELECT id FROM huespedes WHERE usuario_id = ?',
      [usuario_id]
    );

    if (huespedes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huésped no encontrado'
      });
    }

    const huesped_id = huespedes[0].id;

    const [contrataciones] = await pool.query(
      'SELECT * FROM contrataciones_servicios WHERE id = ? AND huesped_id = ?',
      [contratacion_id, huesped_id]
    );

    if (contrataciones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contratación no encontrada'
      });
    }

    await pool.query(
      `UPDATE contrataciones_servicios 
       SET estado = 'cancelado' 
       WHERE id = ?`,
      [contratacion_id]
    );

    res.json({
      success: true,
      message: 'Contratación cancelada exitosamente'
    });

  } catch (error) {
    console.error('Error al cancelar contratación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar contratación',
      error: error.message
    });
  }
};
// Obtener servicios de una reserva
exports.obtenerServiciosReserva = async (req, res) => {
  try {
    const { reservaId } = req.params;

    const [servicios] = await pool.query(
      `SELECT 
        rs.*,
        s.nombre,
        s.descripcion,
        s.categoria,
        s.precio as precio_unitario
       FROM reserva_servicios rs
       INNER JOIN servicios s ON rs.servicio_id = s.id
       WHERE rs.reserva_id = ?`,
      [reservaId]
    );

    res.json({
      success: true,
      data: servicios
    });
  } catch (error) {
    console.error('Error al obtener servicios de reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios de la reserva',
      error: error.message
    });
  }
};
// Al final de serviciosController.js

// Obtener todas las contrataciones (Admin)
exports.obtenerTodasContrataciones = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id as contratacion_id,
        c.huesped_id,
        c.fecha_servicio,
        c.fecha_contratacion,
        c.total,
        c.estado,
        h.nombre as huesped_nombre,
        h.email as huesped_email,
        GROUP_CONCAT(
          CONCAT(s.nombre, ' (', dc.cantidad, ')') 
          ORDER BY s.nombre 
          SEPARATOR ', '
        ) as servicios_contratados
      FROM contrataciones_servicios c
      JOIN huespedes h ON c.huesped_id = h.id
      JOIN detalle_contrataciones dc ON c.id = dc.contratacion_id
      JOIN servicios s ON dc.servicio_id = s.id
      GROUP BY c.id
      ORDER BY c.fecha_contratacion DESC
    `;
    
    const [contrataciones] = await pool.query(query);
    
    res.json({ 
      success: true,
      data: contrataciones 
    });
  } catch (error) {
    console.error('Error al obtener contrataciones:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener contrataciones',
      error: error.message
    });
  }
};

// Cambiar estado de contratación (Admin)
// Cambiar estado de contratación (Admin)
exports.cambiarEstadoContratacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const estadosValidos = ['pendiente', 'confirmado', 'completado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        success: false,
        message: 'Estado inválido. Debe ser: pendiente, confirmado, completado o cancelado' 
      });
    }
    
    // Obtener información de la contratación antes de actualizar
    const [contratacion] = await pool.query(
      'SELECT * FROM contrataciones_servicios WHERE id = ?',
      [id]
    );
    
    if (contratacion.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Contratación no encontrada' 
      });
    }
    
    // Actualizar estado
    await pool.query(
      'UPDATE contrataciones_servicios SET estado = ? WHERE id = ?',
      [estado, id]
    );

    // ✅ ENVIAR EMAIL CUANDO SE CONFIRMA
    if (estado === 'confirmado') {
      console.log('📧 [SERVICIOS] Servicio confirmado, preparando email...');
      
      try {
        // Obtener información del huésped
        const [huesped] = await pool.query(
          'SELECT nombre, email FROM huespedes WHERE id = ?',
          [contratacion[0].huesped_id]
        );

        console.log('📧 [SERVICIOS] Huésped encontrado:', huesped[0]);

        // Obtener detalle de servicios
        const [servicios] = await pool.query(
          `SELECT dc.*, s.nombre as servicio_nombre
           FROM detalle_contrataciones dc
           JOIN servicios s ON dc.servicio_id = s.id
           WHERE dc.contratacion_id = ?`,
          [id]
        );

        console.log('📧 [SERVICIOS] Servicios encontrados:', servicios.length);

        const serviciosDetalle = servicios.map(s => ({
          nombre: s.servicio_nombre,
          cantidad: s.cantidad,
          precio_unitario: s.precio_unitario,
          subtotal: s.subtotal
        }));

        // Enviar email de confirmación
        const resultEmail = await enviarEmailConfirmacionServicio({
          email: huesped[0].email,
          nombre: huesped[0].nombre,
          contratacion_id: id,
          fecha_servicio: contratacion[0].fecha_servicio,
          servicios: serviciosDetalle,
          total: contratacion[0].total,
          observaciones: contratacion[0].observaciones
        });

        if (resultEmail.success) {
          console.log('✅ Email de confirmación enviado al confirmar servicio a:', huesped[0].email);
        } else {
          console.error('❌ Error al enviar email:', resultEmail.error);
        }
      } catch (emailError) {
        console.error('❌ Error al enviar email de confirmación (no crítico):', emailError);
        console.error('Stack trace:', emailError.stack);
      }
    }
    
    res.json({ 
      success: true,
      message: `Estado actualizado a: ${estado}`,
      data: { estado }
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al cambiar estado de la contratación' 
    });
  }
};