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
