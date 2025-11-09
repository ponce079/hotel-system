import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        const user = result.user;
        if (user.rol === 'admin' || user.rol === 'administrador') {
          navigate('/admin');
        } else if (user.rol === 'recepcionista') {
          navigate('/recepcion');
        } else {
          navigate('/cliente');
        }
      } else {
        setError(result.message || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error inesperado al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Columna izquierda - Imagen de fondo */}
      <Box
        sx={{
          flex: { xs: 0, md: 1 },
          display: { xs: 'none', md: 'block' },
          position: 'relative',
          backgroundImage: 'url(https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(201, 168, 106, 0.9) 0%, rgba(44, 44, 44, 0.9) 100%)'
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: 8,
            color: 'white'
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 300,
              mb: 3,
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Hotel Sistema
          </Typography>
          <Box sx={{ width: 80, height: 2, bgcolor: 'white', mb: 4 }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 300,
              mb: 3,
              lineHeight: 1.6,
              maxWidth: 500
            }}
          >
            Donde la elegancia se encuentra con el servicio excepcional
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 300,
              opacity: 0.9,
              lineHeight: 1.8,
              maxWidth: 500
            }}
          >
            Bienvenido a una experiencia de hospitalidad redefinida. 
            Acceda a su cuenta y descubra un mundo de confort y exclusividad.
          </Typography>

          {/* Stats decorativos */}
          <Box sx={{ display: 'flex', gap: 6, mt: 6 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 300, fontFamily: '"Playfair Display", serif' }}>
                5★
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, letterSpacing: '0.1em' }}>
                CALIFICACIÓN
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 300, fontFamily: '"Playfair Display", serif' }}>
                24/7
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, letterSpacing: '0.1em' }}>
                SERVICIO
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 300, fontFamily: '"Playfair Display", serif' }}>
                +50
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, letterSpacing: '0.1em' }}>
                HABITACIONES
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Columna derecha - Formulario */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#FAFAFA',
          px: { xs: 2, sm: 4 },
          py: 4
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 480 }}>
          {/* Logo para móvil */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 300,
                fontFamily: '"Playfair Display", serif',
                color: '#C9A86A',
                mb: 1
              }}
            >
              Hotel Sistema
            </Typography>
            <Box sx={{ width: 60, height: 2, bgcolor: '#C9A86A', mx: 'auto' }} />
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              bgcolor: 'white',
              border: '1px solid #E0E0E0',
              borderRadius: 0
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 300,
                  mb: 1,
                  fontFamily: '"Playfair Display", serif',
                  color: '#2C2C2C'
                }}
              >
                Bienvenido
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#666',
                  fontWeight: 300,
                  letterSpacing: '0.05em'
                }}
              >
                Ingrese sus credenciales para continuar
              </Typography>
            </Box>

            {location.state?.message && (
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  borderRadius: 0,
                  bgcolor: '#F1F8E9',
                  color: '#558B2F',
                  border: '1px solid #C5E1A5'
                }}
              >
                {location.state.message}
              </Alert>
            )}

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 0,
                  bgcolor: '#FFEBEE',
                  color: '#C62828',
                  border: '1px solid #EF9A9A'
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Correo Electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoFocus
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    '&:hover fieldset': {
                      borderColor: '#C9A86A'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#C9A86A'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#C9A86A'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#999' }} />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                sx={{
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    '&:hover fieldset': {
                      borderColor: '#C9A86A'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#C9A86A'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#C9A86A'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#999' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  py: 1.8,
                  bgcolor: '#C9A86A',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 400,
                  letterSpacing: '0.1em',
                  borderRadius: 0,
                  '&:hover': {
                    bgcolor: '#B8956A'
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#E0E0E0',
                    color: '#999'
                  }
                }}
              >
                {loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
              </Button>
            </form>

            <Divider sx={{ my: 4 }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#999',
                  letterSpacing: '0.1em',
                  px: 2
                }}
              >
                O
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#666',
                  fontWeight: 300
                }}
              >
                ¿No tiene una cuenta?{' '}
                <Link
                  href="/register"
                  underline="hover"
                  sx={{
                    color: '#C9A86A',
                    fontWeight: 500,
                    '&:hover': {
                      color: '#B8956A'
                    }
                  }}
                >
                  Regístrese aquí
                </Link>
              </Typography>
            </Box>
          </Paper>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#999',
                fontWeight: 300,
                letterSpacing: '0.1em'
              }}
            >
              © {new Date().getFullYear()} HOTEL SISTEMA
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;