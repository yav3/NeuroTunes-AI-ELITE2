#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Audio Path Validation Script
 * Validates all tracks have accessible audio files before deployment
 * Prevents audio path mismatches and track playback failures
 */

const AUDIO_DIRECTORY = path.join(path.dirname(__dirname), 'music_library');
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function validateAudioPaths() {
  log('🎵 NeuroTunes Audio Path Validation', 'cyan');
  log('=====================================', 'cyan');
  
  let totalTracks = 0;
  let workingTracks = 0;
  let brokenTracks = [];
  let missingFiles = [];
  let corruptedFiles = [];
  
  try {
    // Check if audio directory exists
    if (!fs.existsSync(AUDIO_DIRECTORY)) {
      log(`❌ Audio directory not found: ${AUDIO_DIRECTORY}`, 'red');
      process.exit(1);
    }
    
    log(`📁 Checking audio directory: ${AUDIO_DIRECTORY}`, 'blue');
    
    // Get all audio files
    const audioFiles = fs.readdirSync(AUDIO_DIRECTORY)
      .filter(file => file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.m4a'))
      .sort();
    
    if (audioFiles.length === 0) {
      log('⚠️  No audio files found in directory', 'yellow');
      return {
        success: false,
        message: 'No audio files found'
      };
    }
    
    log(`🔍 Found ${audioFiles.length} audio files to validate`, 'blue');
    console.log('');
    
    // Validate each audio file
    for (const filename of audioFiles) {
      totalTracks++;
      const filePath = path.join(AUDIO_DIRECTORY, filename);
      
      try {
        const stats = fs.statSync(filePath);
        
        // Check if file is empty (corrupted)
        if (stats.size === 0) {
          corruptedFiles.push({
            filename,
            path: filePath,
            issue: 'File is empty (0 bytes)'
          });
          log(`❌ ${filename} - Empty file (0 bytes)`, 'red');
          continue;
        }
        
        // Check if file is too small (likely corrupted)
        if (stats.size < 1024) { // Less than 1KB
          corruptedFiles.push({
            filename,
            path: filePath,
            issue: `File too small (${stats.size} bytes)`
          });
          log(`⚠️  ${filename} - Very small file (${stats.size} bytes)`, 'yellow');
          continue;
        }
        
        workingTracks++;
        log(`✅ ${filename} - ${(stats.size / 1024 / 1024).toFixed(2)} MB`, 'green');
        
      } catch (error) {
        missingFiles.push({
          filename,
          path: filePath,
          error: error.message
        });
        log(`❌ ${filename} - Access error: ${error.message}`, 'red');
      }
    }
    
    // Summary
    console.log('');
    log('📊 VALIDATION SUMMARY', 'cyan');
    log('====================', 'cyan');
    log(`Total audio files: ${totalTracks}`, 'blue');
    log(`Working files: ${workingTracks}`, 'green');
    log(`Broken files: ${corruptedFiles.length + missingFiles.length}`, 'red');
    
    if (corruptedFiles.length > 0) {
      console.log('');
      log('🚫 CORRUPTED FILES:', 'red');
      corruptedFiles.forEach(file => {
        log(`   - ${file.filename}: ${file.issue}`, 'red');
      });
    }
    
    if (missingFiles.length > 0) {
      console.log('');
      log('📁 MISSING/INACCESSIBLE FILES:', 'red');
      missingFiles.forEach(file => {
        log(`   - ${file.filename}: ${file.error}`, 'red');
      });
    }
    
    // Health check
    const healthPercentage = (workingTracks / totalTracks) * 100;
    console.log('');
    
    if (healthPercentage === 100) {
      log('🎉 ALL AUDIO FILES ARE HEALTHY!', 'green');
      log('✅ Audio validation passed - ready for deployment', 'green');
      return {
        success: true,
        total: totalTracks,
        working: workingTracks,
        broken: totalTracks - workingTracks,
        healthPercentage
      };
    } else if (healthPercentage >= 95) {
      log(`⚠️  Audio health: ${healthPercentage.toFixed(1)}% - Minor issues detected`, 'yellow');
      log('✅ Validation passed with warnings', 'yellow');
      return {
        success: true,
        total: totalTracks,
        working: workingTracks,
        broken: totalTracks - workingTracks,
        healthPercentage,
        warnings: corruptedFiles.concat(missingFiles)
      };
    } else {
      log(`❌ Audio health: ${healthPercentage.toFixed(1)}% - Significant issues detected`, 'red');
      log('🚫 Validation failed - fix audio issues before deployment', 'red');
      return {
        success: false,
        total: totalTracks,
        working: workingTracks,
        broken: totalTracks - workingTracks,
        healthPercentage,
        errors: corruptedFiles.concat(missingFiles)
      };
    }
    
  } catch (error) {
    log(`💥 Validation failed with error: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message
    };
  }
}

// Export for programmatic use
export { validateAudioPaths };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateAudioPaths()
    .then(result => {
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch(error => {
      log(`💥 Validation crashed: ${error.message}`, 'red');
      process.exit(1);
    });
}