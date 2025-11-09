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
  CardMedia,
  CardActions,
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
  ListItemSecondaryAction
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
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import api from '../config/api';

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
      // Filtrar solo servicios activos
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
        item.id === servicio.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
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
      setError('Debes agregar al menos un servicio');
      return;
    }

    try {
      // Crear la contratación de servicios
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

      const response = await api.post('/servicios/contratar', payload);
      
      setSuccess('¡Servicios contratados exitosamente! Te contactaremos pronto.');
      setCarrito([]);
      setDialogConfirmOpen(false);
      setDialogCarritoOpen(false);
      
      setTimeout(() => {
        navigate('/cliente/mis-servicios')
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al contratar servicios');
    }
  };

  const serviciosFiltrados = categoriaFiltro === 'todas'
    ? servicios
    : servicios.filter(s => s.categoria === categoriaFiltro);

  const categorias = ['todas', ...new Set(servicios.map(s => s.categoria))];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Contratar Servicios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Disfruta de nuestros servicios sin necesidad de hospedaje
          </Typography>
        </Box>
        <Badge badgeContent={carrito.length} color="primary">
          <Button
            variant="contained"
            startIcon={<CartIcon />}
            onClick={() => setDialogCarritoOpen(true)}
            size="large"
          >
            Ver Carrito
          </Button>
        </Badge>
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

      {/* Filtros por categoría */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categorias.map(cat => (
            <Chip
              key={cat}
              label={cat === 'todas' ? 'Todas' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              onClick={() => setCategoriaFiltro(cat)}
              color={categoriaFiltro === cat ? 'primary' : 'default'}
              variant={categoriaFiltro === cat ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Paper>

      {/* Grid de servicios */}
      <Grid container spacing={3}>
        {serviciosFiltrados.map((servicio) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={servicio.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  height: 140,
                  bgcolor: `${getColorCategoria(servicio.categoria)}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box sx={{ color: getColorCategoria(servicio.categoria), fontSize: 60 }}>
                  {categoriaIcons[servicio.categoria]}
                </Box>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {servicio.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {servicio.descripcion || 'Servicio de calidad premium'}
                </Typography>
                <Chip
                  label={servicio.categoria}
                  size="small"
                  sx={{ mb: 1 }}
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
                  ${parseFloat(servicio.precio).toFixed(2)}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => agregarAlCarrito(servicio)}
                >
                  Agregar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {serviciosFiltrados.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No hay servicios disponibles en esta categoría
          </Typography>
        </Paper>
      )}

      {/* Dialog del Carrito */}
      <Dialog
        open={dialogCarritoOpen}
        onClose={() => setDialogCarritoOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CartIcon />
            <Typography variant="h6">Mi Carrito</Typography>
            <Chip label={carrito.length} size="small" color="primary" />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {carrito.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              Tu carrito está vacío. Agrega servicios para continuar.
            </Typography>
          ) : (
            <List>
              {carrito.map((item) => (
                <ListItem key={item.id} divider>
                  <ListItemText
                    primary={item.nombre}
                    secondary={`$${parseFloat(item.precio).toFixed(2)} c/u`}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => modificarCantidad(item.id, -1)}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography variant="body1" sx={{ minWidth: 30, textAlign: 'center' }}>
                      {item.cantidad}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => modificarCantidad(item.id, 1)}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <ListItemSecondaryAction>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body1" fontWeight="bold">
                        ${(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                      </Typography>
                      <IconButton
                        edge="end"
                        size="small"
                        color="error"
                        onClick={() => eliminarDelCarrito(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
          
          {carrito.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  ${calcularTotal().toFixed(2)}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogCarritoOpen(false)}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            onClick={() => setDialogConfirmOpen(true)}
            disabled={carrito.length === 0}
          >
            Continuar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmación */}
      <Dialog
        open={dialogConfirmOpen}
        onClose={() => setDialogConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Contratación</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box sx={{ mb: 3, mt: 2 }}>
              <DatePicker
                label="Fecha del Servicio"
                value={fechaServicio}
                onChange={(newValue) => setFechaServicio(newValue)}
                minDate={new Date()}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
          </LocalizationProvider>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones (opcional)"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Indica horarios preferidos u otras indicaciones..."
            sx={{ mb: 2 }}
          />

          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              Resumen de la contratación:
            </Typography>
            {carrito.map(item => (
              <Typography key={item.id} variant="body2" sx={{ mb: 0.5 }}>
                • {item.nombre} x{item.cantidad} = ${(parseFloat(item.precio) * item.cantidad).toFixed(2)}
              </Typography>
            ))}
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" color="primary">
              Total: ${calcularTotal().toFixed(2)}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={confirmarContratacion}>
            Confirmar Contratación
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

const getColorCategoria = (categoria) => {
  const colores = {
    restaurante: '#d32f2f',
    spa: '#7b1fa2',
    lavanderia: '#0288d1',
    transporte: '#f57c00',
    otros: '#455a64'
  };
  return colores[categoria] || '#757575';
};

export default ContratarServicios;