#!/usr/bin/env python3
"""
Spectral Analysis and Duplicate Detection for NeuroTunes Music Library
Performs acoustic fingerprinting using spectrograms and audio features to identify duplicates
"""

import os
import json
import hashlib
import numpy as np
import librosa
from pathlib import Path
from collections import defaultdict
from datetime import datetime
import argparse

class SpectralAnalyzer:
    def __init__(self, music_dir="music_library"):
        self.music_dir = Path(music_dir)
        self.sample_rate = 22050
        self.n_mels = 128
        self.hop_length = 512
        self.n_fft = 2048
        
    def extract_features(self, audio_path):
        """Extract comprehensive audio features for fingerprinting"""
        try:
            # Load audio file
            y, sr = librosa.load(audio_path, sr=self.sample_rate)
            
            # Basic features
            duration = len(y) / sr
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            
            # Spectral features
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
            spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
            zero_crossing_rate = librosa.feature.zero_crossing_rate(y)
            
            # MFCC features (for timbral similarity)
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            
            # Chroma features (for harmonic content)
            chroma = librosa.feature.chroma_stft(y=y, sr=sr)
            
            # Mel-spectrogram for detailed spectral fingerprint
            mel_spec = librosa.feature.melspectrogram(
                y=y, sr=sr, n_mels=self.n_mels, 
                hop_length=self.hop_length, n_fft=self.n_fft
            )
            mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
            
            # Create spectral fingerprint hash
            spectral_hash = hashlib.md5(
                mel_spec_db.flatten().tobytes()
            ).hexdigest()[:16]
            
            return {
                'file_path': str(audio_path),
                'duration': float(duration),
                'tempo': float(tempo),
                'spectral_centroid_mean': float(np.mean(spectral_centroids)),
                'spectral_rolloff_mean': float(np.mean(spectral_rolloff)),
                'spectral_bandwidth_mean': float(np.mean(spectral_bandwidth)),
                'zero_crossing_rate_mean': float(np.mean(zero_crossing_rate)),
                'mfcc_means': [float(np.mean(mfcc)) for mfcc in mfccs],
                'chroma_means': [float(np.mean(chroma_bin)) for chroma_bin in chroma],
                'spectral_hash': spectral_hash,
                'file_size': os.path.getsize(audio_path)
            }
            
        except Exception as e:
            print(f"Error processing {audio_path}: {e}")
            return None
    
    def calculate_similarity(self, features1, features2):
        """Calculate similarity between two audio feature sets"""
        # Duration similarity (within 5% tolerance)
        duration_diff = abs(features1['duration'] - features2['duration'])
        duration_sim = 1.0 - min(duration_diff / max(features1['duration'], features2['duration']), 1.0)
        
        # Tempo similarity
        tempo_diff = abs(features1['tempo'] - features2['tempo'])
        tempo_sim = 1.0 - min(tempo_diff / max(features1['tempo'], features2['tempo']), 1.0)
        
        # Spectral similarity
        spectral_features1 = np.array([
            features1['spectral_centroid_mean'],
            features1['spectral_rolloff_mean'],
            features1['spectral_bandwidth_mean'],
            features1['zero_crossing_rate_mean']
        ])
        
        spectral_features2 = np.array([
            features2['spectral_centroid_mean'],
            features2['spectral_rolloff_mean'],
            features2['spectral_bandwidth_mean'],
            features2['zero_crossing_rate_mean']
        ])
        
        spectral_sim = 1.0 - np.linalg.norm(spectral_features1 - spectral_features2) / np.linalg.norm(spectral_features1 + spectral_features2)
        
        # MFCC similarity (timbral)
        mfcc_sim = 1.0 - np.linalg.norm(
            np.array(features1['mfcc_means']) - np.array(features2['mfcc_means'])
        ) / 13.0
        
        # Chroma similarity (harmonic)
        chroma_sim = 1.0 - np.linalg.norm(
            np.array(features1['chroma_means']) - np.array(features2['chroma_means'])
        ) / 12.0
        
        # Overall similarity score (weighted)
        overall_sim = (
            duration_sim * 0.3 +
            tempo_sim * 0.2 +
            spectral_sim * 0.2 +
            mfcc_sim * 0.2 +
            chroma_sim * 0.1
        )
        
        return {
            'overall': overall_sim,
            'duration': duration_sim,
            'tempo': tempo_sim,
            'spectral': spectral_sim,
            'mfcc': mfcc_sim,
            'chroma': chroma_sim
        }
    
    def find_duplicates(self, threshold=0.85):
        """Find potential duplicates using spectral analysis"""
        print("Starting spectral analysis...")
        
        # Get all audio files
        audio_files = list(self.music_dir.glob("*.mp3")) + list(self.music_dir.glob("*.wav"))
        print(f"Found {len(audio_files)} audio files")
        
        # Extract features for all files
        features_db = {}
        print("Extracting audio features...")
        
        for i, audio_file in enumerate(audio_files):
            print(f"Processing {i+1}/{len(audio_files)}: {audio_file.name}")
            features = self.extract_features(audio_file)
            if features:
                features_db[str(audio_file)] = features
        
        print(f"Successfully processed {len(features_db)} files")
        
        # Find similar pairs
        duplicate_groups = []
        processed = set()
        
        print("Analyzing for duplicates...")
        files = list(features_db.keys())
        
        for i, file1 in enumerate(files):
            if file1 in processed:
                continue
                
            group = [file1]
            processed.add(file1)
            
            for j, file2 in enumerate(files[i+1:], i+1):
                if file2 in processed:
                    continue
                    
                similarity = self.calculate_similarity(
                    features_db[file1], 
                    features_db[file2]
                )
                
                if similarity['overall'] >= threshold:
                    group.append(file2)
                    processed.add(file2)
            
            if len(group) > 1:
                # Sort by file size (keep largest)
                group_data = [
                    {
                        'path': f,
                        'size': features_db[f]['file_size'],
                        'duration': features_db[f]['duration']
                    }
                    for f in group
                ]
                group_data.sort(key=lambda x: x['size'], reverse=True)
                duplicate_groups.append(group_data)
        
        return {
            'analysis_date': datetime.now().isoformat(),
            'total_files': len(audio_files),
            'processed_files': len(features_db),
            'duplicate_groups': duplicate_groups,
            'threshold': threshold,
            'features_db': features_db
        }
    
    def generate_removal_plan(self, duplicates_data):
        """Generate a plan for removing duplicates"""
        removal_plan = {
            'total_duplicates': 0,
            'files_to_remove': [],
            'files_to_keep': [],
            'space_saved': 0
        }
        
        for group in duplicates_data['duplicate_groups']:
            # Keep the first file (largest), mark others for removal
            keep_file = group[0]
            remove_files = group[1:]
            
            removal_plan['files_to_keep'].append(keep_file['path'])
            
            for file_data in remove_files:
                removal_plan['files_to_remove'].append({
                    'path': file_data['path'],
                    'size': file_data['size'],
                    'reason': f"Duplicate of {Path(keep_file['path']).name}"
                })
                removal_plan['space_saved'] += file_data['size']
                removal_plan['total_duplicates'] += 1
        
        return removal_plan

