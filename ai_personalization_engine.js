// src/services/AIPersonalizationEngine.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AIPersonalizationEngine {
  constructor() {
    this.userProfile = {};
    this.listeningHistory = [];
    this.preferences = {};
    this.recommendations = [];
    this.isInitialized = false;
  }

  async initialize() {
    try {
      await this.loadUserProfile();
      await this.loadListeningHistory();
      await this.loadPreferences();
      this.isInitialized = true;
      console.log('🤖 AI Personalization Engine initialized');
    } catch (error) {
      console.error('Failed to initialize AI engine:', error);
    }
  }

  async loadUserProfile() {
    try {
      const profile = await AsyncStorage.getItem('aiUserProfile');
      this.userProfile = profile ? JSON.parse(profile) : {
        preferredGenres: [],
        listeningTimes: {},
        moodPreferences: {},
        skipPatterns: {},
        volumePreferences: {},
        created: Date.now()
      };
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  async loadListeningHistory() {
    try {
      const history = await AsyncStorage.getItem('aiListeningHistory');
      this.listeningHistory = history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to load listening history:', error);
    }
  }

  async loadPreferences() {
    try {
      const prefs = await AsyncStorage.getItem('aiPreferences');
      this.preferences = prefs ? JSON.parse(prefs) : {
        autoPlaySimilar: true,
        adaptToMood: true,
        learnFromSkips: true,
        timeBasedRecommendations: true
      };
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }

  async saveUserProfile() {
    try {
      await AsyncStorage.setItem('aiUserProfile', JSON.stringify(this.userProfile));
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }

  async saveListeningHistory() {
    try {
      // Keep only last 1000 entries
      if (this.listeningHistory.length > 1000) {
        this.listeningHistory = this.listeningHistory.slice(-1000);
      }
      await AsyncStorage.setItem('aiListeningHistory', JSON.stringify(this.listeningHistory));
    } catch (error) {
      console.error('Failed to save listening history:', error);
    }
  }

  // Track user engagement with songs
  async trackEngagement(trackId, action, metadata = {}) {
    const engagement = {
      trackId,
      action, // 'play', 'skip', 'like', 'pause', 'seek', 'complete'
      timestamp: Date.now(),
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      ...metadata
    };

    this.listeningHistory.push(engagement);
    await this.updateUserProfile(engagement);
    await this.saveListeningHistory();
    
    if (this.preferences.learnFromSkips && action === 'skip') {
      await this.learnFromSkip(trackId, metadata);
    }
  }

  async updateUserProfile(engagement) {
    const { trackId, action, timeOfDay, dayOfWeek } = engagement;
    
    // Update listening time patterns
    const timeSlot = this.getTimeSlot(timeOfDay);
    if (!this.userProfile.listeningTimes[timeSlot]) {
      this.userProfile.listeningTimes[timeSlot] = 0;
    }
    this.userProfile.listeningTimes[timeSlot]++;

    // Update genre preferences based on completed listens
    if (action === 'complete' || action === 'like') {
      // This would typically get genre from track metadata
      // For now, we'll use mock data
      const genre = this.getTrackGenre(trackId);
      if (genre) {
        this.userProfile.preferredGenres[genre] = (this.userProfile.preferredGenres[genre] || 0) + 1;
      }
    }

    await this.saveUserProfile();
  }

  getTimeSlot(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  getTrackGenre(trackId) {
    // Mock genre mapping - in real app, this would come from track metadata
    const genreMap = {
      1: 'synthwave',
      2: 'retrowave', 
      3: 'electronic',
      4: 'ambient'
    };
    return genreMap[trackId] || 'unknown';
  }

  async learnFromSkip(trackId, metadata) {
    const { position, duration } = metadata;
    const skipRatio = position / duration;
    
    // If skipped very early, user doesn't like this type
    if (skipRatio < 0.1) {
      const genre = this.getTrackGenre(trackId);
      if (genre) {
        this.userProfile.skipPatterns[genre] = (this.userProfile.skipPatterns[genre] || 0) + 1;
      }
    }
  }

  // Generate AI-powered recommendations
  async generateRecommendations(currentTrack, availableTracks) {
    const timeOfDay = new Date().getHours();
    const timeSlot = this.getTimeSlot(timeOfDay);
    
    const scored = availableTracks.map(track => ({
      ...track,
      aiScore: this.calculateTrackScore(track, timeSlot, currentTrack)
    }));

    // Sort by AI score descending
    const recommendations = scored
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 10);

    this.recommendations = recommendations;
    return recommendations;
  }

  calculateTrackScore(track, timeSlot, currentTrack) {
    let score = 0.5; // Base score

    // Genre preference scoring
    const genre = track.genre || 'unknown';
    const genrePreference = this.userProfile.preferredGenres[genre] || 0;
    score += Math.min(genrePreference * 0.1, 0.3);

    // Time-based scoring
    if (this.preferences.timeBasedRecommendations) {
      const timePreference = this.userProfile.listeningTimes[timeSlot] || 0;
      score += Math.min(timePreference * 0.05, 0.2);
    }

    // Mood matching (simplified)
    if (currentTrack && track.mood === currentTrack.mood) {
      score += 0.15;
    }

    // BPM similarity for flow
    if (currentTrack && Math.abs(track.bpm - currentTrack.bpm) < 20) {
      score += 0.1;
    }

    // Penalize frequently skipped genres
    const skipPenalty = this.userProfile.skipPatterns[genre] || 0;
    score -= Math.min(skipPenalty * 0.05, 0.2);

    // Random factor for discovery
    score += Math.random() * 0.1;

    return Math.max(0, Math.min(1, score));
  }

  // Get mood-based recommendations
  async getMoodBasedRecommendations(mood, tracks) {
    const filtered = tracks.filter(track => 
      track.mood === mood || this.isMoodCompatible(track.mood, mood)
    );
    
    return this.generateRecommendations(null, filtered);
  }

  isMoodCompatible(trackMood, targetMood) {
    const moodCompatibility = {
      'energetic': ['intense', 'happy'],
      'chill': ['peaceful', 'relaxed'],
      'intense': ['energetic', 'powerful'],
      'peaceful': ['chill', 'ambient'],
      'happy': ['energetic', 'upbeat'],
      'sad': ['melancholic', 'emotional']
    };
    
    return moodCompatibility[targetMood]?.includes(trackMood) || false;
  }

  // Get personalized queue for continuous playback
  async getPersonalizedQueue(currentTrack, availableTracks, queueLength = 20) {
    const recommendations = await this.generateRecommendations(c