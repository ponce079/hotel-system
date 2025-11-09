// frontend/src/pages/GestionConsultas.jsx
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  Grid
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Reply as ReplyIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Close as CloseIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import api from '../config/api';

const GestionConsultas = () => {
  const [mensajes, setMensajes] = useState([]);
  const [mensajesFiltrados, setMensajesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [filtroEstado, setFiltroEstado] = useState('todas');
  
  // Dialog responder
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
  const [respuesta, setRespuesta] = useState('');
  const [respondiendo, setRespondiendo] = useState(false);

  useEffect(() => {
    cargarMensajes();
  }, []);

  useEffect(() => {
    filtrarMensajes();
  }, [mensajes, filtroEstado]);

  const cargarMensajes = async () => {
    try {
      const response = await api.get('/mensajes/admin/todos');
      setMensajes(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  const filtrarMensajes = () => {
    if (filtroEstado === 'todas') {
      setMensajesFiltrados(mensajes);
    } else {
      setMensajesFiltrados(mensajes.filter(m => m.estado === filtroEstado));
    }
  };

  const abrirDialogRespuesta = (mensaje) => {
    setMensajeSeleccionado(mensaje);
    setRespuesta(mensaje.respuesta || '');
    setDialogOpen(true);
  };

  const enviarRespuesta = async () => {
    if (!respuesta.trim()) {
      setError('La respuesta no puede estar vacía');
      return;
    }

    setRespondiendo(true);
    setError('');

    try {
      await api.patch(`/mensajes/${mensajeSeleccionado.id}/responder`, {
        respuesta
      });

      setSuccess('Respuesta enviada exitosamente. El usuario recibirá un email.');
      setDialogOpen(false);
      setRespuesta('');
      await cargarMensajes();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar respuesta');
    } finally {
      setRespondiendo(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/mensajes/${id}/estado`, { estado: nuevoEstado });
      setSuccess(`Estado actualizado a: ${nuevoEstado}`);
      await cargarMensajes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar estado');
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

  const contarPorEstado = (estado) => {
    if (estado === 'todas') return mensajes.length;
    return mensajes.filter(m => m.estado === estado).length;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Consultas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Responde las consultas de los clientes
        </Typography>
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

      {/* Filtros por estado */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs
          value={filtroEstado}
          onChange={(e, newValue) => setFiltroEstado(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`Todas (${contarPorEstado('todas')})`} value="todas" />
          <Tab label={`Pendientes (${contarPorEstado('pendiente')})`} value="pendiente" />
          <Tab label={`Respondidas (${contarPorEstado('respondido')})`} value="respondido" />
          <Tab label={`Cerradas (${contarPorEstado('cerrado')})`} value="cerrado" />
        </Tabs>
      </Paper>

      {/* Tabla de Mensajes */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Asunto</TableCell>
              <TableCell>Mensaje</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mensajesFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No hay mensajes para mostrar
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              mensajesFiltrados.map((mensaje) => (
                <TableRow key={mensaje.id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(mensaje.fecha_creacion).toLocaleDateString('es-AR')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(mensaje.fecha_creacion).toLocaleTimeString('es-AR')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{mensaje.usuario_nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {mensaje.usuario_email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {mensaje.asunto}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {mensaje.mensaje}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getEstadoIcon(mensaje.estado)}
                      label={getEstadoLabel(mensaje.estado)}
                      color={getEstadoColor(mensaje.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={mensaje.respuesta ? 'Ver/Editar respuesta' : 'Responder'}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => abrirDialogRespuesta(mensaje)}
                      >
                        <ReplyIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {mensaje.estado !== 'cerrado' && (
                      <Tooltip title="Marcar como cerrado">
                        <IconButton 
                          size="small" 
                          color="default"
                          onClick={() => cambiarEstado(mensaje.id, 'cerrado')}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Responder */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {mensajeSeleccionado && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Responder Consulta</Typography>
                <Chip
                  icon={getEstadoIcon(mensajeSeleccionado.estado)}
                  label={getEstadoLabel(mensajeSeleccionado.estado)}
                  color={getEstadoColor(mensajeSeleccionado.estado)}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      De: {mensajeSeleccionado.usuario_nombre} ({mensajeSeleccionado.usuario_email})
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      Fecha: {new Date(mensajeSeleccionado.fecha_creacion).toLocaleString('es-AR')}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Asunto:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {mensajeSeleccionado.asunto}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Mensaje del cliente:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body1">
                      {mensajeSeleccionado.mensaje}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tu respuesta:
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={respuesta}
                    onChange={(e) => setRespuesta(e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    variant="outlined"
                  />
                </Grid>

                {mensajeSeleccionado.respuesta && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      Ya respondiste este mensaje el{' '}
                      {new Date(mensajeSeleccionado.fecha_respuesta).toLocaleString('es-AR')}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} disabled={respondiendo}>
                Cancelar
              </Button>
              <Button 
                onClick={enviarRespuesta} 
                variant="contained" 
                disabled={respondiendo}
                startIcon={<EmailIcon />}
              >
                {respondiendo ? 'Enviando...' : 'Enviar Respuesta'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default GestionConsultas;