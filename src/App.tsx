import { AppShell } from '@/app/layout/AppShell';
import { SystemInitOverlay } from '@/app/layout/SystemInitOverlay';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { AppRoutes } from '@/app/routes';
import { useSystemInit } from '@/shared/hooks/useSystemInit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient({
 defaultOptions: {
 queries: {
 staleTime: 1000 * 60 * 5,
 refetchOnWindowFocus: false,
 retry: 1,
 },
 },
});

import { Toaster } from 'react-hot-toast';

function App() {
 const { isComplete, error, progress } = useSystemInit();

 return (
 <ThemeProvider>
 <QueryClientProvider client={queryClient}>
 <BrowserRouter basename={import.meta.env.BASE_URL}>
 {!isComplete && (
 <SystemInitOverlay progress={progress} error={error} />
 )}
 {isComplete && (
 <AppShell>
 <AppRoutes />
 </AppShell>
 )}
 </BrowserRouter>
 <Toaster position="top-right" />
 </QueryClientProvider>
 </ThemeProvider>
 );
}

export default App;
