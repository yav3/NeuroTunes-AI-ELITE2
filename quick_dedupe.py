#!/usr/bin/env python3
"""
Quick duplicate detection based on filename patterns and file size
Fast analysis for NeuroTunes music library
"""

import os
import json
import hashlib
from pathlib import Path
from collections import defaultdict
from datetime import datetime

def analyze_filename_patterns(music_dir="music_library"):
    """Analyze filename patterns to detect potential duplicates"""
    music_path = Path(music_dir)
    
    if not music_path.exists():
        print(f"Music directory {music_dir} not found!")
        return
    
    files = list(music_path.glob("*.mp3"))
    print(f"Analyzing {len(files)} MP3 files...")
    
    # Group by patterns
    title_groups = defaultdict(list)
    size_groups = defaultdict(list)
    
    for file_path in files:
        file_size = file_path.stat().st_size
        filename = file_path.name
        
        # Extract probable title (first part before semicolon or underscore)
        title_part = filename.split(';')[0].split('_')[0].strip()
        title_clean = title_part.lower().replace(' ', '').replace('-', '')
        
        title_groups[title_clean].append({
            'path': str(file_path),
            'name': filename,
            'size': file_size,
            'title_part': title_part
        })
        
        # Group by exact file size
        size_groups[file_size].append({
            'path': str(file_path),
            'name': filename,
            'size': file_size
        })
    
    # Find duplicates
    duplicate_groups = []
    
    # Title-based duplicates
    for title, files_list in title_groups.items():
        if len(files_list) > 1:
            # Sort by file size (largest first)
            files_list.sort(key=lambda x: x['size'], reverse=True)
            duplicate_groups.append({
                'type': 'title_similarity',
                'title': title,
                'files': files_list,
                'keep': files_list[0]['path'],
                'remove': [f['path'] for f in files_list[1:]]
            })
    
    # Size-based duplicates (exact same size)
    for size, files_list in size_groups.items():
        if len(files_list) > 1:
            duplicate_groups.append({
                'type': 'exact_size',
                'size_mb': size / 1024 / 1024,
                'files': files_list,
                'keep': files_list[0]['path'],
                'remove': [f['path'] for f in files_list[1:]]
            })
    
    # Generate report
    report = {
        'analysis_date': datetime.now().isoformat(),
        'total_files': len(files),
        'duplicate_groups': duplicate_groups,
        'summary': {
            'title_duplicates': len([g for g in duplicate_groups if g['type'] == 'title_similarity']),
            'size_duplicates': len([g for g in duplicate_groups if g['type'] == 'exact_size']),
            'total_to_remove': sum(len(g['remove']) for g in duplicate_groups),
            'space_to_save_mb': sum(
                sum(f['size'] for f in g['files'][1:]) 
                for g in duplicate_groups if g['type'] == 'title_similarity'
            ) / 1024 / 1024
        }
    }
    
    # Save report
    report_file = f"quick_dedupe_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    # Print summary
    print(f"\nQuick Duplicate Analysis Complete:")
    print(f"Title-based duplicate groups: {report['summary']['title_duplicates']}")
    print(f"Size-based duplicate groups: {report['summary']['size_duplicates']}")
    print(f"Files that could be removed: {report['summary']['total_to_remove']}")
    print(f"Estimated space savings: {report['summary']['space_to_save_mb']:.2f} MB")
    
    if duplicate_groups:
        print(f"\nSample duplicates found:")
        for i, group in enumerate(duplicate_groups[:5]):  # Show first 5
            print(f"  Group {i+1} ({group['type']}):")
            for file_info in group['files']:
                status = "KEEP" if file_info['path'] == group['keep'] else "REMOVE"
                print(f"    [{status}] {Path(file_info['path']).name}")
        
        # Auto-remove duplicates for script execution
        print(f"\nAuto-removing {report['summary']['total_to_remove']} duplicate files...")
        if True:  # Auto-approve for batch processing
            removed_count = 0
            for group in duplicate_groups:
                for remove_path in group['remove']:
                    try:
                        os.remove(remove_path)
                        print(f"Removed: {Path(remove_path).name}")
                        removed_count += 1
                    except Exception as e:
                        print(f"Error removing {remove_path}: {e}")
            
            print(f"\nRemoved {removed_count} duplicate files")
    
    print(f"Report saved: {report_file}")
    return report

if __name__ == "__main__":
    analyze_filename_patterns()