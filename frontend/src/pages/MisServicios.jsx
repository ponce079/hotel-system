import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  Button,
  Alert,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  HourglassEmpty, 
  Restaurant as RestaurantIcon
} from '@mui/icons-material';
import api from '../config/api';

const MisServicios = () => {
  const { user } = useAuth();
  const [contrataciones, setContrataciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [dialogDetalleOpen, setDialogDetalleOpen] = useState(false);
  const [contratacionSeleccionada, setContratacionSeleccionada] = useState(null);
  const [detalleServicios, setDetalleServicios] = useState([]);

  useEffect(() => {
    cargarMisServicios();
  }, []);

  const cargarMisServicios = async () => {
    try {
      const response = await api.get('/servicios/mis-servicios');
      setContrataciones(response.data.data);
    } catch (err) {
      setError('Error al cargar tus servicios contratados');
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (contratacion) => {
    try {
      const response = await api.get(`/servicios/contratacion/${contratacion.contratacion_id}/detalle`);
      setDetalleServicios(response.data.data);
      setContratacionSeleccionada(contratacion);
      setDialogDetalleOpen(true);
    } catch (err) {
      setError('Error al cargar el detalle');
    }
  };

  const cancelarContratacion = async (contratacionId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta contratación?')) {
      return;
    }

    try {
      await api.patch(`/servicios/contratacion/${contratacionId}/cancelar`);
      setSuccess('Contratación cancelada exitosamente');
      await cargarMisServicios();
      setDialogDetalleOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cancelar');
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'warning',
      confirmado: 'info',
      en_proceso: 'primary',
      completado: 'success',
      cancelado: 'error'
    };
    return colores[estado] || 'default';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      en_proceso: 'En Proceso',
      completado: 'Completado',
      cancelado: 'Cancelado'
    };
    return labels[estado] || estado;
  };

  const getEstadoIcon = (estado) => {
    const iconos = {
      pendiente: <PendingIcon />,
      confirmado: <CheckCircleIcon />,
      en_proceso: <HourglassEmpty />,
      completado: <CheckCircleIcon />,
      cancelado: <CancelIcon />
    };
    return iconos[estado] || null;
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Mis Servicios Contratados
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Historial de servicios que has contratado
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

      {/* Resumen rápido */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PendingIcon sx={{ fontSize: 40, color: '#ed6c02', mb: 1 }} />
              <Typography variant="h4" color="#ed6c02">
                {contrataciones.filter(c => c.estado === 'pendiente').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
              <Typography variant="h4" color="#1976d2">
                {contrataciones.filter(c => c.estado === 'confirmado' || c.estado === 'en_proceso').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En Proceso
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
              <Typography variant="h4" color="#2e7d32">
                {contrataciones.filter(c => c.estado === 'completado').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de contrataciones */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Servicios</TableCell>
              <TableCell>Fecha del Servicio</TableCell>
              <TableCell>Fecha de Contratación</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contrataciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box sx={{ py: 4 }}>
                    <RestaurantIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No has contratado servicios aún
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ mt: 2 }}
                      onClick={() => window.location.href = '/cliente/contratar-servicios'}
                    >
                      Contratar Servicios
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              contrataciones.map((contratacion) => (
                <TableRow key={contratacion.contratacion_id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      #{contratacion.contratacion_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 250 }}>
                      {contratacion.servicios_contratados}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(contratacion.fecha_servicio).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(contratacion.fecha_contratacion).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      ${parseFloat(contratacion.total).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getEstadoIcon(contratacion.estado)}
                      label={getEstadoLabel(contratacion.estado)}
                      color={getEstadoColor(contratacion.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver detalle">
                      <IconButton
                        size="small"
                        onClick={() => verDetalle(contratacion)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {contratacion.estado === 'pendiente' && (
                      <Tooltip title="Cancelar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => cancelarContratacion(contratacion.contratacion_id)}
                        >
                          <CancelIcon />
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

      {/* Dialog de Detalle */}
      <Dialog
        open={dialogDetalleOpen}
        onClose={() => setDialogDetalleOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {contratacionSeleccionada && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Detalle de Contratación #{contratacionSeleccionada.contratacion_id}
                </Typography>
                <Chip
                  icon={getEstadoIcon(contratacionSeleccionada.estado)}
                  label={getEstadoLabel(contratacionSeleccionada.estado)}
                  color={getEstadoColor(contratacionSeleccionada.estado)}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha del Servicio
                  </Typography>
                  <Typography variant="body1">
                    {new Date(contratacionSeleccionada.fecha_servicio).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha de Contratación
                  </Typography>
                  <Typography variant="body1">
                    {new Date(contratacionSeleccionada.fecha_contratacion).toLocaleDateString()}
                  </Typography>
                </Grid>

                {contratacionSeleccionada.observaciones && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Observaciones
                    </Typography>
                    <Typography variant="body1">
                      {contratacionSeleccionada.observaciones}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Servicios Contratados
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List>
                    {detalleServicios.map((detalle) => (
                      <ListItem key={detalle.id} divider>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body1">
                                {detalle.servicio_nombre}
                              </Typography>
                              <Typography variant="body1" fontWeight="bold">
                                ${parseFloat(detalle.subtotal).toFixed(2)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {detalle.servicio_descripcion}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Cantidad: {detalle.cantidad} × ${parseFloat(detalle.precio_unitario).toFixed(2)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">Total</Typography>
                      <Typography variant="h4" color="primary">
                        ${parseFloat(contratacionSeleccionada.total).toFixed(2)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogDetalleOpen(false)}>
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default MisServicios;