def main():
    parser = argparse.ArgumentParser(description='Spectral Analysis for Music Library')
    parser.add_argument('--threshold', type=float, default=0.85, 
                       help='Similarity threshold for duplicates (0.0-1.0)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Only analyze, don\'t remove files')
    parser.add_argument('--music-dir', default='music_library',
                       help='Path to music library directory')
    
    args = parser.parse_args()
    
    analyzer = SpectralAnalyzer(args.music_dir)
    
    # Perform analysis
    duplicates_data = analyzer.find_duplicates(threshold=args.threshold)
    
    # Save analysis results
    output_file = f"spectral_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w') as f:
        json.dump(duplicates_data, f, indent=2)
    
    print(f"\nAnalysis complete!")
    print(f"Total files analyzed: {duplicates_data['processed_files']}")
    print(f"Duplicate groups found: {len(duplicates_data['duplicate_groups'])}")
    
    if duplicates_data['duplicate_groups']:
        # Generate removal plan
        removal_plan = analyzer.generate_removal_plan(duplicates_data)
        
        plan_file = f"removal_plan_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(plan_file, 'w') as f:
            json.dump(removal_plan, f, indent=2)
        
        print(f"Files to remove: {removal_plan['total_duplicates']}")
        print(f"Space to save: {removal_plan['space_saved'] / 1024 / 1024:.2f} MB")
        print(f"Removal plan saved to: {plan_file}")
        
        if not args.dry_run:
            response = input("\nProceed with removing duplicates? (y/N): ")
            if response.lower() == 'y':
                removed_count = 0
                for file_data in removal_plan['files_to_remove']:
                    try:
                        os.remove(file_data['path'])
                        print(f"Removed: {Path(file_data['path']).name}")
                        removed_count += 1
                    except Exception as e:
                        print(f"Error removing {file_data['path']}: {e}")
                
                print(f"\nRemoved {removed_count} duplicate files")
    else:
        print("No duplicates found!")
    
    print(f"Analysis results saved to: {output_file}")

if __name__ == "__main__":
    main()