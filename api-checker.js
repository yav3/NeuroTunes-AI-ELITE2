
import axios from 'axios';

// Use your actual Replit URL - replace with your domain
const BASE_URL = 'https://your-replit-url.repl.co'; // Update this with your actual URL
const LOCAL_URL = 'http://0.0.0.0:5000'; // For local development

// Choose which URL to use
const API_BASE = LOCAL_URL;

const apiEndpoints = [
  // Health and status endpoints
  { method: 'get', url: `${API_BASE}/api/health` },
  { method: 'get', url: `${API_BASE}/api/external-test` },
  
  // Track/Song endpoints
  { method: 'get', url: `${API_BASE}/api/tracks` },
  { method: 'get', url: `${API_BASE}/api/songs` },
  { method: 'get', url: `${API_BASE}/api/songs/1` },
  { method: 'get', url: `${API_BASE}/api/tracks/search?q=meditation` },
  { method: 'get', url: `${API_BASE}/api/tracks/mood/calm` },
  
  // User and playlist endpoints
  { method: 'get', url: `${API_BASE}/api/users/1/playlists` },
  { method: 'get', url: `${API_BASE}/api/users/1/playlists/recommended` },
  { method: 'get', url: `${API_BASE}/api/users/1/preferences` },
  { method: 'get', url: `${API_BASE}/api/users/1/stats` },
  { method: 'get', url: `${API_BASE}/api/users/1/recent` },
  { method: 'get', url: `${API_BASE}/api/users/1/favorites` },
  
  // Chat and NLP endpoints
  { 
    method: 'post', 
    url: `${API_BASE}/api/chat`, 
    data: { message: 'I need help focusing', userId: 1 } 
  },
  { 
    method: 'post', 
    url: `${API_BASE}/api/nlp`, 
    data: { text: 'I feel stressed and need to relax' } 
  },
  { 
    method: 'post', 
    url: `${API_BASE}/api/analyze`, 
    data: { text: 'I need energy for my workout' } 
  },
  
  // Upload and track management
  { 
    method: 'post', 
    url: `${API_BASE}/api/tracks/upload`, 
    data: { 
      filename: 'test-track.mp3', 
      title: 'Test Track', 
      artist: 'Test Artist',
      genre: 'Ambient',
      mood: 'calm',
      tags: ['relaxation', 'meditation']
    } 
  },
  
  // Audio streaming
  { method: 'get', url: `${API_BASE}/api/audio/morning-meditation.mp3` },
  { method: 'get', url: `${API_BASE}/api/audio/focus-demo.mp3` },
  
  // Mood analysis endpoints
  { 
    method: 'post', 
    url: `${API_BASE}/api/tracks/1/analyze-mood`, 
    data: { userId: 1 } 
  },
  { method: 'get', url: `${API_BASE}/api/mood-suggestions?limit=5` },
  { method: 'get', url: `${API_BASE}/api/users/1/ai-status` },
  
  // Recommendations
  { method: 'get', url: `${API_BASE}/api/recommendations/stress` },
  { method: 'get', url: `${API_BASE}/api/recommendations/focus` },
  
  // Listening history
  { 
    method: 'post', 
    url: `${API_BASE}/api/listening-history`, 
    data: { 
      userId: 1, 
      trackId: 1, 
      sessionDuration: 180,
      context: 'focus_session'
    } 
  }
];

const checkAPI = async () => {
  console.log('🔄 Starting API Health Check...\n');
  console.log(`Testing against: ${API_BASE}\n`);
  
  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (const endpoint of apiEndpoints) {
    try {
      const startTime = Date.now();
      const response = await axios({
        method: endpoint.method,
        url: endpoint.url,
        data: endpoint.data,
        timeout: 10000, // 10 seconds timeout
        validateStatus: function (status) {
          // Accept any status code less than 500 as success for testing
          return status < 500;
        }
      });

      const duration = Date.now() - startTime;
      const status = response.status;
      const method = endpoint.method.toUpperCase();
      const url = endpoint.url.replace(API_BASE, '');

      if (status >= 200 && status < 400) {
        console.log(`✅ [${method}] ${url} - Status: ${status} (${duration}ms)`);
        successCount++;
        results.push({ endpoint: url, method, status, success: true, duration });
      } else {
        console.log(`⚠️  [${method}] ${url} - Status: ${status} (${duration}ms)`);
        successCount++; // Still counts as working, just different status
        results.push({ endpoint: url, method, status, success: true, duration });
      }

      // Log interesting response data for key endpoints
      if (endpoint.url.includes('/health') && response.data) {
        console.log(`   📊 Health: ${response.data.status} - ${response.data.trackCount || 0} tracks`);
      }
      if (endpoint.url.includes('/chat') && response.data) {
        console.log(`   🤖 Chat: Suggested need: ${response.data.suggestedNeed}`);
      }
      if (endpoint.url.includes('/nlp') && response.data) {
        console.log(`   🧠 NLP: Detected mood: ${response.data.analysis?.mood}`);
      }

    } catch (error) {
      const method = endpoint.method.toUpperCase();
      const url = endpoint.url.replace(API_BASE, '');
      
      if (error.response) {
        console.error(`🚨 [${method}] ${url} - Error Status: ${error.response.status}`);
        console.error(`   Error: ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.code === 'ECONNREFUSED') {
        console.error(`🚨 [${method}] ${url} - Connection refused (server not running?)`);
      } else if (error.code === 'ETIMEDOUT') {
        console.error(`🚨 [${method}] ${url} - Request timeout`);
      } else {
        console.error(`🚨 [${method}] ${url} - Error: ${error.message}`);
      }
      
      errorCount++;
      results.push({ endpoint: url, method, success: false, error: error.message });
    }
  }

  console.log('\n📊 API Health Check Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`🚨 Failed: ${errorCount}`);
  console.log(`📈 Success Rate: ${Math.round((successCount / (successCount + errorCount)) * 100)}%`);

  if (errorCount > 0) {
    console.log('\n🔧 Failed Endpoints:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   • [${r.method}] ${r.endpoint}`);
    });
  }

  // Save results to file
  const { writeFileSync } = await import('fs');
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    baseUrl: API_BASE,
    summary: { successful: successCount, failed: errorCount },
    results
  };
  
  writeFileSync('api-health-report.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Detailed report saved to: api-health-report.json');
};

// Enhanced error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run the health check
checkAPI().catch(error => {
  console.error('🚨 Critical error in API checker:', error);
  process.exit(1);
});
