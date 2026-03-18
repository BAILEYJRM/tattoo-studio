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
