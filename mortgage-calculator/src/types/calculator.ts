export interface InputState {
  householdIncome: number;
  homeValue: number;
  loanAmount: number;
  extraPayment: number;
  investmentReturn: number;
  salaryGrowth: number;
  marketVolatility: number;
  inflationRate: number;
  liquidityNeeded: number;
  jobLossProb: number;
  refiProb: number;
  emergencyProb: number;
  iBondLimit: number;
  megaBackdoorAmount: number;
  stressTestFactor: number;
  iBondBaseRate: number;
}

export interface Constants {
  house: { 
    value: number; 
    loan: number; 
    downPayment: number; 
    pmiMonthly: number; 
    payment: number; 
    rate: number; 
    appreciation: number; 
    closingCosts: number; 
  };
  income: { 
    salary: number; 
    taxRate: number; 
    deduction: number; 
    limit401k: number; 
    matchRate: number; 
    ficaRate: number; 
  };
  taxBrackets: [number, number, number][];
  capital: { 
    gainRate: number; 
    dividendRate: number; 
    qualifiedRate: number; 
    brackets: [number, number]; 
  };
}

export interface YearData {
  year: number;
  balance: number;
  equity: number;
  homeValue: number;
  taxableInvestments: number;
  retirement401k: number;
  totalInvestments: number;
  netWorth: number;
  pmiPaid: number;
  taxesPaid: number;
  salary: number;
  liquidityRatio: number;
  mortgageRate: number;
  confidenceInterval?: number;
}

export interface Stats {
  tax: number;
  int: number;
  liq: number;
}

export interface ScenarioData {
  title: string;
  description: string;
  yearData: YearData;
  stats: Stats;
  color: string;
  metrics: Record<string, number>;
}

export interface MetricDisplayProps {
  label: string;
  value: number;
  description: string;
  formatValue?: (value: number) => string;
}

export interface ScenarioMetricsProps {
  title: string;
  description: string;
  yearData: YearData;
  stats: Stats;
  metrics: Record<string, number>;
}

export interface ComparisonTableProps {
  mortgageData: {
    yearData: YearData;
    stats: Stats;
    metrics: Record<string, number>;
  };
  investmentData: {
    yearData: YearData;
    stats: Stats;
    metrics: Record<string, number>;
  };
} 