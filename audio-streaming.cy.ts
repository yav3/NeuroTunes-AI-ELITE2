
describe('Audio Streaming Tests', () => {
  const API_URL = 'http://0.0.0.0:5000';

  it('should stream audio files correctly', () => {
    // Test audio endpoint with demo files
    const testFiles = [
      'morning-meditation.mp3',
      'focus-flow.mp3',
      'energy-boost.mp3'
    ];

    testFiles.forEach(filename => {
      cy.request({
        url: `${API_URL}/api/audio/${filename}`,
        followRedirect: false
      }).then((response) => {
        // Should redirect to actual audio file or return audio data
        expect([200, 302]).to.include(response.status);
        
        if (response.status === 302) {
          expect(response.headers.location).to.contain('mp3');
        }
      });
    });
  });

  it('should handle mood-based audio streaming', () => {
    const moodFiles = [
      'stress-demo.mp3',
      'focus-demo.mp3',
      'energy-demo.mp3',
      'meditation-demo.mp3'
    ];

    moodFiles.forEach(filename => {
      cy.request(`${API_URL}/api/audio/${filename}`).should((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  it('should play audio through the music player', () => {
    cy.visit('/library');
    
    // Get first track and attempt to play
    cy.get('[data-testid*="track"], .track-item').first().within(() => {
      cy.get('button[aria-label*="play"], .play-button').click();
    });

    // Verify audio player appears and works
    cy.get('[data-testid="music-player"], .music-player').should('be.visible');
    
    // Check play/pause functionality
    cy.get('button[aria-label*="pause"], button[aria-label*="Pause"]').should('exist');
  });
});
