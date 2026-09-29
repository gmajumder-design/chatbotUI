import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { formatCurrency, CHART_COLORS } from '../../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="gen-chart-tooltip">
      <div className="gen-chart-tooltip-dot" style={{ background: entry.payload?.fill || entry.color }} />
      <span className="gen-chart-tooltip-label">{entry.name || entry.payload?.name}</span>
      <span className="gen-chart-tooltip-value">{formatCurrency(entry.value)}</span>
    </div>
  );
};

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null; // Skip tiny slices
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="var(--text-secondary)"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={500}
      fontFamily="var(--font-sans)"
    >
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
};

function SpendingPieChart({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <motion.div
      className="gen-chart-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="gen-section-header">
        <div className="gen-section-header-left">
          <PieIcon size={16} style={{ color: 'var(--accent-violet)' }} />
          <span className="gen-section-title">Spending Breakdown</span>
        </div>
      </div>
      <div className="gen-chart-body">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
              animationBegin={100}
              animationDuration={800}
              animationEasing="ease-out"
              stroke="var(--bg-primary)"
              strokeWidth={2}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="gen-chart-legend">
          {data.map((item, i) => (
            <div key={item.name} className="gen-chart-legend-item">
              <div className="gen-chart-legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="gen-chart-legend-label">{item.name}</span>
              <span className="gen-chart-legend-value">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SpendingBarChart({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <motion.div
      className="gen-chart-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="gen-section-header">
        <div className="gen-section-header-left">
          <BarChart3 size={16} style={{ color: 'var(--accent-cyan)' }} />
          <span className="gen-section-title">Expense Comparison</span>
        </div>
      </div>
      <div className="gen-chart-body">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-sans)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-sans)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((_, i) => (
                <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

/**
 * Unified chart component — decides pie vs bar based on data or chartData hints.
 */
export default function FinancialCharts({ categoryData, chartData }) {
  // If explicit chart_data from backend, render that
  if (chartData) {
    // Format 1: Expected our custom ui_component format
    if (chartData.ui_component === 'pie_chart' && chartData.data) {
      return <SpendingPieChart data={chartData.data} />;
    }
    if (chartData.ui_component === 'bar_chart' && chartData.data) {
      return <SpendingBarChart data={chartData.data.map(d => ({ name: d.label || d.name, value: d.value }))} />;
    }
    
    // Format 2: Chart.js style format the LLM actually generates { labels: [], datasets: [{data: []}] }
    if (chartData.labels && chartData.datasets && chartData.datasets.length > 0) {
      const mappedData = chartData.labels.map((label, index) => ({
        name: label,
        value: chartData.datasets[0].data[index] || 0
      })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
      
      // Limit to top 10 for readability in pie chart
      const topData = mappedData.slice(0, 10);
      const otherValue = mappedData.slice(10).reduce((sum, item) => sum + item.value, 0);
      if (otherValue > 0) {
        topData.push({ name: 'Other', value: otherValue });
      }

      return (
        <>
          <SpendingPieChart data={topData} />
          <SpendingBarChart data={topData} />
        </>
      );
    }
  }

  // Auto-generate pie chart from parsed category data
  if (categoryData && categoryData.length > 1) {
    return (
      <>
        <SpendingPieChart data={categoryData} />
        {categoryData.length <= 8 && <SpendingBarChart data={categoryData} />}
      </>
    );
  }

  return null;
}
