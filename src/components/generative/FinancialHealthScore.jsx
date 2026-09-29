import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * FinancialHealthScore — A premium animated health score card.
 * Shows a 0-100 score based on burn rate with color-coded ring.
 */
export default function FinancialHealthScore({ income, totalBill, tdi, burnRate }) {
  if (!income || !totalBill) return null;

  // Calculate a 0-100 health score (inverse of burn rate)
  const score = burnRate != null
    ? Math.max(0, Math.min(100, Math.round(100 - burnRate)))
    : Math.max(0, Math.min(100, Math.round((tdi / income) * 100)));

  // Color based on score
  const getScoreColor = (s) => {
    if (s >= 60) return { main: '#10b981', glow: 'rgba(16, 185, 129, 0.25)', label: 'Good', gradient: 'linear-gradient(135deg, #10b981, #059669)' };
    if (s >= 30) return { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)', label: 'Fair', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' };
    return { main: '#f43f5e', glow: 'rgba(244, 63, 94, 0.25)', label: 'Needs Attention', gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)' };
  };

  const { main, glow, label, gradient } = getScoreColor(score);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const dashoffset = circumference - progress;

  const insights = [];
  if (tdi > 0 && income > 0) {
    const savingsRate = ((tdi / income) * 100).toFixed(0);
    insights.push({ icon: Target, text: `${savingsRate}% savings rate`, positive: parseInt(savingsRate) >= 20 });
  }
  if (burnRate != null) {
    insights.push({
      icon: burnRate < 70 ? CheckCircle : AlertTriangle,
      text: `${burnRate.toFixed(0)}% of income goes to bills`,
      positive: burnRate < 70,
    });
  }
  if (tdi > 0) {
    insights.push({ icon: DollarSign, text: `${formatCurrency(tdi)} available after bills`, positive: true });
  }

  return (
    <motion.div
      className="gen-health-card"
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="gen-health-top">
        {/* Score Ring */}
        <div className="gen-health-ring-wrap">
          <svg width="130" height="130" viewBox="0 0 130 130">
            {/* Background track */}
            <circle
              cx="65" cy="65" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="8"
            />
            {/* Score arc */}
            <motion.circle
              cx="65" cy="65" r={radius}
              fill="none"
              stroke={main}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashoffset }}
              transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              transform="rotate(-90 65 65)"
              style={{ filter: `drop-shadow(0 0 8px ${glow})` }}
            />
          </svg>
          <div className="gen-health-ring-center">
            <motion.span
              className="gen-health-score"
              style={{ color: main }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {score}
            </motion.span>
            <span className="gen-health-score-label">Score</span>
          </div>
        </div>

        {/* Right side info */}
        <div className="gen-health-info">
          <div className="gen-health-badge" style={{ background: `${main}15`, color: main, borderColor: `${main}30` }}>
            <TrendingUp size={12} />
            {label}
          </div>
          <p className="gen-health-desc">
            Your financial health score is calculated from your income-to-bill ratio and savings capacity.
          </p>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="gen-health-insights">
          {insights.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={i}
                className="gen-health-insight"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <Icon
                  size={14}
                  style={{ color: insight.positive ? '#10b981' : '#f59e0b', flexShrink: 0 }}
                />
                <span>{insight.text}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
