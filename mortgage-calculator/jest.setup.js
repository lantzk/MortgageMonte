require('@testing-library/jest-dom');

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_DEFAULT_EXTRA_PAYMENT: '500',
  NEXT_PUBLIC_DEFAULT_INVESTMENT_RETURN: '7',
  NEXT_PUBLIC_DEFAULT_SALARY_GROWTH: '3',
  NEXT_PUBLIC_DEFAULT_MARKET_VOLATILITY: '20',
  NEXT_PUBLIC_DEFAULT_INFLATION_RATE: '6',
  NEXT_PUBLIC_DEFAULT_LIQUIDITY_NEEDED: '30000',
  NEXT_PUBLIC_DEFAULT_JOB_LOSS_PROB: '0.4',
  NEXT_PUBLIC_DEFAULT_REFI_PROB: '0.15',
  NEXT_PUBLIC_DEFAULT_EMERGENCY_PROB: '0.05',
  NEXT_PUBLIC_DEFAULT_IBOND_LIMIT: '3000',
  NEXT_PUBLIC_DEFAULT_MEGA_BACKDOOR: '2000',
  NEXT_PUBLIC_DEFAULT_STRESS_TEST: '0.25',
  NEXT_PUBLIC_DEFAULT_IBOND_BASE_RATE: '0.90',
}; 