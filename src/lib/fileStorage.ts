/**
 * File Storage Utility for Audio Files
 * 
 * This utility handles storing and retrieving audio files using IndexedDB
 * to persist files across browser sessions, since blob URLs are not persistent.
 */

interface StoredFile {
  id: string;
  file: File;
  metadata: {
    title: string;
    artist: string;
    album: string;
    year?: string;
    duration: number;
    artworkUrl?: string;
    dominantColor: string;
  };
  createdAt: number;
}

class FileStorageManager {
  private dbName = 'MusicPlayerDB';
  private version = 1;
  private storeName = 'audioFiles';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store for audio files
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async storeFile(file: File, metadata: StoredFile['metadata']): Promise<string> {
    if (!this.db) {
      await this.init();
    }

    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const storedFile: StoredFile = {
      id: fileId,
      file,
      metadata,
      createdAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(storedFile);

      request.onsuccess = () => {
        console.log(`File stored with ID: ${fileId}`);
        resolve(fileId);
      };

      request.onerror = () => {
        console.error('Failed to store file:', request.error);
        reject(request.error);
      };
    });
  }

  async getFile(fileId: string): Promise<StoredFile | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(fileId);

      request.onsuccess = () => {
        const result = request.result as StoredFile | undefined;
        resolve(result || null);
      };

      request.onerror = () => {
        console.error('Failed to retrieve file:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(fileId);

      request.onsuccess = () => {
        console.log(`File deleted: ${fileId}`);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete file:', request.error);
        reject(request.error);
      };
    });
  }

  async getAllFileIds(): Promise<string[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        const keys = request.result as string[];
        resolve(keys);
      };

      request.onerror = () => {
        console.error('Failed to get file IDs:', request.error);
        reject(request.error);
      };
    });
  }

  async clearAllFiles(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('All files cleared from storage');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to clear files:', request.error);
        reject(request.error);
      };
    });
  }
}

// Export singleton instance
export const fileStorage = new FileStorageManager();

/**
 * Check if IndexedDB is supported
 */
export function isIndexedDBSupported(): boolean {
  return 'indexedDB' in window;
}

/**
 * Fallback for browsers that don't support IndexedDB
 * Uses localStorage with base64 encoding (limited storage)
 */
export class FallbackFileStorage {
  private maxFileSize = 5 * 1024 * 1024; // 5MB limit for localStorage fallback

  async storeFile(file: File, metadata: StoredFile['metadata']): Promise<string> {
    if (file.size > this.maxFileSize) {
      throw new Error('File too large for fallback storage (max 5MB)');
    }

    const fileId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const fileData = {
            id: fileId,
            data: reader.result,
            metadata,
            createdAt: Date.now(),
          };
          
          localStorage.setItem(`audio_file_${fileId}`, JSON.stringify(fileData));
          resolve(fileId);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async getFile(fileId: string): Promise<StoredFile | null> {
    try {
      const data = localStorage.getItem(`audio_file_${fileId}`);
      if (!data) return null;

      const fileData = JSON.parse(data);
      
      // Convert data URL back to File
      const response = await fetch(fileData.data);
      const blob = await response.blob();
      const file = new File([blob], 'audio.mp3', { type: blob.type });

      return {
        id: fileId,
        file,
        metadata: fileData.metadata,
        createdAt: fileData.createdAt,
      };
    } catch (error) {
      console.error('Failed to retrieve fallback file:', error);
      return null;
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    localStorage.removeItem(`audio_file_${fileId}`);
  }

  async getAllFileIds(): Promise<string[]> {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('audio_file_'));
    return keys.map(key => key.replace('audio_file_', ''));
  }

  async clearAllFiles(): Promise<void> {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('audio_file_'));
    keys.forEach(key => localStorage.removeItem(key));
  }
}

export const fallbackFileStorage = new FallbackFileStorage();
