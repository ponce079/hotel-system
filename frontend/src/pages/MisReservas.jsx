import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
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
  Divider,
  Fade,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Hotel as HotelIcon,
  EventNote as EventIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Restaurant as RestaurantIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import api from '../config/api';
import AgregarServiciosDialog from '../components/AgregarServiciosDialog';

// Imágenes por tipo de habitación
const getHabitacionImagen = (tipoHabitacion) => {
  const imagenes = {
    'Individual': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    'Doble': 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
    'Triple': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
    'Suite': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    'Suite Presidencial': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80'
  };
  return imagenes[tipoHabitacion] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80';
};

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
    if (!window.confirm('¿Está seguro de cancelar esta reserva?')) {
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
      pendiente: '#FFB74D',
      confirmada: '#4FC3F7',
      check_in: '#C9A86A',
      check_out: '#90A4AE',
      cancelada: '#E57373'
    };
    return colores[estado] || '#90A4AE';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      check_in: 'Check-in',
      check_out: 'Finalizada',
      cancelada: 'Cancelada'
    };
    return labels[estado] || estado;
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#FAFAFA' }}>
        <CircularProgress sx={{ color: '#C9A86A' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFAFA', py: 6 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 300,
              mb: 1,
              fontFamily: '"Playfair Display", serif',
              color: '#2C2C2C'
            }}
          >
            Mis Reservas
          </Typography>
          <Box sx={{ width: 60, height: 2, bgcolor: '#C9A86A', mx: 'auto', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#666', fontWeight: 300, mb: 3 }}>
            Gestione sus reservas y consulte su historial
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/cliente/nueva-reserva')}
            sx={{
              bgcolor: '#C9A86A',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: 0,
              letterSpacing: '0.1em',
              '&:hover': {
                bgcolor: '#B8956A'
              }
            }}
          >
            NUEVA RESERVA
          </Button>
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
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {reservas.length === 0 ? (
          <Fade in timeout={600}>
            <Paper
              elevation={0}
              sx={{
                p: 8,
                textAlign: 'center',
                border: '1px solid #E0E0E0',
                borderRadius: 0
              }}
            >
              <HotelIcon sx={{ fontSize: 100, color: '#C9A86A', mb: 3, opacity: 0.5 }} />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 300,
                  mb: 2,
                  fontFamily: '"Playfair Display", serif',
                  color: '#2C2C2C'
                }}
              >
                No Tiene Reservas
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', mb: 4, fontWeight: 300 }}>
                Comience a planificar su estadía creando una nueva reserva
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/cliente/nueva-reserva')}
                sx={{
                  bgcolor: '#C9A86A',
                  px: 4,
                  py: 1.5,
                  borderRadius: 0,
                  '&:hover': { bgcolor: '#B8956A' }
                }}
              >
                CREAR PRIMERA RESERVA
              </Button>
            </Paper>
          </Fade>
        ) : (
          <Grid container spacing={4}>
            {reservas.map((reserva, index) => (
              <Grid item xs={12} key={reserva.id}>
                <Fade in timeout={600 + index * 100}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid #E0E0E0',
                      borderRadius: 0,
                      overflow: 'hidden',
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <Grid container>
                      {/* Imagen de la habitación */}
                      <Grid item xs={12} md={4}>
                        <Box
                          sx={{
                            height: { xs: 250, md: '100%' },
                            minHeight: { md: 300 },
                            backgroundImage: `url(${getHabitacionImagen(reserva.tipo_habitacion)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative'
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 16,
                              left: 16,
                              bgcolor: getEstadoColor(reserva.estado),
                              color: 'white',
                              px: 2,
                              py: 0.5,
                              fontWeight: 500,
                              fontSize: '0.85rem',
                              letterSpacing: '0.1em'
                            }}
                          >
                            {getEstadoLabel(reserva.estado).toUpperCase()}
                          </Box>
                        </Box>
                      </Grid>

                      {/* Contenido */}
                      <Grid item xs={12} md={8}>
                        <CardContent sx={{ p: 4 }}>
                          <Box sx={{ mb: 3 }}>
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 300,
                                mb: 1,
                                fontFamily: '"Playfair Display", serif',
                                color: '#2C2C2C'
                              }}
                            >
                              {reserva.tipo_habitacion}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#999', fontWeight: 300 }}>
                              Habitación {reserva.habitacion_numero}
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 3 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#999',
                                letterSpacing: '0.1em',
                                display: 'block',
                                mb: 0.5
                              }}
                            >
                              CÓDIGO DE RESERVA
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontFamily: '"Courier New", monospace',
                                color: '#C9A86A',
                                letterSpacing: '0.15em'
                              }}
                            >
                              {reserva.codigo_reserva}
                            </Typography>
                          </Box>

                          <Divider sx={{ my: 3 }} />

                          <Grid container spacing={3}>
                            <Grid item xs={6} sm={3}>
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#999',
                                    letterSpacing: '0.1em',
                                    display: 'block'
                                  }}
                                >
                                  CHECK-IN
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {new Date(reserva.fecha_entrada).toLocaleDateString('es-AR', {
                                    day: '2-digit',
                                    month: 'short'
                                  })}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={6} sm={3}>
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#999',
                                    letterSpacing: '0.1em',
                                    display: 'block'
                                  }}
                                >
                                  CHECK-OUT
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {new Date(reserva.fecha_salida).toLocaleDateString('es-AR', {
                                    day: '2-digit',
                                    month: 'short'
                                  })}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={6} sm={3}>
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#999',
                                    letterSpacing: '0.1em',
                                    display: 'block'
                                  }}
                                >
                                  HUÉSPEDES
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {reserva.numero_huespedes} {reserva.numero_huespedes === 1 ? 'persona' : 'personas'}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={6} sm={3}>
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#999',
                                    letterSpacing: '0.1em',
                                    display: 'block'
                                  }}
                                >
                                  TOTAL
                                </Typography>
                                <Typography
                                  variant="h5"
                                  sx={{
                                    color: '#C9A86A',
                                    fontWeight: 300,
                                    fontFamily: '"Playfair Display", serif'
                                  }}
                                >
                                  ${parseFloat(reserva.precio_total).toFixed(2)}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                            <Button
                              variant="outlined"
                              onClick={() => verDetalle(reserva.id)}
                              endIcon={<ArrowForwardIcon />}
                              sx={{
                                borderColor: '#C9A86A',
                                color: '#C9A86A',
                                borderRadius: 0,
                                px: 3,
                                '&:hover': {
                                  borderColor: '#B8956A',
                                  bgcolor: 'rgba(201, 168, 106, 0.05)'
                                }
                              }}
                            >
                              VER DETALLE
                            </Button>

                            {(reserva.estado === 'confirmada' || reserva.estado === 'check_in') && (
                              <Button
                                variant="outlined"
                                startIcon={<RestaurantIcon />}
                                onClick={() => abrirServicios(reserva.id)}
                                sx={{
                                  borderColor: '#C9A86A',
                                  color: '#C9A86A',
                                  borderRadius: 0,
                                  px: 3,
                                  '&:hover': {
                                    borderColor: '#B8956A',
                                    bgcolor: 'rgba(201, 168, 106, 0.05)'
                                  }
                                }}
                              >
                                SERVICIOS
                              </Button>
                            )}

                            {reserva.estado === 'pendiente' && (
                              <Button
                                variant="outlined"
                                startIcon={<CancelIcon />}
                                onClick={() => cancelarReserva(reserva.id)}
                                sx={{
                                  borderColor: '#C62828',
                                  color: '#C62828',
                                  borderRadius: 0,
                                  px: 3,
                                  '&:hover': {
                                    borderColor: '#B71C1C',
                                    bgcolor: 'rgba(198, 40, 40, 0.05)'
                                  }
                                }}
                              >
                                CANCELAR
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Grid>
                    </Grid>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Dialog de Servicios */}
        <AgregarServiciosDialog
          open={dialogServiciosOpen}
          onClose={() => setDialogServiciosOpen(false)}
          reservaId={reservaServiciosId}
          onServicioAgregado={cargarReservas}
        />

        {/* Dialog de Detalle con Imagen de Fondo */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 0,
              border: '1px solid #E0E0E0',
              overflow: 'hidden',
              position: 'relative',
              backgroundImage: reservaDetalle ? `url(${getHabitacionImagen(reservaDetalle.tipo_habitacion)})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }
          }}
        >
          {reservaDetalle && (
            <>
              {/* Overlay oscuro para legibilidad */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, rgba(44, 44, 44, 0.95), rgba(26, 26, 26, 0.97))',
                  zIndex: 0
                }}
              />

              <DialogTitle 
                sx={{ 
                  borderBottom: '1px solid rgba(201, 168, 106, 0.3)',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 300,
                      fontFamily: '"Playfair Display", serif',
                      color: 'white'
                    }}
                  >
                    Detalle de Reserva
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: getEstadoColor(reservaDetalle.estado),
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      fontSize: '0.85rem',
                      letterSpacing: '0.1em'
                    }}
                  >
                    {getEstadoLabel(reservaDetalle.estado).toUpperCase()}
                  </Box>
                </Box>
              </DialogTitle>

              <DialogContent 
                dividers 
                sx={{ 
                  p: 4, 
                  position: 'relative',
                  zIndex: 1,
                  borderColor: 'rgba(201, 168, 106, 0.3)'
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography
                      variant="caption"
                      sx={{ color: '#C9A86A', letterSpacing: '0.1em' }}
                    >
                      CÓDIGO DE RESERVA
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: '"Courier New", monospace',
                        color: '#C9A86A',
                        letterSpacing: '0.15em',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      {reservaDetalle.codigo_reserva}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#C9A86A', letterSpacing: '0.1em' }}>
                      HABITACIÓN
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 300, color: 'white' }}>
                      {reservaDetalle.tipo_habitacion}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Habitación {reservaDetalle.habitacion_numero} • Piso {reservaDetalle.piso}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                      Capacidad: {reservaDetalle.capacidad_personas} personas
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#C9A86A', letterSpacing: '0.1em' }}>
                      FECHAS
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      Check-in: {new Date(reservaDetalle.fecha_entrada).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      Check-out: {new Date(reservaDetalle.fecha_salida).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, color: 'white' }}>
                      Huéspedes: {reservaDetalle.numero_huespedes}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ borderColor: 'rgba(201, 168, 106, 0.3)' }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#C9A86A', letterSpacing: '0.1em' }}>
                      HUÉSPED PRINCIPAL
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'white' }}>
                      {reservaDetalle.huesped_nombre}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {reservaDetalle.huesped_email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {reservaDetalle.huesped_telefono}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                      {reservaDetalle.tipo_documento}: {reservaDetalle.numero_documento}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ borderColor: 'rgba(201, 168, 106, 0.3)' }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 3,
                        bgcolor: 'rgba(201, 168, 106, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(201, 168, 106, 0.3)'
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 300, color: 'white' }}>
                        Total
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          color: '#C9A86A',
                          fontWeight: 300,
                          fontFamily: '"Playfair Display", serif',
                          textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                        }}
                      >
                        ${parseFloat(reservaDetalle.precio_total).toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1, display: 'block' }}>
                      Precio base: ${parseFloat(reservaDetalle.precio_base).toFixed(2)}/noche
                    </Typography>
                  </Grid>

                  {reservaDetalle.observaciones && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#C9A86A', letterSpacing: '0.1em' }}>
                        OBSERVACIONES
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        {reservaDetalle.observaciones}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>

              <DialogActions sx={{ p: 3, position: 'relative', zIndex: 1, bgcolor: 'rgba(26, 26, 26, 0.9)' }}>
                {reservaDetalle.estado === 'pendiente' && (
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => cancelarReserva(reservaDetalle.id)}
                    disabled={cancelando}
                    sx={{
                      borderColor: '#E57373',
                      color: '#E57373',
                      borderRadius: 0,
                      '&:hover': {
                        borderColor: '#EF5350',
                        bgcolor: 'rgba(229, 115, 115, 0.1)'
                      }
                    }}
                  >
                    {cancelando ? 'CANCELANDO...' : 'CANCELAR RESERVA'}
                  </Button>
                )}
                <Button
                  onClick={() => setDialogOpen(false)}
                  sx={{
                    borderRadius: 0,
                    color: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      color: '#C9A86A',
                      bgcolor: 'rgba(201, 168, 106, 0.1)'
                    }
                  }}
                >
                  CERRAR
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default MisReservas;