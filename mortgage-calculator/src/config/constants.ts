import { Constants } from '../types/calculator';

export const DEFAULT_CONSTANTS: Constants = {
  house: { 
    value: Number(process.env.NEXT_PUBLIC_HOUSE_VALUE) || 597000, 
    loan: Number(process.env.NEXT_PUBLIC_HOUSE_LOAN) || 567150, 
    downPayment: Number(process.env.NEXT_PUBLIC_HOUSE_DOWN_PAYMENT) || 29850, 
    pmiMonthly: Number(process.env.NEXT_PUBLIC_HOUSE_PMI_MONTHLY) || 99.25, 
    payment: Number(process.env.NEXT_PUBLIC_HOUSE_PAYMENT) || 3631.52, 
    rate: Number(process.env.NEXT_PUBLIC_HOUSE_RATE) / 100 || 0.06625, 
    appreciation: Number(process.env.NEXT_PUBLIC_HOUSE_APPRECIATION) || 3, 
    closingCosts: Number(process.env.NEXT_PUBLIC_HOUSE_CLOSING_COSTS) || 5000 
  },
  income: { 
    salary: Number(process.env.NEXT_PUBLIC_INCOME_SALARY) || 250000, 
    taxRate: Number(process.env.NEXT_PUBLIC_INCOME_TAX_RATE) / 100 || 0.0495, 
    deduction: Number(process.env.NEXT_PUBLIC_INCOME_DEDUCTION) || 29200, 
    limit401k: Number(process.env.NEXT_PUBLIC_INCOME_401K_LIMIT) || 23000, 
    matchRate: Number(process.env.NEXT_PUBLIC_INCOME_MATCH_RATE) / 100 || 0.05, 
    ficaRate: Number(process.env.NEXT_PUBLIC_INCOME_FICA_RATE) / 100 || 0.153 
  },
  taxBrackets: [
    [22000, 0.10, 0], 
    [89450, 0.12, 2200], 
    [190750, 0.22, 10294], 
    [384750, 0.24, 32580],
    [490000, 0.32, 74208], 
    [731200, 0.35, 108217], 
    [Infinity, 0.37, 192417]
  ],
  capital: { 
    gainRate: Number(process.env.NEXT_PUBLIC_CAPITAL_GAIN_RATE) / 100 || 0.15, 
    dividendRate: Number(process.env.NEXT_PUBLIC_CAPITAL_DIVIDEND_RATE) / 100 || 0.20, 
    qualifiedRate: Number(process.env.NEXT_PUBLIC_CAPITAL_QUALIFIED_RATE) / 100 || 0.20, 
    brackets: [
      Number(process.env.NEXT_PUBLIC_CAPITAL_BRACKET_LOW) || 83350, 
      Number(process.env.NEXT_PUBLIC_CAPITAL_BRACKET_HIGH) || 517200
    ] 
  }
};

export const CHART_COLORS = {
  light: {
    mn: '#0033cc',
    mt: '#6600cc',
    vn: '#cc3300',
    vt: '#ff6600',
    k: '#00cc00',
    ml: '#000099',
    vl: '#990000',
    r: '#666666'
  },
  dark: {
    mn: '#4d79ff',
    mt: '#9966ff',
    vn: '#ff6666',
    vt: '#ff944d',
    k: '#66ff66',
    ml: '#3333ff',
    vl: '#ff3333',
    r: '#999999'
  }
}; 