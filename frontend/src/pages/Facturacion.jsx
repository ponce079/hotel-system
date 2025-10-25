import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Cancel as CancelIcon,
  CreditCard as CardIcon,
  AttachMoney as MoneyIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import api from '../config/api';

const Facturacion = () => {
  const navigate = useNavigate();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('todas');
  
  // Dialogs
  const [dialogDetalleOpen, setDialogDetalleOpen] = useState(false);
  const [dialogPagoOpen, setDialogPagoOpen] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [procesando, setProcesando] = useState(false);
  
  // Datos de pago
  const [datosPago, setDatosPago] = useState({
    monto: '',
    metodo_pago: 'tarjeta',
    referencia: '',
    notas: '',
    // Datos de tarjeta
    numero_tarjeta: '',
    nombre_titular: '',
    fecha_vencimiento: '',
    cvv: ''
  });

  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    try {
      const response = await api.get('/facturas');
      setFacturas(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (id) => {
    try {
      const response = await api.get(`/facturas/${id}`);
      setFacturaSeleccionada(response.data.data);
      setDialogDetalleOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar detalle');
    }
  };

  const abrirDialogPago = async (factura) => {
    try {
      // Obtener resumen de pagos
      const response = await api.get(`/facturas/${factura.id}/resumen-pagos`);
      const resumen = response.data.data;
      
      setFacturaSeleccionada({
        ...factura,
        ...resumen
      });
      
      setDatosPago({
        monto: resumen.saldo_pendiente.toFixed(2),
        metodo_pago: 'tarjeta',
        referencia: '',
        notas: '',
        numero_tarjeta: '',
        nombre_titular: '',
        fecha_vencimiento: '',
        cvv: ''
      });
      
      setDialogPagoOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar información de pago');
    }
  };

  const handleChangePago = (e) => {
    const { name, value } = e.target;
    
    // Formatear número de tarjeta (solo números, máximo 19 dígitos)
    if (name === 'numero_tarjeta') {
      const numeros = value.replace(/\D/g, '').slice(0, 19);
      setDatosPago({ ...datosPago, [name]: numeros });
      return;
    }
    
    // Formatear CVV (solo números, máximo 4 dígitos)
    if (name === 'cvv') {
      const numeros = value.replace(/\D/g, '').slice(0, 4);
      setDatosPago({ ...datosPago, [name]: numeros });
      return;
    }
    
    // Formatear fecha de vencimiento (MM/YY)
    if (name === 'fecha_vencimiento') {
      let numeros = value.replace(/\D/g, '');
      if (numeros.length >= 2) {
        numeros = numeros.slice(0, 2) + '/' + numeros.slice(2, 4);
      }
      setDatosPago({ ...datosPago, [name]: numeros });
      return;
    }
    
    setDatosPago({ ...datosPago, [name]: value });
  };

  const procesarPago = async () => {
    setError('');

    // Validaciones
    if (!datosPago.monto || parseFloat(datosPago.monto) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    if (datosPago.metodo_pago === 'tarjeta') {
      if (!datosPago.numero_tarjeta || !datosPago.nombre_titular || 
          !datosPago.fecha_vencimiento || !datosPago.cvv) {
        setError('Todos los datos de la tarjeta son requeridos');
        return;
      }

      if (datosPago.numero_tarjeta.length < 13) {
        setError('Número de tarjeta inválido');
        return;
      }

      if (datosPago.cvv.length < 3) {
        setError('CVV inválido');
        return;
      }
    }

    setProcesando(true);

    try {
      const response = await api.post(`/facturas/${facturaSeleccionada.id}/pagos`, datosPago);
      
      setSuccess(`Pago procesado exitosamente. Referencia: ${response.data.data.referencia}`);
      setDialogPagoOpen(false);
      await cargarFacturas();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar pago');
    } finally {
      setProcesando(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'warning',
      pagada: 'success',
      anulada: 'error'
    };
    return colores[estado] || 'default';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      pendiente: 'Pendiente',
      pagada: 'Pagada',
      anulada: 'Anulada'
    };
    return labels[estado] || estado;
  };

  const getMetodoPagoLabel = (metodo) => {
    const labels = {
      efectivo: 'Efectivo',
      tarjeta: 'Tarjeta',
      transferencia: 'Transferencia',
      mixto: 'Mixto'
    };
    return labels[metodo] || metodo;
  };

  const filtrarFacturas = () => {
    if (filtroEstado === 'todas') return facturas;
    return facturas.filter(f => f.estado === filtroEstado);
  };

  const contarPorEstado = (estado) => {
    if (estado === 'todas') return facturas.length;
    return facturas.filter(f => f.estado === estado).length;
  };

  const formatearNumeroTarjeta = (numero) => {
    return numero.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const facturasFiltradas = filtrarFacturas();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Facturación y Pagos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona las facturas y procesa pagos
        </Typography>
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

      {/* Filtros por Estado */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={filtroEstado}
          onChange={(e, newValue) => setFiltroEstado(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`Todas (${contarPorEstado('todas')})`} value="todas" />
          <Tab label={`Pendientes (${contarPorEstado('pendiente')})`} value="pendiente" />
          <Tab label={`Pagadas (${contarPorEstado('pagada')})`} value="pagada" />
          <Tab label={`Anuladas (${contarPorEstado('anulada')})`} value="anulada" />
        </Tabs>
      </Paper>

      {/* Tabla de Facturas */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Huésped</TableCell>
              <TableCell>Reserva</TableCell>
              <TableCell align="right">Subtotal</TableCell>
              <TableCell align="right">Impuestos</TableCell>
              <TableCell align="right">Descuentos</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facturasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No se encontraron facturas
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              facturasFiltradas.map((factura) => (
                <TableRow key={factura.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {factura.numero_factura}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(factura.fecha_emision).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{factura.huesped_nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {factura.huesped_email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{factura.codigo_reserva}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hab. {factura.habitacion_numero}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    ${parseFloat(factura.subtotal).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    ${parseFloat(factura.impuestos).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    ${parseFloat(factura.descuentos).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      ${parseFloat(factura.total).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getEstadoLabel(factura.estado)}
                      color={getEstadoColor(factura.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver detalle">
                      <IconButton size="small" onClick={() => verDetalle(factura.id)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {factura.estado === 'pendiente' && (
                      <Tooltip title="Procesar pago">
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => abrirDialogPago(factura)}
                        >
                          <PaymentIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Detalle */}
      <Dialog open={dialogDetalleOpen} onClose={() => setDialogDetalleOpen(false)} maxWidth="md" fullWidth>
        {facturaSeleccionada && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Detalle de Factura</Typography>
                <Chip
                  label={getEstadoLabel(facturaSeleccionada.estado)}
                  color={getEstadoColor(facturaSeleccionada.estado)}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Información de Factura */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {facturaSeleccionada.numero_factura}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de emisión: {new Date(facturaSeleccionada.fecha_emision).toLocaleDateString()}
                  </Typography>
                </Grid>

                {/* Huésped y Reserva */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Huésped</Typography>
                  <Typography variant="body2">{facturaSeleccionada.huesped_nombre}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {facturaSeleccionada.huesped_email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {facturaSeleccionada.tipo_documento}: {facturaSeleccionada.numero_documento}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Reserva</Typography>
                  <Typography variant="body2">{facturaSeleccionada.codigo_reserva}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {facturaSeleccionada.tipo_habitacion} - Hab. {facturaSeleccionada.habitacion_numero}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(facturaSeleccionada.fecha_entrada).toLocaleDateString()} - {new Date(facturaSeleccionada.fecha_salida).toLocaleDateString()}
                  </Typography>
                </Grid>

                {/* Servicios adicionales */}
                {facturaSeleccionada.servicios && facturaSeleccionada.servicios.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Servicios Adicionales</Typography>
                    <List dense>
                      {facturaSeleccionada.servicios.map((servicio, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`${servicio.servicio_nombre} (x${servicio.cantidad})`}
                            secondary={servicio.categoria}
                          />
                          <Typography variant="body2">
                            ${parseFloat(servicio.precio_total).toFixed(2)}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                {/* Totales */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">${parseFloat(facturaSeleccionada.subtotal).toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Impuestos:</Typography>
                    <Typography variant="body2">${parseFloat(facturaSeleccionada.impuestos).toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Descuentos:</Typography>
                    <Typography variant="body2" color="error">-${parseFloat(facturaSeleccionada.descuentos).toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h5" color="primary">
                      ${parseFloat(facturaSeleccionada.total).toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>

                {/* Pagos realizados */}
                {facturaSeleccionada.pagos && facturaSeleccionada.pagos.length > 0 && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>Historial de Pagos</Typography>
                    <List dense>
                      {facturaSeleccionada.pagos.map((pago, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`${getMetodoPagoLabel(pago.metodo_pago)} - $${parseFloat(pago.monto).toFixed(2)}`}
                            secondary={`${new Date(pago.fecha_pago).toLocaleString()} - Ref: ${pago.referencia || 'N/A'}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogDetalleOpen(false)}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog de Pago */}
      <Dialog open={dialogPagoOpen} onClose={() => setDialogPagoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon />
            <Typography variant="h6">Procesar Pago</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {facturaSeleccionada && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Resumen */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Resumen de Pago</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Factura:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {facturaSeleccionada.numero_factura}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Total Factura:</Typography>
                      <Typography variant="body2">
                        ${facturaSeleccionada.total_factura?.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Total Pagado:</Typography>
                      <Typography variant="body2" color="success.main">
                        ${facturaSeleccionada.total_pagado?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2">Saldo Pendiente:</Typography>
                      <Typography variant="h6" color="primary">
                        ${facturaSeleccionada.saldo_pendiente?.toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Método de pago */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Método de Pago"
                  name="metodo_pago"
                  value={datosPago.metodo_pago}
                  onChange={handleChangePago}
                >
                  <MenuItem value="tarjeta">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CardIcon fontSize="small" />
                      Tarjeta de Crédito/Débito
                    </Box>
                  </MenuItem>
                  <MenuItem value="efectivo">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MoneyIcon fontSize="small" />
                      Efectivo
                    </Box>
                  </MenuItem>
                  <MenuItem value="transferencia">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BankIcon fontSize="small" />
                      Transferencia Bancaria
                    </Box>
                  </MenuItem>
                </TextField>
              </Grid>

              {/* Datos de Tarjeta */}
              {datosPago.metodo_pago === 'tarjeta' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Número de Tarjeta"
                      name="numero_tarjeta"
                      value={formatearNumeroTarjeta(datosPago.numero_tarjeta)}
                      onChange={handleChangePago}
                      placeholder="1234 5678 9012 3456"
                      inputProps={{ maxLength: 23 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CardIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Nombre del Titular"
                      name="nombre_titular"
                      value={datosPago.nombre_titular}
                      onChange={handleChangePago}
                      placeholder="Como aparece en la tarjeta"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      required
                      label="Fecha de Vencimiento"
                      name="fecha_vencimiento"
                      value={datosPago.fecha_vencimiento}
                      onChange={handleChangePago}
                      placeholder="MM/YY"
                      inputProps={{ maxLength: 5 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      required
                      label="CVV"
                      name="cvv"
                      type="password"
                      value={datosPago.cvv}
                      onChange={handleChangePago}
                      placeholder="123"
                      inputProps={{ maxLength: 4 }}
                    />
                  </Grid>
                </>
              )}

              {/* Referencia y Notas */}
              {datosPago.metodo_pago !== 'tarjeta' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Referencia"
                    name="referencia"
                    value={datosPago.referencia}
                    onChange={handleChangePago}
                    placeholder="Número de referencia o comprobante"
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Monto a Pagar"
                  name="monto"
                  type="number"
                  value={datosPago.monto}
                  onChange={handleChangePago}
                  inputProps={{ 
                    min: 0.01, 
                    step: 0.01,
                    max: facturaSeleccionada.saldo_pendiente
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notas"
                  name="notas"
                  value={datosPago.notas}
                  onChange={handleChangePago}
                />
              </Grid>

              {/* Mensaje de seguridad para tarjetas */}
              {datosPago.metodo_pago === 'tarjeta' && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="caption">
                      🔒 Transacción simulada. En producción, los datos de la tarjeta se procesarían de forma segura a través de un gateway de pagos certificado (PCI-DSS).
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogPagoOpen(false)} disabled={procesando}>
            Cancelar
          </Button>
          <Button 
            onClick={procesarPago} 
            variant="contained" 
            disabled={procesando}
            startIcon={procesando ? <CircularProgress size={20} /> : <PaymentIcon />}
          >
            {procesando ? 'Procesando...' : 'Procesar Pago'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Facturacion;