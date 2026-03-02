import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '@/app/layout/AppShell';
import { AppRoutes } from '@/app/routes';
import { SystemInitOverlay } from '@/app/layout/SystemInitOverlay';
import { useSystemInit } from '@/shared/hooks/useSystemInit';
import { DebugBar } from '@/shared/ui/DebugBar';
import { ThemeProvider } from '@/app/providers/ThemeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { isInitializing, isComplete, error, progress } = useSystemInit();

  return (
    <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DebugBar />
        {!isComplete && (
          <SystemInitOverlay progress={progress} error={error} />
        )}
        {isComplete && (
          <AppShell>
            <AppRoutes />
          </AppShell>
        )}
      </BrowserRouter>
    </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
