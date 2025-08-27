
# Audio Export Process

## Directory Structure
- `export_audio/` - Contains exported audio files for deployment
- `uploads/` - Original uploaded audio files

## Export Commands Used
```bash
mkdir -p export_audio
find uploads/ \( -name "*.mp3" -o -name "*.wav" -o -name "*.flac" -o -name "*.m4a" -o -name "*.ogg" -o -name "*.aac" \) -exec cp {} export_audio/ \;
```

## Notes
- Audio files are gitignored for repository size management
- Use the export directory for deployment to external hosting
