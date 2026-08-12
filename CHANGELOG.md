# CHANGELOG

## [Unreleased] - 2026-08-13

### Estilo & Animaciones (Integración Animate UI & Lucide React)
- **Soporte para Animate UI y Framer Motion**: Instaladas dependencias `framer-motion`, `clsx` y `tailwind-merge`.
- **Configuración de Aliases `@/*`**: Creado `jsconfig.json` y la función de utilidad `cn` en `src/lib/utils.js`.
- **Soporte de Traducción Multilingüe en Páginas**: Ampliado [`LanguageContext.js`](file:///c:/Users/Bailey/proyectos/tattoo-studio/frontend/src/context/LanguageContext.js) y conectado a las páginas de la aplicación ([`Dashboard.js`](file:///c:/Users/Bailey/proyectos/tattoo-studio/frontend/src/pages/Dashboard.js), etc.). Ahora al conmutar el selector de idioma (ES/EN), todos los encabezados, estados, métricas, tarjetas, listas y accesos rápidos de la página cambian dinámicamente de idioma en tiempo real junto con el menú de navegación.
- **Contadores Animados con `SlidingNumber`**: Implementada la animación de conteo deslizante para los valores numéricos y métricas financieras de ventas, gastos y beneficio en el Dashboard.
- **Eliminación del Destello de Modo Oscuro al Refrescar (FOUC)**: Actualizado el script síncrono del `<head>` en `public/index.html` para aplicar la propiedad `data-theme="light"` inmediatamente antes de la primera renderización de la página, eliminando el parpadeo oscuro al recargar con F5.
- **Bordes y Delimitación Global de Tarjetas en Modo Claro**: Aplicada regla global en `index.css` y `Clientes.js` para que absolutamente todas las tarjetas, tablas y bloques contenedores de Clientes y el resto de páginas tengan bordes limpios `#cbd5e1` y sombra suave, distinguiéndose perfectamente del fondo en Modo Claro.


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
