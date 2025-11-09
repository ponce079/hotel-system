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
  Button,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ConfirmIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import api from '../config/api';

const GestionServicios = () => {
  const [contrataciones, setContrataciones] = useState([]);
  const [contratacionesFiltradas, setContratacionesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  
  const [dialogDetalleOpen, setDialogDetalleOpen] = useState(false);
  const [contratacionSeleccionada, setContratacionSeleccionada] = useState(null);
  const [detalleServicios, setDetalleServicios] = useState([]);
  const [accionando, setAccionando] = useState(false);

  useEffect(() => {
    cargarContrataciones();
  }, []);

  useEffect(() => {
    filtrarContrataciones();
  }, [contrataciones, filtroEstado]);

  const cargarContrataciones = async () => {
    try {
      const response = await api.get('/servicios/admin/contrataciones');
      setContrataciones(response.data.data);
    } catch (err) {
      setError('Error al cargar contrataciones');
    } finally {
      setLoading(false);
    }
  };

  const filtrarContrataciones = () => {
    let filtradas = [...contrataciones];

    if (filtroEstado !== 'todas') {
      filtradas = filtradas.filter(c => c.estado === filtroEstado);
    }

    filtradas.sort((a, b) => new Date(b.fecha_contratacion) - new Date(a.fecha_contratacion));
    setContratacionesFiltradas(filtradas);
  };

  const verDetalle = async (contratacion) => {
    try {
      const response = await api.get(`/servicios/contratacion/${contratacion.contratacion_id}/detalle`);
      setDetalleServicios(response.data.data);
      setContratacionSeleccionada(contratacion);
      setDialogDetalleOpen(true);
    } catch (err) {
      setError('Error al cargar detalle');
    }
  };

  const cambiarEstado = async (contratacionId, nuevoEstado) => {
    if (!window.confirm(`¿Confirmar cambio a ${getEstadoLabel(nuevoEstado)}?`)) {
      return;
    }

    setAccionando(true);
    try {
      await api.patch(`/servicios/admin/contratacion/${contratacionId}/estado`, {
        estado: nuevoEstado
      });
      setSuccess(`Estado actualizado a: ${getEstadoLabel(nuevoEstado)}`);
      setDialogDetalleOpen(false);
      await cargarContrataciones();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar estado');
    } finally {
      setAccionando(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'warning',
      confirmado: 'info',
      completado: 'success',
      cancelado: 'error'
    };
    return colores[estado] || 'default';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      completado: 'Completado',
      cancelado: 'Cancelado'
    };
    return labels[estado] || estado;
  };

  const contarPorEstado = (estado) => {
    if (estado === 'todas') return contrataciones.length;
    return contrataciones.filter(c => c.estado === estado).length;
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
          Gestión de Servicios Contratados
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra los servicios contratados sin reserva
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

      {/* Filtros */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={filtroEstado}
          onChange={(e, newValue) => setFiltroEstado(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`Todas (${contarPorEstado('todas')})`} value="todas" />
          <Tab label={`Pendientes (${contarPorEstado('pendiente')})`} value="pendiente" />
          <Tab label={`Confirmadas (${contarPorEstado('confirmado')})`} value="confirmado" />
          <Tab label={`Completadas (${contarPorEstado('completado')})`} value="completado" />
          <Tab label={`Canceladas (${contarPorEstado('cancelado')})`} value="cancelado" />
        </Tabs>
      </Paper>

      {/* Tabla de contrataciones */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Servicios</TableCell>
              <TableCell>Fecha del Servicio</TableCell>
              <TableCell>Fecha de Contratación</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contratacionesFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No hay contrataciones
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              contratacionesFiltradas.map((contratacion) => (
                <TableRow key={contratacion.contratacion_id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      #{contratacion.contratacion_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{contratacion.huesped_nombre}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {contratacion.huesped_email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 250 }}>
                      {contratacion.servicios_contratados}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(contratacion.fecha_servicio).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(contratacion.fecha_contratacion).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      ${parseFloat(contratacion.total).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getEstadoLabel(contratacion.estado)}
                      color={getEstadoColor(contratacion.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver detalle">
                      <IconButton size="small" onClick={() => verDetalle(contratacion)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {contratacion.estado === 'pendiente' && (
                      <Tooltip title="Confirmar">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => cambiarEstado(contratacion.contratacion_id, 'confirmado')}
                        >
                          <ConfirmIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {contratacion.estado === 'confirmado' && (
                      <Tooltip title="Marcar como completado">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => cambiarEstado(contratacion.contratacion_id, 'completado')}
                        >
                          <ReceiptIcon />
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
      <Dialog open={dialogDetalleOpen} onClose={() => setDialogDetalleOpen(false)} maxWidth="md" fullWidth>
        {contratacionSeleccionada && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Contratación #{contratacionSeleccionada.contratacion_id}
                </Typography>
                <Chip
                  label={getEstadoLabel(contratacionSeleccionada.estado)}
                  color={getEstadoColor(contratacionSeleccionada.estado)}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cliente
                  </Typography>
                  <Typography variant="body1">{contratacionSeleccionada.huesped_nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {contratacionSeleccionada.huesped_email}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha del Servicio
                  </Typography>
                  <Typography variant="body1">
                    {new Date(contratacionSeleccionada.fecha_servicio).toLocaleDateString()}
                  </Typography>
                </Grid>

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
                              <Typography variant="body1">{detalle.servicio_nombre}</Typography>
                              <Typography variant="body1" fontWeight="bold">
                                ${parseFloat(detalle.subtotal).toFixed(2)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption">
                              Cantidad: {detalle.cantidad} × ${parseFloat(detalle.precio_unitario).toFixed(2)}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
              {contratacionSeleccionada.estado === 'pendiente' && (
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => cambiarEstado(contratacionSeleccionada.contratacion_id, 'confirmado')}
                  disabled={accionando}
                >
                  Confirmar
                </Button>
              )}
              {contratacionSeleccionada.estado === 'confirmado' && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => cambiarEstado(contratacionSeleccionada.contratacion_id, 'completado')}
                  disabled={accionando}
                >
                  Completar
                </Button>
              )}
              <Button onClick={() => setDialogDetalleOpen(false)}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default GestionServicios;