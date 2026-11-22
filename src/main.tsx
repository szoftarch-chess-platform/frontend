import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import { loadBackend } from './api';
import { AppProviders } from './app/AppProviders';
import { createQueryClient } from './app/query-client';

const queryClient = createQueryClient();

loadBackend().then((backend) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <AppProviders backend={backend} queryClient={queryClient}>
          <App />
        </AppProviders>
      </BrowserRouter>
    </StrictMode>,
  );
});
