// backend/src/middleware/checkRole.js

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Verificar si el rol del usuario está en los roles permitidos
    if (!allowedRoles.includes(req.user.rol)) {
      console.log('❌ Acceso denegado:', {
        usuario: req.user.email,
        rolUsuario: req.user.rol,
        rolesPermitidos: allowedRoles
      });
      
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

module.exports = { checkRole };