import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [quarantinedTracks, setQuarantinedTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuarantineList();
  }, []);

  const fetchQuarantineList = async () => {
    try {
      const response = await fetch('/api/quarantine/list');
      const data = await response.json();
      setQuarantinedTracks(data);
    } catch (error) {
      console.error('Error fetching quarantine list:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearTrack = async (trackId) => {
    try {
      const response = await fetch('/api/quarantine/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId })
      });
      
      if (response.ok) {
        setQuarantinedTracks(prev => prev.filter(entry => entry.trackId !== trackId));
      }
    } catch (error) {
      console.error('Error clearing track:', error);
    }
  };

  const clearAll = async () => {
    if (!confirm('Are you sure you want to unquarantine all tracks?')) return;
    
    for (const track of quarantinedTracks) {
      await clearTrack(track.trackId);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-gray-900 transition-colors mr-4"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Quarantine Section */}
      <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-800 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-3" size={24} />
            <h2 className="text-xl font-bold">Quarantined Tracks</h2>
          </div>
          {quarantinedTracks.length > 0 && (
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
            >
              Clear All
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : quarantinedTracks.length === 0 ? (
          <div className="flex items-center text-green-400">
            <CheckCircle size={20} className="mr-2" />
            No tracks currently quarantined
          </div>
        ) : (
          <div className="space-y-2">
            {quarantinedTracks.map(entry => (
              <div 
                key={entry.trackId} 
                className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">Track #{entry.trackId}</div>
                  <div className="text-sm text-gray-400">{entry.filename}</div>
                  <div className="text-xs text-red-400">{entry.reason}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => clearTrack(entry.trackId)}
                  className="ml-4 px-3 py-1 bg-green-600 hover:bg-green-700 rounded transition-colors text-sm flex items-center"
                >
                  <Trash2 size={16} className="mr-1" />
                  Unquarantine
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Track Validation Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <div className="text-2xl font-bold">4,701</div>
            <div className="text-sm text-gray-400">Total Tracks</div>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {4701 - quarantinedTracks.length}
            </div>
            <div className="text-sm text-gray-400">Available</div>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-400">
              {quarantinedTracks.length}
            </div>
            <div className="text-sm text-gray-400">Quarantined</div>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">
              {((4701 - quarantinedTracks.length) / 4701 * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;