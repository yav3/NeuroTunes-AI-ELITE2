#!/usr/bin/env python3
"""
NeuroTunes+ Track Deduplication Script
Analyzes and removes duplicate tracks from the PostgreSQL database
"""

import os
import json
import hashlib
from collections import defaultdict
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class NeuroTunesDeduplicator:
    def __init__(self):
        self.db_url = os.getenv('DATABASE_URL')
        if not self.db_url:
            raise ValueError("DATABASE_URL environment variable is required")
        
        self.conn = psycopg2.connect(self.db_url)
        self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
    
    def create_fingerprint(self, track):
        """Create a unique fingerprint for each track"""
        # Normalize title and artist for better matching
        title = str(track.get('title', '')).strip().lower()
        artist = str(track.get('artist', '')).strip().lower()
        duration = track.get('duration', 0)
        
        # Create fingerprint from title + artist + duration
        fingerprint_data = f"{title}|{artist}|{duration}"
        return hashlib.md5(fingerprint_data.encode()).hexdigest()
    
    def fetch_all_tracks(self):
        """Fetch all tracks from the database"""
        query = """
        SELECT id, title, artist, duration, mood, genre, 
               audio_url, image_url, created_at, updated_at
        FROM tracks
        ORDER BY created_at DESC
        """
        
        self.cursor.execute(query)
        tracks = self.cursor.fetchall()
        
        print(f"Found {len(tracks)} tracks in database")
        return tracks
    
    def analyze_duplicates(self, tracks):
        """Analyze tracks for duplicates"""
        fingerprint_groups = defaultdict(list)
        
        # Group tracks by fingerprint
        for track in tracks:
            fingerprint = self.create_fingerprint(track)
            fingerprint_groups[fingerprint].append(dict(track))
        
        # Find duplicates
        duplicates = {}
        total_duplicates = 0
        
        for fingerprint, group in fingerprint_groups.items():
            if len(group) > 1:
                # Keep the oldest track (first created)
                group.sort(key=lambda x: x.get('created_at', datetime.min))
                original = group[0]
                dupes = group[1:]
                
                duplicates[fingerprint] = {
                    'original': original,
                    'duplicates': dupes,
                    'count': len(dupes)
                }
                total_duplicates += len(dupes)
        
        print(f"Found {len(duplicates)} duplicate groups")
        print(f"Total duplicate tracks: {total_duplicates}")
        
        return duplicates
    
    def display_duplicates(self, duplicates):
        """Display duplicate analysis results"""
        if not duplicates:
            print("No duplicates found!")
            return
        
        print("\n" + "="*80)
        print("DUPLICATE ANALYSIS RESULTS")
        print("="*80)
        
        for i, (fingerprint, group) in enumerate(duplicates.items(), 1):
            print(f"\nGroup {i}: {group['count']} duplicate(s)")
            print(f"   Original: '{group['original']['title']}' by {group['original']['artist']}")
            print(f"   Duration: {group['original']['duration']}s")
            print(f"   Created: {group['original']['created_at']}")
            
            print("   Duplicates to remove:")
            for j, dupe in enumerate(group['duplicates'], 1):
                print(f"     {j}. ID {dupe['id']} - Created: {dupe['created_at']}")
    
    def remove_duplicates(self, duplicates, dry_run=True):
        """Remove duplicate tracks from database"""
        if not duplicates:
            print("No duplicates to remove")
            return
        
        duplicate_ids = []
        for group in duplicates.values():
            for dupe in group['duplicates']:
                duplicate_ids.append(dupe['id'])
        
        if dry_run:
            print(f"\nDRY RUN: Would remove {len(duplicate_ids)} duplicate tracks")
            print("Track IDs to remove:", duplicate_ids)
            return
        
        print(f"\nRemoving {len(duplicate_ids)} duplicate tracks...")
        
        try:
            # Delete duplicates
            query = "DELETE FROM tracks WHERE id = ANY(%s)"
            self.cursor.execute(query, (duplicate_ids,))
            
            # Commit changes
            self.conn.commit()
            
            print(f"Successfully removed {len(duplicate_ids)} duplicate tracks")
            
        except Exception as e:
            print(f"Error removing duplicates: {e}")
            self.conn.rollback()
    
    def export_duplicates(self, duplicates, filename="duplicate_tracks.json"):
        """Export duplicate data to JSON file"""
        if not duplicates:
            print("No duplicates to export")
            return
        
        # Convert datetime objects to strings for JSON serialization
        export_data = {}
        for fingerprint, group in duplicates.items():
            export_data[fingerprint] = {
                'original': self._serialize_track(group['original']),
                'duplicates': [self._serialize_track(dupe) for dupe in group['duplicates']],
                'count': group['count']
            }
        
        with open(filename, 'w') as f:
            json.dump(export_data, f, indent=2, default=str)
        
        print(f"Exported duplicate data to {filename}")
    
    def _serialize_track(self, track):
        """Convert track data for JSON serialization"""
        return {
            'id': track['id'],
            'title': track['title'],
            'artist': track['artist'],
            'duration': track['duration'],
            'mood': track['mood'],
            'genre': track['genre'],
            'created_at': str(track['created_at']),
            'updated_at': str(track['updated_at'])
        }
    
    def get_database_stats(self):
        """Get database statistics"""
        stats_queries = {
            'total_tracks': "SELECT COUNT(*) FROM tracks",
            'unique_artists': "SELECT COUNT(DISTINCT artist) FROM tracks",
            'unique_moods': "SELECT COUNT(DISTINCT mood) FROM tracks WHERE mood IS NOT NULL",
            'tracks_by_mood': """
                SELECT mood, COUNT(*) as count 
                FROM tracks 
                WHERE mood IS NOT NULL 
                GROUP BY mood 
                ORDER BY count DESC
            """
        }
        
        stats = {}
        for key, query in stats_queries.items():
            if key == 'tracks_by_mood':
                self.cursor.execute(query)
                stats[key] = dict(self.cursor.fetchall())
            else:
                self.cursor.execute(query)
                stats[key] = self.cursor.fetchone()[0]
        
        return stats
    
    def display_stats(self, stats):
        """Display database statistics"""
        print("\n" + "="*50)
        print("DATABASE STATISTICS")
        print("="*50)
        print(f"Total Tracks: {stats['total_tracks']}")
        print(f"Unique Artists: {stats['unique_artists']}")
        print(f"Unique Moods: {stats['unique_moods']}")
        
        print("\nTracks by Mood:")
        for mood, count in stats['tracks_by_mood'].items():
            print(f"  {mood}: {count}")
    
    def close(self):
        """Close database connection"""
        self.cursor.close()
        self.conn.close()

