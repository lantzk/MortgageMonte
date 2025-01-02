'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { ThemeToggle } from './theme-toggle';
import { ComparisonTable } from './ComparisonTable';
import { FinancialChart , VisibleLines } from './FinancialChart';
import { useMonteCarloSimulation } from '../hooks/useMonteCarloSimulation';
import { DEFAULT_CONSTANTS } from '../config/constants';
import { InputState } from '../types/calculator';
import { calculateStats } from '../utils/financial';
import { validateInput } from '../utils/validation';
import { ErrorBoundary } from './ErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const MortgageCalculator = () => {
  const [isClient, setIsClient] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [visibleLines, setVisibleLines] = useState<VisibleLines>({
    mn: true,
    mt: true,
    vn: true,
    vt: true,
    k: true,
    ml: false,
    vl: false
  });
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Helper function to convert probability to "once every X years" text
  const getProbabilityText = (annualProb: number) => {
    if (annualProb <= 0) return "never";
    const years = Math.round(1 / annualProb);
    return `once every ${years} ${years === 1 ? 'year' : 'years'}`;
  };

  // Helper function to convert monthly to annual probability for display
  const monthlyToAnnualProb = (monthlyProb: number) => {
    return 1 - (1 - monthlyProb)**12;
  };

  // Helper function to format probability as percentage
  const formatProbability = (prob: number) => {
    return `${(prob * 100).toFixed(1)}%`;
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const [i, setI] = useState<InputState>({ 
    householdIncome: Number(process.env.NEXT_PUBLIC_INCOME_SALARY) || 250000,
    homeValue: Number(process.env.NEXT_PUBLIC_HOUSE_VALUE) || 597000,
    loanAmount: Number(process.env.NEXT_PUBLIC_HOUSE_LOAN) || 567150,
    extraPayment: Number(process.env.NEXT_PUBLIC_DEFAULT_EXTRA_PAYMENT) || 500,
    investmentReturn: Number(process.env.NEXT_PUBLIC_DEFAULT_INVESTMENT_RETURN) || 7,
    salaryGrowth: Number(process.env.NEXT_PUBLIC_DEFAULT_SALARY_GROWTH) || 3,
    marketVolatility: Number(process.env.NEXT_PUBLIC_DEFAULT_MARKET_VOLATILITY) || 20,
    inflationRate: Number(process.env.NEXT_PUBLIC_DEFAULT_INFLATION_RATE) || 3.5,
    liquidityNeeded: Number(process.env.NEXT_PUBLIC_DEFAULT_LIQUIDITY_NEEDED) || 30000,
    jobLossProb: 0.05,
    refiProb: Number(process.env.NEXT_PUBLIC_DEFAULT_REFI_PROB) || 0.15,
    emergencyProb: 0.01,
    iBondLimit: Number(process.env.NEXT_PUBLIC_DEFAULT_IBOND_LIMIT) || 3000,
    megaBackdoorAmount: Number(process.env.NEXT_PUBLIC_DEFAULT_MEGA_BACKDOOR) || 2000,
    stressTestFactor: Number(process.env.NEXT_PUBLIC_DEFAULT_STRESS_TEST) || 0.25,
    iBondBaseRate: Number(process.env.NEXT_PUBLIC_DEFAULT_IBOND_BASE_RATE) || 0.90
  });

  // Store default values for reset functionality
  const defaultValues = useMemo(() => ({
    householdIncome: Number(process.env.NEXT_PUBLIC_INCOME_SALARY) || 250000,
    homeValue: Number(process.env.NEXT_PUBLIC_HOUSE_VALUE) || 597000,
    loanAmount: Number(process.env.NEXT_PUBLIC_HOUSE_LOAN) || 567150,
    extraPayment: Number(process.env.NEXT_PUBLIC_DEFAULT_EXTRA_PAYMENT) || 500,
    investmentReturn: Number(process.env.NEXT_PUBLIC_DEFAULT_INVESTMENT_RETURN) || 7,
    salaryGrowth: Number(process.env.NEXT_PUBLIC_DEFAULT_SALARY_GROWTH) || 3,
    marketVolatility: Number(process.env.NEXT_PUBLIC_DEFAULT_MARKET_VOLATILITY) || 20,
    inflationRate: Number(process.env.NEXT_PUBLIC_DEFAULT_INFLATION_RATE) || 3.5,
    liquidityNeeded: Number(process.env.NEXT_PUBLIC_DEFAULT_LIQUIDITY_NEEDED) || 30000,
    jobLossProb: 0.05,
    refiProb: Number(process.env.NEXT_PUBLIC_DEFAULT_REFI_PROB) || 0.15,
    emergencyProb: 0.01,
    iBondLimit: Number(process.env.NEXT_PUBLIC_DEFAULT_IBOND_LIMIT) || 3000,
    megaBackdoorAmount: Number(process.env.NEXT_PUBLIC_DEFAULT_MEGA_BACKDOOR) || 2000,
    stressTestFactor: Number(process.env.NEXT_PUBLIC_DEFAULT_STRESS_TEST) || 0.25,
    iBondBaseRate: Number(process.env.NEXT_PUBLIC_DEFAULT_IBOND_BASE_RATE) || 0.90
  }), []);

  const handleReset = (key?: keyof InputState) => {
    if (key) {
      setI(prev => ({...prev, [key]: defaultValues[key]}));
      setHasPendingChanges(true);
    } else {
      setI(defaultValues);
      setHasPendingChanges(true);
    }
  };

  const { isCalculating, monteCarloResults, runSimulation } = useMonteCarloSimulation(DEFAULT_CONSTANTS);

  // Run initial simulation when component mounts
  useEffect(() => {
    if (isClient && !monteCarloResults) {
      const validation = validateInput(i);
      if (validation.isValid) {
        setValidationErrors([]);
        setCalculationError(null);
        try {
          runSimulation(i);
        } catch (error) {
          setCalculationError('Failed to run simulation. Please check your inputs and try again.');
        }
      } else {
        setValidationErrors(validation.errors.map(e => e.message));
      }
    }
  }, [isClient, monteCarloResults, runSimulation, i]);

  const {m, v} = monteCarloResults ?? {m: {d: []}, v: {d: []}};

  const met = m.d.length > 0 ? {
    mp: Math.ceil(m.d.find(d => !d.balance)?.year || 30),
    mm: m.d.findIndex(d => (d.balance / d.homeValue) <= 0.8) + 1,
    vm: v.d.findIndex(d => (d.balance / d.homeValue) <= 0.8) + 1,
    ml: m.d.findIndex(d => d.liquidityRatio >= 1) + 1,
    vl: v.d.findIndex(d => d.liquidityRatio >= 1) + 1,
    m1m: m.d.findIndex(d => d.netWorth >= 1000000) + 1 || 30,
    v1m: v.d.findIndex(d => d.netWorth >= 1000000) + 1 || 30,
    m2m: m.d.findIndex(d => d.netWorth >= 2000000) + 1 || 30,
    v2m: v.d.findIndex(d => d.netWorth >= 2000000) + 1 || 30,
    mstats: calculateStats(m.d, DEFAULT_CONSTANTS.house.rate),
    vstats: calculateStats(v.d, DEFAULT_CONSTANTS.house.rate)
  } : null;

  const validateAndSetInput = (key: keyof InputState, value: number) => {
    setI(prev => ({...prev, [key]: value}));
    setHasPendingChanges(true);
  };

  const handleRunSimulation = () => {
    const validation = validateInput(i);
    if (validation.isValid) {
      setValidationErrors([]);
      setCalculationError(null);
      try {
        runSimulation(i);
        setHasPendingChanges(false);
      } catch (error) {
        setCalculationError('Failed to run simulation. Please check your inputs and try again.');
      }
    } else {
      setValidationErrors(validation.errors.map(e => e.message));
    }
  };

  const hasChanges = useMemo(() => {
    return Object.keys(i).some(key => i[key as keyof InputState] !== defaultValues[key as keyof InputState]);
  }, [i, defaultValues]);

  return (
    <ErrorBoundary>
      <div className="space-y-6 p-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/monte_house.png" alt="House Icon" className="w-8 h-8" />
            <h1 className="text-3xl font-bold font-space-mono tracking-tight">Mortgage Monte</h1>
          </div>
          <ThemeToggle />
        </div>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Inputs</CardTitle>
              {hasChanges && (
                <button
                  onClick={() => handleReset()}
                  className="p-1 rounded hover:bg-secondary/80"
                  title="Reset all values to defaults"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {(validationErrors.length > 0 || calculationError) && (
              <div className="mb-4 p-4 border border-destructive rounded-md bg-destructive/10">
                <h4 className="text-destructive font-medium mb-2">Please fix the following errors:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-destructive">{error}</li>
                  ))}
                  {calculationError && (
                    <li className="text-sm text-destructive">{calculationError}</li>
                  )}
                </ul>
              </div>
            )}
            <div className="space-y-4">
              <Tabs defaultValue="starting" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="starting">Start Conditions</TabsTrigger>
                  <TabsTrigger value="core">Financial Decisions</TabsTrigger>
                  <TabsTrigger value="risk">Risk Factors</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                <TabsContent value="starting">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      ['Household Income', 'Annual household income before taxes. Used to calculate savings rate, tax implications, and retirement account contributions.', 'householdIncome', [0, 2000000], 1000],
                      ['Home Value', 'Current market value of the home. Used to calculate equity position, PMI requirements, and property tax estimates.', 'homeValue', [0, 10000000], 1000],
                      ['Loan Amount', 'Current mortgage balance. Used to calculate monthly payments, interest costs, and loan-to-value ratio.', 'loanAmount', [0, 10000000], 1000]
                    ].map(([label, hint, key, range, step]) => (
                      <div key={key as string} className="flex flex-col h-[140px]">
                        <div className="space-y-1 flex-grow">
                          <Label htmlFor={key as string}>{label}</Label>
                          <div className="text-xs text-muted-foreground">{hint}</div>
                          {key === 'loanAmount' && (
                            <div className="text-xs text-muted-foreground italic">
                              Loan-to-Value Ratio: {formatProbability(i.loanAmount / i.homeValue)} {i.loanAmount / i.homeValue > 0.8 ? '(PMI Required)' : ''}
                            </div>
                          )}
                          {key === 'householdIncome' && (
                            <div className="text-xs text-muted-foreground italic">
                              Monthly Pre-Tax Income: {formatCurrency(i.householdIncome / 12)}
                            </div>
                          )}
                          {key === 'homeValue' && (
                            <div className="text-xs text-muted-foreground italic">
                              Current Equity: {formatCurrency(i.homeValue - i.loanAmount)} ({formatProbability((i.homeValue - i.loanAmount) / i.homeValue)} of value)
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Slider
                            id={key as string}
                            aria-label={label as string}
                            min={(range as [number, number])[0]}
                            max={(range as [number, number])[1]}
                            step={step as number}
                            value={[i[key as keyof InputState]]}
                            onValueChange={([value]: number[]) => validateAndSetInput(key as keyof InputState, value)}
                            className="flex-1"
                          />
                          <div className="flex items-center gap-1">
                            <span className="w-24 text-right font-mono text-sm">
                              {formatCurrency(i[key as keyof InputState])}
                            </span>
                            {i[key as keyof InputState] !== defaultValues[key as keyof InputState] && (
                              <button
                                onClick={() => handleReset(key as keyof InputState)}
                                className="p-1 rounded hover:bg-secondary/80"
                                title="Reset to default"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="w-3 h-3"
                                >
                                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                  <path d="M3 3v5h5" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="core">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      ['Extra Payment', 'Additional monthly payment towards mortgage principal - accelerates payoff and reduces total interest', 'extraPayment', [0, 5000], 100]
                    ].map(([label, hint, key, range, step]) => (
                      <div key={key as string} className="space-y-2">
                        <Label htmlFor={key as string}>{label}</Label>
                        <div className="text-xs text-muted-foreground">{hint}</div>
                        <div className="flex items-center gap-2">
                          <Slider
                            id={key as string}
                            aria-label={label as string}
                            min={(range as [number, number])[0]}
                            max={(range as [number, number])[1]}
                            step={step as number}
                            value={[i[key as keyof InputState]]}
                            onValueChange={([value]: number[]) => validateAndSetInput(key as keyof InputState, value)}
                            className="flex-1"
                          />
                          <div className="flex items-center gap-1">
                            <span className="w-24 text-right font-mono text-sm">
                              {formatCurrency(i[key as keyof InputState])}
                            </span>
                            {i[key as keyof InputState] !== defaultValues[key as keyof InputState] && (
                              <button
                                onClick={() => handleReset(key as keyof InputState)}
                                className="p-1 rounded hover:bg-secondary/80"
                                title="Reset to default"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="w-3 h-3"
                                >
                                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                  <path d="M3 3v5h5" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="risk">
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        ['Emergency Fund Target', 'Target amount to keep in highly liquid accounts (e.g., high-yield savings). Typically 3-6 months of essential expenses. Consider factors like job stability and health when setting this.', 'liquidityNeeded', [0, 1000000], 1000],
                        ['Emergency Fund Need', 'Monthly probability of needing to tap into emergency savings (excluding job loss). Higher values suggest keeping more in cash vs. investments. Consider factors like health, home/car age, and overall financial stability.', 'emergencyProb', [0, 1], 0.01]
                      ].map(([label, hint, key, range, step]) => (
                        <div key={key as string} className="flex flex-col h-[160px]">
                          <div className="space-y-2 flex-grow">
                            <Label htmlFor={key as string}>{label}</Label>
                            <div className="text-xs text-muted-foreground">{hint}</div>
                            {key === 'emergencyProb' && (
                              <div className="text-xs text-muted-foreground italic">
                                With {formatProbability(i.emergencyProb)} monthly risk ({formatProbability(monthlyToAnnualProb(i.emergencyProb))} annually), you expect to need emergency funds {getProbabilityText(monthlyToAnnualProb(i.emergencyProb))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Slider
                              id={key as string}
                              aria-label={label as string}
                              min={(range as [number, number])[0]}
                              max={(range as [number, number])[1]}
                              step={step as number}
                              value={[i[key as keyof InputState]]}
                              onValueChange={([value]: number[]) => validateAndSetInput(key as keyof InputState, value)}
                              className="flex-1"
                            />
                            <div className="flex items-center gap-1">
                              <span className="w-24 text-right font-mono text-sm">
                                {key === 'liquidityNeeded' ? formatCurrency(i[key]) : typeof key === 'string' && key.endsWith('Prob') ? formatProbability(i[key as keyof InputState]) : i[key as keyof InputState].toLocaleString()}
                              </span>
                              {i[key as keyof InputState] !== defaultValues[key as keyof InputState] && (
                                <button
                                  onClick={() => handleReset(key as keyof InputState)}
                                  className="p-1 rounded hover:bg-secondary/80"
                                  title="Reset to default"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-3 h-3"
                                  >
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                    <path d="M3 3v5h5" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {[
                        ['Unemployment Risk', 'Annual probability of extended job loss requiring emergency fund use. Based on BLS data, average unemployment rate is ~5% annually, but varies by industry and economic conditions.', 'jobLossProb', [0, 1], 0.01],
                        ['Market Volatility', 'Expected annual market volatility (standard deviation of returns). Higher values mean more extreme swings in portfolio value. Historical US stock market volatility is ~15-20%.', 'marketVolatility', [0, 100], 1],
                        ['Risk Aversion', 'How much to weight downside scenarios in decision making. Higher values favor conservative strategies. Consider your risk tolerance and time until retirement.', 'stressTestFactor', [0, 1], 0.01]
                      ].map(([label, hint, key, range, step]) => (
                        <div key={key as string} className="flex flex-col h-[180px]">
                          <div className="space-y-2 flex-grow">
                            <Label htmlFor={key as string}>{label}</Label>
                            <div className="text-xs text-muted-foreground">{hint}</div>
                            {key === 'jobLossProb' && (
                              <div className="text-xs text-muted-foreground italic">
                                With {formatProbability(i.jobLossProb)} annual risk, you expect to experience unemployment {getProbabilityText(i.jobLossProb)}
                              </div>
                            )}
                            {key === 'marketVolatility' && (
                              <div className="text-xs text-muted-foreground italic">
                                At {formatProbability(i.marketVolatility/100)} volatility, annual returns typically range from {formatProbability((i.investmentReturn - i.marketVolatility)/100)} to {formatProbability((i.investmentReturn + i.marketVolatility)/100)}
                              </div>
                            )}
                            {key === 'stressTestFactor' && (
                              <div className="text-xs text-muted-foreground italic">
                                At {formatProbability(i.stressTestFactor)}, the model {i.stressTestFactor > 0.5 ? 'prioritizes avoiding bad outcomes over maximizing returns' : 'prioritizes maximizing returns over avoiding bad outcomes'}. <strong>Higher values (max 100%) are more conservative, lower values (min 0%) are more aggressive.</strong>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Slider
                              id={key as string}
                              aria-label={label as string}
                              min={(range as [number, number])[0]}
                              max={(range as [number, number])[1]}
                              step={step as number}
                              value={[i[key as keyof InputState]]}
                              onValueChange={([value]: number[]) => validateAndSetInput(key as keyof InputState, value)}
                              className="flex-1"
                            />
                            <div className="flex items-center gap-1">
                              <span className="w-24 text-right font-mono text-sm">
                                {key === 'marketVolatility' ? formatProbability(i[key]/100) : 
                                 typeof key === 'string' && key.endsWith('Prob') ? formatProbability(i[key as keyof InputState]) : 
                                 i[key as keyof InputState].toLocaleString()}
                              </span>
                              {i[key as keyof InputState] !== defaultValues[key as keyof InputState] && (
                                <button
                                  onClick={() => handleReset(key as keyof InputState)}
                                  className="p-1 rounded hover:bg-secondary/80"
                                  title="Reset to default"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-3 h-3"
                                  >
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                    <path d="M3 3v5h5" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="advanced">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      ['Salary Growth', 'Expected annual salary increase rate. Includes both merit increases and inflation adjustments. Historical average is 3-4% including inflation.', 'salaryGrowth', [-10, 20], 0.5],
                      ['Investment Return', 'Long-term expected stock market return after inflation. Historical S&P 500 average is ~7% real return (10% nominal minus 3% inflation).', 'investmentReturn', [0, 20], 0.5],
                      ['Inflation Rate', 'Expected long-term inflation rate. Affects purchasing power, I-Bond returns, and nominal investment returns. Fed targets 2%, historical average is ~3%.', 'inflationRate', [0, 20], 0.5],
                      ['Refinance Chance', 'Annual probability of being able to refinance at a better rate. Higher in falling rate environments, lower in rising rate environments.', 'refiProb', [0, 1], 0.01],
                      ['I-Bond Purchase', 'Annual I-Bond purchase limit. These are government bonds that pay inflation + fixed rate. Current individual limit is $10,000/year.', 'iBondLimit', [0, 15000], 100],
                      ['I-Bond Fixed Rate', 'Fixed rate component of I-Bond return, on top of inflation adjustment. Currently ~1%, historically ranges 0-3%.', 'iBondBaseRate', [0, 10], 0.1],
                      ['Mega Backdoor', 'Annual after-tax 401(k) contribution that can be converted to Roth. Requires specific plan features, max varies by plan and income.', 'megaBackdoorAmount', [0, 50000], 100]
                    ].map(([label, hint, key, range, step]) => (
                      <div key={key as string} className="flex flex-col h-[140px]">
                        <div className="space-y-1 flex-grow">
                          <Label htmlFor={key as string}>{label}</Label>
                          <div className="text-xs text-muted-foreground">{hint}</div>
                          {key === 'investmentReturn' && (
                            <div className="text-xs text-muted-foreground italic">
                              At {formatProbability(i.investmentReturn/100)} real return + {formatProbability(i.inflationRate/100)} inflation = {formatProbability((i.investmentReturn + i.inflationRate)/100)} nominal return
                            </div>
                          )}
                          {key === 'refiProb' && (
                            <div className="text-xs text-muted-foreground italic">
                              With {formatProbability(i.refiProb)} annual chance, you expect to refinance {getProbabilityText(i.refiProb)}
                            </div>
                          )}
                          {key === 'iBondBaseRate' && (
                            <div className="text-xs text-muted-foreground italic">
                              Total I-Bond yield: {formatProbability(i.iBondBaseRate/100)} fixed + {formatProbability(i.inflationRate/100)} inflation = {formatProbability((i.iBondBaseRate + i.inflationRate)/100)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Slider
                            id={key as string}
                            aria-label={label as string}
                            min={(range as [number, number])[0]}
                            max={(range as [number, number])[1]}
                            step={step as number}
                            value={[i[key as keyof InputState]]}
                            onValueChange={([value]: number[]) => validateAndSetInput(key as keyof InputState, value)}
                            className="flex-1"
                          />
                          <div className="flex items-center gap-1">
                            <span className="w-24 text-right font-mono text-sm">
                              {key === 'refiProb' ? formatProbability(i[key as keyof InputState]) :
                               key === 'iBondLimit' || key === 'megaBackdoorAmount' ? formatCurrency(i[key as keyof InputState]) :
                               formatProbability(i[key as keyof InputState]/100)}
                            </span>
                            {i[key as keyof InputState] !== defaultValues[key as keyof InputState] && (
                              <button
                                onClick={() => handleReset(key as keyof InputState)}
                                className="p-1 rounded hover:bg-secondary/80"
                                title="Reset to default"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="w-3 h-3"
                                >
                                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                  <path d="M3 3v5h5" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleRunSimulation}
                  disabled={!hasPendingChanges || isCalculating || validationErrors.length > 0}
                  className={`px-4 py-2 rounded-md font-medium ${
                    !hasPendingChanges || validationErrors.length > 0
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : isCalculating
                      ? 'bg-primary/50 text-primary-foreground cursor-wait'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {isCalculating ? 'Calculating...' : hasPendingChanges ? 'Run Model' : 'Up to Date'}
                </button>
              </div>
              <Card className="bg-card">
                <CardContent className="pt-6">
                  {m?.d && v?.d && m.d[29] && v.d[29] && met ? (
                    <ComparisonTable
                      mortgageData={{
                        yearData: m.d[29],
                        stats: met.mstats,
                        metrics: { 'Paid': met.mp, 'MI': met.mm, 'Liquid': met.ml }
                      }}
                      investmentData={{
                        yearData: v.d[29],
                        stats: met.vstats,
                        metrics: { 'MI': met.vm, 'Liquid': met.vl }
                      }}
                    />
                  ) : (
                    <div className="text-center py-4">Loading calculations...</div>
                  )}
                </CardContent>
              </Card>
              {m?.d && v?.d && (
                <FinancialChart
                  mortgageData={m.d}
                  investmentData={v.d}
                  visibleLines={visibleLines}
                  onToggleLine={(key) => setVisibleLines((prev: VisibleLines) => ({...prev, [key]: !prev[key]}))}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default MortgageCalculator; 