#!/usr/bin/env python3
"""
NeuroTunes+ Spectral Analysis Requirements Assessment
Determines what's needed for comprehensive spectral analysis of all tracks
"""

import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import subprocess
import sys

load_dotenv()

class SpectralAnalysisRequirements:
    def __init__(self):
        self.db_url = os.getenv('DATABASE_URL')
        self.audio_dir = '/home/runner/workspace/attached_assets'
        
    def connect_db(self):
        return psycopg2.connect(self.db_url, cursor_factory=RealDictCursor)
    
    def check_audio_files(self):
        """Check which audio files exist and their formats"""
        with self.connect_db() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, title, audio_url, duration
                    FROM tracks 
                    WHERE audio_url LIKE '/assets/%'
                    ORDER BY id
                """)
                tracks = cur.fetchall()
        
        file_analysis = {
            'total_tracks': len(tracks),
            'existing_files': 0,
            'missing_files': 0,
            'file_formats': {},
            'total_size_mb': 0,
            'sample_files': []
        }
        
        for track in tracks:
            audio_url = track['audio_url']
            filename = audio_url.replace('/assets/', '')
            file_path = os.path.join(self.audio_dir, filename)
            
            if os.path.exists(file_path):
                file_analysis['existing_files'] += 1
                
                # Get file extension
                ext = os.path.splitext(filename)[1].lower()
                file_analysis['file_formats'][ext] = file_analysis['file_formats'].get(ext, 0) + 1
                
                # Get file size
                size_mb = os.path.getsize(file_path) / (1024 * 1024)
                file_analysis['total_size_mb'] += size_mb
                
                # Add to sample files (first 5)
                if len(file_analysis['sample_files']) < 5:
                    file_analysis['sample_files'].append({
                        'title': track['title'],
                        'filename': filename,
                        'size_mb': round(size_mb, 2),
                        'duration': track['duration']
                    })
            else:
                file_analysis['missing_files'] += 1
        
        file_analysis['total_size_mb'] = round(file_analysis['total_size_mb'], 2)
        return file_analysis
    
    def check_python_audio_capabilities(self):
        """Check what audio analysis libraries are available"""
        capabilities = {
            'libraries_available': {},
            'recommended_approach': None,
            'installation_needed': []
        }
        
        # Test basic audio libraries
        test_libraries = [
            ('wave', 'Basic WAV file support'),
            ('mutagen', 'Audio metadata extraction'),
            ('pydub', 'Audio manipulation'),
            ('scipy', 'Scientific computing for audio'),
            ('numpy', 'Numerical operations')
        ]
        
        for lib_name, description in test_libraries:
            try:
                __import__(lib_name)
                capabilities['libraries_available'][lib_name] = {
                    'available': True,
                    'description': description
                }
            except ImportError:
                capabilities['libraries_available'][lib_name] = {
                    'available': False,
                    'description': description
                }
                capabilities['installation_needed'].append(lib_name)
        
        # Determine recommended approach
        if capabilities['libraries_available'].get('wave', {}).get('available'):
            capabilities['recommended_approach'] = 'python_native'
        else:
            capabilities['recommended_approach'] = 'external_tool'
        
        return capabilities
    
    def generate_spectral_analysis_plan(self):
        """Generate a comprehensive plan for spectral analysis"""
        file_analysis = self.check_audio_files()
        capabilities = self.check_python_audio_capabilities()
        
        plan = {
            'current_status': {
                'total_tracks': file_analysis['total_tracks'],
                'analyzable_files': file_analysis['existing_files'],
                'missing_files': file_analysis['missing_files'],
                'total_audio_data_mb': file_analysis['total_size_mb'],
                'file_formats': file_analysis['file_formats']
            },
            'analysis_requirements': {
                'spectral_features_needed': [
                    'Fundamental frequency (F0)',
                    'Spectral centroid',
                    'Spectral rolloff',
                    'Spectral bandwidth',
                    'Zero crossing rate',
                    'Tempo (BPM)',
                    'Harmonic vs percussive content',
                    'Energy distribution',
                    'Dynamic range',
                    'Frequency spectrum analysis'
                ],
                'therapeutic_parameters': [
                    'Valence (positive/negative emotion)',
                    'Arousal (energy level)',
                    'Dominance (control/power)',
                    'Therapeutic category classification',
                    'Binaural beat detection',
                    'Frequency entrainment analysis'
                ]
            },
            'implementation_options': [
                {
                    'approach': 'Python with librosa',
                    'pros': ['Comprehensive audio analysis', 'Scientific accuracy', 'Easy integration'],
                    'cons': ['Complex dependencies', 'Installation challenges in Replit'],
                    'feasibility': 'Medium'
                },
                {
                    'approach': 'Python with basic libraries',
                    'pros': ['Lightweight', 'Replit compatible', 'Fast processing'],
                    'cons': ['Limited spectral analysis', 'Basic features only'],
                    'feasibility': 'High'
                },
                {
                    'approach': 'FFmpeg + Python analysis',
                    'pros': ['External audio processing', 'Format flexibility', 'Robust'],
                    'cons': ['Requires system dependencies', 'Complex integration'],
                    'feasibility': 'Medium'
                },
                {
                    'approach': 'Web Audio API integration',
                    'pros': ['Client-side processing', 'Real-time analysis', 'No server load'],
                    'cons': ['Browser limitations', 'JavaScript complexity'],
                    'feasibility': 'High'
                }
            ],
            'recommended_solution': {
                'primary': 'Python with basic audio analysis + file metadata',
                'fallback': 'Web Audio API for real-time client analysis',
                'rationale': 'Start with analyzable features using available tools, expand capabilities incrementally'
            },
            'immediate_actions': [
                'Implement basic audio file analysis (duration, format, size)',
                'Extract metadata from MP3 files using available tools',
                'Calculate basic statistics (tempo estimation from filename patterns)',
                'Implement VAD value assignment based on therapeutic tags',
                'Create spectral analysis placeholder framework for future enhancement'
            ]
        }
        
        return plan
    
    def export_analysis_plan(self, plan, filename='spectral_analysis_plan.json'):
        """Export the analysis plan"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(plan, f, indent=2, ensure_ascii=False)
        
        print(f"Spectral analysis plan exported: {filename}")
        return filename

def main():
    """Main execution"""
    analyzer = SpectralAnalysisRequirements()
    
    print("NeuroTunes+ Spectral Analysis Requirements Assessment")
    print("=" * 60)
    
    # Generate comprehensive plan
    plan = analyzer.generate_spectral_analysis_plan()
    
    # Export plan
    plan_file = analyzer.export_analysis_plan(plan)
    
    # Print summary
    print(f"\nCURRENT STATUS:")
    print(f"Total tracks: {plan['current_status']['total_tracks']}")
    print(f"Analyzable files: {plan['current_status']['analyzable_files']}")
    print(f"Missing files: {plan['current_status']['missing_files']}")
    print(f"Total audio data: {plan['current_status']['total_audio_data_mb']} MB")
    print(f"File formats: {plan['current_status']['file_formats']}")
    
    print(f"\nRECOMMENDED APPROACH:")
    print(f"Primary: {plan['recommended_solution']['primary']}")
    print(f"Rationale: {plan['recommended_solution']['rationale']}")
    
    print(f"\nIMMEDIATE ACTIONS:")
    for action in plan['immediate_actions']:
        print(f"- {action}")
    
    print(f"\nDetailed plan exported to: {plan_file}")

if __name__ == "__main__":
    main()