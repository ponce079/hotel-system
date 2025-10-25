import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
  Spa as SpaIcon,
  LocalLaundryService as LaundryIcon,
  DirectionsCar as TransportIcon,
  MoreHoriz as OtherIcon
} from '@mui/icons-material';
import api from '../config/api';

const categoriaIcons = {
  restaurante: <RestaurantIcon />,
  spa: <SpaIcon />,
  lavanderia: <LaundryIcon />,
  transporte: <TransportIcon />,
  otros: <OtherIcon />
};

const AgregarServiciosDialog = ({ open, onClose, reservaId, onServicioAgregado }) => {
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [serviciosReserva, setServiciosReserva] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agregando, setAgregando] = useState(false);

  // Formulario para agregar servicio
  const [nuevoServicio, setNuevoServicio] = useState({
    servicio_id: '',
    cantidad: 1,
    notas: ''
  });

  useEffect(() => {
    if (open && reservaId) {
      cargarDatos();
    }
  }, [open, reservaId]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar servicios disponibles
      const [serviciosRes, serviciosReservaRes] = await Promise.all([
        api.get('/servicios?activo=true'),
        api.get(`/servicios/reserva/${reservaId}`)
      ]);

      setServiciosDisponibles(serviciosRes.data.data);
      setServiciosReserva(serviciosReservaRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setNuevoServicio({
      ...nuevoServicio,
      [e.target.name]: e.target.value
    });
  };

  const agregarServicio = async () => {
    setError('');

    if (!nuevoServicio.servicio_id) {
      setError('Selecciona un servicio');
      return;
    }

    if (nuevoServicio.cantidad < 1) {
      setError('La cantidad debe ser al menos 1');
      return;
    }

    setAgregando(true);

    try {
      await api.post(`/servicios/reserva/${reservaId}`, nuevoServicio);

      setSuccess('Servicio agregado exitosamente');
      setNuevoServicio({ servicio_id: '', cantidad: 1, notas: '' });
      
      await cargarDatos();
      
      if (onServicioAgregado) {
        onServicioAgregado();
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al agregar servicio');
    } finally {
      setAgregando(false);
    }
  };

  const calcularTotal = () => {
    return serviciosReserva.reduce((total, servicio) => {
      return total + parseFloat(servicio.precio_total);
    }, 0);
  };

  const servicioSeleccionado = serviciosDisponibles.find(
    s => s.id === nuevoServicio.servicio_id
  );

  const precioEstimado = servicioSeleccionado 
    ? parseFloat(servicioSeleccionado.precio) * nuevoServicio.cantidad 
    : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RestaurantIcon />
          <Typography variant="h6">Servicios de la Reserva</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Agregar nuevo servicio */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Agregar Servicio
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      {success}
                    </Alert>
                  )}

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label="Servicio"
                        name="servicio_id"
                        value={nuevoServicio.servicio_id}
                        onChange={handleChange}
                      >
                        <MenuItem value="">
                          <em>Seleccionar...</em>
                        </MenuItem>
                        {serviciosDisponibles.map((servicio) => (
                          <MenuItem key={servicio.id} value={servicio.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                              {categoriaIcons[servicio.categoria]}
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2">{servicio.nombre}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {servicio.categoria} - ${parseFloat(servicio.precio).toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Cantidad"
                        name="cantidad"
                        value={nuevoServicio.cantidad}
                        onChange={handleChange}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center',
                        height: '100%',
                        p: 1,
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                        textAlign: 'center'
                      }}>
                        <Typography variant="caption" color="text.secondary">
                          Precio
                        </Typography>
                        <Typography variant="h6" color="primary">
                          ${precioEstimado.toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Notas (opcional)"
                        name="notas"
                        value={nuevoServicio.notas}
                        onChange={handleChange}
                        placeholder="Ej: Sin cebolla, preferencia de horario, etc."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={agregando ? <CircularProgress size={20} /> : <AddIcon />}
                        onClick={agregarServicio}
                        disabled={agregando || !nuevoServicio.servicio_id}
                      >
                        {agregando ? 'Agregando...' : 'Agregar Servicio'}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Lista de servicios agregados */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Servicios Agregados ({serviciosReserva.length})
              </Typography>

              {serviciosReserva.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay servicios agregados a esta reserva
                  </Typography>
                </Box>
              ) : (
                <>
                  <List>
                    {serviciosReserva.map((servicio, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          bgcolor: 'grey.50',
                          borderRadius: 1,
                          mb: 1,
                          border: 1,
                          borderColor: 'grey.200'
                        }}
                      >
                        <Box sx={{ mr: 2 }}>
                          {categoriaIcons[servicio.categoria]}
                        </Box>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" fontWeight="bold">
                                {servicio.servicio_nombre}
                              </Typography>
                              <Typography variant="h6" color="primary">
                                ${parseFloat(servicio.precio_total).toFixed(2)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                Cantidad: {servicio.cantidad} × ${parseFloat(servicio.precio_unitario).toFixed(2)}
                              </Typography>
                              {servicio.notas && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  📝 {servicio.notas}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {new Date(servicio.fecha_consumo).toLocaleString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="h6">Total Servicios:</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      ${calcularTotal().toFixed(2)}
                    </Typography>
                  </Box>
                </>
              )}
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgregarServiciosDialog;