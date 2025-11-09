// backend/src/controllers/mensajesController.js
const { pool } = require('../config/database');
const nodemailer = require('nodemailer');

// Configurar transportador de email (reutilizando configuración existente)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// ✅ CREAR MENSAJE (Cliente)
exports.crearMensaje = async (req, res) => {
  try {
    const { asunto, mensaje } = req.body;
    const usuario_id = req.user.id;

    if (!asunto || !mensaje) {
      return res.status(400).json({
        success: false,
        message: 'Asunto y mensaje son requeridos'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO mensajes (usuario_id, asunto, mensaje, estado)
       VALUES (?, ?, ?, 'pendiente')`,
      [usuario_id, asunto, mensaje]
    );

    // Obtener información del usuario para el email
    const [usuarios] = await pool.query(
      'SELECT nombre, email FROM usuarios WHERE id = ?',
      [usuario_id]
    );

    // Enviar notificación por email al admin
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Hotel Sistema" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER, // Email del admin
        subject: `Nueva Consulta: ${asunto}`,
        html: `
          <h2>Nueva Consulta Recibida</h2>
          <p><strong>De:</strong> ${usuarios[0].nombre} (${usuarios[0].email})</p>
          <p><strong>Asunto:</strong> ${asunto}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${mensaje}</p>
          <hr>
          <p><small>Inicia sesión en el sistema para responder esta consulta.</small></p>
        `
      });
    } catch (emailError) {
      console.error('Error al enviar email de notificación:', emailError);
      // No fallar la operación si el email falla
    }

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado exitosamente. Te responderemos pronto.',
      data: {
        id: result.insertId,
        asunto,
        mensaje,
        estado: 'pendiente'
      }
    });
  } catch (error) {
    console.error('Error al crear mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar mensaje',
      error: error.message
    });
  }
};

// ✅ OBTENER MIS MENSAJES (Cliente)
exports.obtenerMisMensajes = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const [mensajes] = await pool.query(
      `SELECT 
        m.*,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        a.nombre as admin_nombre
       FROM mensajes m
       JOIN usuarios u ON m.usuario_id = u.id
       LEFT JOIN usuarios a ON m.admin_id = a.id
       WHERE m.usuario_id = ?
       ORDER BY m.fecha_creacion DESC`,
      [usuario_id]
    );

    res.json({
      success: true,
      data: mensajes
    });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes',
      error: error.message
    });
  }
};

// ✅ OBTENER MENSAJE POR ID
exports.obtenerMensajePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;
    const esAdmin = req.user.rol === 'admin' || req.user.rol === 'administrador';

    const [mensajes] = await pool.query(
      `SELECT 
        m.*,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        a.nombre as admin_nombre
       FROM mensajes m
       JOIN usuarios u ON m.usuario_id = u.id
       LEFT JOIN usuarios a ON m.admin_id = a.id
       WHERE m.id = ?`,
      [id]
    );

    if (mensajes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    // Verificar que el usuario tenga acceso al mensaje
    if (!esAdmin && mensajes[0].usuario_id !== usuario_id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este mensaje'
      });
    }

    res.json({
      success: true,
      data: mensajes[0]
    });
  } catch (error) {
    console.error('Error al obtener mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensaje',
      error: error.message
    });
  }
};

// ✅ OBTENER TODOS LOS MENSAJES (Admin)
exports.obtenerTodosMensajes = async (req, res) => {
  try {
    const { estado } = req.query;

    let query = `
      SELECT 
        m.*,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        a.nombre as admin_nombre
      FROM mensajes m
      JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN usuarios a ON m.admin_id = a.id
    `;

    const params = [];

    if (estado) {
      query += ' WHERE m.estado = ?';
      params.push(estado);
    }

    query += ' ORDER BY m.fecha_creacion DESC';

    const [mensajes] = await pool.query(query, params);

    res.json({
      success: true,
      data: mensajes
    });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes',
      error: error.message
    });
  }
};

// ✅ RESPONDER MENSAJE (Admin)
exports.responderMensaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { respuesta } = req.body;
    const admin_id = req.user.id;

    if (!respuesta) {
      return res.status(400).json({
        success: false,
        message: 'La respuesta es requerida'
      });
    }

    // Obtener información del mensaje y usuario
    const [mensajes] = await pool.query(
      `SELECT m.*, u.nombre, u.email, m.asunto, m.mensaje
       FROM mensajes m
       JOIN usuarios u ON m.usuario_id = u.id
       WHERE m.id = ?`,
      [id]
    );

    if (mensajes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    const mensaje = mensajes[0];

    // Actualizar mensaje con respuesta
    await pool.query(
      `UPDATE mensajes 
       SET respuesta = ?, admin_id = ?, fecha_respuesta = NOW(), estado = 'respondido'
       WHERE id = ?`,
      [respuesta, admin_id, id]
    );

    // Enviar email al usuario con la respuesta
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Hotel Sistema" <${process.env.SMTP_USER}>`,
        to: mensaje.email,
        subject: `Re: ${mensaje.asunto}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8f9fa; padding: 30px; }
              .mensaje-original { background: #e9ecef; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
              .respuesta { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .footer { text-align: center; margin-top: 30px; padding: 20px; color: #7f8c8d; font-size: 12px; background: #ecf0f1; border-radius: 0 0 10px 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Respuesta a tu Consulta</h1>
              </div>
              
              <div class="content">
                <p>Estimado/a <strong>${mensaje.nombre}</strong>,</p>
                <p>Hemos respondido tu consulta:</p>
                
                <div class="mensaje-original">
                  <strong>Tu consulta:</strong><br>
                  ${mensaje.mensaje}
                </div>
                
                <div class="respuesta">
                  <strong>Nuestra respuesta:</strong><br><br>
                  ${respuesta}
                </div>
                
                <p>Si tienes más preguntas, no dudes en contactarnos nuevamente.</p>
                
                <p style="margin-top: 20px;"><strong>¡Gracias por tu consulta!</strong></p>
              </div>
              
              <div class="footer">
                <p style="margin: 5px 0;">Este es un correo automático, por favor no responda a este mensaje.</p>
                <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Hotel Sistema. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `
      });

      console.log('✅ Email de respuesta enviado a:', mensaje.email);
    } catch (emailError) {
      console.error('❌ Error al enviar email:', emailError);
      // No fallar la operación si el email falla
    }

    res.json({
      success: true,
      message: 'Respuesta enviada exitosamente. Se ha notificado al usuario por email.'
    });
  } catch (error) {
    console.error('Error al responder mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al responder mensaje',
      error: error.message
    });
  }
};

// ✅ CAMBIAR ESTADO DE MENSAJE (Admin)
exports.cambiarEstadoMensaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'respondido', 'cerrado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser: pendiente, respondido o cerrado'
      });
    }

    await pool.query(
      'UPDATE mensajes SET estado = ? WHERE id = ?',
      [estado, id]
    );

    res.json({
      success: true,
      message: `Estado actualizado a: ${estado}`
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del mensaje',
      error: error.message
    });
  }
};