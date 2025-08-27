<?php
/**
 * Audio File Management and Integration
 * Handles uploaded audio files and integrates with enhanced analysis
 */

require_once 'includes/enhanced-audio-analysis.php';

class AudioFileManager {
    
    private $uploadDir = 'assets/uploads/audio/';
    private $allowedExtensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'];
    private $maxFileSize = 50 * 1024 * 1024; // 50MB
    private $analyzer;
    
    public function __construct() {
        $this->analyzer = new EnhancedAudioAnalyzer();
        $this->ensureUploadDirectory();
    }
    
    private function ensureUploadDirectory() {
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }
    
    public function processUploadedFile($file, $trackInfo = []) {
        // Validate file
        $validation = $this->validateFile($file);
        if (!$validation['valid']) {
            return ['success' => false, 'error' => $validation['error']];
        }
        
        // Generate unique filename
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $filename = $this->generateUniqueFilename($extension);
        $filepath = $this->uploadDir . $filename;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            return ['success' => false, 'error' => 'Failed to save file'];
        }
        
        // Analyze audio features
        $audioFeatures = $this->analyzer->analyzeAudioFile($filepath);
        
        // Prepare track data
        $trackData = array_merge($trackInfo, $audioFeatures, [
            'audio_url' => 'assets/uploads/audio/' . $filename,
            'file_size' => filesize($filepath),
            'file_format' => $extension,
            'upload_date' => date('Y-m-d H:i:s')
        ]);
        
        return [
            'success' => true,
            'filename' => $filename,
            'filepath' => $filepath,
            'track_data' => $trackData,
            'audio_features' => $audioFeatures
        ];
    }
    
    private function validateFile($file) {
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['valid' => false, 'error' => 'File upload error: ' . $file['error']];
        }
        
        // Check file size
        if ($file['size'] > $this->maxFileSize) {
            return ['valid' => false, 'error' => 'File too large. Maximum size: ' . ($this->maxFileSize / 1024 / 1024) . 'MB'];
        }
        
        // Check file extension
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $this->allowedExtensions)) {
            return ['valid' => false, 'error' => 'Invalid file type. Allowed: ' . implode(', ', $this->allowedExtensions)];
        }
        
        // Basic MIME type check
        $allowedMimes = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 
            'audio/flac', 'audio/m4a', 'audio/aac', 'audio/x-wav'
        ];
        
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $allowedMimes)) {
            return ['valid' => false, 'error' => 'Invalid audio file format'];
        }
        
        return ['valid' => true];
    }
    
    private function generateUniqueFilename($extension) {
        do {
            $filename = uniqid('track_') . '_' . time() . '.' . $extension;
        } while (file_exists($this->uploadDir . $filename));
        
        return $filename;
    }
    
    public function importProvidedAudioFiles() {
        // Import the audio files provided by user
        $providedFiles = [
            'relaxing_wave.mp3' => [
                'title' => 'Relaxing Wave',
                'artist' => 'Therapeutic Sounds',
                'genre' => 'ambient',
                'mood' => 'calm',
                'description' => 'Soothing ocean wave sounds for deep relaxation'
            ],
            'focus_alpha.ogg' => [
                'title' => 'Focus Alpha',
                'artist' => 'Brainwave Research Lab',
                'genre' => 'binaural',
                'mood' => 'focused',
                'description' => 'Alpha wave frequencies for enhanced concentration'
            ],
            'energize_beat.wav' => [
                'title' => 'Energize Beat',
                'artist' => 'Wellness Rhythms',
                'genre' => 'electronic',
                'mood' => 'energetic',
                'description' => 'High-energy beats for mood enhancement'
            ]
        ];
        
        $importResults = [];
        
        foreach ($providedFiles as $filename => $metadata) {
            $sourcePath = 'assets/audio/' . $filename;
            
            if (file_exists($sourcePath)) {
                // Analyze the existing file
                $audioFeatures = $this->analyzer->analyzeAudioFile($sourcePath);
                
                // Combine metadata with analyzed features
                $trackData = array_merge($metadata, $audioFeatures, [
                    'audio_url' => $sourcePath,
                    'file_size' => filesize($sourcePath),
                    'import_date' => date('Y-m-d H:i:s')
                ]);
                
                $importResults[] = [
                    'filename' => $filename,
                    'status' => 'imported',
                    'track_data' => $trackData
                ];
            } else {
                $importResults[] = [
                    'filename' => $filename,
                    'status' => 'not_found',
                    'error' => 'File not found in assets/audio/'
                ];
            }
        }
        
        return $importResults;
    }
    
    public function createAudioManifest() {
        $manifest = [
            'created_at' => date('Y-m-d H:i:s'),
            'audio_directory' => $this->uploadDir,
            'supported_formats' => $this->allowedExtensions,
            'max_file_size_mb' => $this->maxFileSize / 1024 / 1024,
            'files' => []
        ];
        
        // Scan audio directory
        if (is_dir($this->uploadDir)) {
            $files = scandir($this->uploadDir);
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..' && !is_dir($this->uploadDir . $file)) {
                    $filepath = $this->uploadDir . $file;
                    $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                    
                    if (in_array($extension, $this->allowedExtensions)) {
                        $manifest['files'][] = [
                            'filename' => $file,
                            'size_bytes' => filesize($filepath),
                            'format' => $extension,
                            'stream_url' => 'https://yourdomain.com/' . $filepath,
                            'last_modified' => date('Y-m-d H:i:s', filemtime($filepath))
                        ];
                    }
                }
            }
        }
        
        return $manifest;
    }
    
    public function generateStreamingURL($filename) {
        $filepath = $this->uploadDir . $filename;
        if (file_exists($filepath)) {
            return 'https://yourdomain.com/' . $filepath;
        }
        return null;
    }
    
    public function getAudioFileInfo($filename) {
        $filepath = $this->uploadDir . $filename;
        if (!file_exists($filepath)) {
            return null;
        }
        
        $audioFeatures = $this->analyzer->analyzeAudioFile($filepath);
        
        return [
            'filename' => $filename,
            'filepath' => $filepath,
            'size_bytes' => filesize($filepath),
            'format' => strtolower(pathinfo($filename, PATHINFO_EXTENSION)),
            'stream_url' => $this->generateStreamingURL($filename),
            'audio_features' => $audioFeatures,
            'last_modified' => date('Y-m-d H:i:s', filemtime($filepath))
        ];
    }
}

// Usage example for integration
if (isset($_POST['import_audio_files'])) {
    $audioManager = new AudioFileManager();
    $importResults = $audioManager->importProvidedAudioFiles();
    
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'import_results' => $importResults,
        'manifest' => $audioManager->createAudioManifest()
    ]);
    exit;
}
?>