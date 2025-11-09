// frontend/src/pages/MisConsultas.jsx
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Email as EmailIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api from '../config/api';

const MisConsultas = () => {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog nuevo mensaje
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState({
    asunto: '',
    mensaje: ''
  });

  // Dialog ver detalle
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);

  useEffect(() => {
    cargarMensajes();
  }, []);

  const cargarMensajes = async () => {
    try {
      const response = await api.get('/mensajes/mis-mensajes');
      setMensajes(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  const enviarMensaje = async () => {
    if (!nuevoMensaje.asunto || !nuevoMensaje.mensaje) {
      setError('Por favor completa todos los campos');
      return;
    }

    setEnviando(true);
    setError('');

    try {
      await api.post('/mensajes', nuevoMensaje);
      setSuccess('Consulta enviada exitosamente. Te responderemos pronto.');
      setDialogOpen(false);
      setNuevoMensaje({ asunto: '', mensaje: '' });
      await cargarMensajes();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar consulta');
    } finally {
      setEnviando(false);
    }
  };

  const verDetalle = async (id) => {
    try {
      const response = await api.get(`/mensajes/${id}`);
      setMensajeSeleccionado(response.data.data);
      setDetalleOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar detalle');
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'warning',
      respondido: 'success',
      cerrado: 'default'
    };
    return colores[estado] || 'default';
  };

  const getEstadoIcon = (estado) => {
    if (estado === 'pendiente') return <PendingIcon />;
    if (estado === 'respondido') return <CheckIcon />;
    return <CloseIcon />;
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      pendiente: 'Pendiente',
      respondido: 'Respondido',
      cerrado: 'Cerrado'
    };
    return labels[estado] || estado;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Mis Consultas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Envía tus preguntas y recibe respuestas del equipo
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Nueva Consulta
        </Button>
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

      {mensajes.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <EmailIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No tienes consultas
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            ¿Tienes alguna pregunta? Envía tu primera consulta
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Enviar Consulta
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {mensajes.map((mensaje) => (
            <Grid item xs={12} key={mensaje.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {mensaje.asunto}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {mensaje.mensaje}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getEstadoIcon(mensaje.estado)}
                      label={getEstadoLabel(mensaje.estado)}
                      color={getEstadoColor(mensaje.estado)}
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Enviado el {new Date(mensaje.fecha_creacion).toLocaleString('es-AR')}
                    </Typography>
                    <Button size="small" onClick={() => verDetalle(mensaje.id)}>
                      Ver Detalle
                    </Button>
                  </Box>

                  {mensaje.respuesta && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
                      <Typography variant="caption" color="success.dark" fontWeight="bold">
                        ✓ Respondido por {mensaje.admin_nombre || 'Administrador'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Nueva Consulta */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Consulta</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Asunto"
            value={nuevoMensaje.asunto}
            onChange={(e) => setNuevoMensaje({ ...nuevoMensaje, asunto: e.target.value })}
            margin="normal"
            placeholder="Ej: Consulta sobre check-in"
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Mensaje"
            value={nuevoMensaje.mensaje}
            onChange={(e) => setNuevoMensaje({ ...nuevoMensaje, mensaje: e.target.value })}
            margin="normal"
            placeholder="Escribe tu consulta aquí..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={enviando}>
            Cancelar
          </Button>
          <Button onClick={enviarMensaje} variant="contained" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar Consulta'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Ver Detalle */}
      <Dialog open={detalleOpen} onClose={() => setDetalleOpen(false)} maxWidth="md" fullWidth>
        {mensajeSeleccionado && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{mensajeSeleccionado.asunto}</Typography>
                <Chip
                  icon={getEstadoIcon(mensajeSeleccionado.estado)}
                  label={getEstadoLabel(mensajeSeleccionado.estado)}
                  color={getEstadoColor(mensajeSeleccionado.estado)}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Enviado el {new Date(mensajeSeleccionado.fecha_creacion).toLocaleString('es-AR')}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tu consulta:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body1">
                    {mensajeSeleccionado.mensaje}
                  </Typography>
                </Paper>
              </Box>

              {mensajeSeleccionado.respuesta && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom color="success.main">
                      Respuesta del equipo:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'success.lighter' }}>
                      <Typography variant="body1">
                        {mensajeSeleccionado.respuesta}
                      </Typography>
                    </Paper>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Respondido el {new Date(mensajeSeleccionado.fecha_respuesta).toLocaleString('es-AR')}
                      {mensajeSeleccionado.admin_nombre && ` por ${mensajeSeleccionado.admin_nombre}`}
                    </Typography>
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetalleOpen(false)}>
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default MisConsultas;