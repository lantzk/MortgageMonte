import React from 'react';
import { MetricDisplayProps } from '../types/calculator';
import { fmt } from '../utils/financial';

export const MetricDisplay: React.FC<MetricDisplayProps> = ({ 
  label, 
  value, 
  description, 
  formatValue = fmt 
}) => {
  const displayValue = label === 'Avg Liquidity' ? value.toFixed(2) : formatValue(value);

  return (
    <div className="flex justify-between mb-1">
      <span>{label}: {displayValue}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  );
}; 