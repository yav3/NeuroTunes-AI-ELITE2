import React, { useState } from 'react';
import { Home, Bot, PlayCircle, Activity, BookOpen, Volume2 } from 'lucide-react';

const TABS = [
  { name: 'Mood', icon: Home },
  { name: 'AI DJ', icon: Bot },
  { name: 'Now Playing', icon: PlayCircle },
  { name: 'Journey', icon: Activity },
  { name: 'User Manual', icon: BookOpen }
];

const NeuroTunesAppV2 = () => {
  const [activeTab, setActiveTab] = useState('Now Playing');
  const [spatialEnabled, setSpatialEnabled] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <header className="p-4 text-center text-2xl font-bold border-b border-white/10">
        NeuroTunes AI +
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {activeTab === 'Now Playing' && (
          <div className="flex flex-col items-center">
            <div className="w-64 h-64 rounded-xl mb-6" style={{ background: 'radial-gradient(circle at center, #3b82f6 0%, #1e40af 50%, #1e3a8a 100%)' }}>
              {/* Album art gradient */}
            </div>
            <div className="text-xl font-semibold mb-1">Therapeutic Track 042</div>
            <div className="text-sm text-white/60 mb-6">Focus</div>
            <div className="w-full max-w-xs flex justify-between text-sm text-white/40">
              <span>1:03</span>
              <span>3:45</span>
            </div>
            <div className="w-full max-w-xs h-1 bg-white/20 rounded mt-1 mb-6">
              <div className="h-1 bg-white w-1/3 rounded"></div>
            </div>
            <div className="flex gap-6 mb-6">
              <button className="text-white text-2xl">⏮️</button>
              <button className="text-white text-2xl">⏯️</button>
              <button className="text-white text-2xl">⏭️</button>
            </div>
            <div className="flex gap-8">
              <button className="text-white/80">
                <Volume2 className="w-6 h-6" />
              </button>
              <button className={`text-white ${spatialEnabled ? 'text-yellow-400' : 'text-white/30'}`} onClick={() => setSpatialEnabled(!spatialEnabled)}>
                ⚡
              </button>
              <button className="text-white/80">
                🎧
              </button>
              <button className="text-white/80">
                ❤️
              </button>
            </div>
          </div>
        )}
        {/* Placeholder for other tabs */}
        {activeTab !== 'Now Playing' && (
          <div className="text-center text-white/60 mt-12 text-lg">
            <p>{activeTab} section coming soon.</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-black border-t border-white/10 flex justify-around items-center py-2 z-50">
        {TABS.map(({ name, icon: Icon }) => (
          <button
            key={name}
            onClick={() => setActiveTab(name)}
            className={`flex flex-col items-center text-xs ${activeTab === name ? 'text-white' : 'text-white/40'}`}
          >
            <Icon className="w-6 h-6 mb-1" />
            {name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default NeuroTunesAppV2;
