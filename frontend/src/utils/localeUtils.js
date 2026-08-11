/**
 * Utilidades de localización e internacionalización dinámicas para KuroIchi (EE.UU. / España)
 */

export function getLocaleConfig(config = {}) {
  const pais = config.pais || 'ES'; // 'ES' o 'US'
  const moneda = config.moneda || (pais === 'US' ? 'USD' : 'EUR');
  const formatoFecha = config.formato_fecha || (pais === 'US' ? 'MM/DD/YYYY' : 'DD/MM/YYYY');
  const formatoHora = config.formato_hora || (pais === 'US' ? '12h' : '24h');
  const salesTax = parseFloat(config.sales_tax_porcentaje || 0);
  const mostrarPropinas = config.mostrar_propinas ?? (pais === 'US');

  return { pais, moneda, formatoFecha, formatoHora, salesTax, mostrarPropinas };
}

/**
 * Formatea un importe numérico según la moneda configurada ($ USD / € EUR)
 */
export function formatCurrency(amount, config = {}) {
  if (amount == null || amount === '') return '—';
  const val = Number(amount);
  if (isNaN(val)) return '—';

  const { moneda, pais } = getLocaleConfig(config);
  const locale = pais === 'US' ? 'en-US' : 'es-ES';

  return val.toLocaleString(locale, {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formatea una fecha según el formato configurado (MM/DD/YYYY vs DD/MM/YYYY)
 */
export function formatDate(dateInput, config = {}) {
  if (!dateInput) return '—';
  const d = new Date(dateInput.includes && dateInput.includes('T') ? dateInput : dateInput + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';

  const { pais } = getLocaleConfig(config);
  const locale = pais === 'US' ? 'en-US' : 'es-ES';

  return d.toLocaleDateString(locale, {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formatea una hora en formato 12h AM/PM o 24h
 */
export function formatTime(timeStr, config = {}) {
  if (!timeStr) return '—';
  const { formatoHora } = getLocaleConfig(config);

  if (formatoHora === '12h') {
    const parts = timeStr.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] || '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // la hora 0 se convierte en 12
    return `${hours}:${minutes} ${ampm}`;
  }

  return timeStr.slice(0, 5);
}
