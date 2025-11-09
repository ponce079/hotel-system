// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Ruta de registro
router.post('/register', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('🔍 [REGISTER] Intento de registro:', {
      nombre: req.body.nombre,
      email: req.body.email,
      numero_documento: req.body.numero_documento
    });

    const { 
      nombre, 
      apellido,
      tipo_documento,
      numero_documento,
      email, 
      telefono,
      password 
    } = req.body;

    // Validaciones
    if (!nombre || !email || !password) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y contraseña son requeridos'
      });
    }

    if (!numero_documento) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'El número de documento es requerido'
      });
    }

    // Verificar si el email ya existe
    const [existingUser] = await connection.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Verificar si el documento ya existe
    const [existingDoc] = await connection.query(
      'SELECT id FROM usuarios WHERE numero_documento = ?',
      [numero_documento]
    );

    if (existingDoc.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'El número de documento ya está registrado'
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario con el documento
    const [userResult] = await connection.query(
      `INSERT INTO usuarios 
       (nombre, apellido, tipo_documento, numero_documento, email, password, rol, activo) 
       VALUES (?, ?, ?, ?, ?, ?, 'cliente', 1)`,
      [nombre, apellido || '', tipo_documento || 'DNI', numero_documento, email, hashedPassword]
    );

    const usuarioId = userResult.insertId;
    console.log('✅ [REGISTER] Usuario creado con ID:', usuarioId);

    // Crear huésped asociado con el mismo documento
    await connection.query(
      `INSERT INTO huespedes 
       (nombre, apellido, tipo_documento, numero_documento, nacionalidad, email, telefono, pais, usuario_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        apellido || '',
        tipo_documento || 'DNI',
        numero_documento,
        'Argentina',
        email,
        telefono || null,
        'Argentina',
        usuarioId
      ]
    );

    console.log('✅ [REGISTER] Huésped creado para usuario:', usuarioId);

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id: usuarioId,
        nombre,
        email,
        rol: 'cliente'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ [REGISTER] Error en registro:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'El email o documento ya está registrado'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Ruta de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔍 [LOGIN] Intento de login:', { email });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    const [users] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND activo = 1',
      [email]
    );

    console.log('🔍 [LOGIN] Usuarios encontrados:', users.length);

    if (users.length === 0) {
      console.log('❌ [LOGIN] Usuario no encontrado');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = users[0];
    console.log('🔍 [LOGIN] Usuario encontrado:', {
      id: user.id,
      email: user.email,
      rol: user.rol,
      activo: user.activo
    });

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('🔍 [LOGIN] Contraseña coincide:', passwordMatch);

    if (!passwordMatch) {
      console.log('❌ [LOGIN] Contraseña incorrecta');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        rol: user.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ [LOGIN] Login exitoso para:', user.email);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol
        }
      }
    });

  } catch (error) {
    console.error('❌ [LOGIN] Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
});

module.exports = router;