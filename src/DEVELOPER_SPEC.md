# Music Player Web App - Developer Specification

## Overview

A mobile-first music web application with upload, playlist management, drag-and-drop reordering, and a cinematic full-screen player with swipe gestures. Built with React, TypeScript, Tailwind CSS, and Zustand for state management.

---

## Architecture

### State Management

**Store**: Zustand with persistence (localStorage)

```typescript
interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  year?: string;
  duration: number; // seconds
  artworkUrl?: string;
  dominantColor: string;
  blobUrl: string;
  file?: File;
}

interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
}

interface MusicStore {
  tracks: Record<string, Track>;
  playlists: Playlist[];
  currentTrackId: string | null;
  currentPlaylistId: string | null;
  isPlaying: boolean;
  currentTime: number;
  // ... actions
}
```

### File Structure

```
/lib
  store.ts              # Zustand store
  audioUtils.ts         # ID3, color extraction, validation

/components
  PlaylistCard.tsx      # Playlist grid item
  TrackRow.tsx          # Track list item with drag handle
  UploadZone.tsx        # Drag-and-drop upload area
  FullScreenPlayer.tsx  # Full-screen cinematic player
  MusicPlayerCard.tsx   # Original player card component
  
  /screens
    PlaylistsScreen.tsx       # Home screen with playlist grid
    PlaylistDetailScreen.tsx  # Track list with upload
```

---

## Design Tokens & CSS Variables

### Color Palette

```css
:root {
  /* Brand Colors */
  --music-blue: #6ABAD3;
  --music-blue-dark: #70B7D5;
  --music-red: #D83631;
  --music-red-dark: #C12C27;
  --music-purple: #5A4DD8;
  --music-purple-dark: #6858E0;
  --music-green: #4DD88F;
  --music-green-dark: #3BC47A;
  
  /* UI Colors */
  --music-black: #000000;
  --music-white: #FFFFFF;
  
  /* Backgrounds */
  --bg-gradient-slate: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}
```

### Typography

```css
/* Poppins font family required */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

/* Typography Scale */
--text-hero: 52px;      /* Player title */
--text-title: 28px;     /* Screen titles */
--text-subtitle: 20px;  /* Playlist detail title */
--text-body: 16px;      /* Artist, card info */
--text-meta: 14px;      /* Track count, duration */
--text-caption: 12px;   /* Time, labels */

/* Font Weights */
--weight-extrabold: 800;
--weight-bold: 700;
--weight-semibold: 600;
--weight-medium: 500;
--weight-normal: 400;
```

### Spacing & Sizing

```css
/* Artboard */
--mobile-width: 375px;
--mobile-height: 812px;
--safe-padding: 20px;
--corner-radius: 28px;

/* Card Elements */
--artwork-size: 280px;
--artwork-radius: 12px;
--play-button-size: 72px;
--small-button-size: 36px;

/* Progress Bar */
--progress-height: 4px;
--progress-thumb-size: 12px;
```

### Shadows

```css
--shadow-artwork: 0 16px 40px rgba(0, 0, 0, 0.45);
--shadow-play-button: 0 20px 36px rgba(0, 0, 0, 0.6);
--shadow-thumb: 0 4px 12px rgba(0, 0, 0, 0.45);
--shadow-card: 0 24px 60px rgba(0, 0, 0, 0.3);
```

---

## Animations & Transitions

### Background Color Transition

```css
transition: background 420ms cubic-bezier(0.22, 1, 0.36, 1);
```

Applied when track changes and dominant color updates.

### Artwork Crossfade

```typescript
// Motion/React implementation
<motion.div
  key={track.id}
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -12 }}
  transition={{ duration: 0.32, ease: 'easeOut' }}
>
```

### Play Button Pulse (Playing State)

