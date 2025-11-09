import { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  MenuItem,
  Grid,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Badge as BadgeIcon,
  Visibility,
  VisibilityOff,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipo_documento: 'DNI',
    numero_documento: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.nombre || !formData.email || !formData.password) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    if (!formData.numero_documento) {
      setError('El número de documento es obligatorio');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        nombre: formData.nombre,
        apellido: formData.apellido,
        tipo_documento: formData.tipo_documento,
        numero_documento: formData.numero_documento,
        email: formData.email,
        telefono: formData.telefono,
        password: formData.password
      });

      if (response.data.success) {
        navigate('/login', { 
          state: { message: 'Registro exitoso. Por favor inicie sesión.' }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'Reservas online 24/7',
    'Acceso a servicios exclusivos',
    'Historial de estadías',
    'Atención personalizada'
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#FAFAFA'
      }}
    >
      {/* Columna izquierda - Imagen de fondo */}
      <Box
        sx={{
          flex: { xs: 0, md: 1 },
          display: { xs: 'none', md: 'block' },
          position: 'relative',
          backgroundImage: 'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80)',
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
            Únase a Nosotros
          </Typography>
          <Box sx={{ width: 80, height: 2, bgcolor: 'white', mb: 4 }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 300,
              mb: 4,
              lineHeight: 1.6,
              maxWidth: 500
            }}
          >
            Comience su viaje hacia experiencias inolvidables
          </Typography>

          {/* Beneficios */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 400,
                mb: 3,
                letterSpacing: '0.1em',
                fontSize: '1rem'
              }}
            >
              BENEFICIOS DE SU CUENTA
            </Typography>
            {benefits.map((benefit, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 2
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 20 }} />
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 300,
                    opacity: 0.95
                  }}
                >
                  {benefit}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              mt: 6,
              pt: 4,
              borderTop: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 300,
                opacity: 0.8,
                fontStyle: 'italic'
              }}
            >
              "La excelencia es nuestra promesa, su satisfacción nuestra misión"
            </Typography>
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
          px: { xs: 2, sm: 4 },
          py: 6
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 580 }}>
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
                Crear Cuenta
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#666',
                  fontWeight: 300,
                  letterSpacing: '0.05em'
                }}
              >
                Complete sus datos para registrarse
              </Typography>
            </Box>

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
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre *"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '&:hover fieldset': { borderColor: '#C9A86A' },
                        '&.Mui-focused fieldset': { borderColor: '#C9A86A' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#C9A86A' }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#999' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '&:hover fieldset': { borderColor: '#C9A86A' },
                        '&.Mui-focused fieldset': { borderColor: '#C9A86A' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#C9A86A' }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#999' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Tipo de Documento *"
                    name="tipo_documento"
                    value={formData.tipo_documento}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '&:hover fieldset': { borderColor: '#C9A86A' },
                        '&.Mui-focused fieldset': { borderColor: '#C9A86A' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#C9A86A' }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ color: '#999' }} />
                        </InputAdornment>
                      )
                    }}
                  >
                    <MenuItem value="DNI">DNI</MenuItem>
                    <MenuItem value="Pasaporte">Pasaporte</MenuItem>
                    <MenuItem value="Cédula">Cédula</MenuItem>
                    <MenuItem value="RUC">RUC</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Número de Documento *"
                    name="numero_documento"
                    value={formData.numero_documento}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '&:hover fieldset': { borderColor: '#C9A86A' },
                        '&.Mui-focused fieldset': { borderColor: '#C9A86A' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#C9A86A' }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Correo Electrónico *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '&:hover fieldset': { borderColor: '#C9A86A' },
                        '&.Mui-focused fieldset': { borderColor: '#C9A86A' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#C9A86A' }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#999' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '&:hover fieldset': { borderColor: '#C9A86A' },
                        '&.Mui-focused fieldset': { borderColor: '#C9A86A' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#C9A86A' }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: '#999' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contraseña *"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    helperText="Mínimo 6 caracteres"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '&:hover fieldset': { borderColor: '#C9A86A' },
                        '&.Mui-focused fieldset': { borderColor: '#C9A86A' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#C9A86A' }
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
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirmar Contraseña *"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '&:hover fieldset': { borderColor: '#C9A86A' },
                        '&.Mui-focused fieldset': { borderColor: '#C9A86A' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#C9A86A' }
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
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  mt: 4,
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
                {loading ? 'REGISTRANDO...' : 'CREAR CUENTA'}
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
                ¿Ya tiene una cuenta?{' '}
                <Link
                  href="/login"
                  underline="hover"
                  sx={{
                    color: '#C9A86A',
                    fontWeight: 500,
                    '&:hover': {
                      color: '#B8956A'
                    }
                  }}
                >
                  Inicie sesión aquí
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

export default Register;