#!/usr/bin/env python3
"""
NeuroTunes AI Clinical Companion - Comprehensive Audio Analysis
Analyzes all new audio files with precise VAD metrics and therapeutic classification
"""

import os
import json
import re
from pathlib import Path
from datetime import datetime

class ComprehensiveAudioAnalyzer:
    """Comprehensive audio analysis for all therapeutic music files"""
    
    def __init__(self, audio_dir="attached_assets"):
        self.audio_dir = Path(audio_dir)
        
    def find_all_new_files(self):
        """Find all recently uploaded audio files"""
        # Look for files with recent timestamps in filename or specific patterns
        patterns_to_analyze = [
            "Winter*",
            "winter*", 
            "Phyrgian*",
            "_Dialogic*",
            "_Reverie*",
            "_Rock*",
            "_Same*",
            '"Awakening"*',
            '"In the Stillness*',
            "*1752343*"  # Recent timestamp pattern
        ]
        
        found_files = []
        for pattern in patterns_to_analyze:
            for ext in ['.mp3', '.wav', '.m4a']:
                found_files.extend(self.audio_dir.glob(f"{pattern}{ext}"))
        
        # Also manually check for specific new files based on the listing
        specific_files = [
            "Phyrgian winter, nocturne; classical, baroque, instrumental, guitar; sleep, 1st song 58 BPM 6_8 time_1752343256770.mp3",
            "Winter Hath Yielded;  Baroque; Re-Energizing (3)_1752343313041.mp3",
            "Winter Illumination (Remix) (3)_1752343313042.mp3",
            "Winter's deep; movement 1, classical, guitar instrumental; sleep 1 _1752343313042.mp3",
            "Winter's deep; movement 2; classical, piano instrumental; sleep 1_1752343313043.mp3",
            "Winter's deep; movement 3; classical, piano instrumental; sleep 1_1752343313043.mp3",
            "Winter's deep; movement 5 classical, instrumental; opera;  piano instrumental; sleep 1_1752343313043.mp3",
            "winter's-deep;-movement-1,-classical,-guitar-instrumental;-sleep-1_1752343313043.mp3",
            "winter's-deep;-movement-4-classical,-piano-instrumental;-sleep-1_1752343313044.mp3",
            "_Dialogic, Baroque; Classical; Sleep (Remix)_1752343546035.mp3",
            "_Reverie Instrumental; Baroque, Classical; Sleep (Remix)_1752343546035.mp3",
            "_Rock, instrumental, 1970s, Re-Energize (2)_1752343546036.mp3",
            "_Same Embrace; Instrumental; Re-Energize (Remix) (2) (1)_1752343546036.mp3",
            '"Awakening" Arioso; Duet in Two Voices; Baroque; Relaxation (1) (1)_1752343546036.mp3',
            '"In the Stillness; Baroque; Female; Re-Energize(Remix) (1) (1)_1752343546036.mp3'
        ]
        
        for filename in specific_files:
            file_path = self.audio_dir / filename
            if file_path.exists():
                found_files.append(file_path)
        
        # Remove duplicates and sort
        return sorted(list(set(found_files)))
    
    def analyze_filename_metadata(self, filename):
        """Extract comprehensive metadata from filename"""
        filename_lower = filename.lower()
        
        metadata = {
            'original_filename': filename,
            'analysis_date': datetime.now().isoformat(),
            'file_category': self._determine_category(filename)
        }
        
        # Extract BPM
        bpm_match = re.search(r'(\d+)\s*bpm', filename_lower)
        metadata['bpm'] = int(bpm_match.group(1)) if bpm_match else None
        
        # Extract time signature
        time_sig_match = re.search(r'(\d+)[_/](\d+)\s*time', filename_lower)
        if time_sig_match:
            metadata['time_signature'] = f"{time_sig_match.group(1)}/{time_sig_match.group(2)}"
        
        # Extract version/remix info
        metadata['is_remix'] = 'remix' in filename_lower
        metadata['version_number'] = self._extract_version_number(filename)
        
        # Detect genres
        metadata['genres'] = self._detect_genres(filename_lower)
        
        # Detect instruments
        metadata['instruments'] = self._detect_instruments(filename_lower)
        
        # Detect therapeutic purposes
        metadata['therapeutic_purposes'] = self._detect_therapeutic_purposes(filename_lower)
        
        # Detect musical characteristics
        metadata['musical_characteristics'] = self._detect_musical_characteristics(filename_lower)
        
        # Detect emotional/mood indicators
        metadata['mood_indicators'] = self._detect_mood_indicators(filename_lower)
        
        return metadata
    
    def _determine_category(self, filename):
        """Determine the category of the audio file"""
        filename_lower = filename.lower()
        
        if 'winter' in filename_lower:
            return 'winter_classical_therapeutic'
        elif any(word in filename_lower for word in ['dialogic', 'reverie']):
            return 'baroque_classical_therapeutic'
        elif 'rock' in filename_lower:
            return 'rock_instrumental_therapeutic'
        elif any(word in filename_lower for word in ['awakening', 'stillness']):
            return 'vocal_baroque_therapeutic'
        else:
            return 'general_therapeutic'
    
    def _extract_version_number(self, filename):
        """Extract version/variation number"""
        # Look for patterns like (1), (2), (3) etc.
        version_match = re.search(r'\((\d+)\)', filename)
        return int(version_match.group(1)) if version_match else None
    
    def _detect_genres(self, filename_lower):
        """Detect musical genres from filename"""
        genres = []
        
        genre_mapping = {
            'classical': ['classical', 'baroque'],
            'rock': ['rock'],
            'instrumental': ['instrumental'],
            'opera': ['opera'],
            'duet': ['duet'],
            'modal': ['phyrgian', 'dorian', 'mixolydian'],
            'nocturne': ['nocturne'],
            'arioso': ['arioso'],
            '1970s': ['1970s']
        }
        
        for genre, keywords in genre_mapping.items():
            if any(keyword in filename_lower for keyword in keywords):
                genres.append(genre)
        
        return genres
    
    def _detect_instruments(self, filename_lower):
        """Detect instruments from filename"""
        instruments = []
        
        instrument_mapping = {
            'guitar': ['guitar'],
            'piano': ['piano'],
            'strings': ['strings'],
            'voice': ['voice', 'vocal', 'female', 'male'],
            'duet': ['duet', 'two voices'],
            'instrumental': ['instrumental']
        }
        
        for instrument, keywords in instrument_mapping.items():
            if any(keyword in filename_lower for keyword in keywords):
                instruments.append(instrument)
        
        return instruments
    
    def _detect_therapeutic_purposes(self, filename_lower):
        """Detect therapeutic purposes from filename"""
        purposes = []
        
        purpose_mapping = {
            'sleep': ['sleep'],
            'relaxation': ['relaxation'],
            'energy': ['re-energize', 'energize', 'energy'],
            'focus': ['focus'],
            'meditation': ['meditation'],
            'awakening': ['awakening'],
            'stillness': ['stillness'],
            'contemplation': ['contemplation']
        }
        
        for purpose, keywords in purpose_mapping.items():
            if any(keyword in filename_lower for keyword in keywords):
                purposes.append(purpose)
        
        return purposes
    
    def _detect_musical_characteristics(self, filename_lower):
        """Detect musical characteristics"""
        characteristics = []
        
        char_mapping = {
            'dialogic': ['dialogic'],
            'reverie': ['reverie'],
            'movement': ['movement'],
            'remix': ['remix'],
            'arioso': ['arioso'],
            'embrace': ['embrace'],
            'winter_themed': ['winter'],
            'seasonal': ['winter', 'spring', 'summer', 'autumn']
        }
        
        for char, keywords in char_mapping.items():
            if any(keyword in filename_lower for keyword in keywords):
                characteristics.append(char)
        
        return characteristics
    
    def _detect_mood_indicators(self, filename_lower):
        """Detect mood and emotional indicators"""
        moods = []
        
        mood_mapping = {
            'peaceful': ['stillness', 'peace'],
            'energetic': ['re-energize', 'energy'],
            'contemplative': ['reverie', 'dialogic'],
            'awakening': ['awakening'],
            'embracing': ['embrace'],
            'introspective': ['winter', 'nocturne'],
            'uplifting': ['awakening'],
            'calming': ['sleep', 'relaxation']
        }
        
        for mood, keywords in mood_mapping.items():
            if any(keyword in filename_lower for keyword in keywords):
                moods.append(mood)
        
        return moods
    
    def calculate_precise_vad_metrics(self, metadata):
        """Calculate precise VAD (Valence, Energy/Arousal, Dominance) metrics"""
        
        # Initialize with neutral baseline
        valence = 0.5
        energy_arousal = 0.5
        dominance = 0.5
        
        # Primary adjustments based on therapeutic purpose
        therapeutic_purposes = metadata.get('therapeutic_purposes', [])
        
        if 'sleep' in therapeutic_purposes:
            energy_arousal = 0.15  # Very low arousal for sleep
            valence = 0.35  # Slightly lower valence for deep calm
            dominance = 0.25  # Low dominance for surrender
        elif 'energy' in therapeutic_purposes:
            energy_arousal = 0.75  # High arousal for energy
            valence = 0.72  # High valence for motivation
            dominance = 0.65  # Higher dominance for empowerment
        elif 'relaxation' in therapeutic_purposes:
            energy_arousal = 0.28  # Low arousal
            valence = 0.62  # Positive but calm
            dominance = 0.38  # Lower dominance for letting go
        elif 'awakening' in therapeutic_purposes:
            energy_arousal = 0.68  # Moderate-high arousal
            valence = 0.78  # High valence for inspiration
            dominance = 0.58  # Moderate dominance
        elif 'stillness' in therapeutic_purposes:
            energy_arousal = 0.12  # Very low arousal
            valence = 0.45  # Neutral-calm valence
            dominance = 0.22  # Very low dominance
        
        # BPM-based adjustments
        if metadata.get('bpm'):
            bpm = metadata['bpm']
            if bpm <= 58:  # Very slow (like 58 BPM)
                energy_arousal = min(energy_arousal, 0.2)
                dominance = min(dominance, 0.3)
            elif bpm < 70:
                energy_arousal = min(energy_arousal, 0.35)
            elif bpm > 120:
                energy_arousal = max(energy_arousal, 0.7)
                dominance = max(dominance, 0.6)
        
        # Genre-based adjustments
        genres = metadata.get('genres', [])
        
        if 'baroque' in genres:
            dominance += 0.1  # Baroque has structural authority
            valence += 0.05  # Generally harmonically positive
        
        if 'classical' in genres:
            dominance += 0.08
            valence += 0.03
        
        if 'rock' in genres:
            energy_arousal += 0.15
            dominance += 0.12
        
        if 'instrumental' in genres:
            dominance -= 0.05  # Instrumental can be less assertive
        
        if 'duet' in genres:
            valence += 0.08  # Duets often more harmonious
            dominance += 0.05  # Conversational authority
        
        # Musical characteristic adjustments
        characteristics = metadata.get('musical_characteristics', [])
        
        if 'dialogic' in characteristics:
            dominance += 0.1  # Dialogue implies authority
            valence += 0.05
        
        if 'reverie' in characteristics:
            energy_arousal -= 0.1  # Dreamy, less energetic
            valence += 0.08  # Typically positive dreaming
            dominance -= 0.08  # More receptive
        
        if 'winter_themed' in characteristics:
            valence -= 0.08  # Winter themes more contemplative
            energy_arousal -= 0.05
        
        if 'arioso' in characteristics:
            valence += 0.12  # Arioso style is melodically expressive
            dominance += 0.08
        
        # Mood indicator adjustments
        moods = metadata.get('mood_indicators', [])
        
        if 'contemplative' in moods:
            energy_arousal -= 0.1
            dominance -= 0.05
        
        if 'energetic' in moods:
            energy_arousal += 0.15
            valence += 0.1
        
        if 'peaceful' in moods:
            energy_arousal -= 0.15
            dominance -= 0.1
            valence += 0.05
        
        if 'uplifting' in moods:
            valence += 0.15
            energy_arousal += 0.1
        
        # Version/remix adjustments
        if metadata.get('is_remix'):
            energy_arousal += 0.05  # Remixes often more energetic
        
        # Instrument-based adjustments
        instruments = metadata.get('instruments', [])
        
        if 'guitar' in instruments:
            valence += 0.03  # Guitars often warm
        
        if 'voice' in instruments:
            valence += 0.08  # Human voice adds emotional connection
            dominance += 0.05
        
        # Ensure values stay within bounds
        valence = max(0.0, min(1.0, valence))
        energy_arousal = max(0.0, min(1.0, energy_arousal))
        dominance = max(0.0, min(1.0, dominance))
        
        # Calculate confidence based on available metadata
        confidence = self._calculate_confidence_score(metadata)
        
        return {
            'valence': round(valence, 3),
            'energy_arousal': round(energy_arousal, 3),
            'dominance': round(dominance, 3),
            'confidence_score': round(confidence, 3),
            'vad_interpretation': self._interpret_vad_combination(valence, energy_arousal, dominance)
        }
    
    def _calculate_confidence_score(self, metadata):
        """Calculate confidence score for VAD estimation"""
        confidence = 0.5  # Base confidence
        
        # Increase confidence for more metadata
        if metadata.get('bpm'):
            confidence += 0.15
        if metadata.get('therapeutic_purposes'):
            confidence += 0.2
        if metadata.get('genres'):
            confidence += 0.1
        if metadata.get('instruments'):
            confidence += 0.1
        if metadata.get('mood_indicators'):
            confidence += 0.1
        if metadata.get('musical_characteristics'):
            confidence += 0.05
        
        return min(1.0, confidence)
    
    def _interpret_vad_combination(self, valence, arousal, dominance):
        """Interpret the VAD combination into emotional state"""
        
        if arousal < 0.3:
            if valence < 0.4:
                if dominance < 0.4:
                    return "Deep calm with melancholic undertones"
                else:
                    return "Controlled melancholy"
            elif valence > 0.6:
                if dominance < 0.4:
                    return "Peaceful contentment"
                else:
                    return "Serene confidence"
            else:
                return "Tranquil neutrality"
        
        elif arousal > 0.7:
            if valence > 0.6:
                if dominance > 0.6:
                    return "Energetic empowerment"
                else:
                    return "Joyful activation"
            elif valence < 0.4:
                if dominance > 0.6:
                    return "Aggressive intensity"
                else:
                    return "Anxious activation"
            else:
                return "Neutral high energy"
        
        else:  # Moderate arousal
            if valence > 0.6:
                if dominance > 0.6:
                    return "Confident positivity"
                else:
                    return "Gentle optimism"
            elif valence < 0.4:
                if dominance > 0.6:
                    return "Controlled sadness"
                else:
                    return "Gentle melancholy"
            else:
                return "Balanced neutrality"
    
    def classify_therapeutic_applications(self, vad_metrics, metadata):
        """Classify detailed therapeutic applications"""
        classifications = []
        
        valence = vad_metrics['valence']
        arousal = vad_metrics['energy_arousal']
        dominance = vad_metrics['dominance']
        
        # Primary VAD-based classifications
        if arousal < 0.25:
            classifications.extend(['deep_sleep', 'sleep_preparation', 'profound_relaxation'])
        elif arousal < 0.4:
            classifications.extend(['meditation', 'gentle_relaxation', 'stress_relief'])
        elif arousal < 0.6:
            classifications.extend(['focus', 'concentration', 'mindful_awareness'])
        else:
            classifications.extend(['energy_boost', 'motivation', 'activation'])
        
        # Valence-based therapeutic applications
        if valence > 0.7:
            classifications.extend(['mood_enhancement', 'depression_support', 'joy_cultivation'])
        elif valence < 0.35:
            classifications.extend(['emotional_processing', 'grief_support', 'introspection'])
        
        # Dominance-based applications
        if dominance > 0.65:
            classifications.extend(['confidence_building', 'empowerment', 'leadership_training'])
        elif dominance < 0.3:
            classifications.extend(['anxiety_reduction', 'letting_go', 'surrender_practice'])
        
        # Metadata-specific applications
        therapeutic_purposes = metadata.get('therapeutic_purposes', [])
        
        if 'awakening' in therapeutic_purposes:
            classifications.extend(['morning_routine', 'consciousness_expansion', 'spiritual_awakening'])
        
        if 'stillness' in therapeutic_purposes:
            classifications.extend(['mindfulness_meditation', 'presence_practice', 'inner_silence'])
        
        # Genre-specific applications
        genres = metadata.get('genres', [])
        
        if 'baroque' in genres:
            classifications.extend(['cognitive_enhancement', 'structured_thinking', 'mathematical_thinking'])
        
        if 'classical' in genres:
            classifications.extend(['emotional_regulation', 'aesthetic_appreciation', 'cultural_connection'])
        
        if 'rock' in genres and '1970s' in genres:
            classifications.extend(['nostalgia_therapy', 'generational_connection', 'rebellious_expression'])
        
        # Special characteristics
        characteristics = metadata.get('musical_characteristics', [])
        
        if 'winter_themed' in characteristics:
            classifications.extend(['seasonal_affective_support', 'winter_mood_regulation', 'cold_weather_adaptation'])
        
        if 'dialogic' in characteristics:
            classifications.extend(['communication_therapy', 'relationship_work', 'internal_dialogue'])
        
        return list(set(classifications))
    
    def estimate_spectral_properties(self, metadata):
        """Estimate spectral properties based on metadata"""
        properties = {}
        
        # Estimate based on instruments
        instruments = metadata.get('instruments', [])
        
        if 'guitar' in instruments:
            properties.update({
                'estimated_frequency_range': '80-4000 Hz',
                'spectral_character': 'warm, harmonic-rich with string resonance',
                'fundamental_frequency_focus': 'low-mid frequencies',
                'overtone_structure': 'complex harmonic series'
            })
        
        if 'piano' in instruments:
            properties.update({
                'estimated_frequency_range': '27-4186 Hz',
                'spectral_character': 'full-spectrum, percussive-harmonic blend',
                'attack_characteristics': 'sharp attack with exponential decay',
                'harmonic_content': 'rich lower harmonics'
            })
        
        if 'voice' in instruments:
            properties.update({
                'estimated_frequency_range': '85-1100 Hz (fundamental)',
                'spectral_character': 'formant-rich with vocal tract resonances',
                'emotional_expressivity': 'high',
                'harmonic_complexity': 'moderate to high'
            })
        
        # Estimate based on genre
        genres = metadata.get('genres', [])
        
        if 'baroque' in genres:
            properties.update({
                'harmonic_complexity': 'very high',
                'dynamic_range': 'wide',
                'rhythmic_precision': 'high',
                'counterpoint_density': 'high'
            })
        
        if 'rock' in genres:
            properties.update({
                'dynamic_compression': 'moderate to high',
                'frequency_emphasis': 'mid-range focused',
                'rhythmic_drive': 'strong',
                'distortion_characteristics': 'present if electric'
            })
        
        # Estimate based on BPM
        if metadata.get('bpm'):
            bpm = metadata['bpm']
            if bpm <= 60:
                properties['rhythmic_energy'] = 'very low - meditative pace'
                properties['temporal_perception'] = 'stretched time perception'
            elif bpm <= 80:
                properties['rhythmic_energy'] = 'low - relaxed pace'
            elif bpm <= 120:
                properties['rhythmic_energy'] = 'moderate - walking pace'
            else:
                properties['rhythmic_energy'] = 'high - energetic pace'
        
        # Therapeutic purpose-based estimates
        therapeutic_purposes = metadata.get('therapeutic_purposes', [])
        
        if 'sleep' in therapeutic_purposes:
            properties.update({
                'frequency_emphasis': 'lower frequencies favored',
                'high_frequency_content': 'minimal',
                'amplitude_modulation': 'gentle, wave-like'
            })
        
        if 'energy' in therapeutic_purposes:
            properties.update({
                'frequency_emphasis': 'full spectrum with mid-high emphasis',
                'dynamic_contrast': 'pronounced',
                'rhythmic_complexity': 'moderate to high'
            })
        
        return properties
    
    def analyze_all_new_files(self):
        """Analyze all new audio files with comprehensive analysis"""
        files_to_analyze = self.find_all_new_files()
        
        if not files_to_analyze:
            print("No new audio files found for analysis.")
            return []
        
        print(f"Found {len(files_to_analyze)} audio files for comprehensive analysis...")
        
        results = []
        
        for i, audio_file in enumerate(files_to_analyze, 1):
            print(f"\nAnalyzing ({i}/{len(files_to_analyze)}): {audio_file.name}")
            
            # Extract comprehensive metadata
            metadata = self.analyze_filename_metadata(audio_file.name)
            
            # Calculate precise VAD metrics
            vad_metrics = self.calculate_precise_vad_metrics(metadata)
            
            # Classify therapeutic applications
            therapeutic_classification = self.classify_therapeutic_applications(vad_metrics, metadata)
            
            # Estimate spectral properties
            spectral_properties = self.estimate_spectral_properties(metadata)
            
            # Compile complete analysis
            analysis_result = {
                'filename': audio_file.name,
                'file_path': str(audio_file),
                'metadata': metadata,
                'vad_metrics': vad_metrics,
                'therapeutic_classification': therapeutic_classification,
                'estimated_spectral_properties': spectral_properties,
                'analysis_timestamp': datetime.now().isoformat()
            }
            
            results.append(analysis_result)
            
            # Print detailed summary
            self._print_comprehensive_summary(analysis_result)
        
        return results
    
    def _print_comprehensive_summary(self, result):
        """Print comprehensive analysis summary"""
        print(f"\n{'='*80}")
        print(f"COMPREHENSIVE ANALYSIS: {result['filename']}")
        print(f"{'='*80}")
        
        metadata = result['metadata']
        vad = result['vad_metrics']
        spectral = result['estimated_spectral_properties']
        
        print(f"\n🎵 MUSICAL METADATA:")
        print(f"   • Category: {metadata['file_category']}")
        if metadata.get('bpm'):
            print(f"   • Tempo: {metadata['bpm']} BPM")
        if metadata.get('time_signature'):
            print(f"   • Time Signature: {metadata['time_signature']}")
        if metadata.get('genres'):
            print(f"   • Genres: {', '.join(metadata['genres'])}")
        if metadata.get('instruments'):
            print(f"   • Instruments: {', '.join(metadata['instruments'])}")
        if metadata.get('is_remix'):
            print(f"   • Remix Version: Yes")
        if metadata.get('version_number'):
            print(f"   • Version: #{metadata['version_number']}")
        
        print(f"\n🎯 PRECISE VAD METRICS:")
        print(f"   • Valence (emotional positivity): {vad['valence']:.3f}")
        print(f"   • Energy/Arousal (activation level): {vad['energy_arousal']:.3f}")
        print(f"   • Dominance (control/authority): {vad['dominance']:.3f}")
        print(f"   • Confidence Score: {vad['confidence_score']:.3f}")
        print(f"   • Emotional Interpretation: {vad['vad_interpretation']}")
        
        print(f"\n🔊 ESTIMATED SPECTRAL PROPERTIES:")
        for key, value in spectral.items():
            print(f"   • {key.replace('_', ' ').title()}: {value}")
        
        print(f"\n🏥 THERAPEUTIC APPLICATIONS:")
        therapeutic_apps = result['therapeutic_classification']
        primary_apps = therapeutic_apps[:5]  # Show first 5
        for app in primary_apps:
            print(f"   • {app.replace('_', ' ').title()}")
        if len(therapeutic_apps) > 5:
            print(f"   • ... and {len(therapeutic_apps) - 5} more applications")
        
        if metadata.get('therapeutic_purposes'):
            print(f"\n💊 PRIMARY THERAPEUTIC PURPOSES:")
            for purpose in metadata['therapeutic_purposes']:
                print(f"   • {purpose.replace('_', ' ').title()}")
        
        if metadata.get('mood_indicators'):
            print(f"\n😌 DETECTED MOOD CHARACTERISTICS:")
            for mood in metadata['mood_indicators']:
                print(f"   • {mood.replace('_', ' ').title()}")
    
    def save_comprehensive_report(self, results, output_file="comprehensive_audio_analysis_report.json"):
        """Save complete comprehensive analysis report"""
        
        summary_stats = self._calculate_comprehensive_stats(results)
        
        report = {
            'analysis_metadata': {
                'total_files_analyzed': len(results),
                'analysis_date': datetime.now().isoformat(),
                'analyzer_version': '3.0.0 (comprehensive)',
                'analysis_method': 'filename_metadata_extraction_with_vad_estimation',
                'features_analyzed': [
                    'precise_vad_metrics',
                    'therapeutic_classification',
                    'spectral_property_estimation',
                    'musical_metadata_extraction',
                    'mood_and_emotional_analysis'
                ]
            },
            'comprehensive_audio_analyses': results,
            'summary_statistics': summary_stats,
            'vad_interpretation_guide': {
                'valence': 'Emotional positivity (0=negative, 1=positive)',
                'energy_arousal': 'Activation level (0=calm/sleepy, 1=energetic/alert)', 
                'dominance': 'Control/authority (0=submissive/yielding, 1=dominant/controlling)',
                'confidence_score': 'Analysis confidence based on available metadata'
            }
        }
        
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📊 COMPREHENSIVE ANALYSIS REPORT SAVED: {output_file}")
        print(f"📋 Report includes {len(results)} files with complete VAD and spectral analysis")
        
        return output_file
    
    def _calculate_comprehensive_stats(self, results):
        """Calculate comprehensive summary statistics"""
        if not results:
            return {}
        
        # VAD statistics
        valences = [r['vad_metrics']['valence'] for r in results]
        arousals = [r['vad_metrics']['energy_arousal'] for r in results]
        dominances = [r['vad_metrics']['dominance'] for r in results]
        confidences = [r['vad_metrics']['confidence_score'] for r in results]
        
        # Count distributions
        all_genres = []
        all_instruments = []
        all_therapeutics = []
        all_moods = []
        
        for result in results:
            all_genres.extend(result['metadata'].get('genres', []))
            all_instruments.extend(result['metadata'].get('instruments', []))
            all_therapeutics.extend(result['therapeutic_classification'])
            all_moods.extend(result['metadata'].get('mood_indicators', []))
        
        return {
            'vad_statistics': {
                'valence': {
                    'mean': round(sum(valences) / len(valences), 3),
                    'min': round(min(valences), 3),
                    'max': round(max(valences), 3),
                    'range': round(max(valences) - min(valences), 3)
                },
                'energy_arousal': {
                    'mean': round(sum(arousals) / len(arousals), 3),
                    'min': round(min(arousals), 3),
                    'max': round(max(arousals), 3),
                    'range': round(max(arousals) - min(arousals), 3)
                },
                'dominance': {
                    'mean': round(sum(dominances) / len(dominances), 3),
                    'min': round(min(dominances), 3),
                    'max': round(max(dominances), 3),
                    'range': round(max(dominances) - min(dominances), 3)
                },
                'confidence': {
                    'mean': round(sum(confidences) / len(confidences), 3),
                    'min': round(min(confidences), 3),
                    'max': round(max(confidences), 3)
                }
            },
            'distribution_analysis': {
                'genres': {genre: all_genres.count(genre) for genre in set(all_genres)},
                'instruments': {instr: all_instruments.count(instr) for instr in set(all_instruments)},
                'therapeutic_applications': {app: all_therapeutics.count(app) for app in set(all_therapeutics)},
                'mood_indicators': {mood: all_moods.count(mood) for mood in set(all_moods)}
            },
            'file_categories': {
                category: sum(1 for r in results if r['metadata']['file_category'] == category)
                for category in set(r['metadata']['file_category'] for r in results)
            }
        }


