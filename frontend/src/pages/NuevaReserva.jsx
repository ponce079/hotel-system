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
  Alert,
  CircularProgress,
  Chip,
  Divider,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Fade,
  InputAdornment
} from '@mui/material';
import {
  Hotel as HotelIcon,
  CheckCircle as CheckIcon,
  Bed as BedIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon
} from '@mui/icons-material';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';

const steps = ['Fechas', 'Habitación', 'Datos', 'Confirmación'];

// Función para obtener imágenes premium
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

const NuevaReserva = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [fechas, setFechas] = useState({ fecha_entrada: '', fecha_salida: '' });
  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [huesped, setHuesped] = useState({
    nombre: '', apellido: '', tipo_documento: 'DNI', numero_documento: '',
    fecha_nacimiento: '', nacionalidad: '', email: '', telefono: '',
    direccion: '', ciudad: '', pais: 'Argentina'
  });
  const [numeroHuespedes, setNumeroHuespedes] = useState(1);
  const [observaciones, setObservaciones] = useState('');
  const [reservaCreada, setReservaCreada] = useState(null);

  // Autocompletar datos del huésped
  useEffect(() => {
    const cargarDatosHuesped = async () => {
      if (activeStep !== 2) return;
      try {
        const response = await api.get('/huespedes/mi-perfil');
        if (response.data.success && response.data.data) {
          const data = response.data.data;
          setHuesped({
            nombre: data.nombre || user?.nombre || '',
            apellido: data.apellido || user?.apellido || '',
            tipo_documento: data.tipo_documento || 'DNI',
            numero_documento: data.numero_documento || '',
            fecha_nacimiento: data.fecha_nacimiento || '',
            nacionalidad: data.nacionalidad || '',
            email: data.email || user?.email || '',
            telefono: data.telefono || '',
            direccion: data.direccion || '',
            ciudad: data.ciudad || '',
            pais: data.pais || 'Argentina'
          });
        } else {
          setHuesped(prev => ({
            ...prev,
            nombre: user?.nombre || '',
            apellido: user?.apellido || '',
            email: user?.email || ''
          }));
        }
      } catch (err) {
        setHuesped(prev => ({
          ...prev,
          nombre: user?.nombre || '',
          apellido: user?.apellido || '',
          email: user?.email || ''
        }));
      }
    };
    cargarDatosHuesped();
  }, [activeStep, user]);

  const calcularDias = () => {
    if (!fechas.fecha_entrada || !fechas.fecha_salida) return 0;
    const dias = Math.ceil((new Date(fechas.fecha_salida) - new Date(fechas.fecha_entrada)) / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
  };

  const dias = calcularDias();

  const buscarHabitaciones = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/reservas/disponibilidad/habitaciones', {
        params: { fecha_entrada: fechas.fecha_entrada, fecha_salida: fechas.fecha_salida }
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

  const seleccionarHabitacion = (habitacion) => {
    setHabitacionSeleccionada(habitacion);
    setActiveStep(2);
  };

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
      setActiveStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
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
    setActiveStep((prev) => prev - 1);
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 0,
      '&:hover fieldset': { borderColor: '#C9A86A' },
      '&.Mui-focused fieldset': { borderColor: '#C9A86A' }
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#C9A86A' }
  };

  // Paso 1: Fechas
  const renderPasoFechas = () => (
    <Fade in timeout={600}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, border: '1px solid #E0E0E0', borderRadius: 0 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 300,
            mb: 1,
            fontFamily: '"Playfair Display", serif',
            color: '#2C2C2C'
          }}
        >
          Seleccione sus Fechas
        </Typography>
        <Box sx={{ width: 60, height: 2, bgcolor: '#C9A86A', mb: 4 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Fecha de Entrada"
              type="date"
              value={fechas.fecha_entrada}
              onChange={(e) => setFechas({ ...fechas, fecha_entrada: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              sx={inputStyle}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon sx={{ color: '#999' }} />
                  </InputAdornment>
                )
              }}
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
              sx={inputStyle}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon sx={{ color: '#999' }} />
                  </InputAdornment>
                )
              }}
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
              sx={inputStyle}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PeopleIcon sx={{ color: '#999' }} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          {dias > 0 && (
            <Grid item xs={12}>
              <Alert
                severity="info"
                sx={{
                  borderRadius: 0,
                  bgcolor: '#FFF8E1',
                  color: '#8D6E63',
                  border: '1px solid #FFE082'
                }}
              >
                Duración de la estadía: <strong>{dias} {dias === 1 ? 'noche' : 'noches'}</strong>
              </Alert>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Fade>
  );

  // Paso 2: Habitaciones
  const renderPasoHabitaciones = () => (
    <Fade in timeout={600}>
      <Box>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 300,
              mb: 1,
              fontFamily: '"Playfair Display", serif',
              color: '#2C2C2C'
            }}
          >
            Habitaciones Disponibles
          </Typography>
          <Box sx={{ width: 60, height: 2, bgcolor: '#C9A86A', mx: 'auto', mb: 2 }} />
          <Typography variant="body2" sx={{ color: '#666', fontWeight: 300 }}>
            Del {new Date(fechas.fecha_entrada).toLocaleDateString()} al {new Date(fechas.fecha_salida).toLocaleDateString()} • {dias} {dias === 1 ? 'noche' : 'noches'}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {habitacionesDisponibles.map((habitacion) => {
            const precioTotal = habitacion.precio_base * dias;
            const amenidades = habitacion.amenidades ? JSON.parse(habitacion.amenidades) : [];

            return (
              <Grid item xs={12} md={6} key={habitacion.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #E0E0E0',
                    borderRadius: 0,
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                      '& .room-image': {
                        transform: 'scale(1.05)'
                      }
                    }
                  }}
                  onClick={() => seleccionarHabitacion(habitacion)}
                >
                  {/* Imagen */}
                  <Box sx={{ height: 280, overflow: 'hidden', position: 'relative' }}>
                    <Box
                      className="room-image"
                      sx={{
                        height: '100%',
                        backgroundImage: `url(${getHabitacionImagen(habitacion.tipo_habitacion)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 0.6s ease'
                      }}
                    />
                    <Chip
                      icon={<MoneyIcon />}
                      label={`$${habitacion.precio_base}/noche`}
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: '#C9A86A',
                        color: 'white',
                        fontWeight: 600,
                        letterSpacing: '0.05em'
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 300,
                        mb: 1,
                        fontFamily: '"Playfair Display", serif',
                        color: '#2C2C2C'
                      }}
                    >
                      {habitacion.tipo_habitacion}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#999', mb: 2, fontWeight: 300 }}>
                      Habitación {habitacion.numero} • Piso {habitacion.piso}
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#666', mb: 3, lineHeight: 1.8 }}>
                      {habitacion.descripcion}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<PeopleIcon />}
                        label={`${habitacion.capacidad_personas} personas`}
                        size="small"
                        sx={{ borderColor: '#C9A86A' }}
                        variant="outlined"
                      />
                      <Chip
                        icon={<BedIcon />}
                        label={habitacion.tipo_camas}
                        size="small"
                        sx={{ borderColor: '#C9A86A' }}
                        variant="outlined"
                      />
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} sx={{ color: '#C9A86A', fontSize: 16 }} />
                      ))}
                    </Box>

                    {amenidades.length > 0 && (
                      <Box>
                        <Typography variant="caption" sx={{ color: '#999', fontWeight: 500, letterSpacing: '0.1em' }}>
                          AMENIDADES
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {amenidades.slice(0, 4).map((amenidad, index) => (
                            <Chip
                              key={index}
                              label={amenidad}
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                bgcolor: '#F5F5F5',
                                color: '#666'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#999', letterSpacing: '0.1em' }}>
                          TOTAL
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 300,
                            color: '#C9A86A',
                            fontFamily: '"Playfair Display", serif'
                          }}
                        >
                          ${precioTotal.toFixed(2)}
                        </Typography>
                      </Box>
                      <Button
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          color: '#C9A86A',
                          borderColor: '#C9A86A',
                          '&:hover': {
                            borderColor: '#B8956A',
                            bgcolor: 'transparent'
                          }
                        }}
                        variant="outlined"
                      >
                        SELECCIONAR
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Fade>
  );

  // Paso 3: Datos (simplificado por espacio)
  const renderPasoDatos = () => (
    <Fade in timeout={600}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, border: '1px solid #E0E0E0', borderRadius: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 300, mb: 1, fontFamily: '"Playfair Display", serif', color: '#2C2C2C' }}>
          Datos del Huésped
        </Typography>
        <Box sx={{ width: 60, height: 2, bgcolor: '#C9A86A', mb: 4 }} />

        <Alert severity="info" sx={{ mb: 3, borderRadius: 0, bgcolor: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7' }}>
          Hemos precargado sus datos. Puede modificarlos si es necesario.
        </Alert>

        <Grid container spacing={3}>
          {/* Campos del formulario con el mismo estilo que Register */}
          <Grid item xs={12} sm={6}>
            <TextField fullWidth required label="Nombre" value={huesped.nombre} onChange={(e) => setHuesped({ ...huesped, nombre: e.target.value })} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#999' }} /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth required label="Apellido" value={huesped.apellido} onChange={(e) => setHuesped({ ...huesped, apellido: e.target.value })} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#999' }} /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth required label="Tipo de Documento" value={huesped.tipo_documento} onChange={(e) => setHuesped({ ...huesped, tipo_documento: e.target.value })} sx={inputStyle}>
              <MenuItem value="DNI">DNI</MenuItem>
              <MenuItem value="Pasaporte">Pasaporte</MenuItem>
              <MenuItem value="Cedula">Cédula</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth required label="Número de Documento" value={huesped.numero_documento} onChange={(e) => setHuesped({ ...huesped, numero_documento: e.target.value })} sx={inputStyle} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth required label="Email" type="email" value={huesped.email} onChange={(e) => setHuesped({ ...huesped, email: e.target.value })} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#999' }} /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth required label="Teléfono" value={huesped.telefono} onChange={(e) => setHuesped({ ...huesped, telefono: e.target.value })} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#999' }} /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Dirección" value={huesped.direccion} onChange={(e) => setHuesped({ ...huesped, direccion: e.target.value })} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><LocationIcon sx={{ color: '#999' }} /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={3} label="Observaciones Especiales" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} sx={inputStyle} />
          </Grid>
        </Grid>
      </Paper>
    </Fade>
  );

  // Paso 4: Confirmación
  const renderPasoConfirmacion = () => (
    <Fade in timeout={600}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, border: '1px solid #E0E0E0', borderRadius: 0, textAlign: 'center' }}>
        <CheckIcon sx={{ fontSize: 100, color: '#C9A86A', mb: 3 }} />
        <Typography variant="h3" sx={{ fontWeight: 300, mb: 2, fontFamily: '"Playfair Display", serif', color: '#2C2C2C' }}>
          ¡Reserva Confirmada!
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
          Su código de reserva es:
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 400, color: '#C9A86A', mb: 4, letterSpacing: '0.1em' }}>
          {reservaCreada?.codigo_reserva}
        </Typography>
        
        <Divider sx={{ my: 4 }} />

        <Grid container spacing={3} sx={{ textAlign: 'left', mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: '#999', letterSpacing: '0.1em' }}>CHECK-IN</Typography>
            <Typography variant="h6">{new Date(fechas.fecha_entrada).toLocaleDateString()}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: '#999', letterSpacing: '0.1em' }}>CHECK-OUT</Typography>
            <Typography variant="h6">{new Date(fechas.fecha_salida).toLocaleDateString()}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: '#999', letterSpacing: '0.1em' }}>HABITACIÓN</Typography>
            <Typography variant="h6">{habitacionSeleccionada?.tipo_habitacion} #{habitacionSeleccionada?.numero}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: '#999', letterSpacing: '0.1em' }}>TOTAL</Typography>
            <Typography variant="h5" sx={{ color: '#C9A86A', fontFamily: '"Playfair Display", serif' }}>${reservaCreada?.precio_total}</Typography>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="contained" size="large" onClick={() => navigate('/cliente/mis-reservas')} sx={{ bgcolor: '#C9A86A', color: 'white', px: 4, py: 1.5, borderRadius: 0, '&:hover': { bgcolor: '#B8956A' } }}>
            VER MIS RESERVAS
          </Button>
          <Button variant="outlined" size="large" onClick={() => window.location.reload()} sx={{ borderColor: '#C9A86A', color: '#C9A86A', px: 4, py: 1.5, borderRadius: 0 }}>
            NUEVA RESERVA
          </Button>
        </Box>
      </Paper>
    </Fade>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFAFA', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 300, mb: 1, fontFamily: '"Playfair Display", serif', color: '#2C2C2C' }}>
            Nueva Reserva
          </Typography>
          <Box sx={{ width: 60, height: 2, bgcolor: '#C9A86A', mx: 'auto', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#666', fontWeight: 300 }}>
            Reserve su estadía en pocos pasos
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 5, '& .MuiStepIcon-root.Mui-active': { color: '#C9A86A' }, '& .MuiStepIcon-root.Mui-completed': { color: '#C9A86A' } }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 300, letterSpacing: '0.05em' } }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 0, border: '1px solid #EF9A9A' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && renderPasoFechas()}
        {activeStep === 1 && renderPasoHabitaciones()}
        {activeStep === 2 && renderPasoDatos()}
        {activeStep === 3 && renderPasoConfirmacion()}

        {activeStep < 3 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack} sx={{ color: '#666', borderRadius: 0 }}>
              ATRÁS
            </Button>
            <Button variant="contained" onClick={handleNext} disabled={loading} endIcon={loading ? null : <ArrowForwardIcon />} sx={{ bgcolor: '#C9A86A', px: 4, py: 1.5, borderRadius: 0, letterSpacing: '0.1em', '&:hover': { bgcolor: '#B8956A' } }}>
              {loading ? <CircularProgress size={24} /> : (activeStep === 2 ? 'CONFIRMAR RESERVA' : 'SIGUIENTE')}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default NuevaReserva;