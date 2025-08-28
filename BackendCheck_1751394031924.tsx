
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

interface ConnectionStatus {
  status: 'checking' | 'connected' | 'error' | 'timeout' | 'cors' | 'network';
  message: string;
  details?: string;
  timestamp?: string;
}

const BackendCheck = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'checking',
    message: 'Checking backend connection...'
  });

  const checkBackendConnection = async () => {
    setConnectionStatus({
      status: 'checking',
      message: 'Testing backend connection...'
    });

    try {
      // Test simple health check endpoint first
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/health-check', {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const responseText = await response.text();
        
        // Test detailed health endpoint
        try {
          const detailedResponse = await fetch('/api/health');
          const healthData = await detailedResponse.json();
          
          setConnectionStatus({
            status: 'connected',
            message: '✅ Backend connection successful',
            details: `Status: ${healthData.status} | Database: ${healthData.database} | Tracks: ${healthData.trackCount}`,
            timestamp: new Date().toISOString()
          });
        } catch (detailError) {
          setConnectionStatus({
            status: 'connected',
            message: '✅ Basic backend connection successful',
            details: 'Health check OK, but detailed status unavailable',
            timestamp: new Date().toISOString()
          });
        }
      } else {
        setConnectionStatus({
          status: 'error',
          message: `❌ Backend responded with error: ${response.status}`,
          details: `HTTP ${response.status} - ${response.statusText}`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      console.error('Backend connection error:', error);
      
      if (error.name === 'AbortError') {
        // Timeout error (ECONNABORTED equivalent)
        setConnectionStatus({
          status: 'timeout',
          message: '⏱️ Backend connection timeout',
          details: 'Backend is taking too long to respond or is unreachable. Check if the server is running.',
          timestamp: new Date().toISOString()
        });
      } else if (error.response) {
        // Backend responded with an error (4xx or 5xx)
        setConnectionStatus({
          status: 'error',
          message: `❌ Backend error: ${error.response.status}`,
          details: `Server responded with ${error.response.status} - ${error.response.statusText}`,
          timestamp: new Date().toISOString()
        });
      } else if (error.request) {
        // Request was sent but no response received (network/CORS)
        setConnectionStatus({
          status: 'network',
          message: '🌐 Network connection issue',
          details: 'Request sent but no response received. Possible CORS or network connectivity issue.',
          timestamp: new Date().toISOString()
        });
      } else if (error.message?.includes('cors') || error.message?.includes('CORS')) {
        // CORS specific error
        setConnectionStatus({
          status: 'cors',
          message: '🚫 CORS policy error',
          details: 'Backend lacks proper CORS configuration. Add app.use(cors()) to backend.',
          timestamp: new Date().toISOString()
        });
      } else {
        // General unexpected error
        setConnectionStatus({
          status: 'error',
          message: '❌ Unexpected connection error',
          details: error.message || 'Unknown error occurred while connecting to backend',
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  useEffect(() => {
    checkBackendConnection();
    
    // Set up periodic health checks every 30 seconds
    const interval = setInterval(checkBackendConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'checking':
        return <Clock className="h-5 w-5 animate-spin text-blue-500" />;
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'timeout':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'cors':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'network':
        return <WifiOff className="h-5 w-5 text-yellow-500" />;
      case 'error':
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return 'border-green-200 bg-green-50';
      case 'checking':
        return 'border-blue-200 bg-blue-50';
      case 'timeout':
        return 'border-orange-200 bg-orange-50';
      case 'cors':
        return 'border-red-200 bg-red-50';
      case 'network':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
      default:
        return 'border-red-200 bg-red-50';
    }
  };

  const getTroubleshootingTips = () => {
    switch (connectionStatus.status) {
      case 'timeout':
        return [
          'Check if the backend server is running',
          'Restart the backend application',
          'Check Replit workspace status',
          'Verify server is bound to 0.0.0.0:5000'
        ];
      case 'cors':
        return [
          'Add app.use(cors()) to backend server',
          'Configure CORS headers properly',
          'Check server CORS middleware setup'
        ];
      case 'network':
        return [
          'Check backend URL configuration',
          'Verify network connectivity',
          'Check if backend is accessible',
          'Review server network settings'
        ];
      case 'error':
        return [
          'Check backend server logs',
          'Verify API endpoint exists',
          'Check for runtime errors in backend',
          'Review server error handling'
        ];
      default:
        return [];
    }
  };

  return (
    <Card className={`w-full max-w-md ${getStatusColor()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon()}
          Backend Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium">{connectionStatus.message}</p>
          {connectionStatus.details && (
            <p className="text-sm text-gray-600 mt-1">{connectionStatus.details}</p>
          )}
          {connectionStatus.timestamp && (
            <p className="text-xs text-gray-500 mt-1">
              Last checked: {new Date(connectionStatus.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>

        {connectionStatus.status !== 'connected' && connectionStatus.status !== 'checking' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="mt-2">
                <p className="font-medium mb-2">Troubleshooting Steps:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {getTroubleshootingTips().map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <button
          onClick={checkBackendConnection}
          disabled={connectionStatus.status === 'checking'}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {connectionStatus.status === 'checking' ? 'Checking...' : 'Retry Connection'}
        </button>

        {connectionStatus.status === 'connected' && (
          <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
            🎵 NeuroTunes backend is healthy and ready for therapeutic music streaming
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BackendCheck;
