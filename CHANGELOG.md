# CHANGELOG

## [Unreleased] - 2026-08-11

### Correcciones (Persistencia de Tema e Idioma)
- **Persistencia de Personalización del Estudio (`ThemeContext.js`)**: Corregido el problema donde la personalización del estudio (colores, fuentes, skin) se perdía al refrescar la página. Ahora la app lee inmediatamente el tema guardado en `localStorage` al iniciar y solicita los ajustes con autenticación mediante `getConfiguracion()` para el estudio actual.
- **Traducción Dinámica e i18n (`LanguageContext.js` & `Layout.js`)**: Conectada la función de traducción `t(key)` y enriquecidas las traducciones en Español 🇪🇸 e Inglés 🇺🇸 para que al hacer clic en el botón de idioma de la barra lateral, toda la navegación y elementos cambien dinámicamente de idioma en tiempo real.

### Añadido (Invitación de Empleados y Login por PIN Tablet)
- **Acceso por PIN de 4-6 dígitos (`pin_acceso`)**: Nueva columna en PostgreSQL `empleados`, endpoint `POST /api/auth/login-pin` y selector de PIN de acceso rápido en el formulario de alta de empleados (`Empleados.js`).
- **Modo Tablet en Login (`Login.js`)**: Selector de pestaña en la pantalla de acceso para alternar entre *"Email y Contraseña"* (Manager/Estándar) y *"📱 PIN Tablet"* (Acceso rápido para tatuadores en iPad o dispositivos de estudio).

### Añadido (Vista y Menú Reducido para Artistas)
- **Menú Reducido por Rol en `Layout.js`**: Los usuarios con rol `artista` ven un menú simplificado enfocado únicamente en su trabajo diario.
