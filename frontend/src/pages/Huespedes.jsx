import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search
} from '@mui/icons-material';
import api from '../config/api';
import { format } from 'date-fns';

const Huespedes = () => {
  const [huespedes, setHuespedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipo_documento: 'DNI',
    numero_documento: '',
    fecha_nacimiento: '',
    nacionalidad: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    pais: '',
    notas: ''
  });

  useEffect(() => {
    fetchHuespedes();
  }, [searchTerm]);

  const fetchHuespedes = async () => {
    try {
      const response = await api.get('/huespedes', {
        params: { search: searchTerm }
      });
      setHuespedes(response.data.data);
    } catch (error) {
      console.error('Error al cargar huéspedes:', error);
      setError('Error al cargar los huéspedes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (huesped = null) => {
    if (huesped) {
      setEditingId(huesped.id);
      setFormData({
        nombre: huesped.nombre,
        apellido: huesped.apellido,
        tipo_documento: huesped.tipo_documento,
        numero_documento: huesped.numero_documento,
        fecha_nacimiento: huesped.fecha_nacimiento ? format(new Date(huesped.fecha_nacimiento), 'yyyy-MM-dd') : '',
        nacionalidad: huesped.nacionalidad || '',
        email: huesped.email || '',
        telefono: huesped.telefono || '',
        direccion: huesped.direccion || '',
        ciudad: huesped.ciudad || '',
        pais: huesped.pais || '',
        notas: huesped.notas || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: '',
        apellido: '',
        tipo_documento: 'DNI',
        numero_documento: '',
        fecha_nacimiento: '',
        nacionalidad: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        pais: '',
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
        await api.put(`/huespedes/${editingId}`, formData);
        setSuccess('Huésped actualizado exitosamente');
      } else {
        await api.post('/huespedes', formData);
        setSuccess('Huésped creado exitosamente');
      }
      handleCloseDialog();
      fetchHuespedes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar el huésped');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este huésped?')) {
      try {
        await api.delete(`/huespedes/${id}`);
        setSuccess('Huésped eliminado exitosamente');
        fetchHuespedes();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(error.response?.data?.message || 'Error al eliminar el huésped');
      }
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
        <Typography variant="h4">Gestión de Huéspedes</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Huésped
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre, apellido, documento o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre Completo</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Nacionalidad</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {huespedes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No se encontraron huéspedes
                </TableCell>
              </TableRow>
            ) : (
              huespedes.map((huesped) => (
                <TableRow key={huesped.id}>
                  <TableCell>{`${huesped.nombre} ${huesped.apellido}`}</TableCell>
                  <TableCell>{`${huesped.tipo_documento}: ${huesped.numero_documento}`}</TableCell>
                  <TableCell>{huesped.email || '-'}</TableCell>
                  <TableCell>{huesped.telefono || '-'}</TableCell>
                  <TableCell>{huesped.nacionalidad || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(huesped)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(huesped.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear/editar huésped */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? 'Editar Huésped' : 'Nuevo Huésped'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Tipo de Documento"
                name="tipo_documento"
                value={formData.tipo_documento}
                onChange={handleChange}
                required
              >
                <MenuItem value="DNI">DNI</MenuItem>
                <MenuItem value="Pasaporte">Pasaporte</MenuItem>
                <MenuItem value="Cedula">Cédula</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Documento"
                name="numero_documento"
                value={formData.numero_documento}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de Nacimiento"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nacionalidad"
                name="nacionalidad"
                value={formData.nacionalidad}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="País"
                name="pais"
                value={formData.pais}
                onChange={handleChange}
              />
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

export default Huespedes;
