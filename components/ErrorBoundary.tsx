import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    private handleClearAndReload = () => {
        // Clear user-specific data but preserve auth
        const keysToPreserve = ['aura_current_user', 'user'];
        const preserved: Record<string, string | null> = {};
        keysToPreserve.forEach(key => {
            preserved[key] = localStorage.getItem(key);
        });
        localStorage.clear();
        keysToPreserve.forEach(key => {
            if (preserved[key]) localStorage.setItem(key, preserved[key]!);
        });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
                    <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-accent/30 p-8 text-center">
                        <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-accent/50">
                            <span className="text-3xl">💥</span>
                        </div>
                        <h1 className="font-serif text-2xl text-accent font-bold mb-2">Something Went Wrong</h1>
                        <p className="text-text-dim text-sm mb-6">
                            An unexpected error occurred. Don't worry — your progress is saved locally.
                        </p>

                        {this.state.error && (
                            <details className="mb-6 text-left bg-background/50 rounded-xl border border-secondary/50 p-4">
                                <summary className="text-xs font-bold text-primary cursor-pointer">
                                    Error Details
                                </summary>
                                <pre className="mt-2 text-[10px] text-accent overflow-auto max-h-32 whitespace-pre-wrap break-words">
                                    {this.state.error.message}
                                </pre>
                                {this.state.errorInfo?.componentStack && (
                                    <pre className="mt-1 text-[9px] text-text-dim overflow-auto max-h-24 whitespace-pre-wrap break-words">
                                        {this.state.errorInfo.componentStack.slice(0, 500)}
                                    </pre>
                                )}
                            </details>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
                            >
                                <span className="text-xs uppercase tracking-widest">Try Again</span>
                            </button>
                            <button
                                onClick={this.handleClearAndReload}
                                className="w-full bg-secondary hover:bg-secondary/80 text-text-main font-bold py-3 px-6 rounded-xl transition-all active:scale-95 border border-secondary/50"
                            >
                                <span className="text-xs uppercase tracking-widest">Reset & Reload</span>
                            </button>
                        </div>

                        <p className="mt-6 text-[10px] text-text-dark">
                            If this keeps happening, try clearing your browser cache.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
