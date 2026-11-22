import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import { loadBackend } from './api';
import { AppProviders } from './app/AppProviders';
import { createQueryClient } from './app/query-client';
import { currentUserQueryKey } from './auth/current-user';

const queryClient = createQueryClient();

loadBackend({
  onSessionExpired: () => queryClient.setQueryData(currentUserQueryKey, null),
}).then((backend) => {
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
