#!/usr/bin/env python3
"""
NeuroTunes AI Clinical Companion - Advanced Audio Analysis System
Comprehensive VAD (Valence, Energy/Arousal, Dominance) and spectral analysis for therapeutic music
"""

import os
import sys
import json
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Try to import audio libraries, with fallbacks
try:
    import librosa
    import numpy as np
    LIBROSA_AVAILABLE = True
except ImportError:
    print("Warning: librosa not available. Using simplified analysis.")
    LIBROSA_AVAILABLE = False

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    print("Warning: pandas not available. Using basic date handling.")
    PANDAS_AVAILABLE = False
    import datetime

class TherapeuticAudioAnalyzer:
    """Advanced audio analysis for therapeutic music with precise VAD metrics"""
    
    def __init__(self, audio_dir="attached_assets"):
        self.audio_dir = Path(audio_dir)
        self.sample_rate = 22050
        self.hop_length = 512
        self.frame_length = 2048
        
    def extract_comprehensive_features(self, audio_path):
        """Extract complete acoustic features for therapeutic analysis"""
        try:
            # Load audio file
            y, sr = librosa.load(audio_path, sr=self.sample_rate)
            duration = len(y) / sr
            
            # Basic temporal features
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            
            # Spectral features
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
            spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
            zero_crossing_rate = librosa.feature.zero_crossing_rate(y)[0]
            
            # MFCCs for timbral analysis
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            
            # Chroma features for harmonic content
            chroma = librosa.feature.chroma_stft(y=y, sr=sr)
            
            # Tonnetz features for harmonic network analysis
            tonnetz = librosa.feature.tonnetz(y=y, sr=sr)
            
            # Energy and dynamics
            rms_energy = librosa.feature.rms(y=y)[0]
            
            # Harmonic and percussive separation
            y_harmonic, y_percussive = librosa.effects.hpss(y)
            harmonic_energy = np.mean(librosa.feature.rms(y=y_harmonic)[0])
            percussive_energy = np.mean(librosa.feature.rms(y=y_percussive)[0])
            
            # Advanced features for therapeutic analysis
            features = {
                # Basic properties
                'duration': float(duration),
                'tempo': float(tempo),
                'key_signature': self._estimate_key(chroma),
                
                # Spectral characteristics
                'spectral_centroid_mean': float(np.mean(spectral_centroids)),
                'spectral_centroid_std': float(np.std(spectral_centroids)),
                'spectral_rolloff_mean': float(np.mean(spectral_rolloff)),
                'spectral_rolloff_std': float(np.std(spectral_rolloff)),
                'spectral_bandwidth_mean': float(np.mean(spectral_bandwidth)),
                'spectral_bandwidth_std': float(np.std(spectral_bandwidth)),
                'zero_crossing_rate_mean': float(np.mean(zero_crossing_rate)),
                'zero_crossing_rate_std': float(np.std(zero_crossing_rate)),
                
                # Energy and dynamics
                'rms_energy_mean': float(np.mean(rms_energy)),
                'rms_energy_std': float(np.std(rms_energy)),
                'dynamic_range': float(np.max(rms_energy) - np.min(rms_energy)),
                'harmonic_energy': float(harmonic_energy),
                'percussive_energy': float(percussive_energy),
                'harmonic_percussive_ratio': float(harmonic_energy / (percussive_energy + 1e-8)),
                
                # Timbral features (MFCCs)
                'mfcc_features': [float(np.mean(mfccs[i])) for i in range(13)],
                'mfcc_std': [float(np.std(mfccs[i])) for i in range(13)],
                
                # Harmonic content
                'chroma_features': [float(np.mean(chroma[i])) for i in range(12)],
                'chroma_std': [float(np.std(chroma[i])) for i in range(12)],
                
                # Harmonic network features
                'tonnetz_features': [float(np.mean(tonnetz[i])) for i in range(6)],
                'tonnetz_std': [float(np.std(tonnetz[i])) for i in range(6)],
            }
            
            return features
            
        except Exception as e:
            print(f"Error analyzing {audio_path}: {str(e)}")
            return None
    
    def calculate_vad_metrics(self, features, filename):
        """Calculate precise VAD (Valence, Energy/Arousal, Dominance) metrics"""
        if not features:
            return None
            
        # Parse therapeutic metadata from filename
        metadata = self._parse_filename_metadata(filename)
        
        # Energy/Arousal calculation (0.0 - 1.0)
        # Based on tempo, spectral centroid, and RMS energy
        tempo_norm = min(features['tempo'] / 140.0, 1.0)  # Normalize around 140 BPM
        spectral_energy = min(features['spectral_centroid_mean'] / 4000.0, 1.0)  # Normalize spectral centroid
        rms_norm = min(features['rms_energy_mean'] / 0.1, 1.0)  # Normalize RMS energy
        
        energy_arousal = (tempo_norm * 0.4 + spectral_energy * 0.3 + rms_norm * 0.3)
        
        # Valence calculation (0.0 - 1.0)
        # Based on harmonic content, key mode, and therapeutic context
        major_chroma_strength = np.mean([features['chroma_features'][i] for i in [0, 2, 4, 5, 7, 9, 11]])  # Major scale notes
        minor_chroma_strength = np.mean([features['chroma_features'][i] for i in [1, 3, 6, 8, 10]])  # Minor scale notes
        
        harmonic_positivity = features['harmonic_energy'] / (features['harmonic_energy'] + features['percussive_energy'])
        mode_positivity = major_chroma_strength / (major_chroma_strength + minor_chroma_strength + 1e-8)
        
        # Adjust based on therapeutic context
        therapeutic_valence_boost = self._get_therapeutic_valence_modifier(metadata)
        
        valence = (harmonic_positivity * 0.4 + mode_positivity * 0.4 + therapeutic_valence_boost * 0.2)
        valence = np.clip(valence, 0.0, 1.0)
        
        # Dominance calculation (0.0 - 1.0)
        # Based on dynamic range, percussive energy, and spectral characteristics
        dynamics_strength = min(features['dynamic_range'] / 0.05, 1.0)  # Normalize dynamic range
        percussive_strength = features['percussive_energy'] / (features['harmonic_energy'] + features['percussive_energy'])
        spectral_complexity = min(features['spectral_bandwidth_mean'] / 2000.0, 1.0)
        
        dominance = (dynamics_strength * 0.4 + percussive_strength * 0.3 + spectral_complexity * 0.3)
        dominance = np.clip(dominance, 0.0, 1.0)
        
        return {
            'valence': round(float(valence), 3),
            'energy_arousal': round(float(energy_arousal), 3),
            'dominance': round(float(dominance), 3),
            'therapeutic_context': metadata
        }
    
    def _parse_filename_metadata(self, filename):
        """Extract therapeutic metadata from filename"""
        filename_lower = filename.lower()
        
        # Genre detection
        genres = []
        if any(word in filename_lower for word in ['classical', 'baroque', 'opera', 'cantata']):
            genres.append('classical')
        if any(word in filename_lower for word in ['electronic', 'edm', 'house']):
            genres.append('electronic')
        if any(word in filename_lower for word in ['jazz', 'big band']):
            genres.append('jazz')
        if any(word in filename_lower for word in ['indie', 'pop']):
            genres.append('indie_pop')
        if 'flamenco' in filename_lower:
            genres.append('flamenco')
        if 'rock' in filename_lower:
            genres.append('rock')
        if 'bluegrass' in filename_lower:
            genres.append('bluegrass')
        
        # Mood/therapeutic purpose detection
        therapeutic_purposes = []
        if any(word in filename_lower for word in ['sleep', 'relaxation', 'calm']):
            therapeutic_purposes.append('sleep')
        if any(word in filename_lower for word in ['focus', 'concentration']):
            therapeutic_purposes.append('focus')
        if any(word in filename_lower for word in ['energize', 're-energize', 'energy', 'hiit']):
            therapeutic_purposes.append('energy')
        if any(word in filename_lower for word in ['pain', 'relief']):
            therapeutic_purposes.append('pain_relief')
        if 'meditation' in filename_lower:
            therapeutic_purposes.append('meditation')
        
        # Instrument detection
        instruments = []
        if any(word in filename_lower for word in ['guitar', 'acoustic']):
            instruments.append('guitar')
        if any(word in filename_lower for word in ['piano', 'keyboard']):
            instruments.append('piano')
        if 'strings' in filename_lower:
            instruments.append('strings')
        if any(word in filename_lower for word in ['voice', 'vocal', 'duet']):
            instruments.append('vocal')
        if 'instrumental' in filename_lower:
            instruments.append('instrumental')
        
        # BPM extraction
        bpm = None
        import re
        bpm_match = re.search(r'(\d+)\s*bpm', filename_lower)
        if bpm_match:
            bpm = int(bpm_match.group(1))
        
        return {
            'genres': genres,
            'therapeutic_purposes': therapeutic_purposes,
            'instruments': instruments,
            'bpm': bpm,
            'is_winter_themed': 'winter' in filename_lower,
            'is_nocturne': 'nocturne' in filename_lower,
            'is_movement': 'movement' in filename_lower
        }
    
    def _get_therapeutic_valence_modifier(self, metadata):
        """Calculate valence modifier based on therapeutic context"""
        modifier = 0.5  # Neutral baseline
        
        # Adjust based on therapeutic purpose
        if 'energy' in metadata.get('therapeutic_purposes', []):
            modifier += 0.2
        if 'sleep' in metadata.get('therapeutic_purposes', []):
            modifier -= 0.1  # Sleep music tends to be more subdued
        if 'focus' in metadata.get('therapeutic_purposes', []):
            modifier += 0.1
        
        # Adjust based on genre characteristics
        if 'classical' in metadata.get('genres', []):
            modifier += 0.1  # Classical tends to be more harmonically positive
        if metadata.get('is_winter_themed'):
            modifier -= 0.05  # Winter themes tend to be slightly more subdued
        if metadata.get('is_nocturne'):
            modifier -= 0.1  # Nocturnes are typically more melancholic
        
        return np.clip(modifier, 0.0, 1.0)
    
    def _estimate_key(self, chroma):
        """Estimate musical key from chroma features"""
        # Major key profiles (Krumhansl-Schmuckler)
        major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
        
        # Minor key profiles
        minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
        
        # Calculate correlation with each key
        chroma_mean = np.mean(chroma, axis=1)
        key_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        
        major_correlations = []
        minor_correlations = []
        
        for i in range(12):
            # Rotate profiles to match key
            major_rotated = np.roll(major_profile, i)
            minor_rotated = np.roll(minor_profile, i)
            
            major_corr = np.corrcoef(chroma_mean, major_rotated)[0, 1]
            minor_corr = np.corrcoef(chroma_mean, minor_rotated)[0, 1]
            
            major_correlations.append(major_corr)
            minor_correlations.append(minor_corr)
        
        # Find best matching key
        best_major_idx = np.argmax(major_correlations)
        best_minor_idx = np.argmax(minor_correlations)
        
        if major_correlations[best_major_idx] > minor_correlations[best_minor_idx]:
            return f"{key_names[best_major_idx]} major"
        else:
            return f"{key_names[best_minor_idx]} minor"
    
    def analyze_all_files(self, file_patterns=None):
        """Analyze all audio files and generate comprehensive report"""
        if file_patterns is None:
            # New winter-themed files from latest upload
            file_patterns = [
                "Phyrgian winter, nocturne*",
                "Winter's deep*",
                "Winter Hath Yielded*",
                "Winter Illumination*",
                "winter's-deep*"
            ]
        
        results = []
        
        # Find all matching audio files
        audio_files = []
        for pattern in file_patterns:
            for ext in ['.mp3', '.wav', '.m4a']:
                audio_files.extend(self.audio_dir.glob(f"{pattern}{ext}"))
        
        # Remove duplicates and sort
        audio_files = sorted(list(set(audio_files)))
        
        print(f"Found {len(audio_files)} audio files to analyze...")
        
        for i, audio_file in enumerate(audio_files, 1):
            print(f"\nAnalyzing ({i}/{len(audio_files)}): {audio_file.name}")
            
            # Extract comprehensive features
            features = self.extract_comprehensive_features(audio_file)
            if not features:
                continue
            
            # Calculate VAD metrics
            vad_metrics = self.calculate_vad_metrics(features, audio_file.name)
            if not vad_metrics:
                continue
            
            # Combine all analysis data
            analysis_result = {
                'filename': audio_file.name,
                'file_path': str(audio_file),
                'vad_metrics': vad_metrics,
                'spectral_analysis': {
                    'duration_seconds': features['duration'],
                    'tempo_bpm': features['tempo'],
                    'key_signature': features['key_signature'],
                    'spectral_centroid': {
                        'mean': features['spectral_centroid_mean'],
                        'std': features['spectral_centroid_std']
                    },
                    'spectral_rolloff': {
                        'mean': features['spectral_rolloff_mean'],
                        'std': features['spectral_rolloff_std']
                    },
                    'spectral_bandwidth': {
                        'mean': features['spectral_bandwidth_mean'],
                        'std': features['spectral_bandwidth_std']
                    },
                    'zero_crossing_rate': {
                        'mean': features['zero_crossing_rate_mean'],
                        'std': features['zero_crossing_rate_std']
                    },
                    'energy_dynamics': {
                        'rms_mean': features['rms_energy_mean'],
                        'rms_std': features['rms_energy_std'],
                        'dynamic_range': features['dynamic_range'],
                        'harmonic_energy': features['harmonic_energy'],
                        'percussive_energy': features['percussive_energy'],
                        'harmonic_percussive_ratio': features['harmonic_percussive_ratio']
                    },
                    'timbral_features': {
                        'mfcc_coefficients': features['mfcc_features'],
                        'mfcc_std_dev': features['mfcc_std']
                    },
                    'harmonic_content': {
                        'chroma_vector': features['chroma_features'],
                        'chroma_std_dev': features['chroma_std']
                    },
                    'harmonic_network': {
                        'tonnetz_features': features['tonnetz_features'],
                        'tonnetz_std_dev': features['tonnetz_std']
                    }
                },
                'therapeutic_classification': self._classify_therapeutic_use(vad_metrics, features)
            }
            
            results.append(analysis_result)
            
            # Print detailed VAD results
            self._print_vad_summary(analysis_result)
        
        return results
    
    def _classify_therapeutic_use(self, vad_metrics, features):
        """Classify optimal therapeutic use based on analysis"""
        valence = vad_metrics['valence']
        arousal = vad_metrics['energy_arousal']
        dominance = vad_metrics['dominance']
        
        classifications = []
        
        # Energy-based classifications
        if arousal < 0.3:
            classifications.append('sleep')
            classifications.append('deep_relaxation')
        elif arousal < 0.6:
            classifications.append('relaxation')
            classifications.append('meditation')
        else:
            classifications.append('energy_boost')
            classifications.append('focus')
        
        # Valence-based classifications
        if valence > 0.7:
            classifications.append('mood_enhancement')
        elif valence < 0.4:
            classifications.append('emotional_processing')
        
        # Dominance-based classifications
        if dominance > 0.7:
            classifications.append('confidence_building')
        elif dominance < 0.3:
            classifications.append('anxiety_reduction')
        
        # Tempo-based classifications
        if features['tempo'] < 70:
            classifications.append('sleep_preparation')
        elif features['tempo'] > 120:
            classifications.append('physical_activation')
        
        return list(set(classifications))
    
    def _print_vad_summary(self, result):
        """Print detailed VAD and spectral analysis summary"""
        print(f"\n{'='*60}")
        print(f"COMPREHENSIVE ANALYSIS: {result['filename']}")
        print(f"{'='*60}")
        
        vad = result['vad_metrics']
        spectral = result['spectral_analysis']
        
        print(f"\n🎵 VAD METRICS (Valence-Arousal-Dominance):")
        print(f"   • Valence (emotional positivity): {vad['valence']:.3f} (0=negative, 1=positive)")
        print(f"   • Energy/Arousal (activation level): {vad['energy_arousal']:.3f} (0=calm, 1=energetic)")
        print(f"   • Dominance (control/confidence): {vad['dominance']:.3f} (0=submissive, 1=dominant)")
        
        print(f"\n🎼 MUSICAL CHARACTERISTICS:")
        print(f"   • Duration: {spectral['duration_seconds']:.1f} seconds")
        print(f"   • Tempo: {spectral['tempo_bpm']:.1f} BPM")
        print(f"   • Key Signature: {spectral['key_signature']}")
        
        print(f"\n🔊 SPECTRAL ANALYSIS:")
        print(f"   • Spectral Centroid: {spectral['spectral_centroid']['mean']:.1f} Hz (brightness)")
        print(f"   • Spectral Rolloff: {spectral['spectral_rolloff']['mean']:.1f} Hz (energy distribution)")
        print(f"   • Spectral Bandwidth: {spectral['spectral_bandwidth']['mean']:.1f} Hz (frequency spread)")
        print(f"   • Zero Crossing Rate: {spectral['zero_crossing_rate']['mean']:.4f} (texture)")
        
        print(f"\n⚡ ENERGY & DYNAMICS:")
        print(f"   • RMS Energy: {spectral['energy_dynamics']['rms_mean']:.4f}")
        print(f"   • Dynamic Range: {spectral['energy_dynamics']['dynamic_range']:.4f}")
        print(f"   • Harmonic Energy: {spectral['energy_dynamics']['harmonic_energy']:.4f}")
        print(f"   • Percussive Energy: {spectral['energy_dynamics']['percussive_energy']:.4f}")
        print(f"   • H/P Ratio: {spectral['energy_dynamics']['harmonic_percussive_ratio']:.2f}")
        
        print(f"\n🎯 THERAPEUTIC CLASSIFICATION:")
        for classification in result['therapeutic_classification']:
            print(f"   • {classification.replace('_', ' ').title()}")
        
        context = vad['therapeutic_context']
        if context['genres']:
            print(f"\n🎭 DETECTED CHARACTERISTICS:")
            print(f"   • Genres: {', '.join(context['genres'])}")
        if context['therapeutic_purposes']:
            print(f"   • Purposes: {', '.join(context['therapeutic_purposes'])}")
        if context['instruments']:
            print(f"   • Instruments: {', '.join(context['instruments'])}")
        if context['bpm']:
            print(f"   • Filename BPM: {context['bpm']}")
    
    def save_analysis_report(self, results, output_file="winter_audio_analysis_report.json"):
        """Save complete analysis report to JSON file"""
        report = {
            'analysis_metadata': {
                'total_files_analyzed': len(results),
                'analysis_date': pd.Timestamp.now().isoformat(),
                'analyzer_version': '1.0.0',
                'feature_categories': [
                    'VAD_metrics',
                    'spectral_analysis',
                    'therapeutic_classification'
                ]
            },
            'audio_analyses': results,
            'summary_statistics': self._calculate_summary_stats(results)
        }
        
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📊 Complete analysis report saved to: {output_file}")
        return output_file
    
    def _calculate_summary_stats(self, results):
        """Calculate summary statistics across all analyzed files"""
        if not results:
            return {}
        
        valences = [r['vad_metrics']['valence'] for r in results]
        arousals = [r['vad_metrics']['energy_arousal'] for r in results]
        dominances = [r['vad_metrics']['dominance'] for r in results]
        tempos = [r['spectral_analysis']['tempo_bpm'] for r in results]
        durations = [r['spectral_analysis']['duration_seconds'] for r in results]
        
        return {
            'vad_statistics': {
                'valence': {'mean': np.mean(valences), 'std': np.std(valences), 'range': [min(valences), max(valences)]},
                'arousal': {'mean': np.mean(arousals), 'std': np.std(arousals), 'range': [min(arousals), max(arousals)]},
                'dominance': {'mean': np.mean(dominances), 'std': np.std(dominances), 'range': [min(dominances), max(dominances)]}
            },
            'musical_statistics': {
                'tempo_bpm': {'mean': np.mean(tempos), 'std': np.std(tempos), 'range': [min(tempos), max(tempos)]},
                'duration_seconds': {'mean': np.mean(durations), 'std': np.std(durations), 'range': [min(durations), max(durations)]}
            },
            'therapeutic_distribution': self._count_therapeutic_classifications(results)
        }
    
    def _count_therapeutic_classifications(self, results):
        """Count distribution of therapeutic classifications"""
        classification_counts = {}
        for result in results:
            for classification in result['therapeutic_classification']:
                classification_counts[classification] = classification_counts.get(classification, 0) + 1
        return classification_counts


def main():
    """Main execution function"""
    print("🎵 NeuroTunes AI Clinical Companion - Advanced Audio Analysis System")
    print("=" * 70)
    
    analyzer = TherapeuticAudioAnalyzer()
    
    # Analyze the new winter-themed files
    results = analyzer.analyze_all_files()
    
    if results:
        # Save comprehensive report
        report_file = analyzer.save_analysis_report(results)
        
        print(f"\n✅ Analysis complete! Processed {len(results)} audio files.")
        print(f"📋 Detailed VAD metrics and spectral analysis available in: {report_file}")
        print("\n🔬 All files have been analyzed with precise:")
        print("   • VAD (Valence, Energy/Arousal, Dominance) metrics")
        print("   • Complete spectral analysis")
        print("   • Therapeutic classification")
        print("   • Musical characteristics (tempo, key, duration)")
        print("   • Energy dynamics and harmonic content")
    else:
        print("❌ No audio files found to analyze.")
        print("Please ensure the winter-themed audio files are in the attached_assets folder.")


if __name__ == "__main__":
    main()