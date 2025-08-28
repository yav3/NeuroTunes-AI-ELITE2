
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface HealthChecks {
  api: boolean | null;
  state: boolean | null;
  render: boolean;
  routing: boolean | null;
  localStorage: boolean | null;
}

const FrontendChecker = () => {
  const [checks, setChecks] = useState<HealthChecks>({
    api: null,
    state: null,
    render: true,
    routing: null,
    localStorage: null,
  });

  // API Health Check - use relative URL since frontend and backend are on same domain
  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await axios.get('/health-check', { timeout: 5000 });
        setChecks(prev => ({ ...prev, api: true }));
      } catch (error) {
        setChecks(prev => ({ ...prev, api: false }));
        console.error('API Check Error:', error);
      }
    };

    checkAPI();
  }, []);

  // State Management Check
  useEffect(() => {
    // Set a timeout to ensure this runs after initial render
    const timer = setTimeout(() => {
      // If we can reach this point and the component rendered,
      // React state management is working
      setChecks(prev => ({ ...prev, state: true }));
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Routing Check
  useEffect(() => {
    try {
      // Check if browser history API is available
      const routingWorks = !!(window.history && window.history.pushState);
      setChecks(prev => ({ ...prev, routing: routingWorks }));
    } catch (error) {
      setChecks(prev => ({ ...prev, routing: false }));
      console.error('Routing Check Error:', error);
    }
  }, []);

  // Local Storage Check
  useEffect(() => {
    try {
      const testKey = 'health-check-test';
      localStorage.setItem(testKey, 'test');
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      setChecks(prev => ({ ...prev, localStorage: retrieved === 'test' }));
    } catch (error) {
      setChecks(prev => ({ ...prev, localStorage: false }));
      console.error('LocalStorage Check Error:', error);
    }
  }, []);

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <Clock className="h-4 w-4 animate-spin text-blue-500" />;
    return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = (status: boolean | null) => {
    if (status === null) return 'Checking...';
    return status ? 'OK' : 'Failed';
  };

  const getStatusColor = (status: boolean | null) => {
    if (status === null) return 'text-blue-600';
    return status ? 'text-green-600' : 'text-red-600';
  };

  const allChecksComplete = Object.values(checks).every(check => check !== null);
  const allChecksPassed = Object.values(checks).every(check => check === true);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon(allChecksComplete ? allChecksPassed : null)}
          🚀 Frontend Health Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>API Connection:</span>
            <div className={`flex items-center gap-1 ${getStatusColor(checks.api)}`}>
              {getStatusIcon(checks.api)}
              <span className="text-sm font-medium">{getStatusText(checks.api)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span>State Management:</span>
            <div className={`flex items-center gap-1 ${getStatusColor(checks.state)}`}>
              {getStatusIcon(checks.state)}
              <span className="text-sm font-medium">{getStatusText(checks.state)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span>Component Render:</span>
            <div className={`flex items-center gap-1 ${getStatusColor(checks.render)}`}>
              {getStatusIcon(checks.render)}
              <span className="text-sm font-medium">{getStatusText(checks.render)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span>Routing:</span>
            <div className={`flex items-center gap-1 ${getStatusColor(checks.routing)}`}>
              {getStatusIcon(checks.routing)}
              <span className="text-sm font-medium">{getStatusText(checks.routing)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span>Local Storage:</span>
            <div className={`flex items-center gap-1 ${getStatusColor(checks.localStorage)}`}>
              {getStatusIcon(checks.localStorage)}
              <span className="text-sm font-medium">{getStatusText(checks.localStorage)}</span>
            </div>
          </div>
        </div>

        {allChecksComplete && (
          <div className={`text-xs p-2 rounded ${allChecksPassed ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
            {allChecksPassed 
              ? '🎵 NeuroTunes frontend is healthy and ready!' 
              : '🚨 Some frontend components need attention'
            }
          </div>
        )}

        <button
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
        >
          Refresh Checks
        </button>
      </CardContent>
    </Card>
  );
};

export default FrontendChecker;
