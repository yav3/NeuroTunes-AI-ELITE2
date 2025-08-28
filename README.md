# NeuroTunes+ Database Management Scripts

This directory contains Python scripts for managing and maintaining the NeuroTunes+ PostgreSQL database.

## Track Deduplication Script

The `dedupe_tracks.py` script helps analyze and remove duplicate tracks from your music library.

### Prerequisites

1. **Python 3.x** (you've already installed this with `brew install python`)
2. **Required packages**:
   ```bash
   pip install -r requirements.txt
   ```

### Usage

1. **Run the script**:
   ```bash
   python dedupe_tracks.py
   ```

2. **The script will**:
   - Connect to your PostgreSQL database using `DATABASE_URL`
   - Show database statistics
   - Analyze tracks for duplicates using title + artist + duration fingerprints
   - Display detailed duplicate analysis
   - Offer options to export or remove duplicates

### Features

- **Safe Analysis**: Non-destructive duplicate detection
- **Fingerprint Matching**: Uses title, artist, and duration for accurate matching
- **Dry Run Mode**: Test removal without actually deleting data
- **Export Options**: Save duplicate data to JSON for review
- **Database Statistics**: View comprehensive library metrics

### Safety Features

- **Dry Run First**: Always shows what would be deleted before actual removal
- **Confirmation Required**: Requires typing 'YES' for permanent deletion
- **Backup Recommendations**: Always backup before running destructive operations

### Example Output

```
NeuroTunes+ Track Deduplication Tool
==================================================

DATABASE STATISTICS
==================================================
Total Tracks: 1,247
Unique Artists: 342
Unique Moods: 8

Tracks by Mood:
  calm: 312
  energetic: 198
  focused: 156
  peaceful: 134

Found 23 tracks in database
Found 3 duplicate groups
Total duplicate tracks: 7

DUPLICATE ANALYSIS RESULTS
================================================================================

Group 1: 2 duplicate(s)
   Original: 'Ocean Waves' by Therapeutic Sounds
   Duration: 240s
   Created: 2025-01-15 10:30:00

   Duplicates to remove:
     1. ID 45 - Created: 2025-01-16 14:22:00
     2. ID 78 - Created: 2025-01-17 09:15:00
```

### Integration with NeuroTunes+

This script directly connects to your existing PostgreSQL database and maintains all therapeutic metadata and relationships. It's designed to work seamlessly with your existing music wellness platform.

### Security Note

The script uses your existing `DATABASE_URL` environment variable, so no additional configuration is needed. It maintains all security protocols of your existing database connection.