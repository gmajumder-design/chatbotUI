/**
 * Financial Data Parser — Extracts structured data from the bot's markdown response
 * to render as Generative UI components (charts, cards, gauges, etc.)
 *
 * Works by pattern-matching the bot's markdown output WITHOUT needing
 * the backend to send a separate structured JSON payload.
 */

/**
 * Parse a dollar string like "$1,234.56" to a float
 */
function parseDollar(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/[$,]/g, '')) || 0;
}

/**
 * Extract bill items from a markdown response.
 * Looks for lines like: * **Biller Name** (Category): **$X,XXX.XX** due **Month DD, YYYY** (STATUS)
 */
export function extractBills(text) {
  if (!text) return [];
  const bills = [];

  // Pattern: * **Name** (Category): **$Amount** due **Date** (Status)
  // Also handles variations without category or status
  const billRegex = /\*\s*\*\*(.+?)\*\*\s*(?:\(([^)]+)\))?\s*:?\s*\*\*\$([0-9,.]+)\*\*(?:\s*(?:due|–|—|-)\s*\*\*([^*]+)\*\*)?(?:\s*\((\w[\w\s]*)\))?/gi;
  let match;

  while ((match = billRegex.exec(text)) !== null) {
    const name = match[1].trim();
    const category = match[2]?.trim() || '';
    const amount = parseDollar(match[3]);
    const dueDate = match[4]?.trim() || '';
    const status = match[5]?.trim()?.toUpperCase() || '';

    // Skip if this looks like a total line
    if (name.toLowerCase().includes('total')) continue;

    bills.push({ name, category, amount, dueDate, status });
  }

  return bills;
}

/**
 * Extract the total bill amount from the response.
 */
export function extractTotalBill(text) {
  if (!text) return null;
  // Pattern: **Your Total Bill**: **$X,XXX.XX**
  const totalRegex = /(?:total\s*bill|total\s*amount|total\s*bills?)\s*[:\s]*\*?\*?\$?([0-9,.]+)/i;
  const match = totalRegex.exec(text);
  if (match) return parseDollar(match[1]);
  return null;
}

/**
 * Extract TDI (True Discretionary Income) from the response.
 */
export function extractTDI(text) {
  if (!text) return null;
  // Various patterns for TDI
  const tdiRegex = /(?:TDI|True\s+Discretionary\s+Income|discretionary\s+income)[^$]*\$([0-9,.]+)/i;
  const match = tdiRegex.exec(text);
  if (match) return parseDollar(match[1]);
  return null;
}

/**
 * Extract income from the response.
 */
export function extractIncome(text) {
  if (!text) return null;
  const incomeRegex = /(?:monthly\s+income|total\s+income|your\s+income|income\s+is)[^$]*\$([0-9,.]+)/i;
  const match = incomeRegex.exec(text);
  if (match) return parseDollar(match[1]);
  return null;
}

/**
 * Extract next paycheck date from the response.
 */
export function extractNextPayDate(text) {
  if (!text) return null;
  const dateRegex = /(?:next\s+pay(?:check|day)|expected\s+(?:pay|on))[^*]*\*\*([^*]+)\*\*/i;
  const match = dateRegex.exec(text);
  if (match) return match[1].trim();
  return null;
}

/**
 * Extract burn rate from the response.
 */
export function extractBurnRate(text) {
  if (!text) return null;
  const burnRegex = /burn\s*rate[^0-9]*([0-9.]+)\s*%/i;
  const match = burnRegex.exec(text);
  if (match) return parseFloat(match[1]);
  return null;
}

/**
 * Detect what "type" of financial response this is.
 * Returns a string like 'bills_overview', 'tdi', 'income', 'paycheck', 'advice', 'error'
 */
export function detectResponseType(text) {
  if (!text) return 'generic';
  const lower = text.toLowerCase();

  const bills = extractBills(text);
  if (bills.length > 0) return 'bills_overview';

  if (lower.includes('tdi') || lower.includes('discretionary income')) return 'tdi';
  if (lower.includes('next pay') || lower.includes('paycheck') || lower.includes('payday')) return 'paycheck';
  if (lower.includes('income') && !lower.includes('discretionary')) return 'income';
  if (lower.includes('budget') || lower.includes('savings') || lower.includes('reduce') || lower.includes('advice')) return 'advice';
  if (lower.includes('couldn\'t find') || lower.includes('error')) return 'error';
  if (lower.includes('bitcoin') || lower.includes('crypto') || lower.includes('ethereum')) return 'crypto';
  if (lower.includes('exchange rate') || lower.includes('currency')) return 'currency';

  return 'generic';
}

/**
 * Build a comprehensive financial snapshot from the response text.
 * Returns all extracted data so components can render the right UI.
 */
export function parseFinancialResponse(text, chartData = null) {
  const bills = extractBills(text);
  const totalBill = extractTotalBill(text);
  const tdi = extractTDI(text);
  const income = extractIncome(text);
  const nextPayDate = extractNextPayDate(text);
  const burnRate = extractBurnRate(text);
  const responseType = detectResponseType(text);

  // Build category breakdown for pie chart from bills
  const categoryBreakdown = {};
  bills.forEach(bill => {
    const cat = bill.category || 'Other';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + bill.amount;
  });

  const categoryData = Object.entries(categoryBreakdown)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);

  return {
    responseType,
    bills,
    totalBill,
    tdi,
    income,
    nextPayDate,
    burnRate,
    categoryData,
    chartData,
    hasBills: bills.length > 0,
    hasFinancialMetrics: !!(tdi || income || burnRate),
    billCount: bills.length,
  };
}