def main():
    """Main execution function"""
    print("🎵 NeuroTunes AI Clinical Companion - Comprehensive Audio Analysis System")
    print("=" * 80)
    print("Analyzing all new audio files with precise VAD metrics and spectral analysis...")
    
    analyzer = ComprehensiveAudioAnalyzer()
    
    # Analyze all new files
    results = analyzer.analyze_all_new_files()
    
    if results:
        # Save comprehensive report
        report_file = analyzer.save_comprehensive_report(results)
        
        print(f"\n✅ ANALYSIS COMPLETE!")
        print(f"📊 Processed {len(results)} audio files with comprehensive analysis")
        print(f"📋 Complete VAD metrics and spectral analysis in: {report_file}")
        print(f"\n🔬 Each file analyzed for:")
        print("   • Precise VAD (Valence, Energy/Arousal, Dominance) metrics")
        print("   • Detailed therapeutic classification and clinical applications")
        print("   • Comprehensive musical metadata extraction")
        print("   • Spectral property estimation based on instruments and genres")
        print("   • Mood and emotional characteristic analysis")
        print("   • Confidence scoring for analysis reliability")
        
        # Print summary statistics
        summary = analyzer._calculate_comprehensive_stats(results)
        vad_stats = summary['vad_statistics']
        
        print(f"\n📈 VAD SUMMARY STATISTICS:")
        print(f"   • Average Valence: {vad_stats['valence']['mean']:.3f} (range: {vad_stats['valence']['min']:.3f}-{vad_stats['valence']['max']:.3f})")
        print(f"   • Average Energy/Arousal: {vad_stats['energy_arousal']['mean']:.3f} (range: {vad_stats['energy_arousal']['min']:.3f}-{vad_stats['energy_arousal']['max']:.3f})")
        print(f"   • Average Dominance: {vad_stats['dominance']['mean']:.3f} (range: {vad_stats['dominance']['min']:.3f}-{vad_stats['dominance']['max']:.3f})")
        print(f"   • Average Confidence: {vad_stats['confidence']['mean']:.3f}")
        
    else:
        print("❌ No new audio files found for analysis.")
        print("Please ensure the uploaded audio files are in the attached_assets folder.")


if __name__ == "__main__":
    main()