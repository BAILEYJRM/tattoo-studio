# Reglas Específicas del Workspace: Tattoo Studio Software

Este documento define las directrices exclusivas de arquitectura, desarrollo y normativa para la aplicación del estudio de tatuajes.

---

## 1. Arquitectura del Proyecto

### Backend (Node.js / Express 5 + PostgreSQL)
- **Ubicación**: `./backend/src/`
- **Estructura Modular**:
  - `routes/`: Definición de endpoints REST con prefijo `/api/` en español (`/api/citas`, `/api/clientes`, `/api/tintas`, `/api/consentimientos`, etc.).
  - `controllers/`: Lógica de control de peticiones.
  - `models/`: Consultas SQL y acceso a PostgreSQL mediante `pg`.
  - `services/`: Lógica de negocio (crons, envío de emails con Resend, generación de PDFs con `pdfkit`).
  - `middleware/`: Autenticación JWT, validaciones con `express-validator`.
- **Estructura de Respuesta API**:
  - Toda respuesta debe ser JSON semántico: `{ success: true|false, data: ..., message: "..." }` o `{ status: 'ok'|'error', ... }`.
- **Base de Datos**:
  - Todo cambio o nueva tabla debe actualizar inmediatamente `./backend/src/config/schema.sql` y `./backend/src/config/initDb.js`.

### Frontend (React 19 + Tailwind CSS)
- **Ubicación**: `./frontend/src/`
- **Páginas**: Componentes en `./frontend/src/pages/`.
- **Componentes Reutilizables**: Ubicados en `./frontend/src/components/`.
- **Estilos**: Clases utilitarias de Tailwind CSS siguiendo la estética oscura y moderna del estudio.
- **Cliente API**: Peticiones centralizadas mediante Axios.

---

## 2. Requisitos Legales y Normativa Sanitaria

- **Trazabilidad Sanitaria Obligatoria (Tintas y Agujas)**:
  - En la creación, edición o cierre de citas, se debe asegurar que se registre el número de lote, marca y caducidad de la tinta utilizada, así como el material de agujas esterilizado empleado.
- **Consentimientos Informados y Firma Digital**:
  - No romper el componente de captura de firma digital táctil (`react-signature-canvas`).
  - Garantizar que el PDF generado por `pdfkit` contenga el documento firmado y quede guardado en `uploads/` accesible vía URL estática.

---

## 3. Idioma y Nomenclatura
- Todos los nombres de rutas de API, campos de modelos, mensajes de error y documentación interna deben mantenerse en **español**.
