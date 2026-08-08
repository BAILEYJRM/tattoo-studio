# Walkthrough: Software de Gestión para Estudio de Tatuajes (Tattoo Studio)

Este documento ofrece un recorrido exhaustivo por la arquitectura, módulos, estado del proyecto y guía de uso del sistema integral de gestión para el estudio de tatuajes.

---

## 1. Estado Actual y Fase del Proyecto

Actualmente, el proyecto se encuentra en la **Fase 2: Integración, Pruebas E2E y Despliegue (v1.0.0 Feature Complete)**.

Se han completado con éxito los **6 Bloques Funcionales** planificados:
- **Bloque 1**: Clientes, Historial Clínico/Tatuajes, Citas de Grupo, Calendario Anual y Control de Solapamientos.
- **Bloque 2**: Contabilidad, Recuento Diario de Caja, Liquidación de Tatuadores, Recibos y Facturas.
- **Bloque 3**: Plantillas de Comunicación y Automatización de Notificaciones/Recordatorios (WhatsApp & Email via Resend/Cron).
- **Bloque 4**: Panel de Estadísticas Avanzadas y Métricas de Rendimiento del Estudio.
- **Bloque 5**: Trazabilidad Sanitaria Obligatoria (Lotes de Tintas y Agujas vinculados por Cita).
- **Bloque 6**: Configuración del Estudio (Fiscalidad, Cancelaciones, Parámetros del Sistema).

---

## 2. Arquitectura del Sistema

El proyecto sigue una arquitectura **Client-Server (REST API + SPA)** desacoplada:

```
[ Frontend: React 19 + Tailwind CSS ]
               │
               ▼ (Peticiones HTTP / JSON)
[ Backend: Node.js + Express 5 ]
               │
      ┌────────┴────────┐
      ▼                 ▼
[ PostgreSQL ]    [ Almacenamiento Local / uploads ]
```

### Tecnologías Clave
- **Backend**: Node.js, Express.js (v5), PostgreSQL (`pg`), JWT, bcryptjs, Multer (archivos/fotos), PDFKit (generación de consentimientos/facturas), Resend (emails), Node-cron (tareas programadas).
- **Frontend**: React (v19), React Router (v7), Axios, Tailwind CSS, HTML5 QRCode Scanner, React Signature Canvas.

---

## 3. Desglose de Módulos y Funcionalidades

### 📋 Gestión de Clientes y Fichas Sanitarias
- Ficha completa del cliente con alergias, afecciones médicas y teléfono/email.
- **Detección de Duplicados**: Herramienta para identificar y fusionar fichas duplicadas.
- **Historial Unificado**: Acceso centralizado a citas pasadas, diseños adjuntos, consentimientos firmados y productos/lotes utilizados.

### 📅 Citas y Calendario Inteligente
- Calendario dinámico con vista de día, semana, mes y año.
- **Validación de Solapamiento**: Impide agendar citas duplicadas para el mismo tatuador o en la misma cabina a la misma hora.
- **Citas de Grupo**: Posibilidad de vincular múltiples clientes a una misma sesión o evento.
- **Asignación de Material**: Registro obligatorio de tintas y agujas usadas en cada cita para auditorías sanitarias.

### ✒️ Trazabilidad Sanitaria (Tintas y Agujas)
- Inventario de tintas especificando número de lote, marca, fecha de caducidad y composición.
- Registro de agujas y material esterilizado.
- Vinculación directa cita-material para cumplir con las normativas sanitarias vigentes.

### ✍️ Consentimientos Informados y Firma Digital
- Plantillas de consentimiento redactables y editables.
- Captura de firma digital táctil/mouse en pantalla (`react-signature-canvas`).
- Generación automática de documento PDF sellado y almacenado en el backend (`uploads/`).

### 🚿 Cabinas, Limpiezas e Incidencias
- Control de estado de cabinas (Disponible, Ocupada, En Limpieza, Fuera de Servicio).
- Registro de tareas de desinfección y limpieza post-sesión.
- Reporte de incidencias de equipamiento con subida de fotos adjuntas.

### 💰 Contabilidad, Cajas y Liquidaciones
- **Cierre Diario de Caja**: Arqueo de efectivo, cobros por tarjeta y transferencias.
- **Liquidación a Tatuadores**: Cálculo automático de comisiones basadas en porcentajes acordados.
- **Recibos y Facturación**: Emisión formal de recibos e impresiones/descargas de facturas en PDF.

### 📩 Comunicaciones y Automatismos
- Envío automático de confirmación de cita y recordatorio previo (24-48h).
- Notificación automática con instrucciones de cuidados posteriores (*aftercare*).
- Integración con servidor SMTP / Resend y plantillas editables.

---

## 4. Guía para Levantar y Probar el Proyecto

### Requisitos Previos
- Node.js (v18+)
- PostgreSQL (v14+)

### Configuración del Backend
1. Navegar al directorio backend:
   ```bash
   cd backend
   ```
2. Instalar dependencias (si no se han instalado):
   ```bash
   npm install
   ```
3. Configurar variables de entorno (`.env`):
   ```env
   PORT=3000
   DATABASE_URL=postgresql://usuario:password@localhost:5432/tattoo_db
   JWT_SECRET=secreto_super_seguro
   RESEND_API_KEY=re_xxxx...
   ```
4. Inicializar Base de Datos:
   ```bash
   node src/config/initDb.js
   ```
5. Iniciar Servidor en Modo Desarrollo:
   ```bash
   npm run dev
   ```

### Configuración del Frontend
1. Navegar al directorio frontend:
   ```bash
   cd frontend
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar Aplicación React:
   ```bash
   npm start
   ```
   *La aplicación estará disponible en `http://localhost:3000` (o `3001` si el backend usa el 3000).*

---

## 5. Próximos Pasos Recomendados

1. Ejecutar pruebas unitarias / de integración en las rutas críticas (Autenticación, Agendamiento y Firma de Consentimientos).
2. Probar la generación de PDFs y verificar el envío real de correos con Resend en un entorno de staging/prueba.
3. Despliegue en producción (ej. Docker / VPS o plataformas como Render/Vercel/Railway).
