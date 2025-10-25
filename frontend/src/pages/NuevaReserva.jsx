import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  Bed as BedIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import api from '../config/api';

const steps = ['Seleccionar Fechas', 'Elegir Habitación', 'Datos del Huésped', 'Confirmar'];

const NuevaReserva = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Datos de la reserva
  const [fechas, setFechas] = useState({
    fecha_entrada: '',
    fecha_salida: ''
  });
  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [huesped, setHuesped] = useState({
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
    pais: ''
  });
  const [numeroHuespedes, setNumeroHuespedes] = useState(1);
  const [observaciones, setObservaciones] = useState('');
  const [reservaCreada, setReservaCreada] = useState(null);

  // Calcular número de días
  const calcularDias = () => {
    if (!fechas.fecha_entrada || !fechas.fecha_salida) return 0;
    const entrada = new Date(fechas.fecha_entrada);
    const salida = new Date(fechas.fecha_salida);
    const dias = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
  };

  const dias = calcularDias();

  // Buscar habitaciones disponibles
  const buscarHabitaciones = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/reservas/disponibilidad/habitaciones', {
        params: {
          fecha_entrada: fechas.fecha_entrada,
          fecha_salida: fechas.fecha_salida
        }
      });

      setHabitacionesDisponibles(response.data.data);
      
      if (response.data.data.length === 0) {
        setError('No hay habitaciones disponibles para las fechas seleccionadas');
      } else {
        setActiveStep(1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al buscar habitaciones');
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar habitación
  const seleccionarHabitacion = (habitacion) => {
    setHabitacionSeleccionada(habitacion);
    setActiveStep(2);
  };

  // Crear reserva
  const crearReserva = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/reservas', {
        huesped,
        habitacion_id: habitacionSeleccionada.id,
        fecha_entrada: fechas.fecha_entrada,
        fecha_salida: fechas.fecha_salida,
        numero_huespedes: numeroHuespedes,
        observaciones
      });

      setReservaCreada(response.data.data);
      setSuccess(true);
      setActiveStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validar fechas
      if (!fechas.fecha_entrada || !fechas.fecha_salida) {
        setError('Por favor selecciona las fechas');
        return;
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const entrada = new Date(fechas.fecha_entrada);
      const salida = new Date(fechas.fecha_salida);

      if (entrada < hoy) {
        setError('La fecha de entrada no puede ser anterior a hoy');
        return;
      }

      if (salida <= entrada) {
        setError('La fecha de salida debe ser posterior a la fecha de entrada');
        return;
      }

      buscarHabitaciones();
    } else if (activeStep === 2) {
      // Validar datos del huésped
      if (!huesped.nombre || !huesped.apellido || !huesped.numero_documento || 
          !huesped.email || !huesped.telefono) {
        setError('Por favor completa todos los campos obligatorios');
        return;
      }

      crearReserva();
    }
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Paso 1: Seleccionar fechas
  const renderPasoFechas = () => (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Selecciona las fechas de tu estadía
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Fecha de Entrada"
            type="date"
            value={fechas.fecha_entrada}
            onChange={(e) => setFechas({ ...fechas, fecha_entrada: e.target.value })}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Fecha de Salida"
            type="date"
            value={fechas.fecha_salida}
            onChange={(e) => setFechas({ ...fechas, fecha_salida: e.target.value })}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: fechas.fecha_entrada || new Date().toISOString().split('T')[0] }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Número de Huéspedes"
            type="number"
            value={numeroHuespedes}
            onChange={(e) => setNumeroHuespedes(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1 }}
          />
        </Grid>
        {dias > 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              Duración de la estadía: <strong>{dias} {dias === 1 ? 'noche' : 'noches'}</strong>
            </Alert>
          </Grid>
        )}
      </Grid>
    </Paper>
  );

  // Paso 2: Seleccionar habitación
  const renderPasoHabitaciones = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Habitaciones Disponibles
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Del {new Date(fechas.fecha_entrada).toLocaleDateString()} al {new Date(fechas.fecha_salida).toLocaleDateString()} ({dias} {dias === 1 ? 'noche' : 'noches'})
      </Typography>
      
      <Grid container spacing={3}>
        {habitacionesDisponibles.map((habitacion) => {
          const precioTotal = habitacion.precio_base * dias;
          const amenidades = habitacion.amenidades ? JSON.parse(habitacion.amenidades) : [];

          return (
            <Grid item xs={12} md={6} key={habitacion.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{habitacion.tipo_habitacion}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Habitación {habitacion.numero} - Piso {habitacion.piso}
                      </Typography>
                    </Box>
                    <Chip 
                      icon={<MoneyIcon />} 
                      label={`$${habitacion.precio_base}/noche`} 
                      color="primary" 
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {habitacion.descripcion}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Chip 
                      icon={<PeopleIcon />} 
                      label={`${habitacion.capacidad_personas} personas`} 
                      size="small" 
                    />
                    <Chip 
                      icon={<BedIcon />} 
                      label={habitacion.tipo_camas} 
                      size="small" 
                    />
                  </Box>

                  {amenidades.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" display="block" gutterBottom>
                        Amenidades:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {amenidades.map((amenidad, index) => (
                          <Chip key={index} label={amenidad} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Precio total
                      </Typography>
                      <Typography variant="h5" color="primary">
                        ${precioTotal.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    onClick={() => seleccionarHabitacion(habitacion)}
                  >
                    Seleccionar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  // Paso 3: Datos del huésped
  const renderPasoDatos = () => (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Datos del Huésped Principal
      </Typography>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Nombre"
            value={huesped.nombre}
            onChange={(e) => setHuesped({ ...huesped, nombre: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Apellido"
            value={huesped.apellido}
            onChange={(e) => setHuesped({ ...huesped, apellido: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            select
            label="Tipo de Documento"
            value={huesped.tipo_documento}
            onChange={(e) => setHuesped({ ...huesped, tipo_documento: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value="DNI">DNI</option>
            <option value="Pasaporte">Pasaporte</option>
            <option value="Cedula">Cédula</option>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Número de Documento"
            value={huesped.numero_documento}
            onChange={(e) => setHuesped({ ...huesped, numero_documento: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Fecha de Nacimiento"
            type="date"
            value={huesped.fecha_nacimiento}
            onChange={(e) => setHuesped({ ...huesped, fecha_nacimiento: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Nacionalidad"
            value={huesped.nacionalidad}
            onChange={(e) => setHuesped({ ...huesped, nacionalidad: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Email"
            type="email"
            value={huesped.email}
            onChange={(e) => setHuesped({ ...huesped, email: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Teléfono"
            value={huesped.telefono}
            onChange={(e) => setHuesped({ ...huesped, telefono: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Dirección"
            value={huesped.direccion}
            onChange={(e) => setHuesped({ ...huesped, direccion: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Ciudad"
            value={huesped.ciudad}
            onChange={(e) => setHuesped({ ...huesped, ciudad: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="País"
            value={huesped.pais}
            onChange={(e) => setHuesped({ ...huesped, pais: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  // Paso 4: Confirmación
  const renderPasoConfirmacion = () => (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        ¡Reserva Creada Exitosamente!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Tu código de reserva es:
      </Typography>
      <Typography variant="h5" color="primary" gutterBottom>
        {reservaCreada?.codigo_reserva}
      </Typography>
      
      <Divider sx={{ my: 3 }} />

      <Grid container spacing={2} sx={{ textAlign: 'left', mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">Check-in:</Typography>
          <Typography variant="body1">{new Date(fechas.fecha_entrada).toLocaleDateString()}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">Check-out:</Typography>
          <Typography variant="body1">{new Date(fechas.fecha_salida).toLocaleDateString()}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">Habitación:</Typography>
          <Typography variant="body1">{habitacionSeleccionada?.tipo_habitacion} - #{habitacionSeleccionada?.numero}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">Total:</Typography>
          <Typography variant="h6" color="primary">${reservaCreada?.precio_total}</Typography>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          onClick={() => navigate('/mis-reservas')}
        >
          Ver Mis Reservas
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => window.location.reload()}
        >
          Nueva Reserva
        </Button>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          <HotelIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
          Nueva Reserva
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Reserva tu estadía en pocos pasos
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {activeStep === 0 && renderPasoFechas()}
      {activeStep === 1 && renderPasoHabitaciones()}
      {activeStep === 2 && renderPasoDatos()}
      {activeStep === 3 && renderPasoConfirmacion()}

      {activeStep < 3 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Atrás
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (activeStep === 2 ? 'Confirmar Reserva' : 'Siguiente')}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default NuevaReserva;