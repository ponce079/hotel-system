import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Habitaciones from './pages/Habitaciones';
import Huespedes from './pages/Huespedes';
import MisReservas from './pages/MisReservas';
import NuevaReserva from './pages/NuevaReserva';
import './App.css';
import Reservas from './pages/Reservas';
import Servicios from './pages/Servicios';
import Facturacion from './pages/Facturacion';

// Tema personalizado de Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rutas para clientes */}
            <Route 
              path="/mis-reservas" 
              element={
                <ProtectedRoute>
                  <MisReservas />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/nueva-reserva" 
              element={
                <ProtectedRoute>
                  <NuevaReserva />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas administrativas */}
            <Route
              path="/*"
              element={
                <ProtectedRoute allowedRoles={['admin', 'recepcionista', 'gerente', 'contador']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="habitaciones" element={<Habitaciones />} />
              <Route path="huespedes" element={<Huespedes />} />
              <Route path="reservas" element={<Reservas />} />
              <Route path="facturas" element={<Facturacion />} />
              <Route path="servicios" element={<Servicios />} />
              <Route path="reportes" element={<div>Reportes - En desarrollo</div>} />
            </Route>
            
            {/* Redirección por defecto */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;