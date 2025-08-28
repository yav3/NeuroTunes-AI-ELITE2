#!/usr/bin/env python3
"""
NeuroTunes AI Clinical Companion - Audio Metadata Extractor
Extracts VAD metrics and therapeutic data from filename analysis for winter audio files
"""

import os
import json
import re
from pathlib import Path
from datetime import datetime

class AudioMetadataExtractor:
    """Extract therapeutic metadata and estimate VAD metrics from filename analysis"""
    
    def __init__(self, audio_dir="attached_assets"):
        self.audio_dir = Path(audio_dir)
        
    def analyze_filename(self, filename):
        """Comprehensive filename analysis for therapeutic metadata"""
        filename_lower = filename.lower()
        
        # Parse basic metadata
        metadata = {
            'original_filename': filename,
            'analysis_date': datetime.now().isoformat(),
            'file_category': 'winter_classical_therapeutic'
        }
        
        # Extract BPM if present
        bpm_match = re.search(r'(\d+)\s*bpm', filename_lower)
        metadata['bpm'] = int(bpm_match.group(1)) if bpm_match else None
        
        # Extract time signature
        time_sig_match = re.search(r'(\d+)_(\d+)\s*time', filename_lower)
        if time_sig_match:
            metadata['time_signature'] = f"{time_sig_match.group(1)}/{time_sig_match.group(2)}"
        
        # Detect genres
        genres = []
        if any(word in filename_lower for word in ['classical', 'baroque']):
            genres.append('classical')
        if 'phyrgian' in filename_lower:
            genres.append('modal')
        if 'nocturne' in filename_lower:
            genres.append('nocturne')
        if 'opera' in filename_lower:
            genres.append('opera')
        metadata['genres'] = genres
        
        # Detect instruments
        instruments = []
        if 'guitar' in filename_lower:
            instruments.append('guitar')
        if 'piano' in filename_lower:
            instruments.append('piano')
        if 'instrumental' in filename_lower:
            instruments.append('instrumental')
        metadata['instruments'] = instruments
        
        # Detect therapeutic purposes
        therapeutic_purposes = []
        if 'sleep' in filename_lower:
            therapeutic_purposes.append('sleep')
        if any(word in filename_lower for word in ['re-energiz', 'energiz']):
            therapeutic_purposes.append('energy')
        if 'relaxation' in filename_lower:
            therapeutic_purposes.append('relaxation')
        metadata['therapeutic_purposes'] = therapeutic_purposes
        
        # Detect movement/composition structure
        movement_match = re.search(r'movement\s*(\d+)', filename_lower)
        metadata['movement_number'] = int(movement_match.group(1)) if movement_match else None
        
        # Winter-specific characteristics
        metadata['winter_themed'] = 'winter' in filename_lower
        metadata['seasonal_classification'] = 'winter' if metadata['winter_themed'] else 'general'
        
        return metadata
    
    def estimate_vad_metrics(self, metadata):
        """Estimate VAD (Valence, Energy/Arousal, Dominance) from metadata analysis"""
        
        # Initialize with neutral values
        valence = 0.5
        energy_arousal = 0.5
        dominance = 0.5
        
        # Adjust based on therapeutic purpose
        if 'sleep' in metadata.get('therapeutic_purposes', []):
            energy_arousal = 0.2  # Very low arousal for sleep
            valence = 0.4  # Slightly lower valence for calming
            dominance = 0.3  # Low dominance for relaxation
        elif 'energy' in metadata.get('therapeutic_purposes', []):
            energy_arousal = 0.7  # Higher arousal for energy
            valence = 0.7  # Higher valence for motivation
            dominance = 0.6  # Moderate to high dominance
        elif 'relaxation' in metadata.get('therapeutic_purposes', []):
            energy_arousal = 0.3  # Low arousal
            valence = 0.6  # Positive but calm
            dominance = 0.4  # Lower dominance
        
        # Adjust based on BPM
        if metadata.get('bpm'):
            bpm = metadata['bpm']
            if bpm < 60:
                energy_arousal = min(energy_arousal, 0.25)  # Very low energy
            elif bpm < 80:
                energy_arousal = min(energy_arousal, 0.4)   # Low energy
            elif bpm > 120:
                energy_arousal = max(energy_arousal, 0.7)   # High energy
        
        # Adjust based on genre characteristics
        if 'nocturne' in metadata.get('genres', []):
            valence -= 0.1  # Nocturnes tend to be more melancholic
            energy_arousal -= 0.1  # Generally calmer
        
        if 'classical' in metadata.get('genres', []):
            dominance += 0.1  # Classical music often has structural authority
        
        if 'modal' in metadata.get('genres', []):
            valence -= 0.05  # Modal scales can be more ambiguous emotionally
        
        # Winter theme adjustments
        if metadata.get('winter_themed'):
            valence -= 0.05  # Winter themes often more contemplative
            energy_arousal -= 0.05  # Generally more subdued
        
        # Movement-based adjustments
        if metadata.get('movement_number'):
            movement = metadata['movement_number']
            if movement == 1:
                dominance += 0.1  # First movements often establish authority
            elif movement in [2, 3]:
                valence -= 0.05  # Middle movements often more introspective
                energy_arousal -= 0.05
        
        # Ensure values stay within bounds
        valence = max(0.0, min(1.0, valence))
        energy_arousal = max(0.0, min(1.0, energy_arousal))
        dominance = max(0.0, min(1.0, dominance))
        
        return {
            'valence': round(valence, 3),
            'energy_arousal': round(energy_arousal, 3),
            'dominance': round(dominance, 3),
            'confidence_score': self._calculate_confidence(metadata)
        }
    
    def _calculate_confidence(self, metadata):
        """Calculate confidence score for VAD estimation based on available metadata"""
        confidence = 0.5  # Base confidence
        
        # Increase confidence for more metadata
        if metadata.get('bpm'):
            confidence += 0.2
        if metadata.get('therapeutic_purposes'):
            confidence += 0.2
        if metadata.get('genres'):
            confidence += 0.1
        if metadata.get('time_signature'):
            confidence += 0.1
        
        return round(min(1.0, confidence), 3)
    
    def classify_therapeutic_use(self, vad_metrics, metadata):
        """Classify optimal therapeutic applications"""
        classifications = []
        
        valence = vad_metrics['valence']
        arousal = vad_metrics['energy_arousal']
        dominance = vad_metrics['dominance']
        
        # Primary classifications based on VAD
        if arousal < 0.3:
            classifications.extend(['sleep', 'deep_relaxation', 'meditation'])
        elif arousal < 0.6:
            classifications.extend(['relaxation', 'focus', 'stress_relief'])
        else:
            classifications.extend(['energy_boost', 'motivation', 'focus'])
        
        # Valence-based classifications
        if valence > 0.6:
            classifications.append('mood_enhancement')
        elif valence < 0.4:
            classifications.extend(['emotional_processing', 'contemplation'])
        
        # Dominance-based classifications
        if dominance > 0.6:
            classifications.append('confidence_building')
        elif dominance < 0.4:
            classifications.extend(['anxiety_reduction', 'surrender', 'acceptance'])
        
        # Metadata-based classifications
        if 'winter' in metadata.get('seasonal_classification', ''):
            classifications.extend(['seasonal_therapy', 'winter_mood_support'])
        
        if 'nocturne' in metadata.get('genres', []):
            classifications.extend(['evening_routine', 'bedtime_preparation'])
        
        if metadata.get('movement_number'):
            classifications.append('structured_listening')
        
        return list(set(classifications))
    
    def analyze_winter_files(self):
        """Analyze all winter-themed audio files"""
        # Define patterns for winter files
        winter_patterns = [
            "Phyrgian winter*",
            "Winter*",
            "winter's*"
        ]
        
        results = []
        winter_files = []
        
        # Find all winter audio files
        for pattern in winter_patterns:
            for ext in ['.mp3', '.wav', '.m4a']:
                winter_files.extend(self.audio_dir.glob(f"{pattern}{ext}"))
        
        # Remove duplicates and sort
        winter_files = sorted(list(set(winter_files)))
        
        print(f"Found {len(winter_files)} winter-themed audio files for analysis...")
        
        for i, audio_file in enumerate(winter_files, 1):
            print(f"\nAnalyzing ({i}/{len(winter_files)}): {audio_file.name}")
            
            # Extract metadata from filename
            metadata = self.analyze_filename(audio_file.name)
            
            # Estimate VAD metrics
            vad_metrics = self.estimate_vad_metrics(metadata)
            
            # Classify therapeutic use
            therapeutic_classification = self.classify_therapeutic_use(vad_metrics, metadata)
            
            # Compile complete analysis
            analysis_result = {
                'filename': audio_file.name,
                'file_path': str(audio_file),
                'metadata': metadata,
                'vad_metrics': vad_metrics,
                'therapeutic_classification': therapeutic_classification,
                'estimated_spectral_properties': self._estimate_spectral_properties(metadata)
            }
            
            results.append(analysis_result)
            
            # Print summary
            self._print_analysis_summary(analysis_result)
        
        return results
    
    def _estimate_spectral_properties(self, metadata):
        """Estimate spectral properties based on metadata"""
        properties = {}
        
        # Estimate based on instruments
        if 'guitar' in metadata.get('instruments', []):
            properties['estimated_frequency_range'] = '80-4000 Hz'
            properties['spectral_character'] = 'warm, harmonic-rich'
        elif 'piano' in metadata.get('instruments', []):
            properties['estimated_frequency_range'] = '27-4186 Hz'
            properties['spectral_character'] = 'full-spectrum, percussive-harmonic'
        
        # Estimate based on BPM
        if metadata.get('bpm'):
            bpm = metadata['bpm']
            properties['rhythmic_energy'] = 'very_low' if bpm < 60 else 'low' if bpm < 80 else 'moderate'
        
        # Estimate based on genre
        if 'classical' in metadata.get('genres', []):
            properties['harmonic_complexity'] = 'high'
            properties['dynamic_range'] = 'wide'
        
        return properties
    
    def _print_analysis_summary(self, result):
        """Print detailed analysis summary"""
        print(f"\n{'='*60}")
        print(f"ANALYSIS SUMMARY: {result['filename']}")
        print(f"{'='*60}")
        
        metadata = result['metadata']
        vad = result['vad_metrics']
        
        print(f"\n🎵 MUSICAL METADATA:")
        if metadata.get('bpm'):
            print(f"   • Tempo: {metadata['bpm']} BPM")
        if metadata.get('time_signature'):
            print(f"   • Time Signature: {metadata['time_signature']}")
        if metadata.get('movement_number'):
            print(f"   • Movement: #{metadata['movement_number']}")
        if metadata.get('genres'):
            print(f"   • Genres: {', '.join(metadata['genres'])}")
        if metadata.get('instruments'):
            print(f"   • Instruments: {', '.join(metadata['instruments'])}")
        
        print(f"\n🎯 VAD METRICS (Estimated):")
        print(f"   • Valence (emotional positivity): {vad['valence']:.3f}")
        print(f"   • Energy/Arousal (activation): {vad['energy_arousal']:.3f}")
        print(f"   • Dominance (control/authority): {vad['dominance']:.3f}")
        print(f"   • Confidence Score: {vad['confidence_score']:.3f}")
        
        print(f"\n🏥 THERAPEUTIC APPLICATIONS:")
        for classification in result['therapeutic_classification']:
            print(f"   • {classification.replace('_', ' ').title()}")
        
        if metadata.get('therapeutic_purposes'):
            print(f"\n💊 PRIMARY THERAPEUTIC PURPOSE:")
            for purpose in metadata['therapeutic_purposes']:
                print(f"   • {purpose.replace('_', ' ').title()}")
        
        spectral = result.get('estimated_spectral_properties', {})
        if spectral:
            print(f"\n🔊 ESTIMATED SPECTRAL PROPERTIES:")
            for key, value in spectral.items():
                print(f"   • {key.replace('_', ' ').title()}: {value}")
    
    def save_analysis_report(self, results, output_file="winter_audio_metadata_report.json"):
        """Save complete analysis report"""
        report = {
            'analysis_metadata': {
                'total_files_analyzed': len(results),
                'analysis_date': datetime.now().isoformat(),
                'analyzer_version': '2.0.0 (metadata-based)',
                'analysis_method': 'filename_and_metadata_extraction'
            },
            'winter_audio_analyses': results,
            'summary_statistics': self._calculate_summary_stats(results)
        }
        
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📊 Complete analysis report saved to: {output_file}")
        return output_file
    
    def _calculate_summary_stats(self, results):
        """Calculate summary statistics"""
        if not results:
            return {}
        
        valences = [r['vad_metrics']['valence'] for r in results]
        arousals = [r['vad_metrics']['energy_arousal'] for r in results]
        dominances = [r['vad_metrics']['dominance'] for r in results]
        
        # Count therapeutic classifications
        all_classifications = []
        for result in results:
            all_classifications.extend(result['therapeutic_classification'])
        
        classification_counts = {}
        for classification in all_classifications:
            classification_counts[classification] = classification_counts.get(classification, 0) + 1
        
        # Count genres and instruments
        all_genres = []
        all_instruments = []
        for result in results:
            all_genres.extend(result['metadata'].get('genres', []))
            all_instruments.extend(result['metadata'].get('instruments', []))
        
        return {
            'vad_statistics': {
                'valence': {
                    'mean': sum(valences) / len(valences),
                    'range': [min(valences), max(valences)]
                },
                'energy_arousal': {
                    'mean': sum(arousals) / len(arousals),
                    'range': [min(arousals), max(arousals)]
                },
                'dominance': {
                    'mean': sum(dominances) / len(dominances),
                    'range': [min(dominances), max(dominances)]
                }
            },
            'therapeutic_distribution': classification_counts,
            'genre_distribution': {genre: all_genres.count(genre) for genre in set(all_genres)},
            'instrument_distribution': {instr: all_instruments.count(instr) for instr in set(all_instruments)}
        }


def main():
    """Main execution function"""
    print("🎵 NeuroTunes AI Clinical Companion - Winter Audio Metadata Analysis")
    print("=" * 70)
    
    extractor = AudioMetadataExtractor()
    
    # Analyze winter-themed files
    results = extractor.analyze_winter_files()
    
    if results:
        # Save comprehensive report
        report_file = extractor.save_analysis_report(results)
        
        print(f"\n✅ Analysis complete! Processed {len(results)} winter audio files.")
        print(f"📋 Detailed VAD metrics and metadata analysis in: {report_file}")
        print("\n🔬 Each file analyzed for:")
        print("   • VAD (Valence, Energy/Arousal, Dominance) estimation")
        print("   • Therapeutic classification and applications")
        print("   • Musical metadata (BPM, time signature, instruments)")
        print("   • Spectral property estimation")
        print("   • Winter-specific therapeutic characteristics")
    else:
        print("❌ No winter audio files found to analyze.")
        print("Please ensure the winter-themed audio files are in the attached_assets folder.")


if __name__ == "__main__":
    main()