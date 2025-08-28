#!/usr/bin/env python3
"""
NeuroTunes+ Music Inventory Export Tool
Creates comprehensive exportable inventory of all therapeutic music tracks
"""

import os
import json
import csv
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from datetime import datetime
import urllib.parse

load_dotenv()

class MusicInventoryExporter:
    def __init__(self):
        self.db_url = os.getenv('DATABASE_URL')
        self.audio_dir = '/home/runner/workspace/attached_assets'
        
    def connect_db(self):
        """Connect to PostgreSQL database"""
        return psycopg2.connect(self.db_url, cursor_factory=RealDictCursor)
    
    def get_file_info(self, file_path):
        """Get basic file information"""
        try:
            if os.path.exists(file_path):
                stat = os.stat(file_path)
                return {
                    'file_exists': True,
                    'file_size_bytes': stat.st_size,
                    'file_size_mb': round(stat.st_size / (1024 * 1024), 2),
                    'last_modified': datetime.fromtimestamp(stat.st_mtime).isoformat()
                }
            else:
                return {
                    'file_exists': False,
                    'file_size_bytes': 0,
                    'file_size_mb': 0,
                    'last_modified': None
                }
        except Exception as e:
            return {
                'file_exists': False,
                'error': str(e),
                'file_size_bytes': 0,
                'file_size_mb': 0,
                'last_modified': None
            }
    
    def analyze_therapeutic_tags(self, tags):
        """Analyze therapeutic tag structure"""
        if not tags:
            return {
                'tag_count': 0,
                'categories': [],
                'therapeutic_quality': 'unknown'
            }
        
        # Define therapeutic categories
        therapeutic_categories = {
            'focus': ['focus', 'concentration', 'productivity', 'work'],
            'relaxation': ['relaxation', 'calm', 'peaceful', 'sleep'],
            'energy': ['energy boost', 're-energize', 'energetic', 'hiit'],
            'meditation': ['meditation', 'mindfulness', 'spiritual'],
            'pain_relief': ['pain-relief', 'pain relief', 'healing'],
            'sleep': ['sleep', 'sleepy', 'drowsy', 'lullaby']
        }
        
        found_categories = []
        for category, keywords in therapeutic_categories.items():
            if any(keyword in str(tags).lower() for keyword in keywords):
                found_categories.append(category)
        
        return {
            'tag_count': len(tags) if isinstance(tags, list) else 0,
            'categories': found_categories,
            'therapeutic_quality': 'high' if len(found_categories) >= 2 else 'medium' if found_categories else 'low'
        }
    
    def get_all_tracks_detailed(self):
        """Get all tracks with detailed information"""
        with self.connect_db() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        id, title, artist, album, duration, audio_url, cover_url,
                        mood, valence, energy, therapeutic_tags, binaural, frequency,
                        created_at
                    FROM tracks 
                    WHERE audio_url LIKE '/assets/%'
                    ORDER BY id
                """)
                return cur.fetchall()
    
    def create_comprehensive_inventory(self):
        """Create comprehensive inventory with all track details"""
        print("Creating comprehensive music inventory...")
        
        tracks = self.get_all_tracks_detailed()
        inventory_data = []
        
        # Summary statistics
        total_size_mb = 0
        total_duration_seconds = 0
        therapeutic_quality_counts = {'high': 0, 'medium': 0, 'low': 0, 'unknown': 0}
        mood_counts = {}
        
        for track in tracks:
            # Get file information
            audio_url = track['audio_url']
            filename = urllib.parse.unquote(audio_url.replace('/assets/', ''))
            file_path = os.path.join(self.audio_dir, filename)
            file_info = self.get_file_info(file_path)
            
            # Analyze therapeutic tags
            tag_analysis = self.analyze_therapeutic_tags(track['therapeutic_tags'])
            
            # Create comprehensive track record
            track_record = {
                # Basic track info
                'track_id': track['id'],
                'title': track['title'],
                'artist': track['artist'],
                'album': track['album'],
                'duration_seconds': track['duration'],
                'duration_minutes': round(track['duration'] / 60, 2) if track['duration'] else None,
                'mood': track['mood'],
                'created_date': track['created_at'].isoformat() if track['created_at'] else None,
                
                # Audio file info
                'audio_url': track['audio_url'],
                'filename': filename,
                'file_exists': file_info['file_exists'],
                'file_size_mb': file_info['file_size_mb'],
                'last_modified': file_info['last_modified'],
                
                # Therapeutic properties
                'therapeutic_tags': track['therapeutic_tags'],
                'therapeutic_categories': tag_analysis['categories'],
                'therapeutic_quality': tag_analysis['therapeutic_quality'],
                'tag_count': tag_analysis['tag_count'],
                'valence': track['valence'],
                'energy': track['energy'],
                'binaural': track['binaural'],
                'frequency': track['frequency'],
                
                # Analysis timestamp
                'inventory_timestamp': datetime.now().isoformat()
            }
            
            inventory_data.append(track_record)
            
            # Update statistics
            if file_info['file_exists']:
                total_size_mb += file_info['file_size_mb']
            
            if track['duration']:
                total_duration_seconds += track['duration']
            
            therapeutic_quality_counts[tag_analysis['therapeutic_quality']] += 1
            
            mood = track['mood'] or 'unknown'
            mood_counts[mood] = mood_counts.get(mood, 0) + 1
        
        # Create final inventory structure
        inventory = {
            'metadata': {
                'export_date': datetime.now().isoformat(),
                'total_tracks': len(tracks),
                'total_size_mb': round(total_size_mb, 2),
                'total_duration_hours': round(total_duration_seconds / 3600, 2),
                'inventory_version': '2.0',
                'description': 'NeuroTunes+ Complete Therapeutic Music Inventory'
            },
            'statistics': {
                'therapeutic_quality_distribution': therapeutic_quality_counts,
                'mood_distribution': mood_counts,
                'tracks_with_files': sum(1 for t in inventory_data if t['file_exists']),
                'tracks_missing_files': sum(1 for t in inventory_data if not t['file_exists']),
                'average_track_duration_minutes': round(total_duration_seconds / len(tracks) / 60, 2) if tracks else 0
            },
            'tracks': inventory_data
        }
        
        return inventory
    
    def export_json_inventory(self, inventory, filename='neurotunes_complete_inventory.json'):
        """Export inventory as JSON"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(inventory, f, indent=2, ensure_ascii=False)
        
        print(f"JSON inventory exported: {filename}")
        return filename
    
    def export_csv_inventory(self, inventory, filename='neurotunes_inventory.csv'):
        """Export inventory as CSV for spreadsheet analysis"""
        tracks = inventory['tracks']
        
        if not tracks:
            return None
        
        # Flatten the data for CSV
        csv_data = []
        for track in tracks:
            row = {
                'Track_ID': track['track_id'],
                'Title': track['title'],
                'Artist': track['artist'],
                'Album': track['album'],
                'Duration_Minutes': track['duration_minutes'],
                'Mood': track['mood'],
                'File_Exists': track['file_exists'],
                'File_Size_MB': track['file_size_mb'],
                'Therapeutic_Quality': track['therapeutic_quality'],
                'Therapeutic_Categories': ', '.join(track['therapeutic_categories']),
                'Tag_Count': track['tag_count'],
                'Valence': track['valence'],
                'Energy': track['energy'],
                'Binaural': track['binaural'],
                'Frequency': track['frequency'],
                'Audio_URL': track['audio_url'],
                'Filename': track['filename']
            }
            csv_data.append(row)
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            if csv_data:
                writer = csv.DictWriter(f, fieldnames=csv_data[0].keys())
                writer.writeheader()
                writer.writerows(csv_data)
        
        print(f"CSV inventory exported: {filename}")
        return filename
    
    def generate_quality_report(self, inventory):
        """Generate quality assessment report"""
        tracks = inventory['tracks']
        
        # Quality issues
        issues = {
            'missing_files': [t for t in tracks if not t['file_exists']],
            'no_therapeutic_tags': [t for t in tracks if not t['therapeutic_tags']],
            'low_therapeutic_quality': [t for t in tracks if t['therapeutic_quality'] == 'low'],
            'missing_vad_values': [t for t in tracks if t['valence'] is None or t['energy'] is None],
            'no_mood_classification': [t for t in tracks if not t['mood']]
        }
        
        report = {
            'quality_assessment': {
                'total_tracks_analyzed': len(tracks),
                'tracks_meeting_therapeutic_standards': len([t for t in tracks if t['therapeutic_quality'] in ['high', 'medium']]),
                'tracks_needing_attention': sum(len(issue_tracks) for issue_tracks in issues.values())
            },
            'issues_found': {
                issue_type: len(issue_tracks) 
                for issue_type, issue_tracks in issues.items()
            },
            'recommendations': []
        }
        
        # Generate recommendations
        if issues['missing_files']:
            report['recommendations'].append(f"Re-upload {len(issues['missing_files'])} missing audio files")
        
        if issues['no_therapeutic_tags']:
            report['recommendations'].append(f"Add therapeutic tags to {len(issues['no_therapeutic_tags'])} tracks")
        
        if issues['low_therapeutic_quality']:
            report['recommendations'].append(f"Review {len(issues['low_therapeutic_quality'])} tracks with low therapeutic quality")
        
        if issues['missing_vad_values']:
            report['recommendations'].append("Perform spectral analysis to calculate VAD values for all tracks")
        
        return report

