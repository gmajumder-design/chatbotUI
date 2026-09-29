import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { formatPercent, getBurnRateLabel, formatCurrency } from '../../utils/formatters';

/**
 * Animated radial gauge for burn rate or any 0-100% metric.
 */
export default function BurnRateGauge({ burnRate, income, totalBill, tdi }) {
  if (burnRate == null) return null;

  const { label, color } = getBurnRateLabel(burnRate);
  const clampedRate = Math.min(100, Math.max(0, burnRate));

  // SVG arc calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedRate / 100) * circumference;

  const colorMap = {
    emerald: { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.3)', bg: 'rgba(16, 185, 129, 0.08)' },
    amber: { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)', bg: 'rgba(245, 158, 11, 0.08)' },
    rose: { stroke: '#f43f5e', glow: 'rgba(244, 63, 94, 0.3)', bg: 'rgba(244, 63, 94, 0.08)' },
  };
  const c = colorMap[color] || colorMap.emerald;

  return (
    <motion.div
      className="gen-gauge-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="gen-section-header">
        <div className="gen-section-header-left">
          <Activity size={16} style={{ color: c.stroke }} />
          <span className="gen-section-title">Financial Health</span>
        </div>
        <span className="gen-gauge-label-badge" style={{ background: c.bg, color: c.stroke }}>
          {label}
        </span>
      </div>

      <div className="gen-gauge-body">
        {/* Gauge SVG */}
        <div className="gen-gauge-svg-wrap">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Background track */}
            <circle
              cx="90" cy="90" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="12"
              strokeLinecap="round"
              transform="rotate(-90 90 90)"
            />
            {/* Active arc */}
            <motion.circle
              cx="90" cy="90" r={radius}
              fill="none"
              stroke={c.stroke}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              transform="rotate(-90 90 90)"
              style={{ filter: `drop-shadow(0 0 8px ${c.glow})` }}
            />
          </svg>
          {/* Center Text */}
          <div className="gen-gauge-center">
            <motion.span
              className="gen-gauge-pct"
              style={{ color: c.stroke }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {formatPercent(burnRate)}
            </motion.span>
            <span className="gen-gauge-pct-label">Burn Rate</span>
          </div>
        </div>

        {/* Financial breakdown below gauge */}
        {(income || totalBill || tdi) && (
          <div className="gen-gauge-stats">
            {income && (
              <div className="gen-gauge-stat">
                <span className="gen-gauge-stat-label">Income</span>
                <span className="gen-gauge-stat-value" style={{ color: '#10b981' }}>{formatCurrency(income)}</span>
              </div>
            )}
            {totalBill && (
              <div className="gen-gauge-stat">
                <span className="gen-gauge-stat-label">Bills</span>
                <span className="gen-gauge-stat-value" style={{ color: '#f59e0b' }}>{formatCurrency(totalBill)}</span>
              </div>
            )}
            {tdi && (
              <div className="gen-gauge-stat">
                <span className="gen-gauge-stat-label">TDI</span>
                <span className="gen-gauge-stat-value" style={{ color: '#3b82f6' }}>{formatCurrency(tdi)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
