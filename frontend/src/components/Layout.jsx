// frontend/src/components/Layout.jsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Divider
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  Dashboard as DashboardIcon,
  Hotel as HotelIcon,
  Restaurant as RestaurantIcon,
  Assignment,
  Email as EmailIcon,
  EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon,
  MenuRounded as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    console.log('🔄 [LAYOUT] Ruta cambió a:', location.pathname);
  }, [location]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const getMenuItems = () => {
    if (user?.rol === 'administrador' || user?.rol === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
        { label: 'Reservas', path: '/admin/reservas', icon: <HotelIcon /> },
        { label: 'Habitaciones', path: '/admin/habitaciones', icon: <HotelIcon /> },
        { label: 'Huéspedes', path: '/admin/huespedes', icon: <AccountCircle /> },
        { label: 'Servicios', path: '/admin/servicios', icon: <RestaurantIcon /> },
        { label: 'Gestión Servicios', path: '/admin/gestion-servicios', icon: <Assignment /> },
        { label: 'Facturación', path: '/admin/facturacion', icon: <RestaurantIcon /> },
        { label: 'Consultas', path: '/admin/consultas', icon: <EmailIcon /> }
      ];
    } else if (user?.rol === 'cliente') {
      return [
        { label: 'Inicio', path: '/cliente', icon: <DashboardIcon /> },
        { label: 'Nueva Reserva', path: '/cliente/nueva-reserva', icon: <HotelIcon /> },
        { label: 'Mis Reservas', path: '/cliente/mis-reservas', icon: <EventNoteIcon /> },
        { label: 'Contratar Servicios', path: '/cliente/contratar-servicios', icon: <RestaurantIcon /> },
        { label: 'Mis Servicios', path: '/cliente/mis-servicios', icon: <CheckCircleIcon /> },
        { label: 'Mis Consultas', path: '/cliente/mis-consultas', icon: <EmailIcon /> }
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  console.log('🏗️ [LAYOUT] Renderizando Layout para:', user?.email, 'Rol:', user?.rol);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar de Lujo */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%)',
          borderBottom: '1px solid rgba(201, 168, 106, 0.3)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1 }}>
            {/* Logo */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                mr: 4
              }}
              onClick={() => navigate(user?.rol === 'cliente' ? '/cliente' : '/admin')}
            >
              <HotelIcon sx={{ fontSize: 32, color: '#C9A86A', mr: 1 }} />
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 400,
                    color: 'white',
                    letterSpacing: '0.1em',
                    lineHeight: 1
                  }}
                >
                  HOTEL SISTEMA
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#C9A86A',
                    letterSpacing: '0.2em',
                    fontSize: '0.65rem'
                  }}
                >
                  LUXURY EXPERIENCE
                </Typography>
              </Box>
            </Box>

            {/* Menú Desktop */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flexGrow: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  startIcon={item.icon}
                  sx={{
                    color: location.pathname === item.path ? '#C9A86A' : 'rgba(255,255,255,0.8)',
                    px: 2,
                    py: 1,
                    fontSize: '0.85rem',
                    fontWeight: 400,
                    letterSpacing: '0.05em',
                    borderRadius: 0,
                    borderBottom: location.pathname === item.path ? '2px solid #C9A86A' : '2px solid transparent',
                    transition: 'all 0.3s',
                    '&:hover': {
                      color: '#C9A86A',
                      bgcolor: 'rgba(201, 168, 106, 0.05)',
                      borderBottom: '2px solid #C9A86A'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Botón menú móvil */}
            <IconButton
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                ml: 'auto',
                color: '#C9A86A'
              }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>

            {/* Avatar y menú de usuario (Desktop) */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 2 }}>
              <IconButton
                size="large"
                onClick={handleMenu}
                sx={{ p: 0 }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: '#C9A86A',
                    width: 40,
                    height: 40,
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 400
                  }}
                >
                  {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    borderRadius: 0,
                    border: '1px solid #E0E0E0',
                    minWidth: 240
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 500,
                      color: '#2C2C2C'
                    }}
                  >
                    {user?.nombre} {user?.apellido}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#999',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}
                  >
                    {user?.rol}
                  </Typography>
                </Box>
                <Divider />
                
                {user?.rol === 'cliente' && [
                  <MenuItem 
                    key="perfil" 
                    onClick={() => {
                      navigate('/cliente/mi-perfil');
                      handleClose();
                    }}
                    sx={{ 
                      py: 1.5,
                      '&:hover': { bgcolor: 'rgba(201, 168, 106, 0.08)' }
                    }}
                  >
                    <AccountCircle sx={{ mr: 2, color: '#C9A86A' }} /> Mi Perfil
                  </MenuItem>,
                  <MenuItem 
                    key="password" 
                    onClick={() => {
                      navigate('/cliente/cambiar-password');
                      handleClose();
                    }}
                    sx={{ 
                      py: 1.5,
                      '&:hover': { bgcolor: 'rgba(201, 168, 106, 0.08)' }
                    }}
                  >
                    Cambiar Contraseña
                  </MenuItem>,
                  <Divider key="divider" />
                ]}
                
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ 
                    py: 1.5,
                    color: '#C62828',
                    '&:hover': { bgcolor: 'rgba(198, 40, 40, 0.08)' }
                  }}
                >
                  <ExitToApp sx={{ mr: 2 }} /> Cerrar Sesión
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>

          {/* Menú móvil desplegable */}
          {mobileMenuOpen && (
            <Box 
              sx={{ 
                display: { xs: 'block', md: 'none' },
                pb: 2
              }}
            >
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  fullWidth
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  startIcon={item.icon}
                  sx={{
                    color: location.pathname === item.path ? '#C9A86A' : 'rgba(255,255,255,0.8)',
                    justifyContent: 'flex-start',
                    px: 2,
                    py: 1.5,
                    fontSize: '0.9rem',
                    fontWeight: 400,
                    letterSpacing: '0.05em',
                    borderRadius: 0,
                    bgcolor: location.pathname === item.path ? 'rgba(201, 168, 106, 0.1)' : 'transparent',
                    '&:hover': {
                      color: '#C9A86A',
                      bgcolor: 'rgba(201, 168, 106, 0.1)'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
              
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
              
              {/* Info usuario en móvil */}
              <Box sx={{ px: 2, mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                  {user?.nombre} {user?.apellido}
                </Typography>
                <Typography variant="caption" sx={{ color: '#C9A86A' }}>
                  {user?.rol}
                </Typography>
              </Box>
              
              {user?.rol === 'cliente' && (
                <>
                  <Button
                    fullWidth
                    startIcon={<AccountCircle />}
                    onClick={() => {
                      navigate('/cliente/mi-perfil');
                      setMobileMenuOpen(false);
                    }}
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      justifyContent: 'flex-start',
                      px: 2,
                      py: 1,
                      '&:hover': { color: '#C9A86A' }
                    }}
                  >
                    Mi Perfil
                  </Button>
                  <Button
                    fullWidth
                    onClick={() => {
                      navigate('/cliente/cambiar-password');
                      setMobileMenuOpen(false);
                    }}
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      justifyContent: 'flex-start',
                      px: 2,
                      py: 1,
                      '&:hover': { color: '#C9A86A' }
                    }}
                  >
                    Cambiar Contraseña
                  </Button>
                </>
              )}
              
              <Button
                fullWidth
                startIcon={<ExitToApp />}
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                sx={{
                  color: '#FF6B6B',
                  justifyContent: 'flex-start',
                  px: 2,
                  py: 1,
                  mt: 1,
                  '&:hover': { bgcolor: 'rgba(255, 107, 107, 0.1)' }
                }}
              >
                Cerrar Sesión
              </Button>
            </Box>
          )}
        </Container>
      </AppBar>

      {/* Contenido principal */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#FAFAFA' }}>
        {console.log('📦 [LAYOUT] Renderizando Outlet')}
        <Outlet />
      </Box>

      {/* Footer de Lujo */}
      <Box
        component="footer"
        sx={{
          py: 4,
          px: 2,
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%)',
          borderTop: '1px solid rgba(201, 168, 106, 0.3)'
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  letterSpacing: '0.1em',
                  fontSize: '0.8rem'
                }}
              >
                © {new Date().getFullYear()} HOTEL SISTEMA
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#C9A86A',
                  letterSpacing: '0.15em',
                  fontSize: '0.7rem'
                }}
              >
                LUXURY HOSPITALITY EXPERIENCE
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  '&:hover': { color: '#C9A86A' }
                }}
              >
                Términos y Condiciones
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  '&:hover': { color: '#C9A86A' }
                }}
              >
                Política de Privacidad
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;