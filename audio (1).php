
<?php
// Audio streaming endpoint for cPanel
$track_id = $_GET['id'] ?? null;
$filename = $_GET['file'] ?? null;

if (!$track_id && !$filename) {
    http_response_code(404);
    exit('Audio file not found');
}

// Database connection for track lookup
if ($track_id) {
    $config = [
        'db_host' => 'localhost',
        'db_name' => $_SERVER['MYSQL_DATABASE'] ?? 'neurotunes_db',
        'db_user' => $_SERVER['MYSQL_USERNAME'] ?? 'root',
        'db_pass' => $_SERVER['MYSQL_PASSWORD'] ?? ''
    ];
    
    try {
        $pdo = new PDO(
            "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4",
            $config['db_user'],
            $config['db_pass']
        );
        
        $stmt = $pdo->prepare("SELECT filename, file_url FROM music_tracks WHERE id = ?");
        $stmt->execute([$track_id]);
        $track = $stmt->fetch();
        
        if ($track) {
            $filename = $track['filename'] ?: basename($track['file_url']);
        }
    } catch (Exception $e) {
        // Fallback to direct filename if database fails
    }
}

if (!$filename) {
    http_response_code(404);
    exit('Audio file not found');
}

// Construct file path
$file_path = __DIR__ . '/uploads/' . $filename;

// Check if file exists
if (!file_exists($file_path)) {
    http_response_code(404);
    exit('Audio file not found');
}

// Get file info
$file_size = filesize($file_path);
$file_type = 'audio/mpeg'; // Default to MP3

// Determine content type based on extension
$ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
switch ($ext) {
    case 'mp3':
        $file_type = 'audio/mpeg';
        break;
    case 'wav':
        $file_type = 'audio/wav';
        break;
    case 'flac':
        $file_type = 'audio/flac';
        break;
    case 'm4a':
        $file_type = 'audio/mp4';
        break;
    case 'ogg':
        $file_type = 'audio/ogg';
        break;
}

// Handle range requests for audio streaming
$range = $_SERVER['HTTP_RANGE'] ?? null;

if ($range) {
    // Parse range header
    preg_match('/bytes=(\d+)-(\d*)/', $range, $matches);
    $start = intval($matches[1]);
    $end = $matches[2] ? intval($matches[2]) : $file_size - 1;
    $length = $end - $start + 1;
    
    // Set headers for partial content
    header('HTTP/1.1 206 Partial Content');
    header('Content-Range: bytes ' . $start . '-' . $end . '/' . $file_size);
    header('Content-Length: ' . $length);
    header('Content-Type: ' . $file_type);
    header('Accept-Ranges: bytes');
    
    // Output file chunk
    $file = fopen($file_path, 'rb');
    fseek($file, $start);
    $buffer = 8192;
    while (!feof($file) && $length > 0) {
        $read = min($buffer, $length);
        echo fread($file, $read);
        $length -= $read;
        flush();
    }
    fclose($file);
} else {
    // Serve complete file
    header('Content-Length: ' . $file_size);
    header('Content-Type: ' . $file_type);
    header('Accept-Ranges: bytes');
    header('Cache-Control: public, max-age=86400');
    
    readfile($file_path);
}

exit;
?>
