import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
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
  ListItemText,
  alpha
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Restaurant as RestaurantIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const MisServicios = () => {
  const [contrataciones, setContrataciones] = useState([
    {
      contratacion_id: 1,
      servicios_contratados: 'Desayuno Continental, Limpieza Premium',
      fecha_servicio: '2025-11-20',
      fecha_contratacion: '2025-11-10',
      total: 150.00,
      estado: 'pendiente',
      observaciones: 'Por favor sin gluten'
    },
    {
      contratacion_id: 2,
      servicios_contratados: 'Spa Completo, Masaje Relajante',
      fecha_servicio: '2025-11-15',
      fecha_contratacion: '2025-11-05',
      total: 320.00,
      estado: 'confirmado',
      observaciones: null
    },
    {
      contratacion_id: 3,
      servicios_contratados: 'Cena Gourmet, Room Service',
      fecha_servicio: '2025-10-30',
      fecha_contratacion: '2025-10-25',
      total: 280.00,
      estado: 'completado',
      observaciones: null
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [dialogDetalleOpen, setDialogDetalleOpen] = useState(false);
  const [contratacionSeleccionada, setContratacionSeleccionada] = useState(null);
  const [detalleServicios, setDetalleServicios] = useState([
    {
      id: 1,
      servicio_nombre: 'Desayuno Continental',
      servicio_descripcion: 'Buffet completo con frutas, panes y bebidas',
      cantidad: 2,
      precio_unitario: 50.00,
      subtotal: 100.00
    },
    {
      id: 2,
      servicio_nombre: 'Limpieza Premium',
      servicio_descripcion: 'Servicio de limpieza profunda',
      cantidad: 1,
      precio_unitario: 50.00,
      subtotal: 50.00
    }
  ]);

  const verDetalle = (contratacion) => {
    setContratacionSeleccionada(contratacion);
    setDialogDetalleOpen(true);
  };

  const cancelarContratacion = async (contratacionId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta contratación?')) {
      return;
    }
    setSuccess('Contratación cancelada exitosamente');
    setDialogDetalleOpen(false);
    setTimeout(() => setSuccess(''), 3000);
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
      en_proceso: <PendingIcon />,
      completado: <CheckCircleIcon />,
      cancelado: <CancelIcon />
    };
    return iconos[estado] || null;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#C9A86A' }} />
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
        py: 6
      }}
    >
      <Container maxWidth="lg">
        {/* Header Elegante */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              color: '#C9A86A',
              fontWeight: 300,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              mb: 2,
              textShadow: '0 2px 10px rgba(201, 168, 106, 0.3)'
            }}
          >
            Mis Servicios
          </Typography>
          <Box
            sx={{
              width: 80,
              height: 2,
              background: 'linear-gradient(90deg, transparent, #C9A86A, transparent)',
              margin: '0 auto 24px'
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 300,
              letterSpacing: '0.05em'
            }}
          >
            Gestiona tu experiencia premium
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              bgcolor: 'rgba(211, 47, 47, 0.1)',
              color: '#ff6b6b',
              border: '1px solid rgba(211, 47, 47, 0.3)'
            }} 
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              bgcolor: 'rgba(46, 125, 50, 0.1)',
              color: '#69db7c',
              border: '1px solid rgba(46, 125, 50, 0.3)'
            }} 
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Cards de Resumen Premium */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(237, 108, 2, 0.15) 0%, rgba(237, 108, 2, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(237, 108, 2, 0.3)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(237, 108, 2, 0.4)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <PendingIcon sx={{ fontSize: 48, color: '#ed6c02', mb: 2 }} />
                <Typography variant="h3" sx={{ color: '#ed6c02', fontWeight: 300, mb: 1 }}>
                  {contrataciones.filter(c => c.estado === 'pendiente').length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Pendientes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(25, 118, 210, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(25, 118, 210, 0.3)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(25, 118, 210, 0.4)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
                <Typography variant="h3" sx={{ color: '#1976d2', fontWeight: 300, mb: 1 }}>
                  {contrataciones.filter(c => c.estado === 'confirmado' || c.estado === 'en_proceso').length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  En Proceso
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.15) 0%, rgba(46, 125, 50, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(46, 125, 50, 0.3)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(46, 125, 50, 0.4)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: '#2e7d32', mb: 2 }} />
                <Typography variant="h3" sx={{ color: '#2e7d32', fontWeight: 300, mb: 1 }}>
                  {contrataciones.filter(c => c.estado === 'completado').length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Completados
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Lista de Contrataciones Premium */}
        {contrataciones.length === 0 ? (
          <Paper
            sx={{
              background: 'rgba(44, 44, 44, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(201, 168, 106, 0.2)',
              borderRadius: 3,
              py: 8,
              textAlign: 'center'
            }}
          >
            <RestaurantIcon sx={{ fontSize: 80, color: 'rgba(201, 168, 106, 0.5)', mb: 3 }} />
            <Typography variant="h5" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
              No has contratado servicios aún
            </Typography>
            <Button
              variant="contained"
              sx={{
                mt: 3,
                bgcolor: '#C9A86A',
                color: '#1a1a1a',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                '&:hover': {
                  bgcolor: '#d4b574',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(201, 168, 106, 0.4)'
                }
              }}
            >
              Contratar Servicios
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {contrataciones.map((contratacion) => (
              <Grid item xs={12} key={contratacion.contratacion_id}>
                <Card
                  sx={{
                    background: 'rgba(44, 44, 44, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(201, 168, 106, 0.2)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(8px)',
                      border: '1px solid rgba(201, 168, 106, 0.5)',
                      boxShadow: '0 8px 32px rgba(201, 168, 106, 0.3)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3} alignItems="center">
                      {/* ID y Estado */}
                      <Grid item xs={12} sm={2}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="h5"
                            sx={{
                              color: '#C9A86A',
                              fontWeight: 300,
                              mb: 1
                            }}
                          >
                            #{contratacion.contratacion_id}
                          </Typography>
                          <Chip
                            icon={getEstadoIcon(contratacion.estado)}
                            label={getEstadoLabel(contratacion.estado)}
                            color={getEstadoColor(contratacion.estado)}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              letterSpacing: '0.05em'
                            }}
                          />
                        </Box>
                      </Grid>

                      {/* Servicios */}
                      <Grid item xs={12} sm={4}>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#C9A86A',
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                              mb: 0.5,
                              display: 'block'
                            }}
                          >
                            Servicios
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.9)',
                              fontWeight: 300
                            }}
                          >
                            {contratacion.servicios_contratados}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Fechas */}
                      <Grid item xs={12} sm={3}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CalendarIcon sx={{ fontSize: 16, color: '#C9A86A', mr: 1 }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              Servicio
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
                            {new Date(contratacion.fecha_servicio).toLocaleDateString('es-ES')}
                          </Typography>
                          
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            Contratado
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {new Date(contratacion.fecha_contratacion).toLocaleDateString('es-ES')}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Total */}
                      <Grid item xs={12} sm={2}>
                        <Box sx={{ textAlign: 'center' }}>
                          <MoneyIcon sx={{ fontSize: 20, color: '#C9A86A', mb: 0.5 }} />
                          <Typography
                            variant="h5"
                            sx={{
                              color: '#C9A86A',
                              fontWeight: 600,
                              textShadow: '0 2px 10px rgba(201, 168, 106, 0.3)'
                            }}
                          >
                            ${parseFloat(contratacion.total).toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Acciones */}
                      <Grid item xs={12} sm={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="Ver detalle">
                            <IconButton
                              onClick={() => verDetalle(contratacion)}
                              sx={{
                                color: '#C9A86A',
                                '&:hover': {
                                  bgcolor: 'rgba(201, 168, 106, 0.1)',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          {contratacion.estado === 'pendiente' && (
                            <Tooltip title="Cancelar">
                              <IconButton
                                onClick={() => cancelarContratacion(contratacion.contratacion_id)}
                                sx={{
                                  color: '#ff6b6b',
                                  '&:hover': {
                                    bgcolor: 'rgba(255, 107, 107, 0.1)',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Dialog de Detalle Premium con Imagen de Fondo */}
        <Dialog
          open={dialogDetalleOpen}
          onClose={() => setDialogDetalleOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'none',
              boxShadow: 'none',
              overflow: 'hidden'
            }
          }}
        >
          {contratacionSeleccionada && (
            <Box
              sx={{
                position: 'relative',
                backgroundImage: 'url(https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 2
              }}
            >
              {/* Overlay Oscuro */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(180deg, rgba(44, 44, 44, 0.95) 0%, rgba(26, 26, 26, 0.97) 100%)',
                  zIndex: 0
                }}
              />

              {/* Contenido */}
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <DialogTitle>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="h5"
                      sx={{
                        color: '#fff',
                        fontWeight: 300,
                        letterSpacing: '0.05em',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
                      }}
                    >
                      Contratación #{contratacionSeleccionada.contratacion_id}
                    </Typography>
                    <Chip
                      icon={getEstadoIcon(contratacionSeleccionada.estado)}
                      label={getEstadoLabel(contratacionSeleccionada.estado)}
                      color={getEstadoColor(contratacionSeleccionada.estado)}
                      sx={{
                        fontWeight: 600,
                        letterSpacing: '0.05em'
                      }}
                    />
                  </Box>
                </DialogTitle>

                <DialogContent dividers sx={{ borderColor: 'rgba(201, 168, 106, 0.3)' }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#C9A86A',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          display: 'block',
                          mb: 1,
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                        }}
                      >
                        Fecha del Servicio
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.95)',
                          fontWeight: 300,
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                        }}
                      >
                        {new Date(contratacionSeleccionada.fecha_servicio).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#C9A86A',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          display: 'block',
                          mb: 1,
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                        }}
                      >
                        Fecha de Contratación
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.95)',
                          fontWeight: 300,
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                        }}
                      >
                        {new Date(contratacionSeleccionada.fecha_contratacion).toLocaleDateString('es-ES')}
                      </Typography>
                    </Grid>

                    {contratacionSeleccionada.observaciones && (
                      <Grid item xs={12}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#C9A86A',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            display: 'block',
                            mb: 1,
                            textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                          }}
                        >
                          Observaciones
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: 300,
                            textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                          }}
                        >
                          {contratacionSeleccionada.observaciones}
                        </Typography>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#fff',
                          fontWeight: 300,
                          letterSpacing: '0.05em',
                          mt: 2,
                          mb: 2,
                          textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
                        }}
                      >
                        Servicios Contratados
                      </Typography>
                      <Divider sx={{ borderColor: 'rgba(201, 168, 106, 0.3)', mb: 2 }} />
                      
                      <List sx={{ p: 0 }}>
                        {detalleServicios.map((detalle, index) => (
                          <ListItem
                            key={detalle.id}
                            divider={index < detalleServicios.length - 1}
                            sx={{
                              px: 0,
                              py: 2,
                              borderColor: 'rgba(201, 168, 106, 0.2)'
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: '#fff',
                                      fontWeight: 400,
                                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                                    }}
                                  >
                                    {detalle.servicio_nombre}
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: '#C9A86A',
                                      fontWeight: 600,
                                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                                    }}
                                  >
                                    ${parseFloat(detalle.subtotal).toFixed(2)}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: 'rgba(255, 255, 255, 0.7)',
                                      mb: 0.5,
                                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                                    }}
                                  >
                                    {detalle.servicio_descripcion}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: 'rgba(255, 255, 255, 0.6)',
                                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                                    }}
                                  >
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
                      <Paper
                        sx={{
                          p: 3,
                          background: 'rgba(201, 168, 106, 0.15)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(201, 168, 106, 0.3)',
                          borderRadius: 2
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: '#fff',
                              fontWeight: 300,
                              letterSpacing: '0.05em',
                              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
                            }}
                          >
                            Total
                          </Typography>
                          <Typography
                            variant="h3"
                            sx={{
                              color: '#C9A86A',
                              fontWeight: 600,
                              textShadow: '0 3px 15px rgba(201, 168, 106, 0.5)'
                            }}
                          >
                            ${parseFloat(contratacionSeleccionada.total).toFixed(2)}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </DialogContent>

                <DialogActions
                  sx={{
                    bgcolor: 'rgba(26, 26, 26, 0.8)',
                    borderTop: '1px solid rgba(201, 168, 106, 0.3)',
                    p: 2
                  }}
                >
                  <Button
                    onClick={() => setDialogDetalleOpen(false)}
                    sx={{
                      color: '#C9A86A',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      '&:hover': {
                        bgcolor: 'rgba(201, 168, 106, 0.1)'
                      }
                    }}
                  >
                    Cerrar
                  </Button>
                </DialogActions>
              </Box>
            </Box>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default MisServicios;