import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type BoundaryState = {
    hasError: boolean;
};

type BoundaryProps = {
    children: React.ReactNode;
};

class RouteErrorBoundary extends React.Component<BoundaryProps, BoundaryState> {
    constructor(props: BoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: unknown) {
        console.error('Route rendering failed:', error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="mx-auto flex min-h-[55vh] w-full max-w-2xl items-center justify-center p-6">
                    <div className="w-full rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
                        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">This page hit an unexpected error</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Please reload once. If this continues, use a different menu tab and come back.
                        </p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Reload page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default RouteErrorBoundary;
