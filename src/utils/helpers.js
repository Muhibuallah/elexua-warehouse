import { addDays, differenceInDays, format, parseISO } from 'date-fns';

// Date calculations
export function calcKeepUntilDate(orderDate, supplierReturnDays) {
  if (!orderDate) return null;
  const d = typeof orderDate === 'string' ? parseISO(orderDate) : orderDate;
  return addDays(d, supplierReturnDays || 80);
}

export function calcSupplierDaysLeft(keepUntilDate) {
  if (!keepUntilDate) return null;
  return differenceInDays(keepUntilDate, new Date());
}

export function calcSupplierReturnStatus(daysLeft) {
  if (daysLeft === null || daysLeft === undefined) return 'Unknown';
  return daysLeft >= 0 ? 'Return Allowed' : 'Return Expired';
}

export function calcReturnDeadline(shippingDate, customerReturnDays = 20) {
  if (!shippingDate) return null;
  const d = typeof shippingDate === 'string' ? parseISO(shippingDate) : shippingDate;
  return addDays(d, customerReturnDays);
}

export function calcDaysLeft(returnDeadline) {
  if (!returnDeadline) return null;
  return differenceInDays(returnDeadline, new Date());
}

export function calcReturnStatus(daysLeft) {
  if (daysLeft === null || daysLeft === undefined) return 'Unknown';
  return daysLeft >= 0 ? 'Rücksendung aktuell' : 'Rücksendung abgeschlossen';
}

export function formatDate(date) {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd.MM.yyyy');
  } catch { return '—'; }
}

export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd');
}

// Barcode generation
export function generateStorageBarcode(secretCode, supplierArticleId, boxLabel) {
  if (!secretCode || !supplierArticleId || !boxLabel) return '';
  return `${secretCode}-${supplierArticleId}-${boxLabel}`;
}

export function generateCustomerBarcode(secretCode, supplierArticleId, boxLabel, shippingDate) {
  if (!secretCode || !supplierArticleId || !boxLabel || !shippingDate) return '';
  const d = typeof shippingDate === 'string' ? parseISO(shippingDate) : shippingDate;
  const dateStr = format(d, 'ddMMyy');
  return `${secretCode}-${supplierArticleId}-${boxLabel}-${dateStr}`;
}

// Box label generation
export function generateBoxLabels() {
  const labels = [];
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // A-Z
  for (const c of alpha) labels.push(c);
  // AA-AZ, BA-BZ, ... ZA-ZZ
  for (const c1 of alpha) {
    for (const c2 of alpha) {
      labels.push(c1 + c2);
    }
  }
  return labels;
}

// Export data as JSON file
export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Status badge color
export function statusColor(status) {
  const map = {
    stored: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    sent_to_customer: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    returned_to_supplier: 'bg-surface-500/20 text-surface-300 border-surface-500/30',
    sold: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Return Allowed': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Return Expired': 'bg-red-500/20 text-red-300 border-red-500/30',
    'Rücksendung aktuell': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Rücksendung abgeschlossen': 'bg-surface-500/20 text-surface-400 border-surface-500/30',
    'Unknown': 'bg-surface-700 text-surface-400',
  };
  return map[status] || 'bg-surface-700 text-surface-400';
}

export function daysLeftColor(days) {
  if (days === null || days === undefined) return 'text-surface-400';
  if (days <= 3) return 'text-red-400';
  if (days <= 10) return 'text-amber-400';
  return 'text-emerald-400';
}

// Search helpers
export function searchMatch(text, query) {
  if (!query) return true;
  return String(text || '').toLowerCase().includes(query.toLowerCase());
}
