import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Percent, Activity } from 'lucide-react';
import { formatCurrency, formatPercent, getBurnRateLabel } from '../../utils/formatters';

const iconMap = {
  income: DollarSign,
  tdi: TrendingUp,
  totalBill: TrendingDown,
  burnRate: Activity,
  nextPayDate: Calendar,
  savingsRate: Percent,
};

const gradientMap = {
  income: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  tdi: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  totalBill: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  burnRate: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  nextPayDate: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  savingsRate: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
};

function MetricCard({ type, label, value, subtext, index = 0 }) {
  const Icon = iconMap[type] || DollarSign;
  const gradient = gradientMap[type] || gradientMap.income;

  return (
    <motion.div
      className="gen-metric-card"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="gen-metric-icon" style={{ background: gradient }}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div className="gen-metric-body">
        <span className="gen-metric-label">{label}</span>
        <span className="gen-metric-value">{value}</span>
        {subtext && <span className="gen-metric-sub">{subtext}</span>}
      </div>
    </motion.div>
  );
}

export default function FinancialMetrics({ data }) {
  const metrics = [];

  if (data.income) {
    metrics.push({
      type: 'income',
      label: 'Monthly Income',
      value: formatCurrency(data.income),
    });
  }

  if (data.totalBill) {
    metrics.push({
      type: 'totalBill',
      label: 'Total Bills',
      value: formatCurrency(data.totalBill),
    });
  }

  if (data.tdi) {
    metrics.push({
      type: 'tdi',
      label: 'True Discretionary Income',
      value: formatCurrency(data.tdi),
      subtext: 'After all bills',
    });
  }

  if (data.burnRate) {
    const { label: burnLabel, color } = getBurnRateLabel(data.burnRate);
    metrics.push({
      type: 'burnRate',
      label: 'Burn Rate',
      value: formatPercent(data.burnRate),
      subtext: burnLabel,
    });
  }

  if (data.nextPayDate) {
    metrics.push({
      type: 'nextPayDate',
      label: 'Next Paycheck',
      value: data.nextPayDate,
    });
  }

  if (metrics.length === 0) return null;

  return (
    <motion.div
      className="gen-metrics-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {metrics.map((m, i) => (
        <MetricCard key={m.type} {...m} index={i} />
      ))}
    </motion.div>
  );
}
