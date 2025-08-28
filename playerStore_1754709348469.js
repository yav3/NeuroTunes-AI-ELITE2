import { create } from 'zustand';

export const usePlayerStore = create((set, get) => ({
  // Player state
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  queue: [],
  history: [],
  isLoading: false, // Add loading state
  loadingType: 'none', // 'playing', 'loading', 'buffering', 'transitioning'
  loadingProgress: 0, // Progress for animations (0-100)
  playlistMode: false, // Track if playing from a playlist
  playlistName: null, // Name of the current playlist
  playlistTracks: [], // Store the full playlist for navigation
  autoQueue: [], // Store all tracks from current page for continuous play
  
  // Audio element reference
  audioRef: null,
  
  // Spatial Audio
  spatialAudio: false,
  audioContext: null,
  spatialNodes: null,
  
  // Favorites
  favorites: [],
  
  // Blocked tracks
  blockedTracks: [],
  
  // Actions
  setAudioRef: (ref) => set({ audioRef: ref }),
  
  // Stop all playback and clear queue
  stopAll: () => {
    const { audioRef } = get();
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
    }
    set({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      autoQueue: [],
      playlistTracks: [],
      currentTime: 0,
      duration: 0
    });
    console.log('🛑 Stopped all playback and cleared queue');
  },
  
  // API call when track starts playing
  reportPlayback: async (trackId) => {
    try {
      const response = await fetch(`/api/track/${trackId}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: new Date().toISOString() })
      });
      if (response.ok) {
        console.log('✅ Playback reported to backend:', trackId);
      }
    } catch (err) {
      console.error('Failed to report playback:', err);
    }
  },
  
  playTrack: (track, allTracks = null) => {
    const { audioRef, currentTrack, isLoading } = get();
    
    if (!track || !track.id) {
      console.log('🎵 Invalid track provided, skipping');
      return;
    }
    
    console.log('🎵 playTrack called with:', {
      title: track?.title,
      id: track?.id,
      audio_url: track?.audio_url,
      storage_url: track?.storage_url,
      hasAudioUrl: !!(track?.audio_url || track?.audioUrl || track?.storage_url)
    });
    
    // Prevent rapid cycling - if already loading same track, skip
    if (isLoading && currentTrack?.id === track.id) {
      console.log('🎵 Track already loading, skipping duplicate call');
      return;
    }
    
    // If this is the same track and it's already playing, don't restart
    if (currentTrack?.id === track.id && !isLoading) {
      console.log('🎵 Same track already loaded, toggling play instead');
      get().togglePlay();
      return;
    }
    
    // If allTracks provided, set as auto-queue for continuous play
    if (allTracks && allTracks.length > 0) {
      console.log('🎵 Setting auto-queue with', allTracks.length, 'tracks');
      set({ autoQueue: allTracks });
    }
    
    // Block blocked tracks - but don't auto-advance to prevent cycling
    if (get().isBlocked(track.id)) {
      console.log('Track is blocked, skipping:', track.title);
      return; // Don't call playNext() to prevent rapid cycling
    }
    
    if (currentTrack?.id !== track.id) {
      // New track - update state with loading animation
      set({ 
        currentTrack: track, 
        isPlaying: true,  // Set to true so NowPlaying auto-plays
        currentTime: 0,
        duration: track.duration || 240,  // Use track's duration if available
        isLoading: true,
        loadingType: 'transitioning',
        loadingProgress: 0
      });
      
      // Start loading progress animation
      const progressInterval = setInterval(() => {
        const { loadingProgress, isLoading } = get();
        if (!isLoading || loadingProgress >= 90) {
          clearInterval(progressInterval);
          return;
        }
        set({ loadingProgress: Math.min(loadingProgress + 10, 90) });
      }, 50);
      
      // Let NowPlaying handle the audio element - don't interfere!
      // Just wait for NowPlaying to be ready, then trigger play
      setTimeout(() => {
        const { audioRef } = get();
        if (audioRef && audioRef.src) {
          console.log('Audio element ready, attempting to play');
          audioRef.play()
            .then(() => {
              console.log('✅ Playback started successfully');
              set({ 
                isPlaying: true, 
                isLoading: false, 
                loadingType: 'playing',
                loadingProgress: 100 
              });
              // Report to backend that track is playing
              get().reportPlayback(track.id);
            })
            .catch(err => {
              console.error('❌ Playback failed:', err);
              if (err.name === 'NotAllowedError') {
                console.log('Autoplay blocked. User needs to click play.');
                set({ 
                  isPlaying: false, 
                  isLoading: false,
                  loadingType: 'none',
                  loadingProgress: 0 
                });
              } else {
                set({ 
                  isPlaying: false, 
                  isLoading: false, 
                  loadingType: 'none',
                  loadingProgress: 0 
                });
              }
            });
        } else {
          console.log('Waiting for NowPlaying to set audio source...');
          set({ 
            isLoading: false, 
            loadingType: 'none',
            loadingProgress: 0 
          });
        }
      }, 500); // Give NowPlaying time to set the source
    } else {
      // Same track - just toggle play/pause
      get().togglePlay();
    }
  },
  
  togglePlay: () => {
    const { audioRef, isPlaying, currentTrack } = get();
    
    if (audioRef && currentTrack) {
      if (isPlaying) {
        audioRef.pause();
        set({ isPlaying: false });
      } else {
        // Ensure source is set
        if (!audioRef.src || audioRef.src === 'about:blank' || audioRef.src === window.location.href) {
          const url = currentTrack.audio_url || currentTrack.audioUrl || currentTrack.storage_url || currentTrack.url;
          if (url) {
            console.log('Setting source in togglePlay:', url);
            audioRef.src = url;
            audioRef.load();
          }
        }
        
        // Wait for audio to be ready if needed
        if (audioRef.readyState >= 2) {
          const playPromise = audioRef.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Playback started via toggle');
                set({ isPlaying: true });
              })
              .catch(err => {
                console.error('Toggle play failed:', err);
                set({ isPlaying: false });
              });
          }
        } else {
          // Audio not ready, wait for it
          console.log('Audio not ready, waiting for canplay event');
          const handleCanPlay = () => {
            audioRef.play()
              .then(() => {
                console.log('Playback started after canplay');
                set({ isPlaying: true });
              })
              .catch(err => {
                console.error('Failed to play after canplay:', err);
                set({ isPlaying: false });
              });
          };
          audioRef.addEventListener('canplay', handleCanPlay, { once: true });
        }
      }
    }
  },
  
  stopPlayback: () => {
    const { audioRef } = get();
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
      audioRef.src = ''; // Clear the source to fully stop
    }
    set({ 
      isPlaying: false,
      currentTime: 0,
      currentTrack: null, // Clear the current track
      playlistMode: false, // Exit playlist mode
      playlistName: null,
      playlistTracks: [],
      queue: [],
      duration: 0
    });
    console.log('Playback stopped and cleared');
  },
  
  playNext: (isSkip = false) => {
    const { queue, currentTrack, history, audioRef, playlistTracks, autoQueue, favorites } = get();
    
    console.log('🎵 PlayNext called - queue:', queue.length, 'playlist:', playlistTracks?.length || 0, 'autoQueue:', autoQueue?.length || 0);
    console.log('🎵 Current track:', currentTrack?.title);
    
    // Smart Recommendation: If user skipped and not favorited, add different genre tracks
    if (isSkip && currentTrack && autoQueue && !favorites.some(f => f.id === currentTrack.id)) {
      // Find tracks with different genre
      const differentTracks = autoQueue.filter(t => 
        t.id !== currentTrack.id && 
        t.genre && currentTrack.genre && 
        !t.genre.toLowerCase().includes(currentTrack.genre.split(',')[0].toLowerCase())
      ).slice(0, 3); // Add up to 3 different genre tracks
      
      if (differentTracks.length > 0) {
        console.log(`🔄 Adding ${differentTracks.length} different genre tracks (user skipped)`);
        set(state => ({ 
          queue: [...differentTracks, ...state.queue] 
        }));
      }
    }
    
    // Try to get next track from queue, playlist, or auto-queue
    let nextTrack = null;
    
    if (queue.length > 0) {
      // Get from queue first
      nextTrack = queue[0];
      console.log('Next track from queue:', nextTrack.title);
      
      // Update queue
      set({ 
        queue: queue.slice(1),
        history: currentTrack ? [...history, currentTrack] : history
      });
    } else if (playlistTracks && playlistTracks.length > 0) {
      // No queue, try to find next track in playlist
      const currentIndex = playlistTracks.findIndex(t => t.id === currentTrack?.id);
      if (currentIndex >= 0 && currentIndex < playlistTracks.length - 1) {
        nextTrack = playlistTracks[currentIndex + 1];
        console.log('Next track from playlist:', nextTrack.title);
        set({
          history: currentTrack ? [...history, currentTrack] : history
        });
      } else if (currentIndex === -1 && playlistTracks.length > 0) {
        // Current track not in playlist, play first track
        nextTrack = playlistTracks[0];
        console.log('Playing first track from playlist:', nextTrack.title);
      }
    } else if (autoQueue && autoQueue.length > 0) {
      // Use auto-queue (all tracks from current page)
      const currentIndex = autoQueue.findIndex(t => t.id === currentTrack?.id);
      if (currentIndex >= 0 && currentIndex < autoQueue.length - 1) {
        nextTrack = autoQueue[currentIndex + 1];
        console.log('Next track from auto-queue:', nextTrack.title);
        set({
          history: currentTrack ? [...history, currentTrack] : history
        });
      } else if (currentIndex === autoQueue.length - 1) {
        // Last track, loop to first
        nextTrack = autoQueue[0];
        console.log('Looping to first track in auto-queue:', nextTrack.title);
        set({
          history: currentTrack ? [...history, currentTrack] : history
        });
      }
    }
    
    if (nextTrack) {
      // Stop current playback
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }
      
      // Reset playback state
      set({ 
        isPlaying: false,
        currentTime: 0,
        duration: 0
      });
      
      // Play the next track with a small delay and prevent duplicate calls
      setTimeout(() => {
        const { isLoading } = get();
        if (!isLoading) {  // Only play if not already loading
          get().playTrack(nextTrack);
        }
      }, 150);
    } else {
      console.log('No next track available');
      // No more tracks, just pause without clearing current track
      if (audioRef) {
        audioRef.pause();
      }
      set({ 
        isPlaying: false
      });
    }
  },
  
  playPrevious: () => {
    const { history, currentTrack, audioRef } = get();
    
    console.log('PlayPrevious called - history length:', history.length);
    
    if (history.length > 0) {
      const prevTrack = history[history.length - 1];
      console.log('Previous track:', prevTrack.title);
      
      // Stop current playback
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }
      
      // Update history and queue
      set({ 
        history: history.slice(0, -1),
        queue: currentTrack ? [currentTrack, ...get().queue] : get().queue,
        isPlaying: false,
        currentTime: 0,
        duration: 0
      });
      
      // Play the previous track with a small delay and prevent duplicate calls
      setTimeout(() => {
        const { isLoading } = get();
        if (!isLoading) {  // Only play if not already loading
          get().playTrack(prevTrack);
        }
      }, 150);
    } else {
      console.log('No tracks in history');
    }
  },
  
  setVolume: (volume) => {
    const { audioRef } = get();
    set({ volume });
    if (audioRef) {
      audioRef.volume = volume;
    }
  },
  
  updateTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration: duration || get().currentTrack?.duration || 240 }),
  
  addToQueue: (track) => set((state) => ({ 
    queue: [...state.queue, track] 
  })),
  
  clearQueue: () => set({ queue: [] }),
  
  toggleFavorite: async (track) => {
    const { favorites, currentTrack, autoQueue } = get();
    const isFavorited = favorites.some(f => f.id === track.id);
    
    try {
      if (isFavorited) {
        // Remove from favorites via API
        const response = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackId: track.id })
        });
        if (response.ok) {
          console.log('✅ Removed from favorites (backend):', track.title);
          set({ favorites: favorites.filter(f => f.id !== track.id) });
        }
      } else {
        // Add to favorites via API
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackId: track.id, track: track })
        });
        if (response.ok) {
          console.log('✅ Added to favorites (backend):', track.title);
          set({ favorites: [...favorites, track] });
          
          // Smart Recommendation: User liked this track, add similar tracks to queue
          if (currentTrack?.id === track.id && autoQueue) {
            // Find tracks with same genre or therapeutic application
            const similarTracks = autoQueue.filter(t => 
              t.id !== track.id && (
                (t.genre && track.genre && t.genre.toLowerCase().includes(track.genre.split(',')[0].toLowerCase())) ||
                (t.therapeutic_applications && track.therapeutic_applications && 
                 t.therapeutic_applications.some(app => track.therapeutic_applications.includes(app)))
              )
            ).slice(0, 5); // Add up to 5 similar tracks
            
            if (similarTracks.length > 0) {
              console.log(`🎯 Adding ${similarTracks.length} similar tracks to queue (user favorited)`);
              set(state => ({ 
                queue: [...state.queue, ...similarTracks] 
              }));
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to update favorites:', err);
      // Still update local state even if API fails
      if (isFavorited) {
        set({ favorites: favorites.filter(f => f.id !== track.id) });
      } else {
        set({ favorites: [...favorites, track] });
      }
    }
  },
  
  isFavorited: (trackId) => {
    return get().favorites.some(f => f.id === trackId);
  },
  
  // Block/unblock tracks  
  blockTrack: async (track) => {
    const { blockedTracks, currentTrack } = get();
    const isBlocked = blockedTracks.some(b => b.id === track.id);
    
    if (!isBlocked) {
      console.log('Blocking track:', track.title);
      
      // API call to report blocked track
      try {
        const response = await fetch(`/api/track/${track.id}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: 'blocked',
            reason: 'user_preference',
            timestamp: new Date().toISOString()
          })
        });
        if (response.ok) {
          console.log('✅ Track block reported to backend');
        }
      } catch (err) {
        console.error('Failed to report blocked track:', err);
      }
      
      // Update local state
      set({ blockedTracks: [...blockedTracks, track] });
      
      // If this is the current track, skip to next
      if (currentTrack?.id === track.id) {
        get().playNext();
      }
    }
  },
  
  unblockTrack: (trackId) => set((state) => ({
    blockedTracks: state.blockedTracks.filter(b => b.id !== trackId)
  })),
  
  isBlocked: (trackId) => {
    return get().blockedTracks.some(b => b.id === trackId);
  },
  
  // Playlist mode management
  setPlaylistMode: (mode, name = null) => set({ 
    playlistMode: mode, 
    playlistName: name 
  }),
  
  clearPlaylistMode: () => set({ 
    playlistMode: false, 
    playlistName: null 
  }),
  
  // Play multiple tracks as playlist
  playPlaylist: (tracks, playlistName) => {
    if (tracks && tracks.length > 0) {
      console.log('Playing playlist:', playlistName, 'with', tracks.length, 'tracks');
      const [firstTrack] = tracks;
      
      // First stop all existing playback completely
      get().stopPlayback();
      
      // Wait a moment for stop to complete, then set new playlist
      setTimeout(() => {
        set({ 
          queue: [], // Don't duplicate, use playlistTracks instead
          playlistTracks: tracks, // Store full playlist for navigation
          playlistMode: true,
          playlistName,
          history: [],
          currentTrack: firstTrack, // Set the current track immediately
          isPlaying: true, // Set to playing so music starts automatically
          currentTime: 0,
          duration: firstTrack.duration || 240
        });
        
        // Start playing first track with additional delay to ensure state is set
        setTimeout(() => {
          get().playTrack(firstTrack);
        }, 100);
      }, 100);
    }
  },
  
  // Spatial Audio toggle
  toggleSpatialAudio: () => {
    const { audioRef, spatialAudio, audioContext, spatialNodes } = get();
    
    if (!audioRef) return;
    
    if (!spatialAudio) {
      // Enable spatial audio
      try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const source = context.createMediaElementSource(audioRef);
        
        // Create spatial audio nodes
        const stereoPanner = context.createStereoPanner();
        const convolver = context.createConvolver();
        const compressor = context.createDynamicsCompressor();
        const gain = context.createGain();
        
        // Set up basic reverb impulse response
        const length = context.sampleRate * 2;
        const impulse = context.createBuffer(2, length, context.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
          const channelData = impulse.getChannelData(channel);
          for (let i = 0; i < length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
          }
        }
        
        convolver.buffer = impulse;
        
        // Create wet/dry mix
        const wetGain = context.createGain();
        const dryGain = context.createGain();
        wetGain.gain.value = 0.3; // 30% reverb
        dryGain.gain.value = 0.7; // 70% dry signal
        
        // Connect nodes for spatial effect
        source.connect(dryGain);
        source.connect(convolver);
        convolver.connect(wetGain);
        
        dryGain.connect(stereoPanner);
        wetGain.connect(stereoPanner);
        
        stereoPanner.connect(compressor);
        compressor.connect(gain);
        gain.connect(context.destination);
        
        // Apply subtle panning automation
        const panOscillator = context.createOscillator();
        const panGain = context.createGain();
        panGain.gain.value = 0.3; // Subtle panning
        panOscillator.frequency.value = 0.2; // Slow movement
        panOscillator.connect(panGain);
        panGain.connect(stereoPanner.pan);
        panOscillator.start();
        
        set({ 
          spatialAudio: true, 
          audioContext: context,
          spatialNodes: {
            source,
            stereoPanner,
            convolver,
            compressor,
            gain,
            wetGain,
            dryGain,
            panOscillator
          }
        });
        
        console.log('Spatial Audio enabled - immersive 3D sound activated');
      } catch (error) {
        console.error('Failed to enable spatial audio:', error);
      }
    } else {
      // Disable spatial audio
      if (spatialNodes) {
        try {
          // Stop oscillator
          if (spatialNodes.panOscillator) {
            spatialNodes.panOscillator.stop();
          }
          
          // Disconnect all nodes
          Object.values(spatialNodes).forEach(node => {
            if (node && node.disconnect) {
              node.disconnect();
            }
          });
          
          // Close audio context
          if (audioContext) {
            audioContext.close();
          }
          
          set({ 
            spatialAudio: false, 
            audioContext: null,
            spatialNodes: null
          });
          
          console.log('Spatial Audio disabled');
        } catch (error) {
          console.error('Failed to disable spatial audio:', error);
        }
      }
    }
  }
}));