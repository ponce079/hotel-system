import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  Hotel as HotelIcon,
  People,
  AttachMoney
} from '@mui/icons-material';
import api from '../config/api';

const estadoColors = {
  disponible: 'success',
  ocupada: 'error',
  limpieza: 'warning',
  mantenimiento: 'info',
  reservada: 'primary'
};

const Habitaciones = () => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [tiposHabitacion, setTiposHabitacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    numero: '',
    piso: '',
    tipo_habitacion_id: '',
    estado: 'disponible',
    notas: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [habitacionesRes, tiposRes] = await Promise.all([
        api.get('/habitaciones'),
        api.get('/tipos-habitacion')
      ]);
      setHabitaciones(habitacionesRes.data.data);
      setTiposHabitacion(tiposRes.data.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (habitacion = null) => {
    if (habitacion) {
      setEditingId(habitacion.id);
      setFormData({
        numero: habitacion.numero,
        piso: habitacion.piso,
        tipo_habitacion_id: habitacion.tipo_habitacion_id,
        estado: habitacion.estado,
        notas: habitacion.notas || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        numero: '',
        piso: '',
        tipo_habitacion_id: '',
        estado: 'disponible',
        notas: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/habitaciones/${editingId}`, formData);
        setSuccess('Habitación actualizada exitosamente');
      } else {
        await api.post('/habitaciones', formData);
        setSuccess('Habitación creada exitosamente');
      }
      handleCloseDialog();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar la habitación');
    }
  };

  const handleChangeEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/habitaciones/${id}/estado`, { estado: nuevoEstado });
      setSuccess('Estado actualizado exitosamente');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cambiar el estado');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestión de Habitaciones</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Habitación
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3}>
        {habitaciones.map((habitacion) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={habitacion.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h5" component="div">
                    {habitacion.numero}
                  </Typography>
                  <Chip
                    label={habitacion.estado}
                    color={estadoColors[habitacion.estado]}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>

                <Typography color="text.secondary" gutterBottom>
                  {habitacion.tipo_nombre}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <HotelIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Piso {habitacion.piso}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <People fontSize="small" color="action" />
                    <Typography variant="body2">
                      Capacidad: {habitacion.capacidad_personas} personas
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney fontSize="small" color="action" />
                    <Typography variant="body2">
                      ${habitacion.precio_base}/noche
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => handleOpenDialog(habitacion)}
                >
                  Editar
                </Button>
                <TextField
                  select
                  size="small"
                  value={habitacion.estado}
                  onChange={(e) => handleChangeEstado(habitacion.id, e.target.value)}
                  sx={{ ml: 'auto', minWidth: 120 }}
                >
                  <MenuItem value="disponible">Disponible</MenuItem>
                  <MenuItem value="ocupada">Ocupada</MenuItem>
                  <MenuItem value="limpieza">Limpieza</MenuItem>
                  <MenuItem value="mantenimiento">Mantenimiento</MenuItem>
                  <MenuItem value="reservada">Reservada</MenuItem>
                </TextField>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para crear/editar habitación */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Editar Habitación' : 'Nueva Habitación'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Piso"
                name="piso"
                value={formData.piso}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Tipo de Habitación"
                name="tipo_habitacion_id"
                value={formData.tipo_habitacion_id}
                onChange={handleChange}
                required
              >
                {tiposHabitacion.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre} - ${tipo.precio_base}/noche
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
              >
                <MenuItem value="disponible">Disponible</MenuItem>
                <MenuItem value="ocupada">Ocupada</MenuItem>
                <MenuItem value="limpieza">Limpieza</MenuItem>
                <MenuItem value="mantenimiento">Mantenimiento</MenuItem>
                <MenuItem value="reservada">Reservada</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notas"
                name="notas"
                value={formData.notas}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Habitaciones;
