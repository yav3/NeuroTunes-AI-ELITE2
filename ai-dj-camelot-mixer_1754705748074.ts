// AI DJ Camelot Mixer with 3-Second Crossfade Logic
// Implements harmonic mixing and smooth transitions for therapeutic music

interface CamelotTrack {
  id: number;
  title: string;
  camelot: string;
  valence: number;
  arousal: number;
  dominance: number;
  bpm: number;
  duration: number;
  last_played?: number;
  audio_url: string;
}

interface MixSession {
  sessionGoal: 'focus' | 'energy' | 'chill' | 'sleep' | 'pain_relief' | 'relaxation';
  targetValence: number;
  targetArousal: number;
  targetDominance: number;
  noveltyWeight: number;
  harmonicWeight: number;
}

// Camelot Wheel harmonic compatibility
const CAMELOT_COMPATIBILITY = {
  '1A': ['1B', '2A', '12A'],
  '1B': ['1A', '2B', '12B'],
  '2A': ['2B', '3A', '1A'],
  '2B': ['2A', '3B', '1B'],
  '3A': ['3B', '4A', '2A'],
  '3B': ['3A', '4B', '2B'],
  '4A': ['4B', '5A', '3A'],
  '4B': ['4A', '5B', '3B'],
  '5A': ['5B', '6A', '4A'],
  '5B': ['5A', '6B', '4B'],
  '6A': ['6B', '7A', '5A'],
  '6B': ['6A', '7B', '5B'],
  '7A': ['7B', '8A', '6A'],
  '7B': ['7A', '8B', '6B'],
  '8A': ['8B', '9A', '7A'],
  '8B': ['8A', '9B', '7B'],
  '9A': ['9B', '10A', '8A'],
  '9B': ['9A', '10B', '8B'],
  '10A': ['10B', '11A', '9A'],
  '10B': ['10A', '11B', '9B'],
  '11A': ['11B', '12A', '10A'],
  '11B': ['11A', '12B', '10B'],
  '12A': ['12B', '1A', '11A'],
  '12B': ['12A', '1B', '11B']
};

class CamelotAIDJ {
  private tracks: CamelotTrack[];
  private currentTrack: CamelotTrack | null = null;
  private queue: CamelotTrack[] = [];
  private session: MixSession;
  private crossfadeDuration = 3000; // 3 seconds

  constructor(tracks: CamelotTrack[], session: MixSession) {
    this.tracks = tracks.filter(t => t.camelot); // Only tracks with Camelot keys
    this.session = session;
  }

  // Calculate therapeutic compatibility score (0-1)
  calculateTherapeuticScore(track: CamelotTrack): number {
    const valenceScore = 1 - Math.abs(track.valence - this.session.targetValence);
    const arousalScore = 1 - Math.abs(track.arousal - this.session.targetArousal);
    const dominanceScore = 1 - Math.abs(track.dominance - this.session.targetDominance);
    
    return (valenceScore + arousalScore + dominanceScore) / 3;
  }

  // Calculate harmonic compatibility score (0-1)
  calculateHarmonicScore(fromKey: string, toKey: string): number {
    if (fromKey === toKey) return 1.0; // Perfect match
    
    const compatibleKeys = CAMELOT_COMPATIBILITY[fromKey] || [];
    if (compatibleKeys.includes(toKey)) return 0.8; // Compatible
    
    return 0.2; // Non-compatible but not forbidden
  }

  // Calculate novelty score based on last played time
  calculateNoveltyScore(track: CamelotTrack): number {
    if (!track.last_played) return 1.0; // Never played
    
    const hoursSincePlay = (Date.now() - track.last_played) / (1000 * 60 * 60);
    
    if (hoursSincePlay > 24) return 1.0;     // 24+ hours = fresh
    if (hoursSincePlay > 12) return 0.8;     // 12-24 hours = good
    if (hoursSincePlay > 6) return 0.6;      // 6-12 hours = okay
    if (hoursSincePlay > 3) return 0.4;      // 3-6 hours = recent
    return 0.1;                              // <3 hours = too recent
  }

  // Find next track using AI DJ algorithm
  findNextTrack(): CamelotTrack | null {
    if (!this.currentTrack) {
      // First track - select best therapeutic match
      const candidates = this.tracks
        .map(track => ({
          track,
          score: this.calculateTherapeuticScore(track) * 0.7 + 
                 this.calculateNoveltyScore(track) * 0.3
        }))
        .sort((a, b) => b.score - a.score);
      
      return candidates.length > 0 ? candidates[0].track : null;
    }

    // Find harmonically compatible tracks
    const currentKey = this.currentTrack.camelot;
    const compatibleTracks = this.tracks.filter(track => 
      track.id !== this.currentTrack!.id && // Don't repeat current track
      (currentKey === track.camelot || CAMELOT_COMPATIBILITY[currentKey]?.includes(track.camelot))
    );

    if (compatibleTracks.length === 0) {
      console.log('⚠️  No harmonically compatible tracks found, using therapeutic matching');
      return this.findBestTherapeuticMatch();
    }

    // Score all compatible tracks
    const scoredTracks = compatibleTracks.map(track => {
      const therapeuticScore = this.calculateTherapeuticScore(track);
      const harmonicScore = this.calculateHarmonicScore(currentKey, track.camelot);
      const noveltyScore = this.calculateNoveltyScore(track);

      const totalScore = 
        therapeuticScore * 0.4 +
        harmonicScore * this.session.harmonicWeight +
        noveltyScore * this.session.noveltyWeight;

      return { track, score: totalScore, therapeuticScore, harmonicScore, noveltyScore };
    });

    // Sort by total score and return best match
    scoredTracks.sort((a, b) => b.score - a.score);
    
    if (scoredTracks.length > 0) {
      const best = scoredTracks[0];
      console.log(`🎧 Next track: "${best.track.title}" (${best.track.camelot})`);
      console.log(`   Scores - Therapeutic: ${(best.therapeuticScore * 100).toFixed(1)}%, Harmonic: ${(best.harmonicScore * 100).toFixed(1)}%, Novelty: ${(best.noveltyScore * 100).toFixed(1)}%`);
      
      return best.track;
    }

    return null;
  }

