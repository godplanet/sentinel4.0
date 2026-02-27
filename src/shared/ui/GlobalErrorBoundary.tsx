import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[GlobalErrorBoundary]', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleDismiss = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            maxWidth: '640px',
            width: '100%',
            background: '#1e293b',
            border: '1px solid #dc2626',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <div style={{
              background: '#dc2626',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span style={{ fontSize: '20px' }}>!</span>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>
                Sistem Hatasi / System Error
              </span>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
                Uygulama beklenmeyen bir hata ile karsilasti. Asagidaki detaylari inceleyebilirsiniz.
              </p>

              <div style={{
                background: '#0f172a',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                border: '1px solid #334155',
              }}>
                <code style={{
                  color: '#f87171',
                  fontSize: '13px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'ui-monospace, monospace',
                }}>
                  {this.state.error?.message || 'Unknown error'}
                </code>
              </div>

              {this.state.errorInfo?.componentStack && (
                <details style={{ marginBottom: '16px' }}>
                  <summary style={{ color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>
                    Component Stack
                  </summary>
                  <pre style={{
                    background: '#0f172a',
                    borderRadius: '8px',
                    padding: '12px',
                    marginTop: '8px',
                    color: '#94a3b8',
                    fontSize: '11px',
                    overflow: 'auto',
                    maxHeight: '200px',
                    border: '1px solid #334155',
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={this.handleReload}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  Sayfayi Yenile
                </button>
                <button
                  onClick={this.handleDismiss}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: '#334155',
                    color: '#cbd5e1',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  Yoksay / Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
