import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import api from '../config/api';

const CambiarPassword = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    passwordActual: '',
    passwordNueva: '',
    passwordConfirm: ''
  });

  const [showPassword, setShowPassword] = useState({
    actual: false,
    nueva: false,
    confirm: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleShowPassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Validaciones de contraseña
  const validaciones = {
    longitud: formData.passwordNueva.length >= 8,
    mayuscula: /[A-Z]/.test(formData.passwordNueva),
    minuscula: /[a-z]/.test(formData.passwordNueva),
    numero: /[0-9]/.test(formData.passwordNueva),
    coincide: formData.passwordNueva === formData.passwordConfirm && formData.passwordNueva !== ''
  };

  const passwordValida = Object.values(validaciones).every(v => v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordValida) {
      setError('La contraseña no cumple con todos los requisitos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/cambiar-password', {
        usuario_id: user.id,
        password_actual: formData.passwordActual,
        password_nueva: formData.passwordNueva
      });

      setSuccess('Contraseña actualizada exitosamente');
      setFormData({
        passwordActual: '',
        passwordNueva: '',
        passwordConfirm: ''
      });
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              mr: 2
            }}
          >
            <LockIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h5" gutterBottom>
              Cambiar Contraseña
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Actualiza tu contraseña de acceso
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Contraseña Actual */}
          <TextField
            fullWidth
            required
            type={showPassword.actual ? 'text' : 'password'}
            label="Contraseña Actual"
            name="passwordActual"
            value={formData.passwordActual}
            onChange={handleChange}
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword('actual')}
                    edge="end"
                  >
                    {showPassword.actual ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Nueva Contraseña */}
          <TextField
            fullWidth
            required
            type={showPassword.nueva ? 'text' : 'password'}
            label="Nueva Contraseña"
            name="passwordNueva"
            value={formData.passwordNueva}
            onChange={handleChange}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword('nueva')}
                    edge="end"
                  >
                    {showPassword.nueva ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Confirmar Contraseña */}
          <TextField
            fullWidth
            required
            type={showPassword.confirm ? 'text' : 'password'}
            label="Confirmar Nueva Contraseña"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword('confirm')}
                    edge="end"
                  >
                    {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Requisitos de contraseña */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              La contraseña debe cumplir con:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  {validaciones.longitud ? (
                    <CheckIcon color="success" />
                  ) : (
                    <CancelIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText primary="Mínimo 8 caracteres" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  {validaciones.mayuscula ? (
                    <CheckIcon color="success" />
                  ) : (
                    <CancelIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText primary="Al menos una letra mayúscula" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  {validaciones.minuscula ? (
                    <CheckIcon color="success" />
                  ) : (
                    <CancelIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText primary="Al menos una letra minúscula" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  {validaciones.numero ? (
                    <CheckIcon color="success" />
                  ) : (
                    <CancelIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText primary="Al menos un número" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  {validaciones.coincide ? (
                    <CheckIcon color="success" />
                  ) : (
                    <CancelIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText primary="Las contraseñas coinciden" />
              </ListItem>
            </List>
          </Paper>

          {/* Botones */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => setFormData({
                passwordActual: '',
                passwordNueva: '',
                passwordConfirm: ''
              })}
              disabled={loading}
            >
              Limpiar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !passwordValida}
            >
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CambiarPassword;