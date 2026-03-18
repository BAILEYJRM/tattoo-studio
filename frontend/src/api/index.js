import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// Clientes
export const getClientes = (buscar) =>
  api.get('/clientes', { params: buscar ? { buscar } : {} });
export const getCliente = (id) => api.get(`/clientes/${id}`);
export const createCliente = (data) => api.post('/clientes', data);
export const updateCliente = (id, data) => api.put(`/clientes/${id}`, data);

// Empleados
export const getEmpleados = () => api.get('/empleados');
export const getEmpleado = (id) => api.get(`/empleados/${id}`);
export const createEmpleado = (data) => api.post('/empleados', data);
export const updateEmpleado = (id, data) => api.put(`/empleados/${id}`, data);
export const deleteEmpleado = (id) => api.delete(`/empleados/${id}`);

// Citas
export const getCitas = (params) => api.get('/citas', { params });
export const getCita = (id) => api.get(`/citas/${id}`);
export const createCita = (data) => api.post('/citas', data);
export const updateCita = (id, data) => api.put(`/citas/${id}`, data);
export const updateCitaEstado = (id, estado) =>
  api.patch(`/citas/${id}/estado`, { estado });
export const finalizarCita = (id, data) => api.patch(`/citas/${id}/finalizar`, data);
export const getImagenesCita = (id) => api.get(`/citas/${id}/imagenes`);
export const subirImagenCita = (id, formData) => api.post(`/citas/${id}/imagenes`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// Productos
export const getProductos = () => api.get('/productos');
export const buscarProductos = (q) => api.get('/productos/buscar', { params: { q } });
export const getStockBajo = () => api.get('/productos/stock-bajo');
export const getProducto = (id) => api.get(`/productos/${id}`);
export const createProducto = (data) => api.post('/productos', data);
export const updateProducto = (id, data) => api.put(`/productos/${id}`, data);

// Movimientos de stock
export const getMovimientos = (params) => api.get('/movimientos-stock', { params });
export const registrarMovimiento = (data) => api.post('/movimientos-stock', data);

// Ventas
export const getVentas = (params) => api.get('/ventas', { params });
export const getVenta = (id) => api.get(`/ventas/${id}`);
export const createVenta = (data) => api.post('/ventas', data);
export const updateVenta = (id, data) => api.put(`/ventas/${id}`, data);
export const getResumenDia = (fecha) => api.get('/ventas/resumen-dia', { params: { fecha } });
export const getResumenMesVentas = (year, month) =>
  api.get('/ventas/resumen-mes', { params: { year, month } });

// Gastos
export const getGastos = (params) => api.get('/gastos', { params });
export const getGasto = (id) => api.get(`/gastos/${id}`);
export const createGasto = (data) => api.post('/gastos', data);
export const updateGasto = (id, data) => api.put(`/gastos/${id}`, data);
export const deleteGasto = (id) => api.delete(`/gastos/${id}`);
export const getResumenMesGastos = (year, month) =>
  api.get('/gastos/resumen-mes', { params: { year, month } });

// Plantillas de consentimiento
export const getPlantillas = (tipo) =>
  api.get('/plantillas-consentimiento', { params: tipo ? { tipo } : {} });
export const getPlantilla = (id) => api.get(`/plantillas-consentimiento/${id}`);
export const createPlantilla = (data) => api.post('/plantillas-consentimiento', data);
export const updatePlantilla = (id, data) => api.put(`/plantillas-consentimiento/${id}`, data);

// Consentimientos
export const getConsentimientos = (params) => api.get('/consentimientos', { params });
export const getConsentimiento = (id) => api.get(`/consentimientos/${id}`);
export const createConsentimiento = (data) => api.post('/consentimientos', data);
export const regenerarPdfConsentimiento = (id) =>
  api.post(`/consentimientos/${id}/regenerar-pdf`);
export const getPdfUrl = (pdfPath) =>
  `${api.defaults.baseURL.replace('/api', '')}/${pdfPath}`;

// Cabinas
export const getCabinas = () => api.get('/cabinas');
export const crearCabina = (data) => api.post('/cabinas', data);
export const actualizarCabina = (id, data) => api.put(`/cabinas/${id}`, data);
export const cambiarEstadoCabina = (id, estado) => api.patch(`/cabinas/${id}/estado`, { estado });

// Limpiezas
export const getLimpiezas = (params) => api.get('/limpiezas', { params });
export const getResumenLimpiezas = (fecha) => api.get('/limpiezas/resumen', { params: { fecha } });
export const crearLimpieza = (data) => api.post('/limpiezas', data);
export const eliminarLimpieza = (id) => api.delete(`/limpiezas/${id}`);

// Incidencias
export const getIncidencias = (params) => api.get('/incidencias', { params });
export const crearIncidencia = (formData) => api.post('/incidencias', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const resolverIncidencia = (id) => api.patch(`/incidencias/${id}/resolver`);
export const getImagenUrl = (fotoPath) =>
  `${api.defaults.baseURL.replace('/api', '')}/${fotoPath}`;

// Ausencias de empleados
export const getAusencias = (empleadoId) => api.get(`/empleados/${empleadoId}/ausencias`);
export const crearAusencia = (empleadoId, data) => api.post(`/empleados/${empleadoId}/ausencias`, data);
export const eliminarAusencia = (id) => api.delete(`/ausencias/${id}`);
export const getAusenciasRango = (params) => api.get('/ausencias', { params });

// Eventos de calendario
export const getEventos = (params) => api.get('/eventos-calendario', { params });
export const crearEvento = (data) => api.post('/eventos-calendario', data);
export const updateEvento = (id, data) => api.put(`/eventos-calendario/${id}`, data);
export const eliminarEvento = (id) => api.delete(`/eventos-calendario/${id}`);

// Contabilidad
export const getRecuentoDiario = (fecha) =>
  api.get('/contabilidad/recuento-diario', { params: { fecha } });
export const getLiquidacionArtista = (artista_id, fecha_inicio, fecha_fin) =>
  api.get('/contabilidad/liquidacion-artista', { params: { artista_id, fecha_inicio, fecha_fin } });
export const getLiquidacionEstudio = (fecha_inicio, fecha_fin) =>
  api.get('/contabilidad/liquidacion-estudio', { params: { fecha_inicio, fecha_fin } });

// Recibos
export const getRecibos = (params) => api.get('/recibos', { params });
export const getRecibo = (id) => api.get(`/recibos/${id}`);
export const createRecibo = (data) => api.post('/recibos', data);

// Facturas
export const getFacturas = (params) => api.get('/facturas', { params });
export const crearFactura = (data) => api.post('/facturas', data);

// Tintas
export const getTintas = (params) => api.get('/tintas', { params });
export const getTintasCaducidad = (dias = 30) => api.get('/tintas/caducidad-proxima', { params: { dias } });
export const createTinta = (data) => api.post('/tintas', data);
export const updateTinta = (id, data) => api.put(`/tintas/${id}`, data);
export const deleteTinta = (id) => api.delete(`/tintas/${id}`);
export const getTintasPorDefecto = (empleado_id) => api.get(`/tintas/artista/${empleado_id}/defecto`);
export const addTintaDefectoArtista = (empleado_id, tinta_id) => api.post(`/tintas/artista/${empleado_id}/defecto`, { tinta_id });
export const removeTintaDefectoArtista = (empleado_id, tinta_id) => api.delete(`/tintas/artista/${empleado_id}/defecto/${tinta_id}`);

// Agujas
export const getAgujas = (params) => api.get('/agujas', { params });
export const getAgujasCaducidad = (dias = 30) => api.get('/agujas/caducidad-proxima', { params: { dias } });
export const createAguja = (data) => api.post('/agujas', data);
export const updateAguja = (id, data) => api.put(`/agujas/${id}`, data);
export const deleteAguja = (id) => api.delete(`/agujas/${id}`);
export const getAgujasPorDefecto = (empleado_id) => api.get(`/agujas/artista/${empleado_id}/defecto`);
export const addAgujaDefectoArtista = (empleado_id, aguja_id) => api.post(`/agujas/artista/${empleado_id}/defecto`, { aguja_id });
export const removeAgujaDefectoArtista = (empleado_id, aguja_id) => api.delete(`/agujas/artista/${empleado_id}/defecto/${aguja_id}`);

// Material de cita
export const getMaterialCita = (cita_id) => api.get(`/citas/${cita_id}/material`);
export const addMaterialCita = (cita_id, data) => api.post(`/citas/${cita_id}/material`, data);
export const deleteMaterialCita = (cita_id, material_id) => api.delete(`/citas/${cita_id}/material/${material_id}`);

// Estadísticas
export const getEstResumen = (params) => api.get('/estadisticas/resumen', { params });
export const getEstArtistas = (params) => api.get('/estadisticas/artistas', { params });
export const getEstTopClientes = (params) => api.get('/estadisticas/top-clientes', { params });
export const getEstEvolucion = (año) => api.get('/estadisticas/evolucion-mensual', { params: { año } });
export const getEstEdades = () => api.get('/estadisticas/edades');
export const getEstMetodosPago = (params) => api.get('/estadisticas/metodos-pago', { params });
export const getEstEco = () => api.get('/estadisticas/eco');

// Clientes — historial y duplicados
export const getHistorialCliente = (id) => api.get(`/clientes/${id}/historial`);
export const getDuplicadosClientes = () => api.get('/clientes/duplicados');
export const fusionarClientes = (data) => api.post('/clientes/fusionar', data);

// Citas — solapamiento y grupo
export const verificarSolapamientoCita = (params) => api.get('/citas/verificar-solapamiento', { params });
export const crearCitasGrupo = (data) => api.post('/citas/grupo', data);

// Configuración
export const getConfiguracion = () => api.get('/configuracion');
export const updateConfiguracion = (data) => api.put('/configuracion', data);
export const getConfiguracionPublica = () => api.get('/configuracion/publica');
export const getDiasFestivos = () => api.get('/configuracion/dias-festivos');
export const addDiaFestivo = (data) => api.post('/configuracion/dias-festivos', data);
export const deleteDiaFestivo = (id) => api.delete(`/configuracion/dias-festivos/${id}`);

// Comunicaciones
export const getComunicaciones = (params) => api.get('/comunicaciones', { params });
export const getPlantillasComunicacion = () => api.get('/comunicaciones/plantillas');
export const updatePlantillaComunicacion = (id, data) => api.put(`/comunicaciones/plantillas/${id}`, data);
export const enviarComunicacion = (data) => api.post('/comunicaciones/enviar', data);
export const getEstadisticasComunicaciones = () => api.get('/comunicaciones/estadisticas');
export const enviarEmailConsentimiento = (id) => api.post(`/consentimientos/${id}/enviar-email`);
