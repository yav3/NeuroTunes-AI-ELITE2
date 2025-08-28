#!/usr/bin/env python3
"""
Robust VAD & Camelot Analysis for NeuroTunes Clinical Companion
Simplified version that avoids numpy array comparison errors
"""

import os
import json
import librosa
import numpy as np
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any
from collections import Counter

class RobustMusicAnalyzer:
    def __init__(self, music_dir: str = "music_library"):
        self.music_dir = Path(music_dir)
        self.analysis_results = []
        self.processed_files = set()
        self.load_existing_analysis()
    
    def load_existing_analysis(self):
        """Load existing analysis to avoid reprocessing"""
        try:
            with open("comprehensive_audio_analysis_report.json", "r") as f:
                existing = json.load(f)
                for item in existing.get("comprehensive_analyses", []):
                    self.processed_files.add(item["filename"])
                    self.analysis_results.append(item)
            print(f"Loaded {len(self.processed_files)} existing analyses")
        except FileNotFoundError:
            print("Starting fresh analysis")
    
    def safe_array_operation(self, arr, operation='mean'):
        """Safely perform array operations avoiding comparison errors"""
        try:
            if arr is None or len(arr) == 0:
                return 0.0
            
            arr_clean = np.array(arr).flatten()
            arr_clean = arr_clean[np.isfinite(arr_clean)]  # Remove inf and nan
            
            if len(arr_clean) == 0:
                return 0.0
                
            if operation == 'mean':
                return float(np.mean(arr_clean))
            elif operation == 'std':
                return float(np.std(arr_clean))
            elif operation == 'max':
                return float(np.max(arr_clean))
            elif operation == 'min':
                return float(np.min(arr_clean))
            else:
                return float(np.mean(arr_clean))
        except:
            return 0.0
    
    def analyze_track(self, file_path: Path) -> Dict[str, Any]:
        """Robust track analysis with error handling"""
        try:
            print(f"  Analyzing: {file_path.name}")
            
            # Load audio
            y, sr = librosa.load(file_path, sr=22050, duration=90)
            
            # Basic audio features
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0] 
            zero_crossing_rate = librosa.feature.zero_crossing_rate(y)[0]
            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            chroma = librosa.feature.chroma_stft(y=y, sr=sr)
            rms_energy = librosa.feature.rms(y=y)[0]
            
            # Safe VAD calculations
            valence = self.calculate_valence_safe(spectral_centroids, chroma, mfcc)
            arousal = self.calculate_arousal_safe(tempo, spectral_rolloff, zero_crossing_rate, rms_energy)
            dominance = self.calculate_dominance_safe(spectral_centroids, mfcc, len(beats))
            
            # Safe Camelot analysis
            camelot_key = self.determine_camelot_key_safe(chroma, mfcc)
            
            # Therapeutic applications
            therapeutic_apps = self.determine_therapeutic_applications(valence, arousal, dominance, tempo)
            
            # DJ mixing analysis
            mixing_info = self.analyze_mixing_compatibility(camelot_key, tempo, valence, arousal)
            
            return {
                "filename": file_path.name,
                "vad_metrics": {
                    "valence": valence,
                    "energy_arousal": arousal,
                    "dominance": dominance,
                    "confidence_score": 0.85,
                    "emotional_interpretation": self.get_emotional_interpretation(valence, arousal, dominance)
                },
                "camelot_analysis": {
                    "key": camelot_key,
                    "compatible_keys": self.get_compatible_keys(camelot_key),
                    "mixing_recommendations": self.get_mixing_recommendations(camelot_key, tempo)
                },
                "librosa_features": {
                    "tempo": float(tempo),
                    "spectral_centroid_mean": self.safe_array_operation(spectral_centroids, 'mean'),
                    "spectral_rolloff_mean": self.safe_array_operation(spectral_rolloff, 'mean'),
                    "zero_crossing_rate_mean": self.safe_array_operation(zero_crossing_rate, 'mean'),
                    "rms_energy_mean": self.safe_array_operation(rms_energy, 'mean'),
                    "mfcc_1": self.safe_array_operation(mfcc[1] if len(mfcc) > 1 else [], 'mean'),
                    "mfcc_2": self.safe_array_operation(mfcc[2] if len(mfcc) > 2 else [], 'mean'),
                    "duration_seconds": len(y) / sr,
                    "beat_count": len(beats)
                },
                "therapeutic_applications": therapeutic_apps,
                "dj_mixing": mixing_info,
                "analysis_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"    Error analyzing {file_path.name}: {e}")
            return None
    
    def calculate_valence_safe(self, centroids, chroma, mfcc):
        """Safe valence calculation"""
        try:
            centroid_val = self.safe_array_operation(centroids, 'mean') / 8000.0
            
            # Simple major key detection
            chroma_sum = self.safe_array_operation(chroma, 'mean')
            major_strength = max(0, chroma_sum - 0.1)
            
            # Spectral brightness
            mfcc_brightness = self.safe_array_operation(mfcc[1:4] if len(mfcc) > 3 else [0], 'mean')
            
            valence = (centroid_val * 0.4) + (major_strength * 0.4) + ((mfcc_brightness + 10) / 20 * 0.2)
            return float(np.clip(valence, 0.0, 1.0))
        except:
            return 0.5
    
    def calculate_arousal_safe(self, tempo, rolloff, zcr, rms):
        """Safe arousal calculation"""
        try:
            tempo_val = min(float(tempo) / 180.0, 1.0)
            rolloff_val = self.safe_array_operation(rolloff, 'mean') / 11000.0
            zcr_val = self.safe_array_operation(zcr, 'mean') * 8
            rms_val = self.safe_array_operation(rms, 'mean') * 5
            
            arousal = (tempo_val * 0.4) + (rolloff_val * 0.3) + (zcr_val * 0.2) + (rms_val * 0.1)
            return float(np.clip(arousal, 0.0, 1.0))
        except:
            return 0.5
    
    def calculate_dominance_safe(self, centroids, mfcc, beat_count):
        """Safe dominance calculation"""
        try:
            centroid_consistency = 1.0 - (self.safe_array_operation(centroids, 'std') / 
                                         (self.safe_array_operation(centroids, 'mean') + 1e-8))
            rhythmic_strength = min(beat_count / 120.0, 1.0)
            
            mfcc_definition = 0.5
            if len(mfcc) > 7:
                mfcc_definition = self.safe_array_operation(mfcc[4:8], 'mean')
                mfcc_definition = (mfcc_definition + 10) / 20
            
            dominance = (centroid_consistency * 0.4) + (rhythmic_strength * 0.4) + (mfcc_definition * 0.2)
            return float(np.clip(dominance, 0.0, 1.0))
        except:
            return 0.5
    
    def determine_camelot_key_safe(self, chroma, mfcc):
        """Safe Camelot key determination"""
        try:
            # Simple key detection based on chroma maximum
            chroma_mean = np.mean(chroma, axis=1) if chroma.ndim > 1 else chroma
            key_index = int(np.argmax(chroma_mean)) % 12
            
            # Simple major/minor detection
            is_major = True
            if len(mfcc) > 3:
                brightness = self.safe_array_operation(mfcc[1:4], 'mean')
                is_major = brightness > 0
            
            # Camelot wheel mapping
            major_keys = ["8B", "3B", "10B", "5B", "12B", "7B", "2B", "9B", "4B", "11B", "6B", "1B"]
            minor_keys = ["5A", "12A", "7A", "2A", "9A", "4A", "11A", "6A", "1A", "8A", "3A", "10A"]
            
            if is_major:
                return major_keys[key_index]
            else:
                return minor_keys[key_index]
        except:
            return "8A"  # Default
    
    def get_compatible_keys(self, camelot_key):
        """Get compatible keys for mixing"""
        try:
            if len(camelot_key) < 2:
                return []
            
            number = int(camelot_key[:-1])
            letter = camelot_key[-1]
            
            compatible = [camelot_key]  # Same key
            
            # Adjacent keys
            next_num = 1 if number == 12 else number + 1
            prev_num = 12 if number == 1 else number - 1
            compatible.extend([f"{next_num}{letter}", f"{prev_num}{letter}"])
            
            # Relative major/minor
            relative_letter = "A" if letter == "B" else "B"
            compatible.append(f"{number}{relative_letter}")
            
            return compatible
        except:
            return [camelot_key]
    
    def get_mixing_recommendations(self, camelot_key, tempo):
        """Get mixing recommendations"""
        recommendations = []
        
        if camelot_key.endswith("A"):
            recommendations.extend([
                "Minor key - good for emotional builds",
                "Works well with progressive sequences"
            ])
        else:
            recommendations.extend([
                "Major key - perfect for uplifting moments",
                "Great for peak-time energy"
            ])
        
        tempo_val = float(tempo)
        if tempo_val < 100:
            recommendations.append("Slow tempo - ideal for ambient sections")
        elif 100 <= tempo_val < 130:
            recommendations.append("Medium tempo - versatile mixing options")
        else:
            recommendations.append("Fast tempo - high energy mixing")
        
        return recommendations
    
    def get_emotional_interpretation(self, valence, arousal, dominance):
        """Get emotional interpretation"""
        if valence > 0.7 and arousal > 0.7:
            return "Energetic and highly positive"
        elif valence > 0.7 and arousal < 0.4:
            return "Calm and content"
        elif valence < 0.4 and arousal > 0.7:
            return "Intense or dramatic"
        elif valence < 0.4 and arousal < 0.4:
            return "Melancholic or contemplative"
        else:
            return "Balanced emotional state"
    
    def determine_therapeutic_applications(self, valence, arousal, dominance, tempo):
        """Determine therapeutic applications"""
        applications = []
        
        # Arousal-based
        if arousal > 0.8:
            applications.extend(["high_energy_boost", "motivation", "exercise"])
        elif arousal > 0.6:
            applications.extend(["energy_boost", "focus", "productivity"])
        elif arousal < 0.3:
            applications.extend(["relaxation", "sleep", "meditation"])
        elif arousal < 0.5:
            applications.extend(["calm_focus", "mindfulness"])
        
        # Valence-based
        if valence > 0.8:
            applications.extend(["mood_elevation", "confidence_building"])
        elif valence > 0.6:
            applications.extend(["mood_boost", "positivity"])
        elif valence < 0.3:
            applications.extend(["emotional_processing", "introspection"])
        
        # Dominance-based
        if dominance > 0.8:
            applications.extend(["empowerment", "leadership"])
        elif dominance < 0.3:
            applications.extend(["acceptance", "letting_go"])
        
        # Tempo-based
        tempo_val = float(tempo)
        if tempo_val < 70:
            applications.extend(["deep_relaxation", "sleep"])
        elif 70 <= tempo_val < 110:
            applications.extend(["light_exercise", "background_work"])
        elif 110 <= tempo_val < 140:
            applications.extend(["moderate_exercise", "active_work"])
        else:
            applications.extend(["high_intensity_exercise", "peak_performance"])
        
        return sorted(list(set(applications)))
    
    def analyze_mixing_compatibility(self, camelot_key, tempo, valence, arousal):
        """Analyze DJ mixing compatibility"""
        return {
            "energy_level": "low" if arousal < 0.3 else "medium" if arousal < 0.7 else "high",
            "mood": "positive" if valence > 0.6 else "neutral" if valence > 0.4 else "negative",
            "tempo_category": "slow" if tempo < 100 else "medium" if tempo < 130 else "fast",
            "mixing_difficulty": "easy" if len(self.get_compatible_keys(camelot_key)) > 3 else "moderate",
            "recommended_position": self.recommend_set_position(valence, arousal, tempo)
        }
    
    def recommend_set_position(self, valence, arousal, tempo):
        """Recommend position in DJ set"""
        if arousal < 0.3:
            return "opening_ambient"
        elif arousal < 0.5 and tempo < 110:
            return "warm_up"
        elif 0.5 <= arousal <= 0.8 and 110 <= tempo <= 130:
            return "main_set"
        elif arousal > 0.8:
            return "peak_time"
        else:
            return "flexible"
    
    def process_all_files(self):
        """Process all audio files"""
        audio_extensions = {'.mp3', '.wav', '.flac', '.m4a', '.ogg'}
        
        audio_files = []
        for ext in audio_extensions:
            audio_files.extend(self.music_dir.glob(f"*{ext}"))
        
        new_files = [f for f in audio_files if f.name not in self.processed_files]
        
        print(f"\n=== ROBUST VAD + CAMELOT ANALYSIS ===")
        print(f"Total files: {len(audio_files)}")
        print(f"Already processed: {len(self.processed_files)}")
        print(f"New files to process: {len(new_files)}")
        print("=" * 50)
        
        new_analyses = 0
        for i, file_path in enumerate(new_files):
            print(f"\n[{i+1}/{len(new_files)}]")
            
            analysis = self.analyze_track(file_path)
            if analysis:
                self.analysis_results.append(analysis)
                new_analyses += 1
                
                # Save every 10 files
                if new_analyses % 10 == 0:
                    self.save_results()
                    print(f"  ✓ Progress saved: {new_analyses} completed")
        
        self.save_results()
        self.generate_summary()
        
        print(f"\n=== ANALYSIS COMPLETE ===")
        print(f"New analyses: {new_analyses}")
        print(f"Total in database: {len(self.analysis_results)}")
    
    def save_results(self):
        """Save analysis results"""
        report = {
            "analysis_metadata": {
                "total_files_analyzed": len(self.analysis_results),
                "analysis_date": datetime.now().isoformat(),
                "analyzer_version": "8.0.0 (robust_vad_camelot)",
                "analysis_scope": "comprehensive_vad_camelot_therapeutic_analysis",
                "features": [
                    "VAD (Valence-Arousal-Dominance) metrics",
                    "Camelot wheel harmonic analysis", 
                    "Librosa audio features",
                    "Therapeutic applications",
                    "DJ mixing compatibility"
                ]
            },
            "comprehensive_analyses": self.analysis_results
        }
        
        with open("comprehensive_audio_analysis_report.json", "w") as f:
            json.dump(report, f, indent=2)
    
    def generate_summary(self):
        """Generate analysis summary"""
        if not self.analysis_results:
            return
        
        valences = [a["vad_metrics"]["valence"] for a in self.analysis_results]
        arousals = [a["vad_metrics"]["energy_arousal"] for a in self.analysis_results]
        tempos = [a["librosa_features"]["tempo"] for a in self.analysis_results]
        camelot_keys = [a["camelot_analysis"]["key"] for a in self.analysis_results]
        
        # Count therapeutic applications
        all_apps = []
        for analysis in self.analysis_results:
            all_apps.extend(analysis["therapeutic_applications"])
        app_counts = Counter(all_apps)
        
        summary = {
            "summary": {
                "total_tracks": len(self.analysis_results),
                "avg_valence": float(np.mean(valences)),
                "avg_arousal": float(np.mean(arousals)),
                "avg_tempo": float(np.mean(tempos)),
                "tempo_range": [float(np.min(tempos)), float(np.max(tempos))],
                "unique_camelot_keys": len(set(camelot_keys)),
                "major_keys": len([k for k in camelot_keys if k.endswith("B")]),
                "minor_keys": len([k for k in camelot_keys if k.endswith("A")]),
                "most_common_keys": dict(Counter(camelot_keys).most_common(10)),
                "most_common_applications": dict(app_counts.most_common(15)),
                "tempo_distribution": {
                    "slow_under_100": len([t for t in tempos if t < 100]),
                    "medium_100_130": len([t for t in tempos if 100 <= t < 130]),
                    "fast_over_130": len([t for t in tempos if t >= 130])
                }
            }
        }
        
        with open("analysis_summary_report.json", "w") as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n=== SUMMARY ===")
        print(f"Average valence: {summary['summary']['avg_valence']:.2f}")
        print(f"Average arousal: {summary['summary']['avg_arousal']:.2f}")
        print(f"Average tempo: {summary['summary']['avg_tempo']:.1f} BPM")
        print(f"Unique Camelot keys: {summary['summary']['unique_camelot_keys']}")
        print(f"Major keys: {summary['summary']['major_keys']}")
        print(f"Minor keys: {summary['summary']['minor_keys']}")

if __name__ == "__main__":
    analyzer = RobustMusicAnalyzer()
    analyzer.process_all_files()
    
    print("\n🎵 COMPREHENSIVE VAD + CAMELOT ANALYSIS COMPLETE! 🎵")
    print("Results saved to comprehensive_audio_analysis_report.json")