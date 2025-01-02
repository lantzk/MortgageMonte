import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { YearData } from '../types/calculator';
import { fmt } from '../utils/financial';
import { CHART_COLORS } from '../config/constants';

interface ChartData {
  year: number;
  mn: number; // Mortgage Net Worth
  mt: number; // Mortgage Taxable
  vn: number; // Investment Net Worth
  vt: number; // Investment Taxable
  k: number;  // 401(k)
  ml: number; // Mortgage Liquidity
  vl: number; // Investment Liquidity
  r: number;  // Rate
  ci?: number; // Confidence Interval
}

export type VisibleLines = {
  mn: boolean;
  mt: boolean;
  vn: boolean;
  vt: boolean;
  k: boolean;
  ml: boolean;
  vl: boolean;
};

interface FinancialChartProps {
  mortgageData: YearData[];
  investmentData: YearData[];
  visibleLines: VisibleLines;
  onToggleLine: (key: keyof VisibleLines) => void;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({
  mortgageData,
  investmentData,
  visibleLines,
  onToggleLine
}) => {
  const data: ChartData[] = mortgageData.map((d, j) => ({ 
    year: d.year, 
    mn: d.netWorth, 
    mt: d.taxableInvestments, 
    vn: investmentData[j].netWorth, 
    vt: investmentData[j].taxableInvestments, 
    k: d.retirement401k, 
    ml: d.liquidityRatio,
    vl: investmentData[j].liquidityRatio,
    r: d.mortgageRate,
    ci: d.confidenceInterval
  }));

  const milestones = data.map(d => {
    const markers: Array<{ value: number; label: string }> = [];
    return markers;
  }).flat();

  return (
    <div className="h-96 bg-background rounded-lg p-4" data-testid="financial-chart">
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries({
          'Net Worth': ['mn', 'vn'] as const,
          'Taxable': ['mt', 'vt'] as const,
          '401(k)': ['k'] as const,
          'Liquidity': ['ml', 'vl'] as const,
        }).map(([group, keys]) => (
          <button
            key={group}
            onClick={() => keys.forEach(k => onToggleLine(k))}
            className={`px-2 py-1 text-sm rounded ${
              keys.some(k => visibleLines[k])
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {group}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="year" 
            className="text-muted-foreground"
            label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            yAxisId="left"
            tickFormatter={(val: number) => `${(val / 1000000).toFixed(1)}M`} 
            className="text-muted-foreground"
            label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            domain={[0, 'auto']}
            tickFormatter={(val: number) => val.toFixed(1)}
            className="text-muted-foreground"
            label={{ value: 'Liquidity Ratio', angle: 90, position: 'insideRight' }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name.includes('Liquidity')) {
                return [value.toFixed(2), name];
              }
              return [fmt(value), name];
            }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--popover-foreground))'
            }}
          />
          <Legend 
            onClick={(e) => onToggleLine(e.dataKey as keyof VisibleLines)}
            wrapperStyle={{ paddingTop: '20px' }}
          />
          {[
            ['mn', 'Mortgage Net Worth', 2, 'left'],
            ['mt', 'Mortgage Taxable', 1, 'left'],
            ['vn', 'Investment Net Worth', 2, 'left'],
            ['vt', 'Investment Taxable', 1, 'left'],
            ['k', '401(k)', 1, 'left'],
            ['ml', 'Mortgage Liquidity', 1, 'right'],
            ['vl', 'Investment Liquidity', 1, 'right']
          ].map(([dataKey, name, width, axis]) => (
            visibleLines[dataKey as keyof VisibleLines] && (
              <Line
                key={dataKey as string}
                yAxisId={axis}
                type="monotone"
                dataKey={dataKey as string}
                stroke={`var(--${dataKey}-color)`}
                name={name as string}
                strokeWidth={width as number}
                dot={false}
              />
            )
          ))}
          <ReferenceLine
            y={1}
            yAxisId="right"
            stroke="var(--primary)"
            strokeDasharray="3 3"
            label={{
              value: 'Target Liquidity',
              position: 'right',
              className: 'text-xs fill-primary'
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}; 