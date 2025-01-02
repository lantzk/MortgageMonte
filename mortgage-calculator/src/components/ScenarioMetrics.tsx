import React from 'react';
import { ScenarioMetricsProps } from '../types/calculator';
import { MetricDisplay } from './MetricDisplay';

export const YearMetric: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const description = {
    'Paid': 'Mortgage fully paid off',
    'MI': 'PMI drops off',
    'Liquid': 'Emergency fund met'
  }[label];

  return (
    <div className="flex justify-between mb-1">
      <span>{label}: Year {value}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  );
};

export const ScenarioMetrics: React.FC<ScenarioMetricsProps> = ({ 
  title, 
  description, 
  yearData: d, 
  stats, 
  metrics 
}) => {
  const FINANCIAL_METRICS = [
    ['Investments', 'Final taxable account balance', d.taxableInvestments],
    ['401(k)', 'Final retirement account total', d.retirement401k],
    ['Net Worth', 'Final total assets minus debts', d.netWorth],
    ['95% CI', '30-year net worth confidence interval', d.confidenceInterval],
    ['Total Tax', '30-year tax payments', stats.tax],
    ['Total Interest', '30-year mortgage interest', stats.int],
    ['Avg Liquidity', '30-year liquidity ratio', stats.liq]
  ] as const;

  return (
    <div className="p-4 bg-gray-100 rounded">
      <div className="text-lg font-medium mb-1">{title}</div>
      <div className="text-sm text-muted-foreground mb-2">{description}</div>
      
      {/* Year-based metrics */}
      {Object.entries(metrics).map(([label, value]) => (
        <YearMetric key={label} label={label} value={value} />
      ))}
      
      {/* Financial metrics */}
      {FINANCIAL_METRICS.map(([label, description, value]) => (
        <MetricDisplay
          key={label}
          label={label}
          value={value as number}
          description={description}
        />
      ))}
    </div>
  );
}; 