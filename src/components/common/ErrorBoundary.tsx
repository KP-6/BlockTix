import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 text-center">
          <div className="max-w-lg">
            <h1 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Something went wrong</h1>
            <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
              An unexpected error occurred while rendering the page.
            </p>
            <pre className="text-xs p-3 rounded bg-gray-100 dark:bg-gray-800 text-left overflow-auto max-h-48">
              {this.state.error?.message}
            </pre>
            <button className="mt-4 px-4 py-2 rounded bg-primary-600 text-white" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
