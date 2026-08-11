import React, { createContext, useState, useContext } from 'react';

const translations = {
  es: {
    // General / Navegación
    dashboard: 'Panel Principal',
    clientes: 'Clientes',
    citas: 'Citas',
    leads: 'Leads (CRM)',
    proyectos: 'Proyectos',
    presupuestos: 'Presupuestos',
    seguimientos: 'Seguimientos',
    pipeline: 'Pipeline (Kanban)',
    insights: 'Insights Comercial',
    inventario: 'Inventario',
    contabilidad: 'Contabilidad',
    cabinas: 'Cabinas & Alquileres',
    configuracion: 'Configuración',
    logout: 'Cerrar Sesión',
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
    // General / Navigation
    dashboard: 'Dashboard',
    clientes: 'Clients',
    citas: 'Appointments',
    leads: 'Leads (CRM)',
    proyectos: 'Projects',
    presupuestos: 'Quotes',
    seguimientos: 'Follow-ups',
    pipeline: 'Pipeline (Kanban)',
    insights: 'Commercial Insights',
    inventario: 'Inventory',
    contabilidad: 'Accounting',
    cabinas: 'Booths & Rental',
    configuracion: 'Settings',
    logout: 'Log Out',
    // Common text
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
