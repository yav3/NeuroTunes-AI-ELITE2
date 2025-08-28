#!/usr/bin/env tsx

import { storage } from '../server/storage';

function normalizeTitle(rawTitle: string): string {
  // Remove leading special characters and numbers
  let title = rawTitle.replace(/^[\d\.\(\)\[\]\{\}\-\—\–\s\"=]+/, '').trim();
  
  // Remove all punctuation marks except spaces
  title = title.replace(/[^\w\s]/g, ' ');
  
  // Remove extended numbers (more than 3 digits)
  title = title.replace(/\b\d{4,}\b/g, '');
  
  // Remove standalone numbers in parentheses
  title = title.replace(/\(\d+\)/g, '');
  
  // Remove common file artifacts
  title = title.replace(/\b(remix|remastered|extended|mix|version|vol|ft|feat)\b/gi, '');
  
  // Clean up multiple spaces and trim
  title = title.replace(/\s+/g, ' ').trim();
  
  // Remove accents and special characters from French/Spanish text
  title = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return title || 'Composition';
}

async function normalizeTitles() {
  console.log('🎵 Starting track title normalization...');
  
  try {
    // Get all tracks
    const tracks = await storage.getAllTracks();
    console.log(`Found ${tracks.length} tracks to normalize`);
    
    let updated = 0;
    
    for (const track of tracks) {
      const originalTitle = track.title;
      const normalizedTitle = normalizeTitle(originalTitle);
      
      if (originalTitle !== normalizedTitle) {
        console.log(`Updating: "${originalTitle}" → "${normalizedTitle}"`);
        
        // Update track using database directly since storage doesn't have updateTrack
        await storage.createTrack({
          ...track,
          title: normalizedTitle
        });
        
        updated++;
      }
    }
    
    console.log(`✅ Successfully normalized ${updated} track titles`);
    console.log(`📊 Total tracks processed: ${tracks.length}`);
    
  } catch (error) {
    console.error('❌ Error normalizing titles:', error);
    process.exit(1);
  }
}

// Run the normalization
normalizeTitles().then(() => {
  console.log('🎉 Title normalization complete!');
  process.exit(0);
});