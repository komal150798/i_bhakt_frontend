/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format style ('short', 'long', 'datetime')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'short') {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '-';
  
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
  };
  
  return dateObj.toLocaleDateString('en-US', options[format] || options.short);
}

