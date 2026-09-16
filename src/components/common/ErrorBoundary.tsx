import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Utensils } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetApp = () => {
    try {
      localStorage.removeItem('quickserve_user');
      localStorage.removeItem('quickserve_role');
      localStorage.removeItem('quickserve_jwt_token');
      localStorage.removeItem('quickserve_cart');
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle size={28} />
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              <Utensils size={14} /> QuickServe Smart Canteen
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Application Notice
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              We encountered a temporary interface hiccup. You can refresh the portal or reset the session cache.
            </p>

            {this.state.error?.message && (
              <div className="my-4 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-[11px] font-mono text-slate-700 dark:text-slate-300 text-left overflow-x-auto break-all border border-slate-200 dark:border-slate-700">
                {this.state.error.message}
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
              >
                <RefreshCw size={14} />
                <span>Reload Portal</span>
              </button>

              <button
                onClick={this.handleResetApp}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                <Trash2 size={14} />
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