def main():
    """Main execution function"""
    exporter = MusicInventoryExporter()
    
    print("NeuroTunes+ Music Inventory Export")
    print("=" * 50)
    
    # Create comprehensive inventory
    inventory = exporter.create_comprehensive_inventory()
    
    # Export in multiple formats
    json_file = exporter.export_json_inventory(inventory)
    csv_file = exporter.export_csv_inventory(inventory)
    
    # Generate quality report
    quality_report = exporter.generate_quality_report(inventory)
    
    # Export quality report
    with open('neurotunes_quality_report.json', 'w') as f:
        json.dump(quality_report, f, indent=2)
    
    # Print summary
    print("\n" + "=" * 50)
    print("INVENTORY EXPORT COMPLETE")
    print(f"Total tracks: {inventory['metadata']['total_tracks']}")
    print(f"Total size: {inventory['metadata']['total_size_mb']} MB")
    print(f"Total duration: {inventory['metadata']['total_duration_hours']} hours")
    print(f"Tracks meeting therapeutic standards: {quality_report['quality_assessment']['tracks_meeting_therapeutic_standards']}")
    print(f"JSON export: {json_file}")
    print(f"CSV export: {csv_file}")
    print("Quality report: neurotunes_quality_report.json")
    
    if quality_report['recommendations']:
        print("\nRecommendations:")
        for rec in quality_report['recommendations']:
            print(f"- {rec}")

if __name__ == "__main__":
    main()