import _ from 'lodash';
import { Constants, YearData, Stats } from '../types/calculator';

export const std = (arr: number[]): number => {
  if (arr.length <= 1) return 0;
  const mean = _.mean(arr);
  return Math.sqrt(_.sum(_.map(arr, x => (x - mean) ** 2)) / (arr.length - 1));
};

export const fmt = (n: number): string => 
  new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n);

export const calculateMonthlyPayment = (principal: number, annualRate: number, years: number = 30): number => {
  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
};

export const tax = (inc: number, cg: number = 0, qd: number = 0, C: Constants): number => {
  if (inc <= 0) {
    const gainRate = C.capital.gainRate;
    const [lowBracket, highBracket] = C.capital.brackets;
    const dividendRate = qd <= lowBracket ? 0 : 
                        qd <= highBracket ? C.capital.qualifiedRate : 
                        C.capital.dividendRate;
    return Math.max(0, cg * gainRate + qd * dividendRate);
  }

  const b = C.taxBrackets.find(([t]) => inc <= t);
  if (!b) return 0;
  const prev = C.taxBrackets[C.taxBrackets.indexOf(b) - 1]?.[0] || 0;
  const incomeTax = b[2] + (inc - prev) * b[1];

  const ficaLimit = 160200;
  const socialSecurityRate = 0.062;
  const medicareRate = 0.0145;
  const ficaTax = Math.min(inc, ficaLimit) * socialSecurityRate + inc * medicareRate;

  return incomeTax + ficaTax + tax(0, cg, qd, C);
};

export const calculateVolatility = (
  annualReturn: number, 
  volatility: number, 
  stressFactor: number, 
  norm: () => number
): number => {
  const volatilityDecimal = volatility / 100;
  const annualReturnDecimal = annualReturn / 100;
  
  const randomShock = norm();
  const stressShock = Math.min(0, norm());
  
  const totalShock = randomShock * (1 - stressFactor) + stressShock * stressFactor;
  
  const rawReturn = annualReturnDecimal + volatilityDecimal * totalShock;
  
  const returnPct = rawReturn * 100;
  return Math.max(-50, Math.min(100, returnPct));
};

export const calculateStats = (data: YearData[], houseRate: number): Stats => ({
  tax: data.reduce((s, d) => s + d.taxesPaid, 0),
  int: data.reduce((s, d) => s + (d.balance > 0 ? d.balance * houseRate : 0), 0),
  liq: data.reduce((s, d) => s + d.liquidityRatio, 0) / data.length
}); 