import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
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

const categoriaLabels = {
  restaurante: 'Restaurante',
  spa: 'Spa',
  lavanderia: 'Lavandería',
  transporte: 'Transporte',
  otros: 'Otros'
};

const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(false);
  const [servicioActual, setServicioActual] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'restaurante',
    precio: '',
    activo: true
  });

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      const response = await api.get('/servicios');
      setServicios(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const abrirDialogNuevo = () => {
    setEditando(false);
    setServicioActual({
      nombre: '',
      descripcion: '',
      categoria: 'restaurante',
      precio: '',
      activo: true
    });
    setDialogOpen(true);
  };

  const abrirDialogEditar = (servicio) => {
    setEditando(true);
    setServicioActual(servicio);
    setDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setServicioActual({
      ...servicioActual,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const guardarServicio = async () => {
    setError('');

    if (!servicioActual.nombre || !servicioActual.categoria || !servicioActual.precio) {
      setError('Nombre, categoría y precio son requeridos');
      return;
    }

    try {
      if (editando) {
        await api.put(`/servicios/${servicioActual.id}`, servicioActual);
        setSuccess('Servicio actualizado exitosamente');
      } else {
        await api.post('/servicios', servicioActual);
        setSuccess('Servicio creado exitosamente');
      }

      setDialogOpen(false);
      await cargarServicios();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar servicio');
    }
  };

  const eliminarServicio = async (id) => {
    if (!window.confirm('¿Estás seguro de desactivar este servicio?')) {
      return;
    }

    try {
      await api.delete(`/servicios/${id}`);
      setSuccess('Servicio desactivado exitosamente');
      await cargarServicios();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar servicio');
    }
  };

  const agruparPorCategoria = () => {
    const grupos = {};
    servicios.forEach(servicio => {
      if (!grupos[servicio.categoria]) {
        grupos[servicio.categoria] = [];
      }
      grupos[servicio.categoria].push(servicio);
    });
    return grupos;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const serviciosPorCategoria = agruparPorCategoria();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Servicios del Hotel
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona los servicios adicionales disponibles
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirDialogNuevo}
        >
          Nuevo Servicio
        </Button>
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

      {Object.keys(serviciosPorCategoria).length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No hay servicios registrados
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Comienza agregando servicios disponibles en el hotel
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={abrirDialogNuevo}
          >
            Agregar Primer Servicio
          </Button>
        </Paper>
      ) : (
        Object.entries(serviciosPorCategoria).map(([categoria, serviciosCategoria]) => (
          <Box key={categoria} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {categoriaIcons[categoria]}
              <Typography variant="h5" sx={{ ml: 1 }}>
                {categoriaLabels[categoria]}
              </Typography>
              <Chip 
                label={serviciosCategoria.length} 
                size="small" 
                sx={{ ml: 2 }} 
              />
            </Box>

            <Grid container spacing={3}>
              {serviciosCategoria.map((servicio) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={servicio.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="h6" component="div">
                          {servicio.nombre}
                        </Typography>
                        {!servicio.activo && (
                          <Chip label="Inactivo" size="small" color="default" />
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                        {servicio.descripcion || 'Sin descripción'}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" color="primary">
                          ${parseFloat(servicio.precio).toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Tooltip title="Editar">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => abrirDialogEditar(servicio)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {servicio.activo && (
                        <Tooltip title="Desactivar">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => eliminarServicio(servicio.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}

      {/* Dialog de Crear/Editar */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editando ? 'Editar Servicio' : 'Nuevo Servicio'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Nombre del Servicio"
                name="nombre"
                value={servicioActual.nombre}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                name="descripcion"
                value={servicioActual.descripcion}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                select
                label="Categoría"
                name="categoria"
                value={servicioActual.categoria}
                onChange={handleChange}
              >
                <MenuItem value="restaurante">Restaurante</MenuItem>
                <MenuItem value="spa">Spa</MenuItem>
                <MenuItem value="lavanderia">Lavandería</MenuItem>
                <MenuItem value="transporte">Transporte</MenuItem>
                <MenuItem value="otros">Otros</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Precio"
                name="precio"
                type="number"
                value={servicioActual.precio}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            {editando && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Estado"
                  name="activo"
                  value={servicioActual.activo}
                  onChange={handleChange}
                >
                  <MenuItem value={true}>Activo</MenuItem>
                  <MenuItem value={false}>Inactivo</MenuItem>
                </TextField>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={guardarServicio} variant="contained">
            {editando ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Servicios;