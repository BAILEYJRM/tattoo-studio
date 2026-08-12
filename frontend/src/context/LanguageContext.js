import React, { createContext, useState, useContext } from 'react';

const translations = {
  es: {
    // Categorías de Navegación
    gestion: 'Gestión',
    comercial: 'Comercial',
    inventario: 'Inventario',
    contabilidad: 'Contabilidad',

    // Elementos del menú
    dashboard: 'Dashboard',
    alertas: 'Alertas',
    calendario: 'Calendario',
    clientes: 'Clientes',
    ventas: 'Ventas (TPV)',
    consentimientos: 'Consentimientos',
    cabinas: 'Cabinas & Alquileres',
    empleados: 'Empleados',
    comunicaciones: 'Comunicaciones',
    leads: 'Leads',
    proyectos: 'Proyectos',
    presupuestos: 'Presupuestos',
    seguimientos: 'Seguimientos',
    pipeline: 'Pipeline (Kanban)',
    insights: 'Insights Comercial',
    tintas: 'Tintas',
    agujas: 'Agujas',
    piercing: 'Piercing',
    materiales: 'Materiales',
    estadisticas: 'Estadísticas',
    gastos: 'Gastos',
    ingresos: 'Ingresos',
    recuento_diario: 'Recuento Diario',
    mi_liquidacion: 'Mi Liquidación',
    liq_estudio: 'Liq. Estudio',
    recibos: 'Recibos',
    configuracion: 'Configuración',
    cerrar_sesion: 'Cerrar sesión',
    panel_superadmin: 'Panel SuperAdmin',

    // Dashboard
    buenos_dias: 'Buenos días',
    buenas_tardes: 'Buenas tardes',
    buenas_noches: 'Buenas noches',
    accesos_rapidos: 'Accesos Rápidos',
    citas_de_hoy: 'Citas de hoy',
    ventas_del_mes: 'Ventas del mes',
    gastos_del_mes: 'Gastos del mes',
    beneficio_del_mes: 'Beneficio del mes',
    pendientes: 'Pendientes',
    alertas_pendientes: 'alertas',
    leads_activos: 'Leads Activos',
    en_seguimiento: 'En seguimiento',
    proyectos_diseno: 'Proyectos',
    en_diseno: 'En diseño / curso',
    presupuestos_aceptados: 'Presupuestos',
    aceptados: 'Aceptados',
    conversion_crm: 'Conversión CRM',
    leads_a_clientes: 'Leads a Clientes',
    nueva_cita: 'Nueva Cita',
    programa_calendario: 'Programa en el calendario',
    anadir_cliente: 'Añadir Cliente',
    registra_perfil: 'Registra un nuevo perfil',
    ver_inventario: 'Ver Inventario',
    consulta_productos: 'Consulta tus productos',
    ajusta_estudio: 'Ajusta tu estudio',
    ir: 'Ir →',
    no_hay_citas_hoy: 'No hay citas programadas para hoy',
    stock_bajo_en: 'Stock bajo en',
    con_no_shows: 'con 3+ no-shows',
    ausencias_semana: 'Ausencias esta semana',

    // Textos comunes
    nuevo: 'Nuevo',
    guardar: 'Guardar',
    cancelar: 'Cancelar',
    editar: 'Editar',
    eliminar: 'Eliminar',
    buscar: 'Buscar...',
    acciones: 'Acciones',
    estado: 'Estado',
    fecha: 'Fecha',
    cliente: 'Cliente',
    artista: 'Artista',
    total: 'Total',
    idioma: 'Idioma',
    filtros: 'Filtros',
    exportar: 'Exportar',
    limpiar: 'Limpiar',
    nombre: 'Nombre',
    email: 'Email',
    telefono: 'Teléfono',
    cargando: 'Cargando...',
    detalles: 'Detalles',
  },
  en: {
    // Navigation Categories
    gestion: 'Management',
    comercial: 'Sales & CRM',
    inventario: 'Inventory',
    contabilidad: 'Finance & Payroll',

    // Menu Items
    dashboard: 'Dashboard',
    alertas: 'Alerts',
    calendario: 'Calendar',
    clientes: 'Clients',
    ventas: 'Sales (POS)',
    consentimientos: 'Waivers & Consent',
    cabinas: 'Booths & Rental',
    empleados: 'Staff & Artists',
    comunicaciones: 'Communications',
    leads: 'Leads (Inquiries)',
    proyectos: 'Projects',
    presupuestos: 'Quotes',
    seguimientos: 'Follow-ups',
    pipeline: 'Pipeline (Kanban)',
    insights: 'Sales Insights',
    tintas: 'Inks',
    agujas: 'Needles',
    piercing: 'Piercing',
    materiales: 'Supplies',
    estadisticas: 'Statistics',
    gastos: 'Expenses',
    ingresos: 'Revenue',
    recuento_diario: 'Daily Audit',
    mi_liquidacion: 'My Settlement',
    liq_estudio: 'Studio Payouts',
    recibos: 'Receipts',
    configuracion: 'Settings',
    cerrar_sesion: 'Log Out',
    panel_superadmin: 'SuperAdmin Panel',

    // Dashboard
    buenos_dias: 'Good morning',
    buenas_tardes: 'Good afternoon',
    buenas_noches: 'Good evening',
    accesos_rapidos: 'Quick Access',
    citas_de_hoy: "Today's Appointments",
    ventas_del_mes: 'Monthly Sales',
    gastos_del_mes: 'Monthly Expenses',
    beneficio_del_mes: 'Monthly Profit',
    pendientes: 'Pending',
    alertas_pendientes: 'alerts',
    leads_activos: 'Active Leads',
    en_seguimiento: 'In follow-up',
    proyectos_diseno: 'Projects',
    en_diseno: 'In design / progress',
    presupuestos_aceptados: 'Quotes',
    aceptados: 'Accepted',
    conversion_crm: 'CRM Conversion',
    leads_a_clientes: 'Leads to Clients',
    nueva_cita: 'New Appointment',
    programa_calendario: 'Schedule on calendar',
    anadir_cliente: 'Add Client',
    registra_perfil: 'Register new profile',
    ver_inventario: 'View Inventory',
    consulta_productos: 'Browse products',
    ajusta_estudio: 'Configure studio',
    ir: 'Go →',
    no_hay_citas_hoy: 'No appointments scheduled for today',
    stock_bajo_en: 'Low stock on',
    con_no_shows: 'with 3+ no-shows',
    ausencias_semana: 'Absences this week',

    // Common Text
    nuevo: 'New',
    guardar: 'Save',
    cancelar: 'Cancel',
    editar: 'Edit',
    eliminar: 'Delete',
    buscar: 'Search...',
    acciones: 'Actions',
    estado: 'Status',
    fecha: 'Date',
    cliente: 'Client',
    artista: 'Artist',
    total: 'Total',
    idioma: 'Language',
    filtros: 'Filters',
    exportar: 'Export',
    limpiar: 'Clear',
    nombre: 'Name',
    email: 'Email',
    telefono: 'Phone',
    cargando: 'Loading...',
    detalles: 'Details',
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('kuroichi_lang') || 'es');

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('kuroichi_lang', newLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['es']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
