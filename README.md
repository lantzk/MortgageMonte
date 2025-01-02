# MortgageMonte

A personal project built to help my wife and I make informed decisions about our mortgage and investment strategies. This project serves three main purposes:

1. Create practical tools for analyzing our financial decisions around home ownership
2. Experiment with parts of the frontend stack that I'm less familiar with (Next.js, React, and shadcn)
3. Apply Monte Carlo simulations to real-world financial planning scenarios

## Features

- Interactive mortgage calculator for comparing different loan scenarios
- Monte Carlo simulations for investment returns
- Basic tax implications modeling
- Real-time financial visualization
- Responsive design with dark/light mode support

## Project Architecture

The project follows a modular architecture with clear separation of concerns:

```
src/
├── app/                  # Next.js app router
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── ComparisonTable.tsx
│   ├── FinancialChart.tsx
│   ├── MetricDisplay.tsx
│   └── ScenarioMetrics.tsx
├── hooks/              # Custom React hooks
│   └── useMonteCarloSimulation.ts
├── types/              # TypeScript type definitions
│   └── calculator.ts
├── utils/              # Utility functions
│   └── financial.ts
└── config/             # Configuration and constants
    └── constants.ts
```

### Key Components

- **MortgageCalculator**: Main component orchestrating the simulation
- **ComparisonTable**: Displays comparison metrics between scenarios
- **FinancialChart**: Visualizes financial projections using Recharts
- **ScenarioMetrics**: Shows detailed metrics for each scenario

### Business Logic

- **useMonteCarloSimulation**: Custom hook managing simulation state and calculations
- **financial.ts**: Core financial calculations and utilities
- **calculator.ts**: TypeScript interfaces for the application

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

## Installation

1. Clone the repository
2. Install dependencies:

```bash
cd mortgage-calculator
npm install
# or
yarn install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Adjust the values in `.env.local` according to your needs

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Technology Stack

- [Next.js 15.1.3](https://nextjs.org/) with [Turbopack](https://turbo.build/pack) - React framework
- [React 19](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components built on Radix UI
- [Recharts](https://recharts.org/) - Data visualization
- [SQLite](https://www.sqlite.org/) via better-sqlite3 - Data storage
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme management
- [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/react) - Testing framework

## Best Practices

The project follows several React and TypeScript best practices:

- **Component Modularity**: Each component has a single responsibility
- **Custom Hooks**: Business logic is encapsulated in custom hooks
- **Type Safety**: Comprehensive TypeScript types and interfaces
- **DRY Principles**: Reusable components and utilities
- **Performance**: Optimized rendering with proper React patterns
- **Maintainability**: Clear project structure and code organization

## Environment Variables

The application requires several environment variables to be set for proper functionality. These include:

- House-related constants (value, loan amount, PMI, etc.)
- Income-related constants (salary, tax rates, 401(k) settings)
- Default calculator input values
- Capital gains and tax brackets

Refer to `.env.local.example` for a complete list of required variables.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. When contributing, please:

1. Follow the existing code structure and naming conventions
2. Add appropriate TypeScript types
3. Ensure components are properly modularized
4. Add necessary documentation
5. Test your changes thoroughly

## Testing

The project emphasizes thorough testing of the financial models and Monte Carlo simulations to ensure accuracy and reliability of the calculations.

### Testing Stack

- [Jest](https://jestjs.io/) - Testing framework
- [React Testing Library](https://testing-library.com/react) - React hooks testing
- [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) - Custom Jest matchers

### Test Structure

```
src/
├── hooks/
│   └── __tests__/           # Model and simulation tests
│       └── useMonteCarloSimulation.test.tsx
├── utils/
│   └── __tests__/           # Financial calculation tests
│       └── financial.test.ts
└── components/
    └── __tests__/           # Integration tests
        └── MortgageCalculator.integration.test.tsx
```

### Testing Focus

The test suite primarily focuses on validating the correctness of:

- **Monte Carlo Simulations**: Ensuring statistical validity and expected behavior under various scenarios
  - Investment return calculations
  - Risk modeling (job loss, emergencies, refinancing)
  - Confidence interval calculations
  - Stress testing scenarios

- **Financial Calculations**:
  - Mortgage payment calculations
  - Investment growth projections
  - Tax implications
  - PMI and refinancing logic

- **Model Integration**:
  - Interaction between different financial components
  - State management and data flow
  - Error handling and edge cases

### Key Testing Features

- Deterministic random number generation for reproducible tests
- Comprehensive validation of simulation outputs
- Edge case testing for extreme market conditions
- Statistical validation of Monte Carlo results
- Error state and boundary condition testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```
