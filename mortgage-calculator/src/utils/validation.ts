import { InputState } from '../types/calculator';

export type ValidationError = {
  field: keyof InputState;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

export const inputConstraints: Record<keyof InputState, {
  min: number;
  max: number;
  errorMessage: string;
}> = {
  householdIncome: {
    min: 0,
    max: 2000000,
    errorMessage: 'Household income must be between $0 and $2,000,000'
  },
  homeValue: {
    min: 0,
    max: 10000000,
    errorMessage: 'Home value must be between $0 and $10,000,000'
  },
  loanAmount: {
    min: 0,
    max: 10000000,
    errorMessage: 'Loan amount must be between $0 and $10,000,000'
  },
  extraPayment: {
    min: 0,
    max: 1000000,
    errorMessage: 'Extra payment must be between $0 and $1,000,000'
  },
  investmentReturn: {
    min: -20,
    max: 30,
    errorMessage: 'Investment return must be between -20% and 30%'
  },
  salaryGrowth: {
    min: -10,
    max: 20,
    errorMessage: 'Salary growth must be between -10% and 20%'
  },
  marketVolatility: {
    min: 0,
    max: 100,
    errorMessage: 'Market volatility must be between 0% and 100%'
  },
  inflationRate: {
    min: -5,
    max: 20,
    errorMessage: 'Inflation rate must be between -5% and 20%'
  },
  liquidityNeeded: {
    min: 0,
    max: 1000000,
    errorMessage: 'Liquidity needed must be between $0 and $1,000,000'
  },
  jobLossProb: {
    min: 0,
    max: 1,
    errorMessage: 'Job loss probability must be between 0 and 1'
  },
  refiProb: {
    min: 0,
    max: 1,
    errorMessage: 'Refinance probability must be between 0 and 1'
  },
  emergencyProb: {
    min: 0,
    max: 1,
    errorMessage: 'Emergency probability must be between 0 and 1'
  },
  iBondLimit: {
    min: 0,
    max: 15000,
    errorMessage: 'I-Bond limit must be between $0 and $15,000'
  },
  megaBackdoorAmount: {
    min: 0,
    max: 50000,
    errorMessage: 'Mega backdoor amount must be between $0 and $50,000'
  },
  stressTestFactor: {
    min: 0,
    max: 1,
    errorMessage: 'Stress test factor must be between 0 and 1'
  },
  iBondBaseRate: {
    min: 0,
    max: 10,
    errorMessage: 'I-Bond base rate must be between 0% and 10%'
  }
};

export const validateInput = (input: InputState): ValidationResult => {
  const errors: ValidationError[] = [];

  Object.entries(input).forEach(([field, value]) => {
    const key = field as keyof InputState;
    const constraint = inputConstraints[key];

    if (value < constraint.min || value > constraint.max) {
      errors.push({
        field: key,
        message: constraint.errorMessage
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateSingleInput = (
  field: keyof InputState,
  value: number
): ValidationError | null => {
  const constraint = inputConstraints[field];
  
  if (value < constraint.min || value > constraint.max) {
    return {
      field,
      message: constraint.errorMessage
    };
  }

  return null;
}; 