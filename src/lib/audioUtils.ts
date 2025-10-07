export interface AudioMetadata {
  title: string;
  artist: string;
  album: string;
  year?: string;
  artworkUrl?: string;
  duration: number;
}

// Curated placeholder artworks (~20 abstract/gradient/vibrant images)
// Each artwork is paired with a matching dominant color extracted from the image
export const FALLBACK_ARTWORKS = [
  'https://images.unsplash.com/photo-1648298073530-f9da02e84deb?w=600&q=80', // 1. Abstract gradient
  'https://images.unsplash.com/photo-1618416094752-977e845b237a?w=600&q=80', // 2. Vinyl record
  'https://images.unsplash.com/photo-1662288346057-6190cf5d7b42?w=600&q=80', // 3. Neon lights
  'https://images.unsplash.com/photo-1653454773571-e6937b508048?w=600&q=80', // 4. Wave frequency
  'https://images.unsplash.com/photo-1595059168836-4ef5276c5b62?w=600&q=80', // 5. Cosmic space
  'https://images.unsplash.com/photo-1603847734787-9e8a3f3e9d60?w=600&q=80', // 6. Holographic
  'https://images.unsplash.com/photo-1633492950690-3cb247f76703?w=600&q=80', // 7. Minimalist waves
  'https://images.unsplash.com/photo-1510759704643-849552bf3b66?w=600&q=80', // 8. Music album
  'https://images.unsplash.com/photo-1601885763312-e6fbc36ce2cc?w=600&q=80', // 9. Vibrant sunset
  'https://images.unsplash.com/photo-1613565042636-28de04b02e8c?w=600&q=80', // 10. Neon purple pink
  'https://images.unsplash.com/photo-1611090285001-86450e05822e?w=600&q=80', // 11. Orange blue contrast
  'https://images.unsplash.com/photo-1681874457490-df1acfb39c88?w=600&q=80', // 12. Electric blue yellow
  'https://images.unsplash.com/photo-1683617142185-dd72fa410c8f?w=600&q=80', // 13. Red magenta
  'https://images.unsplash.com/photo-1627497157737-ca76f1eb12c2?w=600&q=80', // 14. Teal cyan wave
  'https://images.unsplash.com/photo-1713791257627-93a7a1a5fbdb?w=600&q=80', // 15. Green emerald
  'https://images.unsplash.com/photo-1644958622183-9d9b2cf0bd80?w=600&q=80', // 16. Golden hour
  'https://images.unsplash.com/photo-1598969880158-b05f958203a2?w=600&q=80', // 17. Indigo violet
  'https://images.unsplash.com/photo-1637487461916-ad26fd8d6b6e?w=600&q=80', // 18. Coral peach
  'https://images.unsplash.com/photo-1635806085670-39692e52bf76?w=600&q=80', // 19. Liquid color
  'https://images.unsplash.com/photo-1746309226499-439cdf9d9270?w=600&q=80', // 20. Geometric pattern
];

// Matching vibrant background colors extracted/inspired from each artwork
// Colors are chosen to match the dominant/vibrant tones in each image
export const FALLBACK_COLORS = [
  '#4A90A4', // 1. Deep teal blue (gradient)
  '#D83631', // 2. Bold red (vinyl)
  '#D946EF', // 3. Bright magenta (neon)
  '#3B82F6', // 4. Electric blue (wave)
  '#7C3AED', // 5. Deep purple (cosmic)
  '#EC4899', // 6. Hot pink (holographic)
  '#06B6D4', // 7. Cyan (waves)
  '#F59E0B', // 8. Amber (music)
  '#F97316', // 9. Orange (sunset)
  '#A855F7', // 10. Purple (neon purple)
  '#F59E0B', // 11. Orange (contrast)
  '#0EA5E9', // 12. Sky blue (electric)
  '#EF4444', // 13. Red (magenta)
  '#14B8A6', // 14. Teal (cyan wave)
  '#10B981', // 15. Emerald (green)
  '#FBBF24', // 16. Golden yellow (golden hour)
  '#6366F1', // 17. Indigo (violet)
  '#FB923C', // 18. Coral orange (peach)
  '#8B5CF6', // 19. Violet (liquid)
  '#6366F1', // 20. Indigo blue (geometric)
];

