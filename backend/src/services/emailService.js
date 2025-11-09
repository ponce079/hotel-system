const nodemailer = require('nodemailer');

// 🔍 Verificar que las variables de entorno estén cargadas
console.log('📧 [EMAIL SERVICE] Inicializando servicio de email...');
console.log('   Host:', process.env.SMTP_HOST || '❌ NO CONFIGURADO');
console.log('   User:', process.env.SMTP_USER || '❌ NO CONFIGURADO');
console.log('   Pass:', process.env.SMTP_PASS ? '✅ Configurado' : '❌ NO CONFIGURADO');

// Configurar el transportador de correo
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false // Solo para desarrollo
  }
});

// Verificar la conexión al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ [EMAIL SERVICE] Error en configuración de correo:', error.message);
    console.error('   Código:', error.code);
  } else {
    console.log('✅ [EMAIL SERVICE] Servidor de correo listo');
  }
});

// ✅ 1. Enviar email de confirmación de reserva
const enviarConfirmacionReserva = async (reservaData) => {
  console.log('📧 [EMAIL SERVICE] Iniciando envío de email de reserva...');
  console.log('   Destinatario:', reservaData.email);
  
  try {
    const {
      email,
      nombre,
      reserva_id,
      habitacion,
      fecha_entrada,
      fecha_salida,
      noches,
      precio_por_noche,
      total,
      servicios
    } = reservaData;

    const entrada = new Date(fecha_entrada).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const salida = new Date(fecha_salida).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let serviciosHTML = '';
    if (servicios && servicios.length > 0) {
      serviciosHTML = `
        <h3 style="color: #2c3e50; margin-top: 20px;">Servicios Adicionales:</h3>
        <ul style="list-style: none; padding: 0;">
          ${servicios.map(s => `
            <li style="padding: 10px; border-bottom: 1px solid #ecf0f1;">
              <strong>${s.nombre}</strong> - ${s.cantidad}x $${parseFloat(s.precio).toFixed(2)}
            </li>
          `).join('')}
        </ul>
      `;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || `"Hotel Sistema" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Confirmación de Reserva #${reserva_id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; }
            .detail-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ecf0f1; }
            .total { font-size: 24px; font-weight: bold; color: #667eea; text-align: right; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #7f8c8d; font-size: 12px; background: #ecf0f1; border-radius: 0 0 10px 10px; }
            .info-box { background: #fff8e1; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">¡Reserva Confirmada! ✅</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Reserva #${reserva_id}</p>
            </div>
            
            <div class="content">
              <p>Estimado/a <strong>${nombre}</strong>,</p>
              <p>Su reserva ha sido confirmada exitosamente. A continuación encontrará los detalles:</p>
              
              <div class="detail-box">
                <h3 style="color: #2c3e50; margin-top: 0;">Detalles de la Reserva</h3>
                
                <div class="detail-row">
                  <span><strong>Habitación:</strong></span>
                  <span>${habitacion}</span>
                </div>
                
                <div class="detail-row">
                  <span><strong>Entrada:</strong></span>
                  <span>${entrada}</span>
                </div>
                
                <div class="detail-row">
                  <span><strong>Salida:</strong></span>
                  <span>${salida}</span>
                </div>
                
                <div class="detail-row">
                  <span><strong>Noches:</strong></span>
                  <span>${noches}</span>
                </div>
                
                <div class="detail-row">
                  <span><strong>Precio por noche:</strong></span>
                  <span>$${parseFloat(precio_por_noche).toFixed(2)}</span>
                </div>
                
                ${serviciosHTML}
                
                <div class="total">
                  Total: $${parseFloat(total).toFixed(2)}
                </div>
              </div>
              
              <div class="info-box">
                <strong>📌 Información importante:</strong><br>
                • Check-in: a partir de las 14:00 hs<br>
                • Check-out: hasta las 11:00 hs<br>
                • Por favor, presente este correo al momento del check-in
              </div>
              
              <p>Si tiene alguna consulta, no dude en contactarnos.</p>
              
              <p style="margin-top: 20px;"><strong>¡Esperamos recibirle pronto!</strong></p>
            </div>
            
            <div class="footer">
              <p style="margin: 5px 0;">Este es un correo automático, por favor no responda a este mensaje.</p>
              <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Hotel Sistema. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    console.log('📤 [EMAIL SERVICE] Enviando email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [EMAIL SERVICE] Email de reserva enviado a:', email);
    console.log('   Message ID:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ [EMAIL SERVICE] Error al enviar email de reserva:', error.message);
    console.error('   Código:', error.code);
    console.error('   Stack:', error.stack);
    return { success: false, error: error.message };
  }
};

// ✅ 2. Enviar email de confirmación de servicio (cuando cliente contrata)
const enviarConfirmacionServicio = async (contratacionData) => {
  console.log('📧 [EMAIL SERVICE] Iniciando envío de email de servicio...');
  
  try {
    const {
      email,
      nombre,
      contratacion_id,
      fecha_servicio,
      servicios,
      total,
      observaciones
    } = contratacionData;

    const fechaServicio = new Date(fecha_servicio).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const serviciosHTML = servicios.map(s => `
      <li style="padding: 15px; border-bottom: 1px solid #ecf0f1; display: flex; justify-content: space-between;">
        <div>
          <strong style="color: #2c3e50;">${s.nombre}</strong><br>
          <span style="color: #7f8c8d; font-size: 14px;">${s.cantidad}x $${parseFloat(s.precio_unitario).toFixed(2)}</span>
        </div>
        <div style="font-weight: bold; color: #667eea;">
          $${parseFloat(s.subtotal).toFixed(2)}
        </div>
      </li>
    `).join('');

    const mailOptions = {
      from: process.env.SMTP_FROM || `"Hotel Sistema" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Confirmación de Servicios #${contratacion_id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; }
            .detail-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .services-list { list-style: none; padding: 0; margin: 0; }
            .total { font-size: 24px; font-weight: bold; color: #f5576c; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #ecf0f1; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #7f8c8d; font-size: 12px; background: #ecf0f1; border-radius: 0 0 10px 10px; }
            .status-badge { background: #ffeaa7; color: #2d3436; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 10px; }
            .info-box { background: #e3f2fd; padding: 15px; border-radius: 5px; border-left: 4px solid #2196f3; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">¡Servicios Contratados! 🎉</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Contratación #${contratacion_id}</p>
              <span class="status-badge">Estado: Pendiente de Confirmación</span>
            </div>
            
            <div class="content">
              <p>Estimado/a <strong>${nombre}</strong>,</p>
              <p>Hemos recibido su contratación de servicios. A continuación encontrará los detalles:</p>
              
              <div class="detail-box">
                <h3 style="color: #2c3e50; margin-top: 0;">Información del Servicio</h3>
                
                <p><strong>Fecha programada:</strong> ${fechaServicio}</p>
                
                ${observaciones ? `
                  <p style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 15px 0;">
                    <strong>Observaciones:</strong><br>
                    ${observaciones}
                  </p>
                ` : ''}
                
                <h3 style="color: #2c3e50; margin-top: 20px;">Servicios Solicitados:</h3>
                <ul class="services-list">
                  ${serviciosHTML}
                </ul>
                
                <div class="total">
                  Total: $${parseFloat(total).toFixed(2)}
                </div>
              </div>
              
              <div class="info-box">
                <strong>📋 Próximos pasos:</strong><br>
                1. Confirmaremos su solicitud en las próximas 24 horas<br>
                2. Recibirá un email cuando el servicio sea confirmado<br>
                3. El servicio se prestará en la fecha indicada
              </div>
              
              <p>Si necesita modificar o cancelar esta contratación, puede hacerlo desde su panel de cliente.</p>
              
              <p style="margin-top: 20px;"><strong>¡Gracias por su preferencia!</strong></p>
            </div>
            
            <div class="footer">
              <p style="margin: 5px 0;">Este es un correo automático, por favor no responda a este mensaje.</p>
              <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Hotel Sistema. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [EMAIL SERVICE] Email de servicios enviado a:', email, '- ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ [EMAIL SERVICE] Error al enviar email de servicios:', error.message);
    return { success: false, error: error.message };
  }
};

// ✅ 3. Enviar email cuando el admin CONFIRMA el servicio
const enviarEmailConfirmacionServicio = async (contratacionData) => {
  console.log('📧 [EMAIL SERVICE] Enviando email de CONFIRMACIÓN de servicio...');
  
  try {
    const {
      email,
      nombre,
      contratacion_id,
      fecha_servicio,
      servicios,
      total,
      observaciones
    } = contratacionData;

    const fechaServicio = new Date(fecha_servicio).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const serviciosHTML = servicios.map(s => `
      <li style="padding: 15px; border-bottom: 1px solid #ecf0f1; display: flex; justify-content: space-between;">
        <div>
          <strong style="color: #2c3e50;">${s.nombre}</strong><br>
          <span style="color: #7f8c8d; font-size: 14px;">${s.cantidad}x $${parseFloat(s.precio_unitario).toFixed(2)}</span>
        </div>
        <div style="font-weight: bold; color: #667eea;">
          $${parseFloat(s.subtotal).toFixed(2)}
        </div>
      </li>
    `).join('');

    const mailOptions = {
      from: process.env.SMTP_FROM || `"Hotel Sistema" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `✅ Servicios Confirmados #${contratacion_id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; }
            .detail-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .services-list { list-style: none; padding: 0; margin: 0; }
            .total { font-size: 24px; font-weight: bold; color: #11998e; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #ecf0f1; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #7f8c8d; font-size: 12px; background: #ecf0f1; border-radius: 0 0 10px 10px; }
            .status-badge { background: #38ef7d; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 10px; font-weight: bold; }
            .info-box { background: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">¡Servicios Confirmados! ✅</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Contratación #${contratacion_id}</p>
              <span class="status-badge">Estado: Confirmado</span>
            </div>
            
            <div class="content">
              <p>Estimado/a <strong>${nombre}</strong>,</p>
              <p><strong>¡Excelentes noticias!</strong> Sus servicios han sido confirmados por nuestro equipo.</p>
              
              <div class="detail-box">
                <h3 style="color: #2c3e50; margin-top: 0;">Información del Servicio</h3>
                
                <p><strong>Fecha programada:</strong> ${fechaServicio}</p>
                
                ${observaciones ? `
                  <p style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 15px 0;">
                    <strong>Observaciones:</strong><br>
                    ${observaciones}
                  </p>
                ` : ''}
                
                <h3 style="color: #2c3e50; margin-top: 20px;">Servicios Confirmados:</h3>
                <ul class="services-list">
                  ${serviciosHTML}
                </ul>
                
                <div class="total">
                  Total: $${parseFloat(total).toFixed(2)}
                </div>
              </div>
              
              <div class="info-box">
                <strong>✅ Su servicio está confirmado</strong><br>
                • Nuestro equipo estará listo en la fecha indicada<br>
                • Le recordaremos un día antes de la fecha<br>
                • Si necesita cambios, contáctenos con anticipación
              </div>
              
              <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
              
              <p style="margin-top: 20px;"><strong>¡Gracias por confiar en nosotros!</strong></p>
            </div>
            
            <div class="footer">
              <p style="margin: 5px 0;">Este es un correo automático, por favor no responda a este mensaje.</p>
              <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Hotel Sistema. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [EMAIL SERVICE] Email de CONFIRMACIÓN enviado:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ [EMAIL SERVICE] Error al enviar email de confirmación:', error.message);
    return { success: false, error: error.message };
  }
};

// ✅ EXPORTAR LAS TRES FUNCIONES
module.exports = {
  enviarConfirmacionReserva,
  enviarConfirmacionServicio,
  enviarEmailConfirmacionServicio
};