```css
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.03);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 1200ms cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Swipe Gesture Transition

```typescript
// Exit animation on swipe
const exitX = direction > 0 ? 200 : -200;
transition: {
  x: { duration: 0.32, ease: 'easeOut' },
  opacity: { duration: 0.32 }
}
```

---

## Audio Metadata Extraction

### ID3 Tag Reading

**Approach**: Custom browser-based ID3v2 parser using File API and DataView

**NOTE**: Artwork is NOT extracted from ID3 tags due to unreliability. Instead, each uploaded track is assigned a random artwork from a curated pool of 10 placeholder images.

```typescript
// Curated placeholder artworks (abstract/gradient/minimal)
export const FALLBACK_ARTWORKS = [
  'https://images.unsplash.com/photo-1648298073530-f9da02e84deb?w=600&q=80', // Abstract gradient
  'https://images.unsplash.com/photo-1618416094752-977e845b237a?w=600&q=80', // Vinyl record
  // ... 8 more artworks
];

// Matching background colors for each artwork
export const FALLBACK_COLORS = [
  '#6ABAD3', '#D83631', '#5A4DD8', '#4DD88F',
  '#FF6B6B', '#FFB84D', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6'
];

export async function extractMetadata(file: File): Promise<AudioMetadata> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration;
      
      try {
        // Custom ID3v2 parser - text only, no artwork
        const metadata = await extractID3Tags(file);
        
        resolve({
          title: metadata.title || parseFilename(file.name).title,
          artist: metadata.artist || 'Unknown Artist',
          album: metadata.album || 'Unknown Album',
          year: metadata.year,
          // Artwork assigned randomly from placeholders in UploadZone
          artworkUrl: undefined,
          duration,
        });
      } catch (error) {
        // Fallback to filename parsing
        const { title, artist } = parseFilename(file.name);
        resolve({
          title,
          artist: artist || 'Unknown Artist',
          album: 'Unknown Album',
          duration,
        });
      }
    });
    
    audio.src = objectUrl;
  });
}

// Parse "Artist - Title.mp3" format
function parseFilename(filename: string): { title: string; artist?: string } {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  if (nameWithoutExt.includes(' - ')) {
    const [artist, title] = nameWithoutExt.split(' - ');
    return { title: title.trim(), artist: artist.trim() };
  }
  
  return { title: nameWithoutExt };
}
```

---

## Dominant Color Extraction

### Canvas-based Color Extraction

```typescript
export async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Scale down for performance
      const size = 50;
      canvas.width = size;
      canvas.height = size;
      
      ctx.drawImage(img, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;
      
      let maxSaturation = 0;
      let dominantColor = { r: 106, g: 186, b: 211 }; // Fallback
      
      // Find most vibrant color
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
      
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      resolve(hex);
    };
    
    img.onerror = () => resolve('#6ABAD3'); // Fallback
    img.src = imageUrl;
  });
}
```

**Alternative Libraries**:
- `vibrant.js` - More sophisticated palette extraction
- `color-thief` - Popular alternative

---

## Swipe Gesture Implementation

### Motion/React Drag Gestures

**Library**: `motion/react` (formerly Framer Motion)

```typescript
import { motion, useMotionValue, useTransform } from 'motion/react';

export function FullScreenPlayer() {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-5, 0, 5]);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const handleDragEnd = () => {
    const threshold = 100; // pixels
    
    if (Math.abs(x.get()) > threshold) {
      if (x.get() > 0) {
        playPrevious(); // Swipe right
      } else {
        playNext(); // Swipe left
      }
    }
    
    x.set(0); // Reset position
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity }}
    >
      {/* Player content */}
    </motion.div>
  );
}
```

### Alternative: Native Touch Events

```typescript
let startX = 0;
let currentX = 0;
let startTime = 0;

const handleTouchStart = (e: TouchEvent) => {
  startX = e.touches[0].clientX;
  startTime = Date.now();
};

