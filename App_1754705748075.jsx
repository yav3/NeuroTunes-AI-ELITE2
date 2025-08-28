import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from './pages/HomePage';
import { TrendingPage } from './pages/TrendingPage';
import { MoodPage } from './pages/MoodPage';
import { AIDJPage } from './pages/AIDJPage';
import { EmotionDashboard } from './pages/EmotionDashboard';
import { NewDropsPage } from './pages/NewDropsPage';
import { ProfilePage } from './pages/ProfilePage';
import { PlayerPage } from './pages/PlayerPage';
import AdminDashboard from './pages/AdminDashboard';
import { BottomNav } from './components/BottomNav';
import { NowPlaying } from './components/NowPlaying';
import { AudioManager } from './components/AudioManager';
import { AIDJFlow } from './components/AIDJFlow';
import { usePlayerStore } from './stores/playerStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppContent() {
  const location = useLocation();
  const { currentTrack, playlistMode } = usePlayerStore();
  const isPlayerPage = location.pathname === '/player' || location.pathname === '/now-playing';

  return (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(to bottom, #0c1929 0%, #000000 100%)' }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trending" element={<TrendingPage />} />
        <Route path="/mood" element={<MoodPage />} />
        <Route path="/ai-dj" element={<AIDJPage />} />
        <Route path="/ai-dj-flow" element={<AIDJFlow />} />
        <Route path="/emotion-dashboard" element={<EmotionDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/player" element={<PlayerPage />} />
        <Route path="/now-playing" element={<PlayerPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      
      {/* Show mini player when there's a track playing and not on player page */}
      {currentTrack && !isPlayerPage && (
        <div className="fixed bottom-16 left-0 right-0 z-50">
          <NowPlaying />
        </div>
      )}
      {!isPlayerPage && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {/* Audio Manager persists across all routes */}
        <AudioManager />
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;