export function getFallbackArtwork(index?: number): string {
  if (index !== undefined) {
    return FALLBACK_ARTWORKS[index % FALLBACK_ARTWORKS.length];
  }
  return FALLBACK_ARTWORKS[Math.floor(Math.random() * FALLBACK_ARTWORKS.length)];
}

export function getFallbackColor(index?: number): string {
  if (index !== undefined) {
    return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  }
  return FALLBACK_COLORS[Math.floor(Math.random() * FALLBACK_COLORS.length)];
}

/**
 * Extract metadata from an MP3 file using Web Audio API and basic ID3 parsing
 * NOTE: Does NOT extract artwork from ID3 tags due to unreliability
 * Instead, artwork is assigned randomly from curated placeholders
 */
export async function extractMetadata(file: File): Promise<AudioMetadata> {
  return new Promise(async (resolve, reject) => {
    // Get duration using Audio element
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', async () => {
      const duration = audio.duration;
      
      try {
        // Try to extract ID3v2 tags (text only, no artwork)
        const metadata = await extractID3Tags(file);
        
        resolve({
          title: metadata.title || parseFilename(file.name).title,
          artist: metadata.artist || parseFilename(file.name).artist || 'Unknown Artist',
          album: metadata.album || 'Unknown Album',
          year: metadata.year,
          // Do NOT include artwork from ID3 - will be assigned randomly from placeholders
          artworkUrl: undefined,
          duration,
        });
      } catch (error) {
        console.warn('ID3 extraction failed, using filename:', error);
        
        // Fallback to filename parsing
        const { title, artist } = parseFilename(file.name);
        
        resolve({
          title,
          artist: artist || 'Unknown Artist',
          album: 'Unknown Album',
          duration,
        });
      }
      
      URL.revokeObjectURL(objectUrl);
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load audio file'));
    });
    
    audio.src = objectUrl;
  });
}

/**
 * Basic ID3v2 tag parser for browser
 */
async function extractID3Tags(file: File): Promise<Partial<AudioMetadata>> {
  const reader = new FileReader();
  
  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const view = new DataView(buffer);
        
        // Check for ID3v2 header
        const header = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2));
        if (header !== 'ID3') {
          resolve({});
          return;
        }
        
        // Parse ID3v2 tags
        const version = view.getUint8(3);
        const flags = view.getUint8(5);
        
        // Get tag size (synchsafe integer)
        const tagSize = (
          (view.getUint8(6) << 21) |
          (view.getUint8(7) << 14) |
          (view.getUint8(8) << 7) |
          view.getUint8(9)
        );
        
        let offset = 10;
        const metadata: Partial<AudioMetadata> = {};
        
        // Parse frames
        while (offset < tagSize + 10) {
          // Frame ID (4 bytes)
          const frameId = String.fromCharCode(
            view.getUint8(offset),
            view.getUint8(offset + 1),
            view.getUint8(offset + 2),
            view.getUint8(offset + 3)
          );
          
          if (frameId === '\x00\x00\x00\x00') break;
          
          // Frame size
          let frameSize: number;
          if (version === 4) {
            // ID3v2.4 uses synchsafe integers
            frameSize = (
              (view.getUint8(offset + 4) << 21) |
              (view.getUint8(offset + 5) << 14) |
              (view.getUint8(offset + 6) << 7) |
              view.getUint8(offset + 7)
            );
          } else {
            // ID3v2.3 uses regular integers
            frameSize = view.getUint32(offset + 4);
          }
          
          const frameFlags = view.getUint16(offset + 8);
          
          offset += 10;
          
          // Extract text frames
          if (frameSize > 0 && offset + frameSize <= buffer.byteLength) {
            const encoding = view.getUint8(offset);
            const textData = new Uint8Array(buffer, offset + 1, frameSize - 1);

            let text = '';
            try {
              if (encoding === 0) {
                // ISO-8859-1 (Latin-1)
                text = new TextDecoder('latin1').decode(textData);
              } else if (encoding === 1) {
                // UTF-16 with BOM
                text = new TextDecoder('utf-16').decode(textData);
              } else if (encoding === 2) {
                // UTF-16BE without BOM
                text = new TextDecoder('utf-16be').decode(textData);
              } else if (encoding === 3) {
                // UTF-8
                text = new TextDecoder('utf-8').decode(textData);
              }
            } catch (e) {
              // Fallback to UTF-8 if decoding fails
              try {
                text = new TextDecoder('utf-8').decode(textData);
              } catch {
                console.warn('Failed to decode text frame:', frameId);
              }
            }

            // Remove null terminators and clean up
            text = text.replace(/\x00+$/, '').trim();

            // Map frame IDs to metadata
            if (frameId === 'TIT2' && text) {
              metadata.title = text;
            } else if (frameId === 'TPE1' && text) {
              metadata.artist = text;
            } else if (frameId === 'TPE2' && text && !metadata.artist) {
              metadata.artist = text;
            } else if (frameId === 'TALB' && text) {
              metadata.album = text;
            } else if ((frameId === 'TYER' || frameId === 'TDRC') && text) {
              const yearMatch = text.match(/\d{4}/);
              if (yearMatch) {
                metadata.year = yearMatch[0];
              }
            }
            else if (frameId === 'APIC') {
              // Extract artwork
              try {
                const mimeEnd = textData.indexOf(0, 1);
                const mimeType = new TextDecoder().decode(textData.slice(1, mimeEnd));
                const pictureType = textData[mimeEnd + 1];
                const descEnd = textData.indexOf(0, mimeEnd + 2);
                const imageData = textData.slice(descEnd + 1);
                
                const blob = new Blob([imageData], { type: mimeType || 'image/jpeg' });
                metadata.artworkUrl = URL.createObjectURL(blob);
              } catch (error) {
                console.warn('Failed to extract artwork:', error);
              }
            }
          }
          
          offset += frameSize;
        }
        
        resolve(metadata);
      } catch (error) {
        console.warn('ID3 parsing error:', error);
        resolve({});
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    // Read first 50KB (enough for most ID3 tags)
    reader.readAsArrayBuffer(file.slice(0, 50000));
  });
}

