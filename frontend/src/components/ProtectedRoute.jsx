import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles permitidos, verificar
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/mis-reservas" replace />;
  }

  return children;
};

export default ProtectedRoute;