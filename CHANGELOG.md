# CHANGELOG

## [Unreleased] - 2026-08-11

### Añadido (Panel de Control SuperAdmin SaaS - `/superadmin`)
- **Middleware de Autorización (`superadminAuth.js`)**: Protección estricta en el backend para validar que únicamente cuentas `superadmin` (`baileyjrm@gmail.com`) puedan acceder a las funciones globales de gestión del software.
- **Rutas y Controlador SuperAdmin (`superadmin.js`)**: Endpoints para consulta de métricas globales, listado de estudios registrados, actualización de planes (`Starter`, `PRO Mensual`, `PRO Semestral`, `PRO Anual`), suspensión/activación de acceso, extensión de periodo de prueba gratis por +14 días y restablecimiento de contraseña de administradores de estudio.
- **Vista Frontend SuperAdmin (`SuperAdmin.js`)**: Panel en modo oscuro con métricas clave (MRR estimado, Estudios totales, Estudios activos, En prueba y Total de tatuadores en la plataforma), buscador/filtrado de estudios y modal de control directo.
- **Navegación Protegida (`Layout.js` & `App.js`)**: Botón exclusivo **Panel SuperAdmin** en la barra lateral para el propietario de la plataforma y protección de rutas.

### Añadido (Landing Page Renovada inspirada en Inkoru)
- **Cinta Marquee de Estudios de Tatuaje (`Landing.js`)**: Marquesina animada en el Hero.
- **Estructura de Precios Transparente**: Planes Mensual, Semestral y Anual.
- **Modal de Matriz Completa de Características**: +40 características organizadas.
- **Módulo de Contacto Directo & WhatsApp**: Formulario con antispam y botón directo a WhatsApp.
