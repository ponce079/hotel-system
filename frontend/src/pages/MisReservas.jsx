import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Hotel as HotelIcon,
  EventNote as EventIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import api from '../config/api';
import AgregarServiciosDialog from '../components/AgregarServiciosDialog';
import { Restaurant as RestaurantIcon } from '@mui/icons-material';

const MisReservas = () => {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservaDetalle, setReservaDetalle] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [dialogServiciosOpen, setDialogServiciosOpen] = useState(false);
  const [reservaServiciosId, setReservaServiciosId] = useState(null);

  useEffect(() => {
    cargarReservas();
  }, []);

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

  const verDetalle = async (id) => {
    try {
      const response = await api.get(`/reservas/${id}`);
      setReservaDetalle(response.data.data);
      setDialogOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar detalle');
    }
  };

  const cancelarReserva = async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar esta reserva?')) {
      return;
    }

    setCancelando(true);
    try {
      await api.delete(`/reservas/${id}`);
      setDialogOpen(false);
      await cargarReservas();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cancelar reserva');
    } finally {
      setCancelando(false);
    }
  };

  const abrirServicios = (reservaId) => {
  setReservaServiciosId(reservaId);
  setDialogServiciosOpen(true);
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
      check_in: 'Check-in Realizado',
      check_out: 'Finalizada',
      cancelada: 'Cancelada'
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
            Mis Reservas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tus reservas y consulta tu historial
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/nueva-reserva')}
        >
          Nueva Reserva
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {reservas.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <HotelIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No tienes reservas
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Comienza a planificar tu estadía creando una nueva reserva
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/nueva-reserva')}
          >
            Crear Primera Reserva
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {reservas.map((reserva) => {
            const amenidades = reserva.amenidades ? JSON.parse(reserva.amenidades) : [];
            
            return (
              <Grid item xs={12} md={6} key={reserva.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">
                          {reserva.tipo_habitacion}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Habitación {reserva.habitacion_numero}
                        </Typography>
                      </Box>
                      <Chip
                        label={getEstadoLabel(reserva.estado)}
                        color={getEstadoColor(reserva.estado)}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Código de Reserva
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {reserva.codigo_reserva}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Check-in
                        </Typography>
                        <Typography variant="body2">
                          {new Date(reserva.fecha_entrada).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Check-out
                        </Typography>
                        <Typography variant="body2">
                          {new Date(reserva.fecha_salida).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Huéspedes
                        </Typography>
                        <Typography variant="body2">
                          {reserva.numero_huespedes} {reserva.numero_huespedes === 1 ? 'persona' : 'personas'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Total
                        </Typography>
                        <Typography variant="h6" color="primary">
                          ${parseFloat(reserva.precio_total).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                      <Button size="small" onClick={() => verDetalle(reserva.id)}>
                        Ver Detalle
                      </Button>
  
                        {/* Botón de servicios para reservas activas */}
                        {(reserva.estado === 'confirmada' || reserva.estado === 'check_in') && (
                      <Button 
                      size="small" 
                      color="primary"
                      startIcon={<RestaurantIcon />}
                      onClick={() => abrirServicios(reserva.id)} >
                      Servicios
                    </Button>
                    )}
  
                    {reserva.estado === 'pendiente' && (
                    <Button
                    size="small"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => cancelarReserva(reserva.id)}
                    >
                     Cancelar
                      </Button>
                        )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Dialog de Servicios */}
        <AgregarServiciosDialog
          open={dialogServiciosOpen}
          onClose={() => setDialogServiciosOpen(false)}
          reservaId={reservaServiciosId}
          onServicioAgregado={cargarReservas}
        />

      {/* Dialog de Detalle */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {reservaDetalle && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Detalle de Reserva</Typography>
                <Chip
                  label={getEstadoLabel(reservaDetalle.estado)}
                  color={getEstadoColor(reservaDetalle.estado)}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Información de la Reserva
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Código de Reserva
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {reservaDetalle.codigo_reserva}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    <HotelIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
                    Habitación
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {reservaDetalle.tipo_habitacion}
                  </Typography>
                  <Typography variant="body2">
                    Habitación {reservaDetalle.habitacion_numero} - Piso {reservaDetalle.piso}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Capacidad: {reservaDetalle.capacidad_personas} personas
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    <EventIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
                    Fechas
                  </Typography>
                  <Typography variant="body2">
                    Check-in: {new Date(reservaDetalle.fecha_entrada).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    Check-out: {new Date(reservaDetalle.fecha_salida).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Huéspedes: {reservaDetalle.numero_huespedes}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    <PersonIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
                    Huésped Principal
                  </Typography>
                  <Typography variant="body2">
                    {reservaDetalle.huesped_nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <EmailIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                    {reservaDetalle.huesped_email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <PhoneIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                    {reservaDetalle.huesped_telefono}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {reservaDetalle.tipo_documento}: {reservaDetalle.numero_documento}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Total
                    </Typography>
                    <Typography variant="h4" color="primary">
                      ${parseFloat(reservaDetalle.precio_total).toFixed(2)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Precio base: ${parseFloat(reservaDetalle.precio_base).toFixed(2)}/noche
                  </Typography>
                </Grid>

                {reservaDetalle.observaciones && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Observaciones
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {reservaDetalle.observaciones}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              {reservaDetalle.estado === 'pendiente' && (
                <Button
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => cancelarReserva(reservaDetalle.id)}
                  disabled={cancelando}
                >
                  {cancelando ? 'Cancelando...' : 'Cancelar Reserva'}
                </Button>
              )}
              <Button onClick={() => setDialogOpen(false)}>
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default MisReservas;