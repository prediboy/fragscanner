import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default class ModalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ModalErrorBoundary caught error:', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Could not display details</h3>
            <p className="text-xs text-slate-400 font-mono">
              There was an issue loading this perfume's full profile.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onClose) this.props.onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
