import { Upload, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { extractMetadata, isAudioFile, isValidFileSize, FALLBACK_ARTWORKS, FALLBACK_COLORS } from '../lib/audioUtils';
import { useMusicStore, Track } from '../lib/store';
import { toast } from 'sonner@2.0.3';

interface SmallUploadButtonProps {
  playlistId: string;
}

export function SmallUploadButton({ playlistId }: SmallUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addTrackWithFile = useMusicStore((s) => s.addTrackWithFile);
  const addTracksToPlaylist = useMusicStore((s) => s.addTracksToPlaylist);

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const trackIds: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file
        if (!isAudioFile(file)) {
          toast.error(`${file.name} is not a valid audio file`);
          continue;
        }

        if (!isValidFileSize(file)) {
          toast.error(`${file.name} is too large (max 100MB)`);
          continue;
        }

        try {
          // Extract metadata (no artwork from ID3)
          const metadata = await extractMetadata(file);

          // Assign random artwork and matching color from curated placeholders
          const randomIndex = Math.floor(Math.random() * FALLBACK_ARTWORKS.length);
          const artworkUrl = FALLBACK_ARTWORKS[randomIndex];
          const dominantColor = FALLBACK_COLORS[randomIndex];

          // Create track
          const trackId = `t${Date.now()}_${i}`;
          const track: Track = {
            id: trackId,
            title: metadata.title,
            artist: metadata.artist,
            album: metadata.album,
            year: metadata.year,
            duration: metadata.duration,
            artworkUrl,
            dominantColor,
            blobUrl: '', // Will be set by addTrackWithFile
          };

          // Store track with file for persistence
          await addTrackWithFile(track, file);
          trackIds.push(trackId);

          toast.success(`Added "${metadata.title}"`);
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          toast.error(`Failed to process ${file.name}`);
        }
      }

      // Add all tracks to playlist
      if (trackIds.length > 0) {
        addTracksToPlaylist(playlistId, trackIds);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center"
        aria-label="Upload music files"
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 text-white animate-spin" strokeWidth={2} />
        ) : (
          <Upload className="w-5 h-5 text-white" strokeWidth={2} />
        )}
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
}
