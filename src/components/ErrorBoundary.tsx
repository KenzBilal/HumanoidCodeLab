import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#282c34] text-[#abb2bf] font-sans p-8">
          <div className="max-w-lg w-full bg-[#21252b] border border-[#181a1f] rounded-lg p-8 flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#e06c75]/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e06c75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-[13px] text-[#5c6370]">
                Humanoid Code Lab encountered an unexpected error.
              </p>
            </div>
            {this.state.error && (
              <div className="w-full bg-[#1e2227] border border-[#181a1f] rounded p-3 font-mono text-[12px] text-[#e06c75] overflow-auto max-h-[150px]">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="px-6 py-2 rounded text-[13px] font-semibold bg-[#4d78cc] text-white hover:bg-[#4065b4] transition-colors cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