  // Fallback therapeutic matching without harmonic constraints
  findBestTherapeuticMatch(): CamelotTrack | null {
    const candidates = this.tracks
      .filter(track => track.id !== this.currentTrack?.id)
      .map(track => ({
        track,
        score: this.calculateTherapeuticScore(track) * 0.6 + 
               this.calculateNoveltyScore(track) * 0.4
      }))
      .sort((a, b) => b.score - a.score);
    
    return candidates.length > 0 ? candidates[0].track : null;
  }

  // Generate crossfade timing for smooth transition
  calculateCrossfadePoints(fromTrack: CamelotTrack, toTrack: CamelotTrack) {
    const fadeOutStart = fromTrack.duration - this.crossfadeDuration;
    const fadeInEnd = this.crossfadeDuration;
    
    return {
      fromTrack: {
        fadeOutStart: Math.max(0, fadeOutStart),
        totalDuration: fromTrack.duration
      },
      toTrack: {
        preloadTime: fadeOutStart - 1000, // Preload 1 second early
        fadeInDuration: this.crossfadeDuration
      },
      crossfadeDuration: this.crossfadeDuration
    };
  }

  // Main AI DJ method - get next track and crossfade instructions
  getNextWithCrossfade(): { 
    nextTrack: CamelotTrack | null, 
    crossfade: any,
    queueInfo: { current: string, next: string, compatibility: string }
  } | null {
    const nextTrack = this.findNextTrack();
    
    if (!nextTrack) return null;

    let crossfade = null;
    let compatibility = 'therapeutic';
    
    if (this.currentTrack) {
      crossfade = this.calculateCrossfadePoints(this.currentTrack, nextTrack);
      
      const harmonicScore = this.calculateHarmonicScore(this.currentTrack.camelot, nextTrack.camelot);
      if (harmonicScore === 1.0) compatibility = 'perfect_match';
      else if (harmonicScore === 0.8) compatibility = 'harmonic_compatible';
      else compatibility = 'therapeutic_only';
    }

    return {
      nextTrack,
      crossfade,
      queueInfo: {
        current: this.currentTrack ? `${this.currentTrack.title} (${this.currentTrack.camelot})` : 'none',
        next: `${nextTrack.title} (${nextTrack.camelot})`,
        compatibility
      }
    };
  }

  // Update current track (call when track starts playing)
  setCurrentTrack(track: CamelotTrack) {
    this.currentTrack = track;
    // Update last_played timestamp
    track.last_played = Date.now();
  }

  // Get session statistics
  getSessionStats() {
    const tracksWithCamelot = this.tracks.length;
    const uniqueKeys = [...new Set(this.tracks.map(t => t.camelot))];
    
    return {
      totalTracks: tracksWithCamelot,
      uniqueKeys: uniqueKeys.length,
      averageValence: this.tracks.reduce((sum, t) => sum + t.valence, 0) / tracksWithCamelot,
      averageArousal: this.tracks.reduce((sum, t) => sum + t.arousal, 0) / tracksWithCamelot,
      keyDistribution: uniqueKeys.map(key => ({
        key,
        count: this.tracks.filter(t => t.camelot === key).length
      }))
    };
  }
}

// Session presets for different therapeutic goals
const THERAPEUTIC_SESSIONS = {
  focus: {
    sessionGoal: 'focus' as const,
    targetValence: 0.6,  // Moderately positive
    targetArousal: 0.4,  // Low-moderate energy
    targetDominance: 0.7, // High control/confidence
    noveltyWeight: 0.2,
    harmonicWeight: 0.4
  },
  energy: {
    sessionGoal: 'energy' as const,
    targetValence: 0.8,  // High positivity
    targetArousal: 0.8,  // High energy
    targetDominance: 0.8, // High empowerment
    noveltyWeight: 0.3,
    harmonicWeight: 0.3
  },
  chill: {
    sessionGoal: 'chill' as const,
    targetValence: 0.7,  // Pleasant
    targetArousal: 0.3,  // Low energy
    targetDominance: 0.5, // Balanced control
    noveltyWeight: 0.15,
    harmonicWeight: 0.45
  },
  sleep: {
    sessionGoal: 'sleep' as const,
    targetValence: 0.5,  // Neutral-pleasant
    targetArousal: 0.1,  // Very low energy
    targetDominance: 0.3, // Low control (surrender)
    noveltyWeight: 0.1,
    harmonicWeight: 0.5
  }
};

export { CamelotAIDJ, THERAPEUTIC_SESSIONS, type CamelotTrack, type MixSession };