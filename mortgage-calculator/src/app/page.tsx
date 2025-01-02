import MortgageCalculator from '@/components/MortgageCalculator';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <MortgageCalculator />
      </div>
      <footer className="text-center text-xs text-gray-500 py-4">
        © 2025 Keenan Cresslan. All rights reserved.
      </footer>
    </main>
  );
} 