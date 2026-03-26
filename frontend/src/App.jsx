// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Páginas públicas
import Login from './pages/Login';
import Register from './pages/Register';

// Páginas de cliente
import ClienteDashboard from './pages/ClienteDashboard';
import NuevaReserva from './pages/NuevaReserva';
import MisReservas from './pages/MisReservas';
import ContratarServicios from './pages/ContratarServicios';
import MisServicios from './pages/MisServicios';
import MiPerfil from './pages/MiPerfil';
import CambiarPassword from './pages/CambiarPassword';
import MisConsultas from './pages/MisConsultas';  // ✅ AGREGAR ESTO

// Páginas de administrador
import Dashboard from './pages/Dashboard';
import Reservas from './pages/Reservas';
import Habitaciones from './pages/Habitaciones';
import Huespedes from './pages/Huespedes';
import Servicios from './pages/Servicios';
import Facturacion from './pages/Facturacion';
import GestionServicios from './pages/GestionServicios';
import GestionConsultas from './pages/GestionConsultas';  // ✅ AGREGAR ESTO
import Operadores from './pages/Operadores';

function App() {
  console.log('🚀 [APP] Inicializando aplicación...');
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas de cliente */}
          <Route
            path="/cliente/*"
            element={
              <ProtectedRoute allowedRoles={['cliente']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ClienteDashboard />} />
            <Route path="nueva-reserva" element={<NuevaReserva />} />
            <Route path="mis-reservas" element={<MisReservas />} />
            <Route path="contratar-servicios" element={<ContratarServicios />} />
            <Route path="mis-servicios" element={<MisServicios />} />
            <Route path="mi-perfil" element={<MiPerfil />} />
            <Route path="cambiar-password" element={<CambiarPassword />} />
            <Route path="mis-consultas" element={<MisConsultas />} />  {/* ✅ AGREGAR ESTO */}
          </Route>

          {/* Rutas de administrador */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin', 'administrador', 'recepcionista', 'gerente', 'contador']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="reservas" element={<Reservas />} />
            <Route path="habitaciones" element={<Habitaciones />} />
            <Route path="huespedes" element={<Huespedes />} />
            <Route path="servicios" element={<Servicios />} />
            <Route path="facturacion" element={<Facturacion />} />
            <Route path="gestion-servicios" element={<GestionServicios />} />
            <Route path="facturas" element={<Facturacion />} />
            <Route path="consultas" element={<GestionConsultas />} />  {/* ✅ AGREGAR ESTO */}
            <Route path="operadores" element={<Operadores />} />
          </Route>

          {/* Ruta global para /facturas (redirección temporal) */}
          <Route
            path="/facturas"
            element={
              <ProtectedRoute allowedRoles={['admin', 'administrador']}>
                <Navigate to="/admin/facturacion" replace />
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;