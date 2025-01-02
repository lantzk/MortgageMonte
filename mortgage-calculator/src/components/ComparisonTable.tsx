import React from 'react';
import { ComparisonTableProps } from '../types/calculator';
import { fmt } from '../utils/financial';

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ mortgageData: m, investmentData: v }) => {
  const calculateDelta = (mortgageValue: number, investmentValue: number, label?: string): string => {
    const delta = investmentValue - mortgageValue;
    
    if (label === 'Monthly Payment') {
      return fmt(-delta);
    }
    
    if (label === 'Monthly Investment' || 
        label === 'Taxable Investments' || 
        label === 'Net Worth' || 
        label === 'Liquidity Ratio' ||
        label === '401(k) Balance' ||
        label === 'Home Equity') {
      return `${delta > 0 ? '+' : ''}${fmt(delta)}`;
    }

    if (label === 'Total Tax Paid' ||
        label === 'Total Interest Paid' ||
        label === 'Total PMI Paid' ||
        label === '95% CI Width') {
      return fmt(delta);
    }
    
    return fmt(delta);
  };

  const isPositiveDelta = (mortgageValue: number, investmentValue: number, label?: string): boolean => {
    const delta = investmentValue - mortgageValue;

    if (label === 'Monthly Investment' || 
        label === 'Taxable Investments' || 
        label === 'Net Worth' || 
        label === 'Liquidity Ratio' ||
        label === '401(k) Balance' ||
        label === 'Home Equity') {
      return delta > 0;
    }

    if (label === 'Monthly Payment' ||
        label === 'Total Tax Paid' ||
        label === 'Total Interest Paid' ||
        label === 'Total PMI Paid' ||
        label === '95% CI Width') {
      return delta < 0;
    }

    return delta > 0;
  };

  const calculatePercentDelta = (mortgageValue: number, investmentValue: number, label?: string): string => {
    if (mortgageValue === 0 && investmentValue === 0) return '—';
    if (mortgageValue === 0) return '+Infinity%';
    const delta = ((investmentValue - mortgageValue) / Math.abs(mortgageValue)) * 100;
    if (label === 'Monthly Payment') {
      return `${-delta.toFixed(1)}%`;
    }
    return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`;
  };

  const basePayment = 3631.52;
  const extraPayment = 500;

  const METRICS: [string, number, number][] = [
    ['Monthly Payment', basePayment + extraPayment, basePayment],
    ['Monthly Investment', 0, extraPayment],
    ['Home Equity', m.yearData.equity, v.yearData.equity],
    ['Taxable Investments', m.yearData.taxableInvestments, v.yearData.taxableInvestments],
    ['401(k) Balance', m.yearData.retirement401k, v.yearData.retirement401k],
    ['Net Worth', m.yearData.netWorth, v.yearData.netWorth],
    ['Liquidity Ratio', m.stats.liq, v.stats.liq],
    ['95% CI Width', m.yearData.confidenceInterval ?? 0, v.yearData.confidenceInterval ?? 0],
    ['Total Tax Paid', m.stats.tax, v.stats.tax],
    ['Total Interest Paid', m.stats.int, v.stats.int],
    ['Total PMI Paid', m.yearData.pmiPaid, v.yearData.pmiPaid],
  ];

  const YEAR_METRICS: [string, number | string, number | string][] = [
    ['PMI Removal', m.metrics.MI || '—', v.metrics.MI || '—'],
    ['Emergency Fund Met', m.metrics.Liquid || '—', v.metrics.Liquid || '—'],
    ['Mortgage Paid Off', m.metrics.Paid || '—', '—'],
  ];

  return (
    <div className="overflow-x-auto" data-testid="comparison-table">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Metric</th>
            <th className="text-right py-2">Mortgage First</th>
            <th className="text-right py-2">Invest First</th>
            <th className="text-right py-2">Δ Value</th>
            <th className="text-right py-2">Δ %</th>
          </tr>
        </thead>
        <tbody>
          {METRICS.map(([label, mortgageValue, investmentValue]) => (
            <tr key={label} className="border-b">
              <td className="py-2">{label}</td>
              <td className="text-right font-mono">
                {label === 'Liquidity Ratio' ? mortgageValue.toFixed(2) : 
                 label === '95% CI Width' && mortgageValue === 0 ? '—' : 
                 fmt(mortgageValue)}
              </td>
              <td className="text-right font-mono">
                {label === 'Liquidity Ratio' ? investmentValue.toFixed(2) : 
                 label === '95% CI Width' && investmentValue === 0 ? '—' : 
                 fmt(investmentValue)}
              </td>
              <td className={`text-right font-mono ${
                isPositiveDelta(mortgageValue, investmentValue, label) ? 'text-green-600' : 'text-red-600'
              }`}>
                {label === 'Liquidity Ratio' ? (investmentValue - mortgageValue).toFixed(2) :
                 label === '95% CI Width' && (mortgageValue === 0 || investmentValue === 0) ? '—' :
                 calculateDelta(mortgageValue, investmentValue, label)}
              </td>
              <td className={`text-right font-mono ${
                isPositiveDelta(mortgageValue, investmentValue, label) ? 'text-green-600' : 'text-red-600'
              }`}>
                {label === '95% CI Width' && (mortgageValue === 0 || investmentValue === 0) ? '—' :
                 calculatePercentDelta(mortgageValue, investmentValue, label)}
              </td>
            </tr>
          ))}
          <tr className="border-b">
            <td colSpan={5} className="py-2 font-medium text-foreground">Timeline (Years)</td>
          </tr>
          {YEAR_METRICS.map(([label, mortgageYear, investmentYear]) => (
            <tr key={label} className="border-b">
              <td className="py-2">{label}</td>
              <td className="text-right font-mono">
                {mortgageYear === '—' ? '—' : `Year ${mortgageYear}`}
              </td>
              <td className="text-right font-mono">
                {investmentYear === '—' ? '—' : `Year ${investmentYear}`}
              </td>
              <td className={`text-right font-mono ${
                typeof mortgageYear === 'number' && typeof investmentYear === 'number' ?
                (label === 'PMI Removal' || label === 'Emergency Fund Met' ? 
                  (investmentYear < mortgageYear ? 'text-green-600' : 'text-red-600') :
                  'text-muted-foreground') : 'text-muted-foreground'
              }`}>
                {typeof mortgageYear === 'number' && typeof investmentYear === 'number' ? 
                  `${investmentYear - mortgageYear} years` : '—'}
              </td>
              <td className="text-right font-mono">—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 