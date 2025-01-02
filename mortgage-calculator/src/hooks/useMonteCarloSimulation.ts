import { useState, useCallback } from 'react';
import _ from 'lodash';
import { InputState, YearData, Constants, Stats } from '../types/calculator';
import { calculateMonthlyPayment, calculateVolatility, calculateStats } from '../utils/financial';

export const useMonteCarloSimulation = (C: Constants) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [monteCarloResults, setMonteCarloResults] = useState<{
    m: { d: YearData[] }, 
    v: { d: YearData[] }
  } | null>(null);

  const norm = useCallback(() => {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }, []);

  const shock = useCallback((p: number, c: number = 0): boolean => {
    return Math.random() < p && (!c || Math.random() < c);
  }, []);

  const run = useCallback((i: InputState, mort: boolean): YearData[] => {
    let [b, p, mi, ti, k4, mo, rf, ib] = [
      mort ? C.house.loan : 0,
      mort ? C.house.downPayment : C.house.value,
      0,
      mort ? 0 : C.house.downPayment,
      0, 0,
      C.house.rate,
      0
    ];
    const jobRisk = shock(i.jobLossProb, 0.7);
    let basePayment = calculateMonthlyPayment(b, rf);
    
    return _.range(30).map(y => {
      const sal = jobRisk && y < 2 ? C.income.salary * 0.5 : C.income.salary * (1 + i.salaryGrowth/100)**y;
      const k = Math.min(C.income.limit401k * 2 + i.megaBackdoorAmount, sal * 0.1);
      const hv = C.house.value * (1 + Math.min(i.inflationRate/100, C.house.appreciation/100))**y;
      let [int, liq] = [0, i.liquidityNeeded * (1 + i.inflationRate/100)**y];
      
      for (let m = 0; m < 12; m+=1) {
        if (shock(i.refiProb/12) && rf > C.house.rate * 0.85) {
          rf = Math.max(C.house.rate * 0.85, rf - 0.005);
          basePayment = calculateMonthlyPayment(b, rf);
        }
        
        const mr = rf/12;
        const ltv = b / hv;
        const needsPMI = ltv > 0.78;
        const mPmt = needsPMI && b > 0 ? C.house.pmiMonthly : 0;
        const mInt = b > 0 ? b * mr : 0;
        const mPrin = Math.min(b, basePayment - mInt);
        
        [int, ti] = [int + mInt, ti * (1 + calculateVolatility(i.investmentReturn, i.marketVolatility, i.stressTestFactor, norm)/100/12)];
        if (needsPMI) mi += C.house.pmiMonthly;
        
        if (b > 0) {
          const ex = mort ? (shock(i.emergencyProb/12) ? 0 : Math.min(b - mPrin, i.extraPayment)) : 0;
          [b, p, mo] = [Math.max(0, b - mPrin - ex), p + mPrin + ex, mo + 1];
        }
        
        if (!mort || b <= 0) {
          const av = Math.min(i.iBondLimit - ib, i.extraPayment);
          [ti, ib] = [ti + (i.extraPayment - av), ib + av];
        }
      }
      
      k4 = (k4 * (1 + calculateVolatility(i.investmentReturn, i.marketVolatility, i.stressTestFactor, norm)/100)) + k + Math.min(sal * C.income.matchRate, k);
      const ibr = i.iBondBaseRate + Math.max(0, i.inflationRate);
      ib *= (1 + ibr/100);
      
      return { 
        year: y + 1, 
        balance: Math.round(b), 
        equity: Math.round(hv - b), 
        homeValue: Math.round(hv),
        taxableInvestments: Math.round(ti), 
        retirement401k: Math.round(k4), 
        totalInvestments: Math.round(ti + k4 + ib), 
        netWorth: Math.round(hv - b + ti + k4 + ib), 
        pmiPaid: Math.round(mi), 
        taxesPaid: Math.round(0), // Tax calculation moved to post-processing
        salary: Math.round(sal), 
        liquidityRatio: Math.round((ti + ib) / liq * 100)/100,
        mortgageRate: Math.round(rf * 10000)/100
      };
    });
  }, [C, norm, shock]);

  const mcRun = useCallback((i: InputState, mort: boolean, n: number = 2000): YearData[] => {
    const sims = _.range(n).map(() => run(i, mort));
    return _.range(30).map(y => {
      const yr = sims.map(s => s[y]);
      const stats = Object.keys(yr[0]).reduce((a: Partial<YearData>, k) => {
        const vals = yr.map(d => d[k as keyof YearData]);
        return {...a, [k]: k === 'year' ? y + 1 : Math.round(_.mean(vals))};
      }, {}) as YearData;
      
      if (y === 29) {
        const netWorths = yr.map(d => d.netWorth);
        const stdDev = Math.sqrt(_.sum(_.map(netWorths, x => (x - _.mean(netWorths)) ** 2)) / (netWorths.length - 1));
        stats.confidenceInterval = Math.round(stdDev * 1.96);
      }
      return stats;
    });
  }, [run]);

  const runSimulation = useCallback(async (i: InputState) => {
    setIsCalculating(true);
    try {
      // Validate input state
      if (!i.investmentReturn || !i.marketVolatility || !i.inflationRate) {
        throw new Error('Invalid input state: required fields are missing');
      }

      setTimeout(() => {
        try {
          const [md, vd] = [mcRun(i, true), mcRun(i, false)];
          setMonteCarloResults({m: {d: md}, v: {d: vd}});
        } catch (error) {
          console.error('Error running Monte Carlo simulation:', error);
          setMonteCarloResults(null);
        } finally {
          setIsCalculating(false);
        }
      }, 0);
    } catch (error) {
      console.error('Error validating input state:', error);
      setIsCalculating(false);
      setMonteCarloResults(null);
    }
  }, [mcRun]);

  return {
    isCalculating,
    monteCarloResults,
    runSimulation
  };
}; 