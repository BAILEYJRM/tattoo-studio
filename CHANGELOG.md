# CHANGELOG

## [Unreleased] - 2026-08-11

### Añadido (Invitación de Empleados y Login por PIN Tablet)
- **Acceso por PIN de 4-6 dígitos (`pin_acceso`)**: Nueva columna en PostgreSQL `empleados`, endpoint `POST /api/auth/login-pin` y selector de PIN de acceso rápido en el formulario de alta de empleados (`Empleados.js`).
- **Modo Tablet en Login (`Login.js`)**: Selector de pestaña en la pantalla de acceso para alternar entre *"Email y Contraseña"* (Manager/Estándar) y *"📱 PIN Tablet"* (Acceso rápido para tatuadores en iPad o dispositivos de estudio).

### Añadido (Vista y Menú Reducido para Artistas)
- **Menú Reducido por Rol en `Layout.js`**: Los usuarios con rol `artista` ven un menú simplificado enfocado únicamente en su trabajo diario (Citas, Clientes, Consentimientos, Leads, Proyectos, Presupuestos, Seguimientos, Materiales y su propia Liquidación).
- **Ocultado de Secciones de Gestión Financiera de Estudio**: Se ocultan automáticamente para el perfil `artista` las páginas de Alertas del Estudio, TPV/Ventas del Estudio, Cabinas & Alquileres, Estadísticas globales, Gastos, Ingresos del Estudio, Recuento Diario, Liquidación General de Estudio, Recibos y Ajustes del Propietario.

### Añadido (Selector de Idioma y Filtrado SuperAdmin)
- **Selector de Idioma Global (`LanguageContext.js`)**: Contexto global de i18n con diccionario de traducción (Español 🇪🇸 / Inglés 🇺🇸) y selector rápido en la barra lateral.
- **Ocultado de Perfil SuperAdmin**: Consulta `buscarTodos` en `Empleado` (`backend/src/models/empleado.js`) actualizada para excluir cuentas de administración de la plataforma (`baileyjrm@gmail.com` y rol `superadmin`).
