import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Hotel as HotelIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckInIcon,
  ExitToApp as CheckOutIcon,
  EventNote as EventIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import api from '../config/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const response = await api.get('/dashboard/estadisticas');
      setEstadisticas(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon sx={{ fontSize: 32, color: `${color}.main` }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Resumen general del sistema
        </Typography>
      </Box>

      {/* Tarjetas de Estadísticas Principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ocupación"
            value={`${estadisticas.ocupacion.porcentaje}%`}
            subtitle={`${estadisticas.ocupacion.ocupadas} de ${estadisticas.ocupacion.total} habitaciones`}
            icon={HotelIcon}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Check-ins Hoy"
            value={estadisticas.hoy.check_ins}
            subtitle="Llegadas programadas"
            icon={CheckInIcon}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Check-outs Hoy"
            value={estadisticas.hoy.check_outs}
            subtitle="Salidas programadas"
            icon={CheckOutIcon}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ingresos del Mes"
            value={`$${estadisticas.ingresos_mes.pagado.toFixed(0)}`}
            subtitle={`Pendiente: $${estadisticas.ingresos_mes.pendiente.toFixed(0)}`}
            icon={MoneyIcon}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Estado de Habitaciones */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HotelIcon />
              Estado de Habitaciones
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Disponibles</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {estadisticas.habitaciones.disponibles}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(estadisticas.habitaciones.disponibles / estadisticas.habitaciones.total) * 100}
                  sx={{ height: 8, borderRadius: 1 }}
                  color="success"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Ocupadas</Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary.main">
                    {estadisticas.habitaciones.ocupadas}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(estadisticas.habitaciones.ocupadas / estadisticas.habitaciones.total) * 100}
                  sx={{ height: 8, borderRadius: 1 }}
                  color="primary"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Reservadas</Typography>
                  <Typography variant="body2" fontWeight="bold" color="info.main">
                    {estadisticas.habitaciones.reservadas}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(estadisticas.habitaciones.reservadas / estadisticas.habitaciones.total) * 100}
                  sx={{ height: 8, borderRadius: 1 }}
                  color="info"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">En Limpieza</Typography>
                  <Typography variant="body2" fontWeight="bold" color="warning.main">
                    {estadisticas.habitaciones.limpieza}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(estadisticas.habitaciones.limpieza / estadisticas.habitaciones.total) * 100}
                  sx={{ height: 8, borderRadius: 1 }}
                  color="warning"
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Mantenimiento</Typography>
                  <Typography variant="body2" fontWeight="bold" color="error.main">
                    {estadisticas.habitaciones.mantenimiento}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(estadisticas.habitaciones.mantenimiento / estadisticas.habitaciones.total) * 100}
                  sx={{ height: 8, borderRadius: 1 }}
                  color="error"
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Próximas Llegadas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon />
              Próximas Llegadas (7 días)
            </Typography>

            {estadisticas.proximas_llegadas.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                No hay llegadas próximas
              </Typography>
            ) : (
              <List>
                {estadisticas.proximas_llegadas.map((llegada, index) => (
                  <ListItem 
                    key={index}
                    sx={{ 
                      borderLeft: 3, 
                      borderColor: 'primary.main',
                      mb: 1,
                      bgcolor: 'grey.50',
                      borderRadius: 1
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" fontWeight="bold">
                            {llegada.huesped}
                          </Typography>
                          <Chip 
                            label={llegada.codigo_reserva} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            📅 {new Date(llegada.fecha_entrada).toLocaleDateString()} • 
                            🏨 {llegada.tipo_habitacion} - Hab. {llegada.habitacion} • 
                            👥 {llegada.numero_huespedes} {llegada.numero_huespedes === 1 ? 'huésped' : 'huéspedes'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Reservas del Mes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon />
              Reservas del Mes
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {estadisticas.reservas_mes.pendientes}
                  </Typography>
                  <Typography variant="body2">Pendientes</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {estadisticas.reservas_mes.confirmadas}
                  </Typography>
                  <Typography variant="body2">Confirmadas</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {estadisticas.reservas_mes.activas}
                  </Typography>
                  <Typography variant="body2">Activas</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.300', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {estadisticas.reservas_mes.finalizadas}
                  </Typography>
                  <Typography variant="body2">Finalizadas</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Ocupación por Tipo */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingIcon />
              Ocupación por Tipo de Habitación
            </Typography>

            <Box sx={{ mt: 3 }}>
              {estadisticas.ocupacion_por_tipo.map((tipo, index) => {
                const porcentaje = tipo.total > 0 ? ((tipo.ocupadas / tipo.total) * 100).toFixed(0) : 0;
                return (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{tipo.nombre}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {tipo.ocupadas}/{tipo.total} ({porcentaje}%)
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={parseFloat(porcentaje)}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;