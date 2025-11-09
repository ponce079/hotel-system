require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Verificando configuración...');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ Configurado' : '❌ NO CONFIGURADO');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'ponce079@gmail.com',
    pass: 'ilpa gfqx yhkx xijr'
  }
});

async function enviarPrueba() {
  try {
    console.log('\n📧 Enviando email de prueba...\n');
    
    const info = await transporter.sendMail({
      from: '"Hotel Sistema" <ponce079@gmail.com>',
      to: 'ponce079@gmail.com',
      subject: '✅ Prueba de Email - Sistema Hotel',
      html: '<h1>¡Funciona!</h1><p>El sistema de emails está operativo.</p>'
    });

    console.log('✅ Email enviado exitosamente!');
    console.log('   Message ID:', info.messageId);
    console.log('\n🎉 ¡Todo funciona correctamente!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al enviar email:');
    console.error('   Mensaje:', error.message);
    console.error('   Código:', error.code);
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 Problema de autenticación');
      console.error('   La contraseña de aplicación puede estar incorrecta');
    }
    
    process.exit(1);
  }
}

enviarPrueba();