import { motion } from 'framer-motion';
import { formatCurrency, formatDate, getStatusColor, stringToColor } from '../../utils/formatters';
import { CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const statusIcons = {
  emerald: CheckCircle,
  amber: Clock,
  rose: AlertCircle,
  blue: CreditCard,
  tertiary: CreditCard,
};

function BillCard({ bill, index }) {
  const statusColor = getStatusColor(bill.status);
  const StatusIcon = statusIcons[statusColor] || CreditCard;
  const accentColor = stringToColor(bill.name);

  const statusStyles = {
    emerald: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.2)' },
    amber: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
    rose: { bg: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e', border: 'rgba(244, 63, 94, 0.2)' },
    blue: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
    tertiary: { bg: 'rgba(100, 116, 139, 0.12)', color: '#64748b', border: 'rgba(100, 116, 139, 0.2)' },
  };

  const ss = statusStyles[statusColor] || statusStyles.tertiary;

  return (
    <motion.div
      className="gen-bill-card"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ x: 4, transition: { duration: 0.15 } }}
    >
      {/* Color accent bar */}
      <div className="gen-bill-accent" style={{ background: accentColor }} />

      {/* Logo / Initial */}
      <div className="gen-bill-logo" style={{ background: `${accentColor}18`, color: accentColor }}>
        {bill.name.charAt(0).toUpperCase()}
      </div>

      {/* Bill Info */}
      <div className="gen-bill-info">
        <span className="gen-bill-name">{bill.name}</span>
        {bill.category && <span className="gen-bill-category">{bill.category}</span>}
      </div>

      {/* Right Side: Amount + Status */}
      <div className="gen-bill-right">
        <span className="gen-bill-amount">{formatCurrency(bill.amount)}</span>
        {bill.dueDate && (
          <span className="gen-bill-date">{formatDate(bill.dueDate)}</span>
        )}
        {bill.status && (
          <span
            className="gen-bill-status"
            style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}
          >
            <StatusIcon size={11} />
            {bill.status}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function BillsGrid({ bills, totalBill }) {
  if (!bills || bills.length === 0) return null;

  const totalAmount = totalBill || bills.reduce((s, b) => s + b.amount, 0);

  return (
    <motion.div
      className="gen-bills-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Section Header */}
      <div className="gen-section-header">
        <div className="gen-section-header-left">
          <CreditCard size={16} style={{ color: 'var(--accent-blue)' }} />
          <span className="gen-section-title">Your Bills</span>
          <span className="gen-section-count">{bills.length} bills</span>
        </div>
        {totalAmount > 0 && (
          <span className="gen-section-total">{formatCurrency(totalAmount)}</span>
        )}
      </div>

      {/* Bills List */}
      <div className="gen-bills-list">
        {bills.map((bill, i) => (
          <BillCard key={`${bill.name}-${i}`} bill={bill} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
