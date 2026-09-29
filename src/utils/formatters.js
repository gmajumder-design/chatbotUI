/**
 * Formatting utilities for financial data.
 */

export function formatCurrency(value, compact = false) {
  if (value == null || isNaN(value)) return '—';
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateStr) {
  if (!dateStr || dateStr === 'Unknown' || dateStr === '—') return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatPercent(value) {
  if (value == null || isNaN(value)) return '—';
  return `${value.toFixed(1)}%`;
}

/**
 * Get a human-friendly label for burn rate.
 */
export function getBurnRateLabel(burnRate) {
  if (burnRate < 40) return { label: 'Healthy', color: 'emerald' };
  if (burnRate < 70) return { label: 'Moderate', color: 'amber' };
  if (burnRate < 85) return { label: 'Caution', color: 'amber' };
  return { label: 'Critical', color: 'rose' };
}

/**
 * Get a status color for a bill status string.
 */
export function getStatusColor(status) {
  if (!status) return 'tertiary';
  const s = status.toUpperCase();
  if (s === 'PAID' || s === 'IS_PAID') return 'emerald';
  if (s === 'DUE' || s === 'UPCOMING') return 'amber';
  if (s === 'OVERDUE' || s === 'LATE') return 'rose';
  return 'blue';
}

/**
 * Generate a color from a string (deterministic).
 */
export function stringToColor(str) {
  const colors = [
    '#3b82f6', '#06b6d4', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#ef4444', '#14b8a6',
    '#f97316', '#6366f1', '#84cc16', '#a855f7',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Chart color palette.
 */
export const CHART_COLORS = [
  '#3b82f6', '#06b6d4', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#ef4444', '#14b8a6',
  '#f97316', '#6366f1', '#84cc16', '#a855f7',
];
