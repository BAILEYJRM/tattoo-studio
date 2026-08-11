# CHANGELOG

## [Unreleased] - 2026-08-11

### Añadido (Selector de Idioma y Filtrado SuperAdmin)
- **Selector de Idioma Global (`LanguageContext.js`)**: Contexto global de i18n con diccionario de traducción (Español 🇪🇸 / Inglés 🇺🇸) y selector rápido en la barra lateral/pie de navegación.
- **Ocultado de Perfil SuperAdmin**: Modificada la consulta `buscarTodos` en `Empleado` (`backend/src/models/empleado.js`) para excluir automáticamente las cuentas de administración de la plataforma (`baileyjrm@gmail.com` y rol `superadmin`) de la lista de empleados/artistas del estudio.
- **Modelo de Permisos SaaS Multi-Tenant**: Estructuración clara entre **Manager** (propietario del estudio con acceso total), **Artista** (acceso limitado a su agenda, proyectos y presupuestos) y **SuperAdmin** (administrador de la plataforma SaaS, oculto).

### Añadido (Adaptación EE.UU. / España & Booth Rental)
- **Localización Multi-Región (`localeUtils.js`)**: Capa de formateo dinámico para moneda (`$` USD / `€` EUR), fechas (`MM/DD/YYYY` vs `DD/MM/YYYY`), hora 12h AM/PM / 24h, Sales Tax y propinas.
- **Pestaña Ajustes Regionales**: Nueva sección en `Configuracion.js` para alternar entre el mercado de España 🇪🇸 y Estados Unidos 🇺🇸 con un solo clic.
- **Gestión Avanzada de Booth Rental**: Nuevas tablas PostgreSQL (`alquileres_cabina`, `cobros_alquiler_cabina`), modelo `alquilerCabina.js`, endpoints y pestaña *"Booth Rental / Alquileres"* en `Cabinas.js` para gestionar el cobro semanal/mensual del alquiler de sillas a artistas independientes.
- **Sincronización iCal / ICS Feed**: Endpoint `GET /api/sync/ical/:artistaId.ics` en `sync.js` para suscribir citas en tiempo real desde Google Calendar, Apple Calendar (iPhone/Mac) y Goldie.

### Añadido (Fase 3 - Tareas de Alta Complejidad)
- **Pipeline Kanban**: Página `Pipeline.js` con tablero visual interactivo Drag & Drop para cambiar estados de Leads y Proyectos dinámicamente.
- **Analytics / Insights Comercial**: Página `Insights.js` y ruta `/api/insights/resumen` con embudo de conversión, origen de leads, estado de proyectos y análisis de motivos de pérdida.
