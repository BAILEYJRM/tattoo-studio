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
