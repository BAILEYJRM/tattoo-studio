# CHANGELOG

## [Unreleased] - 2026-08-13

### Estilo & Animaciones (Integración Animate UI & Lucide React)
- **Soporte para Animate UI y Framer Motion**: Instaladas dependencias `framer-motion`, `clsx` y `tailwind-merge`.
- **Configuración de Aliases `@/*`**: Creado `jsconfig.json` y la función de utilidad `cn` en `src/lib/utils.js`.
- **Componente Animado `SlidingNumber`**: Añadido primer componente de `animate-ui` en `src/components/animate-ui/sliding-number.jsx` para contadores numéricos fluídos.
- **Solución a la Sincronización de Temas Visuales en Login/Logout**: Corregido `ThemeContext` e `index.js` reactivo para actualizar automáticamente el tema del estudio al iniciar sesión y purgar totalmente las variables CSS personalizadas al cerrar sesión sin requerir recargar la página (F5).


### Estilo & Diseño (Rediseño Visual del Landing Page)
- **Eliminación de Líneas Horizontales**: Eliminadas todas las bordes de separación horizontales entre secciones para lograr una experiencia de desplazamiento fluido y moderno.
- **Fondo Oscuro Uniforme**: Eliminados los bloques de fondos grises en favor de un tono negro profundo uniforme (`#050505`) con degradados radiales rojos sutiles.
- **Mockups de Interfaz del Software**: Añadidos componentes visuales interactivos de KuroIchi en el Landing Page:
  - Mockup del Dashboard Principal (Citas, TPV, iCal Feed, Cabinas).
  - Mockup del Pipeline CRM Kanban (Leads comercial).
  - Mockup de Firma Digital en Tablet y Consentimientos Informados PDF con lotes de tintas.

### Añadido (Panel de Control SuperAdmin SaaS - `/superadmin`)
- **Middleware de Autorización y Rutas (`superadminAuth.js` & `superadmin.js`)**: Panel de gestión para el propietario de la plataforma.
- **Vista Frontend SuperAdmin (`SuperAdmin.js`)**: MRR, Estudios totales, activos, en prueba gratis y gestión de contraseñas.
