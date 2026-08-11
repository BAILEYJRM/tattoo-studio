# CHANGELOG

## [Unreleased] - 2026-08-11

### Añadido (Adaptación EE.UU. / España & Booth Rental)
- **Localización Multi-Región (`localeUtils.js`)**: Capa de formateo dinámico para moneda (`$` USD / `€` EUR), fechas (`MM/DD/YYYY` vs `DD/MM/YYYY`), hora 12h AM/PM / 24h, Sales Tax y propinas.
- **Pestaña Ajustes Regionales**: Nueva sección en `Configuracion.js` para alternar entre el mercado de España 🇪🇸 y Estados Unidos 🇺🇸 con un solo clic.
- **Gestión Avanzada de Booth Rental**: Nuevas tablas PostgreSQL (`alquileres_cabina`, `cobros_alquiler_cabina`), modelo `alquilerCabina.js`, endpoints y pestaña *"Booth Rental / Alquileres"* en `Cabinas.js` para gestionar el cobro semanal/mensual del alquiler de sillas a artistas independientes.
- **Sincronización iCal / ICS Feed**: Endpoint `GET /api/sync/ical/:artistaId.ics` en `sync.js` para suscribir citas en tiempo real desde Google Calendar, Apple Calendar (iPhone/Mac) y Goldie.

### Añadido (Fase 3 - Tareas de Alta Complejidad)
- **Pipeline Kanban**: Página `Pipeline.js` con tablero visual interactivo Drag & Drop para cambiar estados de Leads y Proyectos dinámicamente.
- **Analytics / Insights Comercial**: Página `Insights.js` y ruta `/api/insights/resumen` con embudo de conversión, origen de leads, estado de proyectos y análisis de motivos de pérdida.

### Añadido (Fase 3 - Tareas de Complejidad Media)
- **Transiciones de Estado Automáticas**: Endpoint `POST /api/leads/:id/convertir` para convertir Lead a Cliente y Proyecto automáticamente. Actualización automática de estado de Proyecto a 'Aprobado' al aceptar Presupuesto.
- **Generador de Presupuesto en PDF**: Componente `PresupuestoImprimible.js` con vista A4 limpia, desglose económico, marcas de agua y botón de impresión / descarga en PDF.
- **Dashboard Comercial CRM**: Tarjetas interactivas en `Dashboard.js` para Leads Activos, Proyectos en Curso, Presupuestos Aceptados y Tasa de Conversión CRM.
- **Extensión RBAC**: Middlewares `soloGerenteOAdmin` y `esStaffComercial` en `backend/src/middleware/auth.js` para restricción de permisos por rol.

### Añadido (Fase 3 - Tareas de Baja Complejidad)
- **Gestión de Seguimientos**: Página `Seguimientos.js` y ruta `/seguimientos` para gestión de tareas, recordatorios y llamadas comerciales.
- **Motivos de Pérdida**: Selector dinámico de motivos al marcar Leads como "Perdido" o Proyectos como "Cancelado".
- **Compartir Presupuesto**: Botones de envío directo por WhatsApp Web/App y Email desde la vista y detalle de presupuestos.
- **Triggers de Auditoría**: Script SQL `setupTriggers.js` en PostgreSQL para registro automático en la tabla `actividad`.
- **Landing Page**: Integración de nuevas tarjetas promocionales del CRM y Presupuestos interactivos en `Landing.js`.
