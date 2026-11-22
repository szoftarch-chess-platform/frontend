import { Route, Routes } from 'react-router';
import { AppLayout } from './layout/AppLayout';
import { GamePage } from './pages/GamePage';
import { GameReplayPage } from './pages/GameReplayPage';
import { HistoryPage } from './pages/HistoryPage';
import { LobbyPage } from './pages/LobbyPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RegisterPage } from './pages/RegisterPage';
import { RequireGuest, RequireSignedIn } from './routing/guards';

/** The pages of the first version and who may open them (FE-ADR-4). */
export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route element={<RequireGuest />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route element={<RequireSignedIn />}>
          <Route index element={<LobbyPage />} />
          <Route path="game" element={<GamePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="history/:gameId" element={<GameReplayPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
