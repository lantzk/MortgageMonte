import React from 'react';
import { calculateMonthlyPayment, tax, calculateVolatility, std } from '../../utils/financial';
import { DEFAULT_CONSTANTS } from '../../config/constants';

describe('Financial Calculations', () => {
  describe('Monthly Payment Calculations', () => {
    it('calculates correct monthly payment for a 30-year mortgage', () => {
      const principal = 500000;
      const annualRate = 0.05; // 5% interest rate
      const years = 30;
      
      const monthlyPayment = calculateMonthlyPayment(principal, annualRate, years);
      
      // Expected monthly payment for $500k loan at 5% for 30 years
      expect(monthlyPayment).toBeCloseTo(2684.11, 2);
    });

    it('calculates correct monthly payment for a 15-year mortgage', () => {
      const principal = 500000;
      const annualRate = 0.05; // 5% interest rate
      const years = 15;
      
      const monthlyPayment = calculateMonthlyPayment(principal, annualRate, years);
      
      // Expected monthly payment for $500k loan at 5% for 15 years
      expect(monthlyPayment).toBeCloseTo(3953.97, 2);
    });
  });

  describe('Tax Calculations', () => {
    it('calculates correct tax for basic income', () => {
      const income = 100000;
      const capitalGains = 0;
      const qualifiedDividends = 0;
      
      const taxAmount = tax(income, capitalGains, qualifiedDividends, DEFAULT_CONSTANTS);
      
      // Tax should be non-zero and reasonable for $100k income
      expect(taxAmount).toBeGreaterThan(0);
      expect(taxAmount).toBeLessThan(income);
    });

    it('calculates correct tax with capital gains', () => {
      const income = 100000;
      const capitalGains = 20000;
      const qualifiedDividends = 5000;
      
      const taxAmount = tax(income, capitalGains, qualifiedDividends, DEFAULT_CONSTANTS);
      const basicTax = tax(income, 0, 0, DEFAULT_CONSTANTS);
      
      // Tax with capital gains should be higher than basic income tax
      expect(taxAmount).toBeGreaterThan(basicTax);
    });
  });

  describe('Market Volatility Calculations', () => {
    it('calculates volatility within expected bounds', () => {
      const annualReturn = 7; // 7% expected return
      const volatility = 15; // 15% volatility
      const stressFactor = 0.25; // 25% stress test factor
      const mockNorm = () => 1; // Mock normal distribution to return 1 for predictable testing
      
      const result = calculateVolatility(annualReturn, volatility, stressFactor, mockNorm);
      
      // Result should be bounded between -50% and 100%
      expect(result).toBeGreaterThanOrEqual(-50);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('applies stress factor correctly', () => {
      const annualReturn = 7;
      const volatility = 15;
      const stressFactor = 0.5; // 50% stress factor
      const mockNorm = () => 0.5; // Use a smaller shock that won't hit bounds
      
      const result = calculateVolatility(annualReturn, volatility, stressFactor, mockNorm);
      const resultNoStress = calculateVolatility(annualReturn, volatility, 0, mockNorm);
      
      // Result with stress should be lower than without stress
      expect(result).toBeLessThan(resultNoStress);
    });
  });

  describe('Statistical Calculations', () => {
    it('calculates standard deviation correctly', () => {
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      const result = std(values);
      
      // Known standard deviation for this dataset
      expect(result).toBeCloseTo(2.138, 3);
    });

    it('handles edge cases in standard deviation', () => {
      expect(std([])).toBe(0);
      expect(std([1])).toBe(0);
      expect(std([1, 1, 1])).toBeCloseTo(0, 5);
    });
  });
}); 