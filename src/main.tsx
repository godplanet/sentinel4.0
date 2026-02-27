import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GlobalErrorBoundary } from '@/shared/ui/GlobalErrorBoundary';
import App from './App.tsx';
import './app/styles/index.css';
import '@/shared/lib/i18n/config';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>
);
