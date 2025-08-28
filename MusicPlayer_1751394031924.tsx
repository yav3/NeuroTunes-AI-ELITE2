
import React, { useEffect, useState } from 'react';

interface Track {
  id: number;
  title: string;
  artist: string;
  audioUrl: string;
  duration?: number;
  mood?: string;
}

const MusicPlayer = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/songs')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch songs');
        }
        return res.json();
      })
      .then((data: Track[]) => {
        setTracks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching songs:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-4">Loading songs...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Music Library</h2>
      {tracks.length === 0 ? (
        <p>No songs available</p>
      ) : (
        <div className="space-y-4">
          {tracks.map(track => (
            <div key={track.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="mb-2">
                <h3 className="font-semibold">{track.title}</h3>
                <p className="text-gray-600">{track.artist}</p>
                {track.mood && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                    {track.mood}
                  </span>
                )}
              </div>
              <audio controls className="w-full">
                <source src={track.audioUrl} type="audio/mpeg" />
                Your browser doesn't support audio.
              </audio>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