const handleTouchMove = (e: TouchEvent) => {
  currentX = e.touches[0].clientX;
  const deltaX = currentX - startX;
  
  // Apply visual feedback
  element.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.02}deg)`;
};

const handleTouchEnd = () => {
  const deltaX = currentX - startX;
  const deltaTime = Date.now() - startTime;
  const velocity = Math.abs(deltaX) / deltaTime; // px/ms
  
  // Threshold: 24% of viewport OR velocity > 0.6 px/ms
  const threshold = window.innerWidth * 0.24;
  
  if (Math.abs(deltaX) > threshold || velocity > 0.6) {
    if (deltaX > 0) {
      playPrevious();
    } else {
      playNext();
    }
  }
  
  // Reset
  element.style.transform = '';
};
```

---

## Audio Playback

### HTML5 Audio Element

```typescript
const audioRef = useRef<HTMLAudioElement>(null);

useEffect(() => {
  if (!track || !audioRef.current) return;
  
  const audio = audioRef.current;
  audio.src = track.blobUrl;
  
  if (isPlaying) {
    audio.play().catch(console.error);
  } else {
    audio.pause();
  }
}, [track, isPlaying]);

// Time updates
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;
  
  const handleTimeUpdate = () => {
    setCurrentTime(audio.currentTime);
  };
  
  const handleEnded = () => {
    playNext();
  };
  
  audio.addEventListener('timeupdate', handleTimeUpdate);
  audio.addEventListener('ended', handleEnded);
  
  return () => {
    audio.removeEventListener('timeupdate', handleTimeUpdate);
    audio.removeEventListener('ended', handleEnded);
  };
}, []);
```

### Alternative: Howler.js

```typescript
import { Howl } from 'howler';

const sound = new Howl({
  src: [track.blobUrl],
  html5: true,
  preload: true,
  onplay: () => setIsPlaying(true),
  onpause: () => setIsPlaying(false),
  onend: () => playNext(),
});

// Preload next track
const preloadNext = () => {
  const nextTrack = getNextTrack();
  if (nextTrack) {
    new Howl({ src: [nextTrack.blobUrl], preload: true });
  }
};
```

---

## Playlist Management & Reordering

### Drag-and-Drop with react-beautiful-dnd

**Library**: `react-beautiful-dnd`

```typescript
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const handleDragEnd = (result: DropResult) => {
  if (!result.destination) return;
  
  const newTrackIds = Array.from(playlist.trackIds);
  const [removed] = newTrackIds.splice(result.source.index, 1);
  newTrackIds.splice(result.destination.index, 0, removed);
  
  reorderPlaylistTracks(playlistId, newTrackIds);
};

<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="tracks">
    {(provided) => (
      <div {...provided.droppableProps} ref={provided.innerRef}>
        {tracks.map((track, index) => (
          <Draggable key={track.id} draggableId={track.id} index={index}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
              >
                <TrackRow 
                  track={track}
                  dragHandleProps={provided.dragHandleProps}
                />
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
```

---

## File Upload & Validation

### Drag-and-Drop Zone

```typescript
const [isDragging, setIsDragging] = useState(false);

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);
  processFiles(e.dataTransfer.files);
};

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(true);
};

// Validation
const isAudioFile = (file: File): boolean => {
  const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
  return audioTypes.includes(file.type) || file.name.endsWith('.mp3');
};

const isValidFileSize = (file: File, maxSizeMB = 100): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};
```

### Multi-file Processing

```typescript
const processFiles = async (files: FileList) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (!isAudioFile(file)) {
      toast.error(`${file.name} is not a valid audio file`);
      continue;
    }
    
    if (!isValidFileSize(file)) {
      toast.error(`${file.name} is too large (max 100MB)`);
      continue;
    }
    
    try {
      const metadata = await extractMetadata(file);
      const dominantColor = metadata.artworkUrl 
        ? await extractDominantColor(metadata.artworkUrl)
        : '#6ABAD3';
      
      const track = {
        id: `t${Date.now()}_${i}`,
        ...metadata,
        dominantColor,
        blobUrl: URL.createObjectURL(file),
      };
      
      addTrack(track);
      toast.success(`Added "${metadata.title}"`);
    } catch (error) {
      toast.error(`Failed to process ${file.name}`);
    }
  }
};
```

