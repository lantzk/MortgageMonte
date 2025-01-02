import { validateInput, validateSingleInput, inputConstraints } from '../validation';
import { InputState } from '../../types/calculator';

describe('validation utilities', () => {
  describe('validateSingleInput', () => {
    it('should return null for valid inputs', () => {
      expect(validateSingleInput('extraPayment', 500)).toBeNull();
      expect(validateSingleInput('investmentReturn', 7)).toBeNull();
      expect(validateSingleInput('inflationRate', 3)).toBeNull();
    });

    it('should return error for values below minimum', () => {
      const error = validateSingleInput('extraPayment', -1);
      expect(error).toEqual({
        field: 'extraPayment',
        message: inputConstraints.extraPayment.errorMessage
      });
    });

    it('should return error for values above maximum', () => {
      const error = validateSingleInput('extraPayment', 1000001);
      expect(error).toEqual({
        field: 'extraPayment',
        message: inputConstraints.extraPayment.errorMessage
      });
    });
  });

  describe('validateInput', () => {
    const validInput: InputState = {
      extraPayment: 500,
      investmentReturn: 7,
      salaryGrowth: 3,
      marketVolatility: 20,
      inflationRate: 6,
      liquidityNeeded: 30000,
      jobLossProb: 0.4,
      refiProb: 0.15,
      emergencyProb: 0.05,
      iBondLimit: 3000,
      megaBackdoorAmount: 2000,
      stressTestFactor: 0.25,
      iBondBaseRate: 0.9,
      householdIncome: 0,
      homeValue: 0,
      loanAmount: 0
    };

    it('should return isValid true for valid input', () => {
      const result = validateInput(validInput);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid inputs', () => {
      const invalidInput: InputState = {
        ...validInput,
        extraPayment: -1,
        investmentReturn: 31
      };

      const result = validateInput(invalidInput);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContainEqual({
        field: 'extraPayment',
        message: inputConstraints.extraPayment.errorMessage
      });
      expect(result.errors).toContainEqual({
        field: 'investmentReturn',
        message: inputConstraints.investmentReturn.errorMessage
      });
    });

    it('should validate all input fields', () => {
      const invalidInput: InputState = {
        extraPayment: -1,
        investmentReturn: 31,
        salaryGrowth: 21,
        marketVolatility: 101,
        inflationRate: 21,
        liquidityNeeded: -1,
        jobLossProb: 1.1,
        refiProb: 1.1,
        emergencyProb: 1.1,
        iBondLimit: 15001,
        megaBackdoorAmount: 50001,
        stressTestFactor: 1.1,
        iBondBaseRate: 10.1,
        householdIncome: 2000001,
        homeValue: 10000001,
        loanAmount: 10000001
      };

      const result = validateInput(invalidInput);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(Object.keys(inputConstraints).length);
    });
  });
}); 