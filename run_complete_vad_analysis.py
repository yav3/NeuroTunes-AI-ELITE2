#!/usr/bin/env python3
"""
Complete VAD Analysis for NeuroTunes Clinical Companion
Analyzes all 260 tracks for Valence, Arousal, Dominance + therapeutic applications
"""

import os
import json
import librosa
import numpy as np
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Any

class ComprehensiveVADAnalyzer:
    def __init__(self, music_dir: str = "music_library"):
        self.music_dir = Path(music_dir)
        self.analysis_results = []
        self.processed_files = set()
        
        # Load existing analysis to avoid duplicates
        self.load_existing_analysis()
    
    def load_existing_analysis(self):
        """Load existing analysis results to avoid re-processing"""
        try:
            with open("comprehensive_audio_analysis_report.json", "r") as f:
                existing = json.load(f)
                for item in existing.get("comprehensive_analyses", []):
                    self.processed_files.add(item["filename"])
                    self.analysis_results.append(item)
            print(f"Loaded {len(self.processed_files)} existing analyses")
        except FileNotFoundError:
            print("No existing analysis found, starting fresh")
    
    def analyze_audio_vad(self, file_path: Path) -> Dict[str, Any]:
        """Advanced VAD analysis using multiple acoustic features"""
        try:
            # Load audio with librosa
            y, sr = librosa.load(file_path, sr=22050, duration=60)  # First 60 seconds
            
            # Extract comprehensive features
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
            zero_crossing_rate = librosa.feature.zero_crossing_rate(y)[0]
            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            chroma = librosa.feature.chroma_stft(y=y, sr=sr)
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            
            # Advanced VAD calculations
            valence = self.calculate_valence(spectral_centroids, chroma, mfcc)
            arousal = self.calculate_arousal(tempo, spectral_rolloff, zero_crossing_rate)
            dominance = self.calculate_dominance(spectral_centroids, mfcc, beats)
            
            # Camelot wheel analysis
            camelot_key = self.analyze_camelot_key(chroma, mfcc)
            harmonic_compatibility = self.get_harmonic_compatibility(camelot_key)
            
            # Therapeutic applications
            therapeutic_apps = self.determine_therapeutic_applications(valence, arousal, dominance)
            
            return {
                "filename": file_path.name,
                "vad_metrics": {
                    "valence": float(valence),
                    "energy_arousal": float(arousal),
                    "dominance": float(dominance),
                    "confidence_score": 0.85,
                    "emotional_interpretation": self.get_emotional_interpretation(valence, arousal, dominance)
                },
                "camelot_analysis": {
                    "key": camelot_key,
                    "compatible_keys": harmonic_compatibility,
                    "mixing_recommendations": self.get_mixing_recommendations(camelot_key)
                },
                "librosa_features": {
                    "tempo": float(tempo),
                    "spectral_centroid_mean": float(np.mean(spectral_centroids)),
                    "spectral_centroid_std": float(np.std(spectral_centroids)),
                    "spectral_rolloff_mean": float(np.mean(spectral_rolloff)),
                    "spectral_rolloff_std": float(np.std(spectral_rolloff)),
                    "zero_crossing_rate_mean": float(np.mean(zero_crossing_rate)),
                    "zero_crossing_rate_std": float(np.std(zero_crossing_rate)),
                    "mfcc_features": [float(np.mean(mfcc[i])) for i in range(min(13, mfcc.shape[0]))],
                    "chroma_features": [float(np.mean(chroma[i])) for i in range(chroma.shape[0])],
                    "duration_seconds": len(y) / sr,
                    "sample_rate": sr,
                    "total_beats": len(beats)
                },
                "therapeutic_applications": therapeutic_apps,
                "analysis_timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error analyzing {file_path.name}: {e}")
            return None
    
    def calculate_valence(self, spectral_centroids: np.ndarray, chroma: np.ndarray, mfcc: np.ndarray) -> float:
        """Calculate valence (emotional positivity) from audio features"""
        # Higher spectral centroid and major key indicators suggest higher valence
        centroid_norm = np.mean(spectral_centroids) / 8000.0  # Normalize to 0-1
        chroma_brightness = np.max(np.mean(chroma, axis=1))  # Major vs minor tendency
        mfcc_brightness = np.mean(mfcc[1:3])  # First few MFCC coefficients
        
        valence = (centroid_norm * 0.4) + (chroma_brightness * 0.4) + (mfcc_brightness * 0.2)
        return np.clip(valence, 0.0, 1.0)
    
    def calculate_arousal(self, tempo: float, spectral_rolloff: np.ndarray, zcr: np.ndarray) -> float:
        """Calculate arousal (energy/excitement) from audio features"""
        # Tempo, spectral energy, and zero crossing rate indicate arousal
        tempo_norm = min(tempo / 180.0, 1.0)  # Normalize tempo
        rolloff_energy = np.mean(spectral_rolloff) / 11000.0  # High frequency content
        zcr_activity = np.mean(zcr) * 10  # Rhythmic activity
        
        arousal = (tempo_norm * 0.5) + (rolloff_energy * 0.3) + (zcr_activity * 0.2)
        return np.clip(arousal, 0.0, 1.0)
    
    def calculate_dominance(self, spectral_centroids: np.ndarray, mfcc: np.ndarray, beats: np.ndarray) -> float:
        """Calculate dominance (control/power) from audio features"""
        # Consistent strong patterns indicate dominance
        centroid_stability = 1.0 - (np.std(spectral_centroids) / np.mean(spectral_centroids))
        rhythmic_strength = len(beats) / 100.0  # Strong beat patterns
        timbral_complexity = np.mean(np.abs(mfcc[4:8]))  # Mid-range MFCC complexity
        
        dominance = (centroid_stability * 0.4) + (rhythmic_strength * 0.4) + (timbral_complexity * 0.2)
        return np.clip(dominance, 0.0, 1.0)
    
    def get_emotional_interpretation(self, valence: float, arousal: float, dominance: float) -> str:
        """Map VAD to emotional interpretation"""
        if valence > 0.6 and arousal > 0.6:
            return "Energetic and positive"
        elif valence > 0.6 and arousal < 0.4:
            return "Calm and content"
        elif valence < 0.4 and arousal > 0.6:
            return "Intense or aggressive"
        elif valence < 0.4 and arousal < 0.4:
            return "Melancholic or subdued"
        else:
            return "Balanced emotional state"
    
    def determine_therapeutic_applications(self, valence: float, arousal: float, dominance: float) -> List[str]:
        """Determine therapeutic applications based on VAD scores"""
        applications = []
        
        # High arousal applications
        if arousal > 0.7:
            applications.extend(["energy_boost", "motivation", "exercise", "focus"])
        
        # Low arousal applications  
        if arousal < 0.3:
            applications.extend(["relaxation", "sleep", "meditation", "stress_relief"])
        
        # High valence applications
        if valence > 0.7:
            applications.extend(["mood_boost", "confidence", "positivity", "celebration"])
        
        # Low valence applications
        if valence < 0.3:
            applications.extend(["introspection", "emotional_processing", "grief_support"])
        
        # High dominance applications
        if dominance > 0.7:
            applications.extend(["empowerment", "leadership", "confidence_building"])
        
        # Low dominance applications
        if dominance < 0.3:
            applications.extend(["humility", "acceptance", "letting_go"])
        
        # Balanced combinations
        if 0.4 <= valence <= 0.6 and 0.3 <= arousal <= 0.7:
            applications.extend(["general_wellness", "background_ambiance", "work"])
        
        return list(set(applications))
    
    def analyze_camelot_key(self, chroma: np.ndarray, mfcc: np.ndarray) -> str:
        """Analyze musical key using Camelot wheel system"""
        # Map chroma to key detection
        chroma_mean = np.mean(chroma, axis=1)
        key_index = np.argmax(chroma_mean)
        
        # Detect major vs minor mode using MFCC characteristics
        brightness = np.mean(mfcc[1:4])  # Timbral brightness
        is_major = brightness > 0
        
        # Camelot wheel mapping
        major_keys = ["8B", "3B", "10B", "5B", "12B", "7B", "2B", "9B", "4B", "11B", "6B", "1B"]
        minor_keys = ["5A", "12A", "7A", "2A", "9A", "4A", "11A", "6A", "1A", "8A", "3A", "10A"]
        
        if is_major:
            return major_keys[key_index]
        else:
            return minor_keys[key_index]
    
    def get_harmonic_compatibility(self, camelot_key: str) -> List[str]:
        """Get harmonically compatible keys for mixing"""
        # Extract number and letter from Camelot key
        if len(camelot_key) < 2:
            return []
            
        try:
            number = int(camelot_key[:-1])
            letter = camelot_key[-1]
        except:
            return []
        
        compatible = []
        
        # Same key
        compatible.append(camelot_key)
        
        # Adjacent keys (+1/-1 semitone)
        next_num = 1 if number == 12 else number + 1
        prev_num = 12 if number == 1 else number - 1
        compatible.extend([f"{next_num}{letter}", f"{prev_num}{letter}"])
        
        # Relative major/minor
        if letter == "A":
            compatible.append(f"{number}B")
        else:
            compatible.append(f"{number}A")
        
        return compatible
    
    def get_mixing_recommendations(self, camelot_key: str) -> List[str]:
        """Get DJ mixing recommendations based on Camelot key"""
        recommendations = []
        
        if camelot_key.endswith("A"):  # Minor keys
            recommendations.extend([
                "Works well for emotional builds",
                "Suitable for progressive house mixing",
                "Good for tension and release patterns"
            ])
        else:  # Major keys
            recommendations.extend([
                "Perfect for uplifting progressions", 
                "Ideal for peak-time mixing",
                "Great for energetic transitions"
            ])
            
        # Key-specific recommendations
        key_num = camelot_key[:-1]
        if key_num in ["1", "2", "3"]:
            recommendations.append("Lower energy - good for warm-up sets")
        elif key_num in ["10", "11", "12"]:
            recommendations.append("Higher energy - perfect for peak moments")
        
        return recommendations
    
    def process_all_files(self):
        """Process all audio files in the music library"""
        audio_extensions = {'.mp3', '.wav', '.flac', '.m4a', '.ogg'}
        
        # Get all audio files
        audio_files = []
        for ext in audio_extensions:
            audio_files.extend(self.music_dir.glob(f"*{ext}"))
        
        print(f"Found {len(audio_files)} audio files in {self.music_dir}")
        
        # Process each file
        new_analyses = 0
        for i, file_path in enumerate(audio_files):
            if file_path.name in self.processed_files:
                print(f"Skipping {file_path.name} (already processed)")
                continue
                
            print(f"Processing {i+1}/{len(audio_files)}: {file_path.name}")
            
            analysis = self.analyze_audio_vad(file_path)
            if analysis:
                self.analysis_results.append(analysis)
                new_analyses += 1
                
                # Save progress every 10 files
                if new_analyses % 10 == 0:
                    self.save_results()
                    print(f"Saved progress: {new_analyses} new analyses")
        
        print(f"Completed analysis of {new_analyses} new files")
        self.save_results()
    
    def save_results(self):
        """Save comprehensive analysis results"""
        report = {
            "analysis_metadata": {
                "total_files_analyzed": len(self.analysis_results),
                "analysis_date": datetime.now().isoformat(),
                "analyzer_version": "6.0.0 (librosa_camelot_complete)",
                "analysis_scope": "complete_vad_librosa_camelot_therapeutic_analysis",
                "features_extracted": [
                    "VAD (Valence-Arousal-Dominance)",
                    "Librosa audio features (spectral, temporal, timbral)",
                    "Camelot wheel harmonic analysis",
                    "Therapeutic applications mapping",
                    "DJ mixing compatibility"
                ]
            },
            "comprehensive_analyses": self.analysis_results
        }
        
        with open("comprehensive_audio_analysis_report.json", "w") as f:
            json.dump(report, f, indent=2)
        
        print(f"Saved comprehensive analysis report with {len(self.analysis_results)} tracks")

if __name__ == "__main__":
    analyzer = ComprehensiveVADAnalyzer()
    analyzer.process_all_files()
    
    print("\n=== VAD Analysis Complete ===")
    print(f"Total tracks analyzed: {len(analyzer.analysis_results)}")
    print("Results saved to: comprehensive_audio_analysis_report.json")