---

## Accessibility

### ARIA Labels & Live Regions

```typescript
// Screen reader announcements
<div 
  className="sr-only" 
  aria-live="polite" 
  aria-atomic="true"
>
  Now playing: {track.title} by {track.artist}
</div>

// Button labels
<button aria-label="Play" onClick={togglePlayPause}>
  <Play />
</button>

<button aria-label="Previous track" onClick={playPrevious}>
  <SkipBack />
</button>
```

### Keyboard Navigation

```typescript
useEffect(() => {
  const handleKeyboard = (e: KeyboardEvent) => {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'ArrowLeft':
        playPrevious();
        break;
      case 'ArrowRight':
        playNext();
        break;
      case 'Home':
        navigateToPlaylists();
        break;
    }
  };
  
  window.addEventListener('keydown', handleKeyboard);
  return () => window.removeEventListener('keydown', handleKeyboard);
}, []);
```

### Tap Targets & Contrast

```css
/* Minimum tap target: 44px */
.button {
  min-width: 44px;
  min-height: 44px;
}

/* Text shadow for low contrast backgrounds */
.player-title {
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
}
```

### Focus Indicators

```css
button:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}
```

---

## Persistence & Storage

### Zustand Persist Middleware

```typescript
import { persist } from 'zustand/middleware';

export const useMusicStore = create<MusicStore>()(
  persist(
    (set, get) => ({
      // ... store implementation
    }),
    {
      name: 'music-storage',
      partialize: (state) => ({
        tracks: state.tracks,
        playlists: state.playlists,
      }),
    }
  )
);
```

**Note**: Blob URLs are not persisted. On app reload, you may need to re-create blob URLs from stored File objects or use File System Access API for persistent handles.

### Alternative: IndexedDB with localforage

```typescript
import localforage from 'localforage';

const musicDB = localforage.createInstance({
  name: 'MusicApp',
  storeName: 'tracks',
});

// Save track with file
await musicDB.setItem(trackId, {
  metadata: track,
  file: file, // File object
});

// Retrieve and recreate blob URL
const stored = await musicDB.getItem(trackId);
const blobUrl = URL.createObjectURL(stored.file);
```

---

## Performance Optimization

### Image Optimization

```typescript
// Lazy load artwork
<img 
  src={track.artworkUrl} 
  loading="lazy"
  decoding="async"
/>

// Thumbnail generation for track rows
const createThumbnail = (imageUrl: string, size = 100): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      
      canvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg', 0.8);
    };
    img.src = imageUrl;
  });
};
```

### Audio Preloading

```typescript
// Preload next track for gapless playback
const preloadNextTrack = () => {
  const nextTrack = getNextTrack();
  if (nextTrack) {
    const audio = new Audio();
    audio.src = nextTrack.blobUrl;
    audio.preload = 'auto';
  }
};

useEffect(() => {
  if (isPlaying) {
    preloadNextTrack();
  }
}, [currentTrackId, isPlaying]);
```

---

## Error Handling

### Upload Errors

```typescript
try {
  const metadata = await extractMetadata(file);
  // ...
} catch (error) {
  if (error.message.includes('duration')) {
    toast.error('Could not read audio duration');
  } else if (error.message.includes('ID3')) {
    toast.warning('No metadata found, using filename');
  } else {
    toast.error('Failed to process file');
  }
}
```

### Audio Playback Errors

```typescript
audio.addEventListener('error', (e) => {
  const error = audio.error;
  
  switch (error?.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      toast.error('Playback aborted');
      break;
    case MediaError.MEDIA_ERR_NETWORK:
      toast.error('Network error');
      break;
    case MediaError.MEDIA_ERR_DECODE:
      toast.error('Audio file corrupted');
      break;
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      toast.error('Audio format not supported');
      break;
  }
});
```

---

## Browser Compatibility

### Required Features

- **Web Audio API** or `<audio>` element
- **File API** for drag-and-drop
- **Canvas API** for color extraction
- **Blob URLs** for audio playback
- **localStorage** or IndexedDB for persistence

