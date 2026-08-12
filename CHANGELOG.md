# CHANGELOG

## [Unreleased] - 2026-08-13

### Estilo & Animaciones (Integración Animate UI & Lucide React)
- **Soporte para Animate UI y Framer Motion**: Instaladas dependencias `framer-motion`, `clsx` y `tailwind-merge`.
- **Configuración de Aliases `@/*`**: Creado `jsconfig.json` y la función de utilidad `cn` en `src/lib/utils.js`.
- **Componente Animado `SlidingNumber`**: Añadido primer componente de `animate-ui` en `src/components/animate-ui/sliding-number.jsx` para contadores numéricos fluídos.
- **Homogeneización del Diseño de Tarjetas (Dashboard & Gastos)**: Unificado el esquema de tarjetas y contenedores (`bg-gray-900` con paleta sRGB suave) para que la página de Dashboard tenga exactamente la misma apariencia limpia, uniforme y moderna que la sección de Gastos en Modo Claro y Modo Oscuro.


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
