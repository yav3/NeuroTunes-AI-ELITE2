// server/index.ts
import express from 'express';
import { loadAllTracks } from './services/track-loader';

const app = express();
const port = process.env.PORT || 5000;

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ✅ Start server immediately
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server listening on http://0.0.0.0:${port}`);

  // 🔄 Load tracks in background
  setImmediate(async () => {
    try {
      console.log('🎧 Loading track catalog in background...');
      await loadAllTracks();
      console.log('✅ All tracks loaded');
    } catch (err) {
      console.error('❌ Track loading failed:', err);
    }
  });
});
