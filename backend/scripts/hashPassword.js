const bcrypt = require('bcryptjs');

// Script para generar password hasheado
const password = process.argv[2] || 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nUsa este hash en la base de datos para el usuario administrador.');
});
