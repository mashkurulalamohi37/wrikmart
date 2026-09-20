import React from 'react';
import { RotateCcw, AlertTriangle, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[WrikMart ErrorBoundary Caught]', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('wrikmart_stock_category');
      localStorage.removeItem('wrikmart_custom_categories');
    } catch (e) {}
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-12 px-4 flex items-center justify-center">
          <div className="max-w-md w-full bg-[#10224D] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">Temporary Display Glitch</h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Something interrupted the view rendering. We can restore your experience instantly.
              </p>
              {this.state.error?.message && (
                <p className="text-[10px] font-mono text-rose-300/80 mt-2 bg-black/20 p-2 rounded-lg break-words text-left">
                  {this.state.error.message}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-white"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Home className="w-4 h-4 text-emerald-400" />
                <span>Reset & Go Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
