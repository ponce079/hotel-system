import { useState, useEffect } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Chip,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import api from '../config/api';

const Operadores = () => {
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [operadorSeleccionado, setOperadorSeleccionado] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'recepcionista',
    telefono: '',
    tipo_documento: 'DNI',
    numero_documento: ''
  });

  useEffect(() => {
    cargarOperadores();
  }, []);

  const cargarOperadores = async () => {
    try {
      const response = await api.get('/usuarios');
      setOperadores(response.data.data);
    } catch (err) {
      setError('Error al cargar operadores');
    } finally {
      setLoading(false);
    }
  };

  const abrirDialogNuevo = () => {
    setModoEdicion(false);
    setOperadorSeleccionado(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'recepcionista',
      telefono: '',
      tipo_documento: 'DNI',
      numero_documento: ''
    });
    setDialogOpen(true);
  };

  const abrirDialogEditar = (operador) => {
    setModoEdicion(true);
    setOperadorSeleccionado(operador);
    setFormData({
      nombre: operador.nombre || '',
      apellido: operador.apellido || '',
      email: operador.email || '',
      password: '',
      rol: operador.rol || 'recepcionista',
      telefono: operador.telefono || '',
      tipo_documento: operador.tipo_documento || 'DNI',
      numero_documento: operador.numero_documento || ''
    });
    setDialogOpen(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    setError('');

    // Validaciones
    if (!formData.nombre || !formData.email || !formData.rol) {
      setError('Nombre, email y rol son requeridos');
      return;
    }

    if (!modoEdicion && !formData.password) {
      setError('La contraseña es requerida para nuevos operadores');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      if (modoEdicion) {
        await api.put(`/usuarios/${operadorSeleccionado.id}`, formData);
        setSuccess('Operador actualizado exitosamente');
      } else {
        await api.post('/usuarios', formData);
        setSuccess('Operador creado exitosamente');
      }

      setDialogOpen(false);
      await cargarOperadores();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar operador');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este operador?')) {
      return;
    }

    try {
      await api.delete(`/usuarios/${id}`);
      setSuccess('Operador eliminado exitosamente');
      await cargarOperadores();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar operador');
    }
  };

  const getRolColor = (rol) => {
    const colores = {
      admin: 'error',
      administrador: 'error',
      recepcionista: 'primary',
      cliente: 'default'
    };
    return colores[rol] || 'default';
  };

  const getRolLabel = (rol) => {
    const labels = {
      admin: 'Administrador',
      administrador: 'Administrador',
      recepcionista: 'Recepcionista',
      cliente: 'Cliente'
    };
    return labels[rol] || rol;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Gestión de Operadores
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra los usuarios del sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={abrirDialogNuevo}
        >
          Nuevo Operador
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {operadores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No hay operadores registrados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              operadores.map((operador) => (
                <TableRow key={operador.id} hover>
                  <TableCell>{operador.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {operador.nombre} {operador.apellido}
                    </Typography>
                  </TableCell>
                  <TableCell>{operador.email}</TableCell>
                  <TableCell>
                    {operador.tipo_documento}: {operador.numero_documento || 'N/A'}
                  </TableCell>
                  <TableCell>{operador.telefono || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRolLabel(operador.rol)}
                      color={getRolColor(operador.rol)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={operador.activo ? 'Activo' : 'Inactivo'}
                      color={operador.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => abrirDialogEditar(operador)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleEliminar(operador.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Crear/Editar */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {modoEdicion ? 'Editar Operador' : 'Nuevo Operador'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              required
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              required
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label={modoEdicion ? "Nueva Contraseña (dejar vacío para no cambiar)" : "Contraseña"}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={!modoEdicion}
              helperText={modoEdicion ? "Solo completar si desea cambiar la contraseña" : "Mínimo 6 caracteres"}
            />

            <TextField
              fullWidth
              select
              label="Tipo de Documento"
              name="tipo_documento"
              value={formData.tipo_documento}
              onChange={handleChange}
            >
              <MenuItem value="DNI">DNI</MenuItem>
              <MenuItem value="Pasaporte">Pasaporte</MenuItem>
              <MenuItem value="Cédula">Cédula</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Número de Documento"
              name="numero_documento"
              value={formData.numero_documento}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              required
              select
              label="Rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
            >
              <MenuItem value="administrador">Administrador</MenuItem>
              <MenuItem value="recepcionista">Recepcionista</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {modoEdicion ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Operadores;