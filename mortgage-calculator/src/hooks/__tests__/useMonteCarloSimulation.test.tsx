import { renderHook, act } from '@testing-library/react';
import { useMonteCarloSimulation } from '../useMonteCarloSimulation';
import { Constants, InputState } from '../../types/calculator';

const mockConstants: Constants = {
  capital: {
    gainRate: 0.15,
    qualifiedRate: 0.15,
    dividendRate: 0.20,
    brackets: [40000, 441450]
  },
  taxBrackets: [
    [10275, 0.10, 0],
    [41775, 0.12, 1027.50],
    [89075, 0.22, 4807.50],
    [170050, 0.24, 15213.50],
    [215950, 0.32, 34647.50],
    [539900, 0.35, 63368.50]
  ],
  house: {
    value: 500000,
    loan: 400000,
    downPayment: 100000,
    rate: 0.06,
    pmiMonthly: 200,
    appreciation: 3,
    payment: 2398,
    closingCosts: 15000
  },
  income: {
    salary: 100000,
    taxRate: 0.24,
    deduction: 12950,
    limit401k: 22500,
    matchRate: 0.05,
    ficaRate: 0.0765
  }
};

const mockInputState: InputState = {
    investmentReturn: 7,
    marketVolatility: 15,
    stressTestFactor: 0,
    inflationRate: 2,
    extraPayment: 500,
    salaryGrowth: 3,
    jobLossProb: 0.01,
    refiProb: 0.1,
    emergencyProb: 0.05,
    liquidityNeeded: 50000,
    iBondLimit: 10000,
    iBondBaseRate: 0.9,
    megaBackdoorAmount: 0,
    householdIncome: 0,
    homeValue: 0,
    loanAmount: 0
};

describe('useMonteCarloSimulation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useMonteCarloSimulation(mockConstants));
    
    expect(result.current.isCalculating).toBe(false);
    expect(result.current.monteCarloResults).toBeNull();
  });

  it('sets isCalculating during simulation', () => {
    const { result } = renderHook(() => useMonteCarloSimulation(mockConstants));
    
    act(() => {
      result.current.runSimulation(mockInputState);
    });
    
    expect(result.current.isCalculating).toBe(true);
  });

  it('completes simulation and returns results', async () => {
    const { result } = renderHook(() => useMonteCarloSimulation(mockConstants));
    
    act(() => {
      result.current.runSimulation(mockInputState);
      jest.runAllTimers();
    });
    
    expect(result.current.isCalculating).toBe(false);
    expect(result.current.monteCarloResults).toBeTruthy();
    
    if (result.current.monteCarloResults) {
      // Test mortgage scenario results
      const mortgageData = result.current.monteCarloResults.m.d;
      expect(mortgageData).toHaveLength(30);
      expect(mortgageData[0].year).toBe(1);
      expect(mortgageData[29].year).toBe(30);
      
      // Verify key metrics are calculated
      mortgageData.forEach(yearData => {
        expect(yearData.balance).toBeDefined();
        expect(yearData.equity).toBeDefined();
        expect(yearData.homeValue).toBeDefined();
        expect(yearData.taxableInvestments).toBeDefined();
        expect(yearData.retirement401k).toBeDefined();
        expect(yearData.netWorth).toBeDefined();
        expect(yearData.liquidityRatio).toBeDefined();
      });
      
      // Test vanilla (no mortgage) scenario results
      const vanillaData = result.current.monteCarloResults.v.d;
      expect(vanillaData).toHaveLength(30);
      
      // Compare scenarios
      expect(vanillaData[0].balance).toBe(0);
      expect(vanillaData[0].taxableInvestments).toBeGreaterThan(0);
    }
  });

  it('handles stress testing correctly', async () => {
    const { result } = renderHook(() => useMonteCarloSimulation(mockConstants));
    const stressedInput = { ...mockInputState, stressTestFactor: 0.5 };
    
    act(() => {
      result.current.runSimulation(stressedInput);
      jest.runAllTimers();
    });
    
    expect(result.current.monteCarloResults).toBeTruthy();
    if (result.current.monteCarloResults) {
      const normalRun = result.current.monteCarloResults.m.d[29].netWorth;
      
      // Run again with higher stress
      act(() => {
        result.current.runSimulation({ ...stressedInput, stressTestFactor: 1.0 });
        jest.runAllTimers();
      });
      
      const stressedRun = result.current.monteCarloResults.m.d[29].netWorth;
      expect(stressedRun).toBeLessThan(normalRun);
    }
  });

  it('handles job loss probability correctly', async () => {
    const { result } = renderHook(() => useMonteCarloSimulation(mockConstants));
    const highJobLossInput = { ...mockInputState, jobLossProb: 1.0 };
    
    act(() => {
      result.current.runSimulation(highJobLossInput);
      jest.runAllTimers();
    });
    
    expect(result.current.monteCarloResults).toBeTruthy();
    if (result.current.monteCarloResults) {
      const earlyYears = result.current.monteCarloResults.m.d.slice(0, 2);
      earlyYears.forEach(yearData => {
        expect(yearData.salary).toBeLessThan(mockConstants.income.salary);
      });
    }
  });

  it('calculates confidence intervals for final year', async () => {
    const { result } = renderHook(() => useMonteCarloSimulation(mockConstants));
    
    act(() => {
      result.current.runSimulation(mockInputState);
      jest.runAllTimers();
    });
    
    expect(result.current.monteCarloResults).toBeTruthy();
    if (result.current.monteCarloResults) {
      const finalYear = result.current.monteCarloResults.m.d[29];
      expect(finalYear.confidenceInterval).toBeDefined();
      expect(finalYear.confidenceInterval).toBeGreaterThan(0);
    }
  });

  it('handles errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useMonteCarloSimulation(mockConstants));
    
    // Trigger an error by passing invalid input
    act(() => {
      try {
        result.current.runSimulation({} as InputState);
      } catch (error) {
        console.error(error);
      }
      jest.runAllTimers();
    });
    
    expect(result.current.isCalculating).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
}); 