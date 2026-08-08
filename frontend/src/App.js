import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Citas from './pages/Citas';
import Clientes from './pages/Clientes';
import Empleados from './pages/Empleados';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Gastos from './pages/Gastos';
import Consentimientos from './pages/Consentimientos';
import Cabinas from './pages/Cabinas';
import EventosCalendario from './pages/EventosCalendario';
import { RecuentoDiario, LiquidacionArtista, LiquidacionEstudio, Recibos } from './pages/contabilidad';
import Comunicaciones from './pages/Comunicaciones';
import Tintas from './pages/Tintas';
import Agujas from './pages/Agujas';
import Estadisticas from './pages/Estadisticas';
import Configuracion from './pages/Configuracion';
import ClientesDuplicados from './pages/ClientesDuplicados';

function PrivateRoute({ children, adminOnly = false }) {
  const { token, usuario } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && usuario?.rol !== 'admin') return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { token } = useAuth();
  return token ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/estadisticas"
            element={
              <PrivateRoute>
                <Estadisticas />
              </PrivateRoute>
            }
          />
          <Route
            path="/citas"
            element={
              <PrivateRoute>
                <Citas />
              </PrivateRoute>
            }
          />
          <Route
            path="/clientes"
            element={
              <PrivateRoute>
                <Clientes />
              </PrivateRoute>
            }
          />
          <Route
            path="/empleados"
            element={
              <PrivateRoute adminOnly>
                <Empleados />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventario"
            element={
              <PrivateRoute>
                <Inventario />
              </PrivateRoute>
            }
          />
          <Route
            path="/ventas"
            element={
              <PrivateRoute>
                <Ventas />
              </PrivateRoute>
            }
          />
          <Route
            path="/gastos"
            element={
              <PrivateRoute>
                <Gastos />
              </PrivateRoute>
            }
          />
          <Route
            path="/consentimientos"
            element={
              <PrivateRoute>
                <Consentimientos />
              </PrivateRoute>
            }
          />
          <Route
            path="/eventos-calendario"
            element={
              <PrivateRoute>
                <EventosCalendario />
              </PrivateRoute>
            }
          />
          <Route
            path="/cabinas"
            element={
              <PrivateRoute>
                <Cabinas />
              </PrivateRoute>
            }
          />
          <Route
            path="/contabilidad/recuento-diario"
            element={
              <PrivateRoute>
                <RecuentoDiario />
              </PrivateRoute>
            }
          />
          <Route
            path="/contabilidad/liquidacion-artista"
            element={
              <PrivateRoute>
                <LiquidacionArtista />
              </PrivateRoute>
            }
          />
          <Route
            path="/contabilidad/liquidacion-estudio"
            element={
              <PrivateRoute>
                <LiquidacionEstudio />
              </PrivateRoute>
            }
          />
          <Route
            path="/contabilidad/recibos"
            element={
              <PrivateRoute>
                <Recibos />
              </PrivateRoute>
            }
          />
          <Route
            path="/tintas"
            element={
              <PrivateRoute>
                <Tintas />
              </PrivateRoute>
            }
          />
          <Route
            path="/agujas"
            element={
              <PrivateRoute>
                <Agujas />
              </PrivateRoute>
            }
          />
          <Route
            path="/comunicaciones"
            element={
              <PrivateRoute>
                <Comunicaciones />
              </PrivateRoute>
            }
          />
          <Route
            path="/clientes/duplicados"
            element={
              <PrivateRoute>
                <ClientesDuplicados />
              </PrivateRoute>
            }
          />
          <Route
            path="/configuracion"
            element={
              <PrivateRoute adminOnly>
                <Configuracion />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