### Polyfills (if needed)

```typescript
// Check for required APIs
if (!window.Audio) {
  console.error('HTML5 Audio not supported');
}

if (!window.FileReader) {
  console.error('File API not supported');
}
```

---

## Component API Reference

### FullScreenPlayer

```typescript
interface FullScreenPlayerProps {
  onBack: () => void;
}
```

**Events**:
- Swipe left → Next track
- Swipe right → Previous track
- Play button → Toggle play/pause
- Progress bar → Seek
- Back button → Navigate back

### UploadZone

```typescript
interface UploadZoneProps {
  playlistId: string;
}
```

**Features**:
- Drag-and-drop files
- Multi-file upload
- File validation (type, size)
- Progress feedback
- Toast notifications

### TrackRow

```typescript
interface TrackRowProps {
  track: Track;
  isPlaying?: boolean;
  isCurrentTrack?: boolean;
  onClick: () => void;
  dragHandleProps?: any; // From react-beautiful-dnd
}
```

---

## Utility Functions

### Time Formatting

```typescript
export function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

### Color Contrast

```typescript
export function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // YIQ calculation
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#FFFFFF';
}
```

---

## Libraries Used

| Library | Version | Purpose |
|---------|---------|---------|
| `react` | 18+ | UI framework |
| `zustand` | 4+ | State management |
| `motion/react` | latest | Gestures & animations |
| `react-beautiful-dnd` | 13+ | Drag-and-drop reordering |
| `sonner` | 2+ | Toast notifications |
| `lucide-react` | latest | Icons |
| `tailwindcss` | 4+ | Styling |

**Note**: ID3 tag extraction uses native browser APIs (File API, DataView) - no external library needed.

---

## Example Data Model

```json
{
  "playlists": [
    {
      "id": "p1696234567890",
      "name": "My Playlist 1",
      "trackIds": ["t1696234567890_0", "t1696234567891_1"],
      "createdAt": 1696234567890
    }
  ],
  "tracks": {
    "t1696234567890_0": {
      "id": "t1696234567890_0",
      "title": "Midnight",
      "artist": "Neon Dreams",
      "album": "Skyline Sessions",
      "year": "2024",
      "duration": 258,
      "artworkUrl": "blob:http://localhost:3000/abc123",
      "dominantColor": "#6ABAD3",
      "blobUrl": "blob:http://localhost:3000/def456"
    }
  },
  "currentTrackId": "t1696234567890_0",
  "currentPlaylistId": "p1696234567890",
  "isPlaying": true,
  "currentTime": 42.5
}
```

---

## Future Enhancements

1. **Equalizer Visualization**: Canvas-based waveform or frequency bars
2. **Lyrics Support**: Synced lyrics from LRC files or API
3. **Shuffle & Repeat**: Playback modes
4. **Queue Management**: Upcoming tracks
5. **Search & Filter**: Find tracks across playlists
6. **Export Playlists**: JSON/M3U export
7. **Collaborative Playlists**: Real-time sync with backend
8. **PWA Support**: Installable app with offline support
9. **Chromecast/AirPlay**: Cast to external devices
10. **Podcast Support**: Chapter markers, playback speed

---

## Testing Checklist

- [ ] Upload MP3 with ID3 tags
- [ ] Upload MP3 without tags (filename fallback)
- [ ] Upload multiple files at once
- [ ] Drag-and-drop reorder tracks
- [ ] Play/pause/skip tracks
- [ ] Swipe gestures (left/right)
- [ ] Progress bar scrubbing
- [ ] Create/delete playlists
- [ ] Color extraction from artwork
- [ ] Persistence (reload page)
- [ ] Keyboard navigation
- [ ] Screen reader announcements
- [ ] Mobile responsiveness
- [ ] Large file rejection (>100MB)
- [ ] Invalid file type rejection

---

## Credits

Design inspired by modern music player aesthetics with cinematic full-bleed backgrounds, bold typography, and gesture-based navigation.
