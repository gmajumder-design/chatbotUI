import { parseFinancialResponse } from '../../utils/parseFinancialData';
import FinancialMetrics from './FinancialMetrics';
import BillsGrid from './BillsGrid';
import FinancialCharts from './FinancialCharts';
import BurnRateGauge from './BurnRateGauge';
import FinancialHealthScore from './FinancialHealthScore';
import GenerativeBudgetFlow from './GenerativeBudgetFlow';

/**
 * GenerativeResponse — The main orchestrator for Generative UI.
 *
 * Given the bot's raw markdown text and optional chart_data,
 * it parses the text, detects the response type, and renders
 * the appropriate rich UI components BELOW the markdown text.
 */
export default function GenerativeResponse({ text, chartData }) {
  const data = parseFinancialResponse(text, chartData);

  // Don't render any generative UI for error or generic responses
  if (data.responseType === 'error' || data.responseType === 'generic') {
    return null;
  }

  // Determine if we should show the health score
  // Show it when we have both income and bills data
  const showHealthScore = data.income && data.totalBill && data.hasBills;
  const shouldShowBudgetFlow = data.hasBills || data.income != null;

  return (
    <div className="gen-response-container">
      {/* ─── Financial Health Score (hero card) ─── */}
      {showHealthScore && (
        <FinancialHealthScore
          income={data.income}
          totalBill={data.totalBill}
          tdi={data.tdi}
          burnRate={data.burnRate}
        />
      )}

      {/* ─── Financial Metrics Cards ─── */}
      {data.hasFinancialMetrics && !showHealthScore && (
        <FinancialMetrics data={data} />
      )}

      {/* ─── Burn Rate Gauge (standalone, when no health score) ─── */}
      {data.burnRate != null && !showHealthScore && (
        <BurnRateGauge
          burnRate={data.burnRate}
          income={data.income}
          totalBill={data.totalBill}
          tdi={data.tdi}
        />
      )}

      {/* ─── Bills Grid ─── */}
      {data.hasBills && (
        <BillsGrid bills={data.bills} totalBill={data.totalBill} />
      )}

      {/* ─── Charts ─── */}
      {data.chartData && (
        <FinancialCharts
          categoryData={data.categoryData}
          chartData={data.chartData}
        />
      )}

      {/* ─── Interactive Action Flows ─── */}
      {shouldShowBudgetFlow && (
        <GenerativeBudgetFlow />
      )}
    </div>
  );
}
