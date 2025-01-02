import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

const ErrorComponent = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;
  
  beforeAll(() => {
    // Suppress console.error for cleaner test output
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An error occurred/)).toBeInTheDocument();
  });

  it('shows error details in development environment', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      configurable: true,
      writable: true
    });
    
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
    
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalNodeEnv,
      configurable: true,
      writable: true
    });
  });

  it('reloads the page when Try Again button is clicked', () => {
    const reloadMock = jest.fn();
    const originalLocation = window.location;
    
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload: reloadMock }
    });
    
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    fireEvent.click(screen.getByText('Try Again'));
    expect(reloadMock).toHaveBeenCalled();
    
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation
    });
  });
}); 