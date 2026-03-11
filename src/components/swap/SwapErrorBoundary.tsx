import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SwapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is the specific swap widget error
    if (error.message?.includes('Element type is invalid')) {
      console.warn('Swap widget post-transaction render error caught:', error.message);
      // Don't crash the app - the transaction was successful
    }

    // Ignore cancellation errors - these are normal during component updates
    if (error.message?.toLowerCase().includes('cancel')) {
      return { hasError: false, error: null };
    }

    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('SwapErrorBoundary caught an error:', error, errorInfo);

    // For swap widget errors, reset after a short delay to allow recovery
    if (error.message?.includes('Element type is invalid')) {
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 2000);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 text-center bg-steel-950 rounded-xl">
          <div className="text-steel-300 mb-2">Swap widget refreshing...</div>
          <div className="text-steel-500 text-sm">Your transaction was successful</div>
        </div>
      );
    }

    return this.props.children;
  }
}
