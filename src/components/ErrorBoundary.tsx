import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Shield, AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred within The Sentinel's protocols.";
      let isFirebaseError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            isFirebaseError = true;
            errorMessage = `Security Protocol Violation: ${parsed.error} during ${parsed.operationType} operation.`;
          }
        }
      } catch (e) {
        // Not a JSON error message
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <div className="glass-container max-w-md w-full p-10 text-center space-y-8 border-red-500/20">
            <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-red-500 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold tracking-tighter uppercase text-white">
                System Breach Detected
              </h2>
              <p className="text-zinc-400 font-mono text-xs uppercase tracking-[0.2em] font-bold">
                Protocol Error Code: {isFirebaseError ? 'SEC-403' : 'SYS-500'}
              </p>
            </div>

            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
              <p className="text-sm text-red-200 leading-relaxed font-medium italic">
                {errorMessage}
              </p>
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-white text-black py-4 rounded-xl font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-accent hover:text-black transition-all flex items-center justify-center gap-3 group"
            >
              <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Reinitialize Sentinel
            </button>

            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-bold">
              If this persists, contact system administrator
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function handleReset() {
  window.location.reload();
}
