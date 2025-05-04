
'use client';
import React, { ReactNode } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import DamagedProductsWidget from './DamagedProductsWidget';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white shadow rounded-lg p-6 border border-red-100">
          <div className="text-red-500 flex items-center">
            <FiAlertTriangle className="mr-2" />
            Error loading damaged products data
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const DamagedProductsWidgetWithErrorBoundary: React.FC = () => (
    <ErrorBoundary>
      <DamagedProductsWidget />
    </ErrorBoundary>
  );
  
export default DamagedProductsWidgetWithErrorBoundary;
  
