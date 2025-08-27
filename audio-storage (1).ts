
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Track } from '@shared/schema';

export interface AudioFile {
  id: string;
  filename: string;
  file_url: string;
  originalName: string;
  size: number;
  mimetype: string;
  uploadedAt: Date;
}

export class AudioStorageManager {
  private audioDir: string;
  private publicPath: string;

  constructor() {
    this.audioDir = path.join(process.cwd(), 'public', 'audio');
    this.publicPath = '/audio';
    
    // Ensure audio directory exists
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  /**
   * Store an uploaded audio file
   */
  async storeAudioFile(file: Express.Multer.File): Promise<AudioFile> {
    const fileId = randomUUID();
    const extension = path.extname(file.originalname);
    const filename = `${fileId}${extension}`;
    const filePath = path.join(this.audioDir, filename);
    
    // Write file to disk
    fs.writeFileSync(filePath, file.buffer);
    
    return {
      id: fileId,
      filename,
      file_url: `${this.publicPath}/${filename}`,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    };
  }

  /**
   * Get audio file stream
   */
  getAudioStream(filename: string): fs.ReadStream | null {
    const filePath = path.join(this.audioDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    return fs.createReadStream(filePath);
  }

  /**
   * Check if audio file exists
   */
  exists(filename: string): boolean {
    const filePath = path.join(this.audioDir, filename);
    return fs.existsSync(filePath);
  }

  /**
   * Delete audio file
   */
  deleteAudioFile(filename: string): boolean {
    try {
      const filePath = path.join(this.audioDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting audio file:', error);
      return false;
    }
  }

  /**
   * Get file info
   */
  getFileInfo(filename: string): { size: number; mimetype: string } | null {
    try {
      const filePath = path.join(this.audioDir, filename);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      
      const stats = fs.statSync(filePath);
      const extension = path.extname(filename).toLowerCase();
      
      let mimetype = 'audio/mpeg'; // default
      if (extension === '.wav') mimetype = 'audio/wav';
      if (extension === '.ogg') mimetype = 'audio/ogg';
      if (extension === '.flac') mimetype = 'audio/flac';
      
      return {
        size: stats.size,
        mimetype
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Create demo audio files from your uploaded file
   */
  async createDemoAudioFiles(): Promise<Track[]> {
    const demoTracks: Track[] = [
      {
        id: 1,
        title: "Therapeutic Meditation",
        artist: "Wellness Audio",
        album: "Healing Sounds",
        duration: 300,
        genre: "Meditation",
        mood: "calm",
        energy: 0.2,
        valence: 0.8,
        tempo: 60,
        audioUrl: "/audio/sample-therapeutic.mp3",
        coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
        tags: ["meditation", "calming", "therapeutic"]
      },
      {
        id: 2,
        title: "Focus Enhancement",
        artist: "Brain Waves",
        album: "Cognitive Support",
        duration: 420,
        genre: "Ambient",
        mood: "focus",
        energy: 0.4,
        valence: 0.7,
        tempo: 80,
        audioUrl: "/audio/sample-therapeutic.mp3",
        coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
        tags: ["focus", "concentration", "ambient"]
      },
      {
        id: 3,
        title: "Anxiety Relief",
        artist: "Calm Sounds",
        album: "Stress Relief",
        duration: 360,
        genre: "Nature",
        mood: "anxiety",
        energy: 0.1,
        valence: 0.6,
        tempo: 55,
        audioUrl: "/audio/sample-therapeutic.mp3",
        coverUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
        tags: ["anxiety", "relief", "nature"]
      }
    ];

    return demoTracks;
  }
}

export const audioStorage = new AudioStorageManager();
