#!/usr/bin/env python3
"""
NeuroTunes+ Audio Spectral Analysis Tool
Performs comprehensive spectral analysis on all therapeutic music tracks
"""

import os
import json
import numpy as np
import librosa
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import pandas as pd
from datetime import datetime
import warnings
warnings.filterwarnings("ignore")

load_dotenv()

class AudioSpectralAnalyzer:
    def __init__(self):
        self.db_url = os.getenv('DATABASE_URL')
        self.audio_dir = '/home/runner/workspace/attached_assets'
        self.results = []
        
    def connect_db(self):
        """Connect to PostgreSQL database"""
        return psycopg2.connect(self.db_url, cursor_factory=RealDictCursor)
    
    def analyze_audio_file(self, file_path):
        """Perform comprehensive spectral analysis on audio file"""
        try:
            # Load audio file
            y, sr = librosa.load(file_path, sr=None)
            duration = len(y) / sr
            
            # Basic audio properties
            analysis = {
                'duration_seconds': float(duration),
                'sample_rate': int(sr),
                'channels': 1 if len(y.shape) == 1 else y.shape[0],
                'file_size_mb': os.path.getsize(file_path) / (1024 * 1024)
            }
            
            # Spectral analysis
            stft = librosa.stft(y)
            magnitude = np.abs(stft)
            
            # Frequency domain analysis
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
            spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
            zero_crossing_rate = librosa.feature.zero_crossing_rate(y)[0]
            
            analysis.update({
                'spectral_centroid_mean': float(np.mean(spectral_centroids)),
                'spectral_centroid_std': float(np.std(spectral_centroids)),
                'spectral_rolloff_mean': float(np.mean(spectral_rolloff)),
                'spectral_bandwidth_mean': float(np.mean(spectral_bandwidth)),
                'zero_crossing_rate_mean': float(np.mean(zero_crossing_rate))
            })
            
            # Tempo and rhythm analysis
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            analysis['tempo_bpm'] = float(tempo)
            analysis['beat_count'] = len(beats)
            
            # Harmonic and percussive components
            y_harmonic, y_percussive = librosa.effects.hpss(y)
            analysis['harmonic_percussive_ratio'] = float(
                np.mean(np.abs(y_harmonic)) / (np.mean(np.abs(y_percussive)) + 1e-10)
            )
            
            # Chroma features (harmonic content)
            chroma = librosa.feature.chroma_stft(y=y, sr=sr)
            analysis['chroma_energy'] = float(np.sum(chroma))
            
            # MFCC features (timbral characteristics)
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            analysis.update({
                f'mfcc_{i+1}_mean': float(np.mean(mfccs[i])) 
                for i in range(min(5, len(mfccs)))  # First 5 MFCCs
            })
            
            # Energy and dynamics
            rms_energy = librosa.feature.rms(y=y)[0]
            analysis.update({
                'rms_energy_mean': float(np.mean(rms_energy)),
                'rms_energy_std': float(np.std(rms_energy)),
                'dynamic_range_db': float(20 * np.log10(np.max(rms_energy) / (np.min(rms_energy) + 1e-10)))
            })
            
            # Therapeutic classification based on spectral features
            analysis.update(self.classify_therapeutic_properties(analysis))
            
            return analysis
            
        except Exception as e:
            print(f"Error analyzing {file_path}: {str(e)}")
            return None
    
    def classify_therapeutic_properties(self, analysis):
        """Classify therapeutic properties based on spectral analysis"""
        therapeutic = {}
        
        # Calming vs Energizing based on tempo and spectral content
        tempo = analysis.get('tempo_bpm', 120)
        spectral_centroid = analysis.get('spectral_centroid_mean', 2000)
        
        if tempo < 80 and spectral_centroid < 2000:
            therapeutic['therapeutic_category'] = 'relaxation'
            therapeutic['valence'] = 0.3
            therapeutic['arousal'] = 0.2
        elif tempo > 120 and spectral_centroid > 3000:
            therapeutic['therapeutic_category'] = 'energy_boost'
            therapeutic['valence'] = 0.8
            therapeutic['arousal'] = 0.9
        elif 80 <= tempo <= 120:
            therapeutic['therapeutic_category'] = 'focus'
            therapeutic['valence'] = 0.6
            therapeutic['arousal'] = 0.5
        else:
            therapeutic['therapeutic_category'] = 'balanced'
            therapeutic['valence'] = 0.5
            therapeutic['arousal'] = 0.5
        
        # Dominance based on harmonic content and dynamic range
        dynamic_range = analysis.get('dynamic_range_db', 20)
        harmonic_ratio = analysis.get('harmonic_percussive_ratio', 1.0)
        
        if dynamic_range > 30 and harmonic_ratio > 2.0:
            therapeutic['dominance'] = 0.8
        elif dynamic_range < 15 and harmonic_ratio < 0.5:
            therapeutic['dominance'] = 0.3
        else:
            therapeutic['dominance'] = 0.5
            
        return therapeutic
    
    def get_all_tracks(self):
        """Get all tracks from database"""
        with self.connect_db() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, title, artist, audio_url, therapeutic_tags, mood
                    FROM tracks 
                    WHERE audio_url LIKE '/assets/%'
                    ORDER BY id
                """)
                return cur.fetchall()
    
    def analyze_all_tracks(self):
        """Analyze all tracks in the database"""
        tracks = self.get_all_tracks()
        print(f"Starting spectral analysis of {len(tracks)} tracks...")
        
        for i, track in enumerate(tracks):
            print(f"Analyzing {i+1}/{len(tracks)}: {track['title']}")
            
            # Convert URL to file path
            audio_url = track['audio_url']
            if audio_url.startswith('/assets/'):
                filename = audio_url.replace('/assets/', '')
                file_path = os.path.join(self.audio_dir, filename)
                
                if os.path.exists(file_path):
                    analysis = self.analyze_audio_file(file_path)
                    if analysis:
                        result = {
                            'track_id': track['id'],
                            'title': track['title'],
                            'artist': track['artist'],
                            'audio_url': track['audio_url'],
                            'current_tags': track['therapeutic_tags'],
                            'current_mood': track['mood'],
                            'spectral_analysis': analysis,
                            'analysis_timestamp': datetime.now().isoformat()
                        }
                        self.results.append(result)
                else:
                    print(f"File not found: {file_path}")
        
        print(f"Completed analysis of {len(self.results)} tracks")
        return self.results
    
    def export_inventory(self, filename='neurotunes_spectral_inventory.json'):
        """Export complete inventory with spectral analysis"""
        inventory = {
            'metadata': {
                'total_tracks_analyzed': len(self.results),
                'analysis_date': datetime.now().isoformat(),
                'analysis_version': '1.0',
                'description': 'NeuroTunes+ Complete Spectral Analysis Inventory'
            },
            'tracks': self.results,
            'summary_statistics': self.generate_summary_stats()
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(inventory, f, indent=2, ensure_ascii=False)
        
        print(f"Inventory exported to: {filename}")
        return filename
    
    def export_csv(self, filename='neurotunes_spectral_data.csv'):
        """Export flattened data as CSV for analysis"""
        if not self.results:
            return None
            
        rows = []
        for result in self.results:
            row = {
                'track_id': result['track_id'],
                'title': result['title'],
                'artist': result['artist'],
                'current_mood': result['current_mood']
            }
            # Flatten spectral analysis data
            if result['spectral_analysis']:
                row.update(result['spectral_analysis'])
            rows.append(row)
        
        df = pd.DataFrame(rows)
        df.to_csv(filename, index=False)
        print(f"CSV data exported to: {filename}")
        return filename
    
    def generate_summary_stats(self):
        """Generate summary statistics from analysis"""
        if not self.results:
            return {}
        
        analyzed_tracks = [r for r in self.results if r['spectral_analysis']]
        
        if not analyzed_tracks:
            return {}
        
        # Collect spectral features
        tempos = [r['spectral_analysis']['tempo_bpm'] for r in analyzed_tracks]
        spectral_centroids = [r['spectral_analysis']['spectral_centroid_mean'] for r in analyzed_tracks]
        durations = [r['spectral_analysis']['duration_seconds'] for r in analyzed_tracks]
        
        # Therapeutic categories
        categories = [r['spectral_analysis'].get('therapeutic_category', 'unknown') for r in analyzed_tracks]
        category_counts = {cat: categories.count(cat) for cat in set(categories)}
        
        return {
            'tempo_stats': {
                'mean': float(np.mean(tempos)),
                'std': float(np.std(tempos)),
                'min': float(np.min(tempos)),
                'max': float(np.max(tempos))
            },
            'spectral_centroid_stats': {
                'mean': float(np.mean(spectral_centroids)),
                'std': float(np.std(spectral_centroids))
            },
            'duration_stats': {
                'mean_minutes': float(np.mean(durations) / 60),
                'total_hours': float(np.sum(durations) / 3600)
            },
            'therapeutic_categories': category_counts,
            'tracks_by_therapeutic_quality': len(analyzed_tracks)
        }
    
    def update_database_with_analysis(self):
        """Update database with spectral analysis results"""
        if not self.results:
            return
        
        with self.connect_db() as conn:
            with conn.cursor() as cur:
                for result in self.results:
                    if result['spectral_analysis']:
                        analysis = result['spectral_analysis']
                        cur.execute("""
                            UPDATE tracks 
                            SET 
                                valence = %s,
                                energy = %s,
                                tempo_bpm = %s,
                                spectral_analysis = %s
                            WHERE id = %s
                        """, (
                            analysis.get('valence'),
                            analysis.get('arousal'),  # Using arousal as energy
                            analysis.get('tempo_bpm'),
                            json.dumps(analysis),
                            result['track_id']
                        ))
                conn.commit()
        
        print(f"Updated database with spectral analysis for {len(self.results)} tracks")

def main():
    """Main execution function"""
    analyzer = AudioSpectralAnalyzer()
    
    print("NeuroTunes+ Spectral Analysis Starting...")
    print("=" * 50)
    
    # Analyze all tracks
    results = analyzer.analyze_all_tracks()
    
    if results:
        # Export inventory
        json_file = analyzer.export_inventory()
        csv_file = analyzer.export_csv()
        
        # Update database
        analyzer.update_database_with_analysis()
        
        print("\n" + "=" * 50)
        print("SPECTRAL ANALYSIS COMPLETE")
        print(f"Tracks analyzed: {len(results)}")
        print(f"JSON inventory: {json_file}")
        print(f"CSV data: {csv_file}")
        print("Database updated with VAD values and spectral data")
    else:
        print("No tracks were successfully analyzed")

if __name__ == "__main__":
    main()