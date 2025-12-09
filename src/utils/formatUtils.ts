// ==============================================
// UTILIDADES DE FORMATEO
// ==============================================

/**
 * Formatea un número como moneda USD
 * Ejemplo: 1000000 → "US$ 1,000,000"
 */
 export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    currencyDisplay: 'symbol'
  }).format(amount).replace('$', 'US$ ');
};

/**
 * Formatea un número con separadores de miles
 * Ejemplo: 1000000 → "1,000,000"
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

/**
 * Formatea una fecha en formato local
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES');
};

/**
 * Formatea una fecha y hora
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString('es-ES')} ${date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;
};