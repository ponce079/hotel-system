// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    // Obtener el header completo
    const authHeader = req.header('Authorization');
    
    console.log('🔐 [AUTH MIDDLEWARE] Headers recibidos:', {
      authorization: authHeader ? 'Presente' : 'Ausente',
      contentType: req.header('Content-Type')
    });

    if (!authHeader) {
      console.log('❌ [AUTH MIDDLEWARE] No hay header Authorization');
      return res.status(401).json({ 
        success: false, 
        message: 'No autenticado - Token no proporcionado' 
      });
    }

    // Extraer el token (formato: "Bearer TOKEN")
    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token === authHeader) {
      console.log('❌ [AUTH MIDDLEWARE] Token mal formateado:', authHeader.substring(0, 20) + '...');
      return res.status(401).json({ 
        success: false, 
        message: 'No autenticado - Token mal formateado' 
      });
    }

    console.log('🔑 [AUTH MIDDLEWARE] Token extraído correctamente');

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('✅ [AUTH MIDDLEWARE] Token válido para:', {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
    });
    
    // Agregar usuario decodificado al request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('❌ [AUTH MIDDLEWARE] Error al verificar token:', {
      name: error.name,
      message: error.message
    });
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'No autenticado - Token inválido' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'No autenticado - Token expirado' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Error al verificar autenticación',
      error: error.message
    });
  }
};

// Middleware opcional para verificar roles específicos
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('🔒 [ROLE CHECK] Verificando rol:', {
      userRol: req.user?.rol,
      allowedRoles
    });

    if (!req.user) {
      console.log('❌ [ROLE CHECK] No hay usuario en request');
      return res.status(401).json({ 
        success: false, 
        message: 'No autenticado' 
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      console.log('❌ [ROLE CHECK] Rol no autorizado');
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado - Rol insuficiente' 
      });
    }

    console.log('✅ [ROLE CHECK] Rol autorizado');
    next();
  };
};

module.exports = { authenticate, checkRole };