def main():
    """Main execution function"""
    print("NeuroTunes+ Track Deduplication Tool")
    print("="*50)
    
    try:
        # Initialize deduplicator
        deduplicator = NeuroTunesDeduplicator()
        
        # Show database stats
        stats = deduplicator.get_database_stats()
        deduplicator.display_stats(stats)
        
        # Fetch and analyze tracks
        tracks = deduplicator.fetch_all_tracks()
        duplicates = deduplicator.analyze_duplicates(tracks)
        
        # Display results
        deduplicator.display_duplicates(duplicates)
        
        if duplicates:
            print("\n" + "="*50)
            print("ACTIONS AVAILABLE")
            print("="*50)
            print("1. Export duplicates to JSON")
            print("2. Remove duplicates (DRY RUN)")
            print("3. Remove duplicates (PERMANENT)")
            print("4. Exit")
            
            choice = input("\nEnter your choice (1-4): ").strip()
            
            if choice == '1':
                deduplicator.export_duplicates(duplicates)
            elif choice == '2':
                deduplicator.remove_duplicates(duplicates, dry_run=True)
            elif choice == '3':
                confirm = input("Are you sure you want to permanently delete duplicates? (type 'YES'): ")
                if confirm == 'YES':
                    deduplicator.remove_duplicates(duplicates, dry_run=False)
                else:
                    print("Operation cancelled")
            elif choice == '4':
                print("Exiting...")
            else:
                print("Invalid choice")
        
        deduplicator.close()
        
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())