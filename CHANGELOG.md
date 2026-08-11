# CHANGELOG

## [Unreleased] - 2026-08-11

### Añadido (Vista y Menú Reducido para Artistas)
- **Menú Reducido por Rol en `Layout.js`**: Los usuarios con rol `artista` ven un menú simplificado enfocado únicamente en su trabajo diario (Citas, Clientes, Consentimientos, Leads, Proyectos, Presupuestos, Seguimientos, Materiales y su propia Liquidación).
- **Ocultado de Secciones de Gestión Financiera de Estudio**: Se ocultan automáticamente para el perfil `artista` las páginas de Alertas del Estudio, TPV/Ventas del Estudio, Cabinas & Alquileres, Estadísticas globales, Gastos, Ingresos del Estudio, Recuento Diario, Liquidación General de Estudio, Recibos y Ajustes del Propietario.

### Añadido (Selector de Idioma y Filtrado SuperAdmin)
- **Selector de Idioma Global (`LanguageContext.js`)**: Contexto global de i18n con diccionario de traducción (Español 🇪🇸 / Inglés 🇺🇸) y selector rápido en la barra lateral.
- **Ocultado de Perfil SuperAdmin**: Consulta `buscarTodos` en `Empleado` (`backend/src/models/empleado.js`) actualizada para excluir cuentas de administración de la plataforma (`baileyjrm@gmail.com` y rol `superadmin`).

### Añadido (Adaptación EE.UU. / España & Booth Rental)
- **Localización Multi-Región (`localeUtils.js`)**: Formateo dinámico para moneda (`$` USD / `€` EUR), fechas (`MM/DD/YYYY` vs `DD/MM/YYYY`), hora 12h AM/PM / 24h, Sales Tax y propinas.
- **Pestaña Ajustes Regionales**: Nueva sección en `Configuracion.js` para alternar entre 🇪🇸 España y 🇺🇸 EE.UU.
- **Gestión Avanzada de Booth Rental**: Tablas `alquileres_cabina` y `cobros_alquiler_cabina`, modelo `alquilerCabina.js`, endpoints y pestaña *"Booth Rental / Alquileres"* en `Cabinas.js`.
- **Sincronización iCal / ICS Feed**: Endpoint `GET /api/sync/ical/:artistaId.ics` en `sync.js`.
