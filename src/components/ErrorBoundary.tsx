import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h1 className="text-lg font-semibold text-slate-800 mb-2">Something went wrong</h1>
          <p className="text-sm text-slate-500 mb-4">
            An unexpected error occurred. Reloading the page usually fixes this.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-brand text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-dark transition-colors"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