/**
 * Parse filename to extract title and artist
 * Supports formats like "Artist - Title.mp3", "01 Artist - Title.mp3", or "Title.mp3"
 */
function parseFilename(filename: string): { title: string; artist?: string } {
  // Remove extension
  let nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

  // Remove common track number prefixes (e.g., "01 ", "01. ", "1 - ")
  nameWithoutExt = nameWithoutExt.replace(/^\d+[\s.-]+/, '');

  // Check for "Artist - Title" format
  if (nameWithoutExt.includes(' - ')) {
    const parts = nameWithoutExt.split(' - ');
    if (parts.length >= 2) {
      const artist = parts[0].trim();
      const title = parts.slice(1).join(' - ').trim();
      return { title, artist };
    }
  }

  // Check for "Artist_Title" format
  if (nameWithoutExt.includes('_')) {
    const parts = nameWithoutExt.split('_');
    if (parts.length >= 2) {
      const artist = parts[0].trim();
      const title = parts.slice(1).join(' ').trim();
      return { title, artist };
    }
  }

  return { title: nameWithoutExt.trim() };
}

/**
 * Extract dominant color from image URL using canvas
 */
export async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve('#6ABAD3'); // Fallback color
        return;
      }
      
      // Scale down for performance
      const size = 50;
      canvas.width = size;
      canvas.height = size;
      
      ctx.drawImage(img, 0, 0, size, size);
      
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;
      
      // Simple color extraction - get most vibrant color
      let maxSaturation = 0;
      let dominantColor = { r: 106, g: 186, b: 211 }; // Fallback blue
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        const brightness = max / 255;
        
        // Prefer vibrant colors (high saturation, medium-high brightness)
        if (saturation > maxSaturation && brightness > 0.3 && brightness < 0.9) {
          maxSaturation = saturation;
          dominantColor = { r, g, b };
        }
      }
      
      const hex = `#${((1 << 24) + (dominantColor.r << 16) + (dominantColor.g << 8) + dominantColor.b)
        .toString(16)
        .slice(1)}`;
      
      resolve(hex);
    };
    
    img.onerror = () => {
      resolve('#6ABAD3'); // Fallback color
    };
    
    img.src = imageUrl;
  });
}

/**
 * Calculate accessible text color (black or white) based on background
 */
export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate YIQ
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return black or white based on brightness
  return yiq >= 128 ? '#000000' : '#FFFFFF';
}

/**
 * Format seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Validate file is audio
 */
export function isAudioFile(file: File): boolean {
  const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
  return audioTypes.includes(file.type) || file.name.endsWith('.mp3');
}

/**
 * Check file size (default max 100MB)
 */
export function isValidFileSize(file: File, maxSizeMB = 100): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}
