import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Badge,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Fade
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  Spa as SpaIcon,
  LocalLaundryService as LaundryIcon,
  DirectionsCar as TransportIcon,
  MoreHoriz as OtherIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import api from '../config/api';

// Imágenes premium por categoría
const getImagenCategoria = (categoria) => {
  const imagenes = {
    restaurante: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    lavanderia: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&q=80',
    transporte: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
    otros: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80'
  };
  return imagenes[categoria] || imagenes.otros;
};

const categoriaIcons = {
  restaurante: <RestaurantIcon />,
  spa: <SpaIcon />,
  lavanderia: <LaundryIcon />,
  transporte: <TransportIcon />,
  otros: <OtherIcon />
};

const ContratarServicios = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [servicios, setServicios] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogCarritoOpen, setDialogCarritoOpen] = useState(false);
  const [dialogConfirmOpen, setDialogConfirmOpen] = useState(false);
  const [fechaServicio, setFechaServicio] = useState(new Date());
  const [observaciones, setObservaciones] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      const response = await api.get('/servicios');
      const serviciosActivos = response.data.data.filter(s => s.activo);
      setServicios(serviciosActivos);
    } catch (err) {
      setError('Error al cargar los servicios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = (servicio) => {
    const existente = carrito.find(item => item.id === servicio.id);
    if (existente) {
      setCarrito(carrito.map(item =>
        item.id === servicio.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { ...servicio, cantidad: 1 }]);
    }
  };

  const modificarCantidad = (servicioId, delta) => {
    setCarrito(carrito.map(item => {
      if (item.id === servicioId) {
        const nuevaCantidad = item.cantidad + delta;
        return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item;
      }
      return item;
    }).filter(item => item.cantidad > 0));
  };

  const eliminarDelCarrito = (servicioId) => {
    setCarrito(carrito.filter(item => item.id !== servicioId));
  };

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + (parseFloat(item.precio) * item.cantidad), 0);
  };

  const confirmarContratacion = async () => {
    if (carrito.length === 0) {
      setError('Debe agregar al menos un servicio');
      return;
    }
    try {
      const payload = {
        huesped_id: user.id,
        fecha_servicio: fechaServicio.toISOString().split('T')[0],
        servicios: carrito.map(item => ({
          servicio_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: parseFloat(item.precio)
        })),
        observaciones,
        total: calcularTotal()
      };
      await api.post('/servicios/contratar', payload);
      setSuccess('¡Servicios contratados exitosamente! Le contactaremos pronto.');
      setCarrito([]);
      setDialogConfirmOpen(false);
      setDialogCarritoOpen(false);
      setTimeout(() => navigate('/cliente/mis-servicios'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al contratar servicios');
    }
  };

  const serviciosFiltrados = categoriaFiltro === 'todas'
    ? servicios
    : servicios.filter(s => s.categoria === categoriaFiltro);

  const categorias = ['todas', ...new Set(servicios.map(s => s.categoria))];

  const getColorCategoria = (categoria) => {
    const colores = {
      restaurante: '#C9A86A',
      spa: '#B8956A',
      lavanderia: '#D4AF37',
      transporte: '#A67C52',
      otros: '#8B7355'
    };
    return colores[categoria] || '#C9A86A';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFAFA', py: 6 }}>
      <Container maxWidth="xl">
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
            Servicios Exclusivos
          </Typography>
          <Box sx={{ width: 60, height: 2, bgcolor: '#C9A86A', mx: 'auto', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#666', fontWeight: 300, mb: 3 }}>
            Disfrute de nuestros servicios premium sin necesidad de hospedaje
          </Typography>
          <Badge badgeContent={carrito.length} sx={{ '& .MuiBadge-badge': { bgcolor: '#C9A86A' } }}>
            <Button
              variant="contained"
              startIcon={<CartIcon />}
              onClick={() => setDialogCarritoOpen(true)}
              sx={{
                bgcolor: '#C9A86A',
                px: 4,
                py: 1.5,
                borderRadius: 0,
                letterSpacing: '0.1em',
                '&:hover': { bgcolor: '#B8956A' }
              }}
            >
              VER CARRITO
            </Button>
          </Badge>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 0 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Filtros */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #E0E0E0', borderRadius: 0 }}>
          <Typography
            variant="caption"
            sx={{ color: '#999', letterSpacing: '0.1em', display: 'block', mb: 2 }}
          >
            CATEGORÍAS
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {categorias.map(cat => (
              <Chip
                key={cat}
                label={(cat === 'todas' ? 'TODAS' : cat.toUpperCase())}
                onClick={() => setCategoriaFiltro(cat)}
                sx={{
                  bgcolor: categoriaFiltro === cat ? '#C9A86A' : 'transparent',
                  color: categoriaFiltro === cat ? 'white' : '#666',
                  borderColor: '#C9A86A',
                  borderRadius: 0,
                  letterSpacing: '0.1em',
                  fontWeight: 500,
                  px: 3,
                  '&:hover': {
                    bgcolor: categoriaFiltro === cat ? '#B8956A' : 'rgba(201, 168, 106, 0.1)'
                  }
                }}
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>

        {/* Grid de servicios */}
        <Grid container spacing={4}>
          {serviciosFiltrados.map((servicio, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={servicio.id}>
              <Fade in timeout={600 + index * 100}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #E0E0E0',
                    borderRadius: 0,
                    transition: 'all 0.3s',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
                      '& .service-image': {
                        transform: 'scale(1.1)'
                      }
                    }
                  }}
                >
                  <Box
                    sx={{
                      height: 200,
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <Box
                      className="service-image"
                      sx={{
                        height: '100%',
                        backgroundImage: `url(${getImagenCategoria(servicio.categoria)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 0.6s ease'
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(to bottom, transparent 0%, ${getColorCategoria(servicio.categoria)}90 100%)`
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        color: 'white'
                      }}
                    >
                      {categoriaIcons[servicio.categoria]}
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 300,
                        mb: 1,
                        fontFamily: '"Playfair Display", serif',
                        color: '#2C2C2C'
                      }}
                    >
                      {servicio.nombre}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 2, minHeight: 40 }}>
                      {servicio.descripcion || 'Servicio de calidad premium'}
                    </Typography>
                    <Chip
                      label={servicio.categoria.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: 'transparent',
                        color: getColorCategoria(servicio.categoria),
                        borderColor: getColorCategoria(servicio.categoria),
                        borderRadius: 0,
                        fontSize: '0.7rem',
                        letterSpacing: '0.1em'
                      }}
                      variant="outlined"
                    />
                    <Typography
                      variant="h4"
                      sx={{
                        mt: 2,
                        color: '#C9A86A',
                        fontWeight: 300,
                        fontFamily: '"Playfair Display", serif'
                      }}
                    >
                      ${parseFloat(servicio.precio).toFixed(2)}
                    </Typography>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => agregarAlCarrito(servicio)}
                      sx={{
                        borderColor: '#C9A86A',
                        color: '#C9A86A',
                        borderRadius: 0,
                        py: 1.5,
                        letterSpacing: '0.1em',
                        fontWeight: 500,
                        '&:hover': {
                          borderColor: '#B8956A',
                          bgcolor: 'rgba(201, 168, 106, 0.05)'
                        }
                      }}
                    >
                      AGREGAR
                    </Button>
                  </Box>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {serviciosFiltrados.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: 'center',
              border: '1px solid #E0E0E0',
              borderRadius: 0
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: '#999', fontWeight: 300 }}
            >
              No hay servicios disponibles en esta categoría
            </Typography>
          </Paper>
        )}

        {/* Dialog Carrito */}
        <Dialog
          open={dialogCarritoOpen}
          onClose={() => setDialogCarritoOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 0, border: '1px solid #E0E0E0' } }}
        >
          <DialogTitle sx={{ borderBottom: '1px solid #E0E0E0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CartIcon sx={{ color: '#C9A86A' }} />
              <Typography
                variant="h5"
                sx={{ fontWeight: 300, fontFamily: '"Playfair Display", serif' }}
              >
                Mi Carrito
              </Typography>
              <Chip
                label={carrito.length}
                sx={{ bgcolor: '#C9A86A', color: 'white', borderRadius: 0 }}
              />
            </Box>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            {carrito.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CartIcon sx={{ fontSize: 80, color: '#E0E0E0', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#999', fontWeight: 300 }}>
                  Su carrito está vacío
                </Typography>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  Agregue servicios para continuar
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {carrito.map((item, index) => (
                  <Box key={item.id}>
                    {index > 0 && <Divider />}
                    <ListItem sx={{ py: 3, px: 0 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 400, mb: 0.5 }}>
                          {item.nombre}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          ${parseFloat(item.precio).toFixed(2)} c/u
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => modificarCantidad(item.id, -1)}
                            sx={{
                              border: '1px solid #E0E0E0',
                              borderRadius: 0,
                              '&:hover': { borderColor: '#C9A86A', color: '#C9A86A' }
                            }}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography
                            variant="h6"
                            sx={{ minWidth: 40, textAlign: 'center', fontWeight: 400 }}
                          >
                            {item.cantidad}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => modificarCantidad(item.id, 1)}
                            sx={{
                              border: '1px solid #E0E0E0',
                              borderRadius: 0,
                              '&:hover': { borderColor: '#C9A86A', color: '#C9A86A' }
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                        <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: '#C9A86A',
                              fontFamily: '"Playfair Display", serif',
                              fontWeight: 400
                            }}
                          >
                            ${(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => eliminarDelCarrito(item.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </ListItem>
                  </Box>
                ))}
              </List>
            )}

            {carrito.length > 0 && (
              <Box
                sx={{
                  mt: 3,
                  p: 3,
                  bgcolor: '#FAFAFA',
                  border: '1px solid #E0E0E0'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 300 }}>
                    Total
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      color: '#C9A86A',
                      fontFamily: '"Playfair Display", serif',
                      fontWeight: 300
                    }}
                  >
                    ${calcularTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDialogCarritoOpen(false)} sx={{ borderRadius: 0 }}>
              CERRAR
            </Button>
            <Button
              variant="contained"
              onClick={() => setDialogConfirmOpen(true)}
              disabled={carrito.length === 0}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: '#C9A86A',
                borderRadius: 0,
                px: 4,
                letterSpacing: '0.1em',
                '&:hover': { bgcolor: '#B8956A' }
              }}
            >
              CONTINUAR
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Confirmación */}
        <Dialog
          open={dialogConfirmOpen}
          onClose={() => setDialogConfirmOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 0, border: '1px solid #E0E0E0' } }}
        >
          <DialogTitle sx={{ borderBottom: '1px solid #E0E0E0' }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 300, fontFamily: '"Playfair Display", serif' }}
            >
              Confirmar Contratación
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ p: 4 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha del Servicio"
                value={fechaServicio}
                onChange={(newValue) => setFechaServicio(newValue)}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '&:hover fieldset': { borderColor: '#C9A86A' },
                        '&.Mui-focused fieldset': { borderColor: '#C9A86A' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#C9A86A' }
                    }
                  }
                }}
              />
            </LocalizationProvider>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observaciones (opcional)"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Indique horarios preferidos u otras indicaciones..."
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  '&:hover fieldset': { borderColor: '#C9A86A' },
                  '&.Mui-focused fieldset': { borderColor: '#C9A86A' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#C9A86A' }
              }}
            />

            <Paper elevation={0} sx={{ p: 3, bgcolor: '#FAFAFA', border: '1px solid #E0E0E0' }}>
              <Typography
                variant="caption"
                sx={{ color: '#999', letterSpacing: '0.1em', display: 'block', mb: 2 }}
              >
                RESUMEN DE LA CONTRATACIÓN
              </Typography>
              {carrito.map(item => (
                <Typography key={item.id} variant="body2" sx={{ mb: 1, color: '#666' }}>
                  • {item.nombre} x{item.cantidad} = ${(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                </Typography>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 300 }}>
                  Total
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#C9A86A',
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 300
                  }}
                >
                  ${calcularTotal().toFixed(2)}
                </Typography>
              </Box>
            </Paper>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDialogConfirmOpen(false)} sx={{ borderRadius: 0 }}>
              CANCELAR
            </Button>
            <Button
              variant="contained"
              onClick={confirmarContratacion}
              endIcon={<CheckCircleIcon />}
              sx={{
                bgcolor: '#C9A86A',
                borderRadius: 0,
                px: 4,
                letterSpacing: '0.1em',
                '&:hover': { bgcolor: '#B8956A' }
              }}
            >
              CONFIRMAR
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ContratarServicios;