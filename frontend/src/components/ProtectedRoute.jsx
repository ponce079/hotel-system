import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material'; // ✅ Agrega esto

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  console.log('🔒 [ProtectedRoute] Verificando acceso:', { user, loading, allowedRoles });

  if (loading) {
    console.log('⏳ [ProtectedRoute] Cargando autenticación...');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    console.log('❌ [ProtectedRoute] No hay usuario, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    console.log('❌ [ProtectedRoute] Rol no permitido:', user.rol, 'Permitidos:', allowedRoles);
    return <Navigate to="/login" replace />;
  }

  console.log('✅ [ProtectedRoute] Acceso permitido');
  return children;
};

export default ProtectedRoute;