import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
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
  Grid,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckInIcon,
  ExitToApp as CheckOutIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Hotel as HotelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import api from '../config/api';

const Reservas = () => {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  
  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [accionando, setAccionando] = useState(false);
  
  // Estado para cambiar
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [dialogEstadoOpen, setDialogEstadoOpen] = useState(false);

  useEffect(() => {
    cargarReservas();
  }, []);

  useEffect(() => {
    filtrarReservas();
  }, [reservas, filtroEstado, busqueda]);

  const cargarReservas = async () => {
    try {
      const response = await api.get('/reservas');
      setReservas(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  const filtrarReservas = () => {
    let filtradas = [...reservas];

    // Filtrar por estado
    if (filtroEstado !== 'todas') {
      filtradas = filtradas.filter(r => r.estado === filtroEstado);
    }

    // Filtrar por búsqueda
    if (busqueda) {
      const termino = busqueda.toLowerCase();
      filtradas = filtradas.filter(r => 
        r.codigo_reserva.toLowerCase().includes(termino) ||
        r.huesped_nombre.toLowerCase().includes(termino) ||
        r.habitacion_numero.includes(termino) ||
        r.tipo_habitacion.toLowerCase().includes(termino)
      );
    }

    // Ordenar por fecha de entrada (más recientes primero)
    filtradas.sort((a, b) => new Date(b.fecha_entrada) - new Date(a.fecha_entrada));

    setReservasFiltradas(filtradas);
  };

  const verDetalle = async (id) => {
    try {
      const response = await api.get(`/reservas/${id}`);
      setReservaSeleccionada(response.data.data);
      setDialogOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar detalle');
    }
  };

  const abrirCambioEstado = (reserva, estado) => {
    setReservaSeleccionada(reserva);
    setNuevoEstado(estado);
    setDialogEstadoOpen(true);
  };

  const cambiarEstado = async () => {
    setAccionando(true);
    setError('');

    try {
      await api.patch(`/reservas/${reservaSeleccionada.id}/estado`, {
        estado: nuevoEstado
      });

      setSuccess(`Estado actualizado a: ${getEstadoLabel(nuevoEstado)}`);
      setDialogEstadoOpen(false);
      setDialogOpen(false);
      await cargarReservas();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar estado');
    } finally {
      setAccionando(false);
    }
  };

  const cancelarReserva = async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar esta reserva?')) {
      return;
    }

    setAccionando(true);
    try {
      await api.delete(`/reservas/${id}`);
      setSuccess('Reserva cancelada exitosamente');
      setDialogOpen(false);
      await cargarReservas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cancelar reserva');
    } finally {
      setAccionando(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'warning',
      confirmada: 'info',
      check_in: 'success',
      check_out: 'default',
      cancelada: 'error'
    };
    return colores[estado] || 'default';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      check_in: 'Check-in',
      check_out: 'Check-out',
      cancelada: 'Cancelada'
    };
    return labels[estado] || estado;
  };

  const contarPorEstado = (estado) => {
    if (estado === 'todas') return reservas.length;
    return reservas.filter(r => r.estado === estado).length;
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
          Gestión de Reservas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra todas las reservas del hotel
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

      {/* Filtros y Búsqueda */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar por código, huésped o habitación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Tabs
              value={filtroEstado}
              onChange={(e, newValue) => setFiltroEstado(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label={`Todas (${contarPorEstado('todas')})`} value="todas" />
              <Tab label={`Pendientes (${contarPorEstado('pendiente')})`} value="pendiente" />
              <Tab label={`Confirmadas (${contarPorEstado('confirmada')})`} value="confirmada" />
              <Tab label={`Check-in (${contarPorEstado('check_in')})`} value="check_in" />
              <Tab label={`Finalizadas (${contarPorEstado('check_out')})`} value="check_out" />
              <Tab label={`Canceladas (${contarPorEstado('cancelada')})`} value="cancelada" />
            </Tabs>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de Reservas */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Huésped</TableCell>
              <TableCell>Habitación</TableCell>
              <TableCell>Check-in</TableCell>
              <TableCell>Check-out</TableCell>
              <TableCell>Huéspedes</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No se encontraron reservas
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              reservasFiltradas.map((reserva) => (
                <TableRow key={reserva.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {reserva.codigo_reserva}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{reserva.huesped_nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {reserva.huesped_email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{reserva.tipo_habitacion}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Hab. {reserva.habitacion_numero}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(reserva.fecha_entrada).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(reserva.fecha_salida).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>{reserva.numero_huespedes}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      ${parseFloat(reserva.precio_total).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getEstadoLabel(reserva.estado)}
                      color={getEstadoColor(reserva.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver detalle">
                      <IconButton size="small" onClick={() => verDetalle(reserva.id)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {reserva.estado === 'pendiente' && (
                      <Tooltip title="Confirmar">
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => abrirCambioEstado(reserva, 'confirmada')}
                        >
                          <CheckInIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {reserva.estado === 'confirmada' && (
                      <Tooltip title="Check-in">
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => abrirCambioEstado(reserva, 'check_in')}
                        >
                          <CheckInIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {reserva.estado === 'check_in' && (
                      <Tooltip title="Check-out">
                        <IconButton 
                          size="small" 
                          color="default"
                          onClick={() => abrirCambioEstado(reserva, 'check_out')}
                        >
                          <CheckOutIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {(reserva.estado === 'pendiente' || reserva.estado === 'confirmada') && (
                      <Tooltip title="Cancelar">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => cancelarReserva(reserva.id)}
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
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {reservaSeleccionada && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Detalle de Reserva</Typography>
                <Chip
                  label={getEstadoLabel(reservaSeleccionada.estado)}
                  color={getEstadoColor(reservaSeleccionada.estado)}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Información de la Reserva */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Información de la Reserva
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Código de Reserva
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {reservaSeleccionada.codigo_reserva}
                    </Typography>
                  </Box>
                </Grid>

                {/* Habitación */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    <HotelIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
                    Habitación
                  </Typography>
                  <Typography variant="body2">{reservaSeleccionada.tipo_habitacion}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Habitación {reservaSeleccionada.habitacion_numero} - Piso {reservaSeleccionada.piso}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Capacidad: {reservaSeleccionada.capacidad_personas} personas
                  </Typography>
                </Grid>

                {/* Fechas */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Fechas de Estadía
                  </Typography>
                  <Typography variant="body2">
                    Check-in: {new Date(reservaSeleccionada.fecha_entrada).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    Check-out: {new Date(reservaSeleccionada.fecha_salida).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Huéspedes: {reservaSeleccionada.numero_huespedes}
                  </Typography>
                </Grid>

                {/* Huésped */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    <PersonIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
                    Huésped Principal
                  </Typography>
                  <Typography variant="body2">{reservaSeleccionada.huesped_nombre}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    <EmailIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                    {reservaSeleccionada.huesped_email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <PhoneIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                    {reservaSeleccionada.huesped_telefono}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {reservaSeleccionada.tipo_documento}: {reservaSeleccionada.numero_documento}
                  </Typography>
                </Grid>

                {/* Precio */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h4" color="primary">
                      ${parseFloat(reservaSeleccionada.precio_total).toFixed(2)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Precio base: ${parseFloat(reservaSeleccionada.precio_base).toFixed(2)}/noche
                  </Typography>
                </Grid>

                {reservaSeleccionada.observaciones && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Observaciones</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {reservaSeleccionada.observaciones}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog de Cambio de Estado */}
      <Dialog open={dialogEstadoOpen} onClose={() => setDialogEstadoOpen(false)}>
        <DialogTitle>Cambiar Estado de Reserva</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            ¿Confirmas cambiar el estado a <strong>{getEstadoLabel(nuevoEstado)}</strong>?
          </Typography>
          {reservaSeleccionada && (
            <Typography variant="body2" color="text.secondary">
              Reserva: {reservaSeleccionada.codigo_reserva}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogEstadoOpen(false)} disabled={accionando}>
            Cancelar
          </Button>
          <Button 
            onClick={cambiarEstado} 
            variant="contained" 
            disabled={accionando}
          >
            {accionando ? 'Cambiando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Reservas;