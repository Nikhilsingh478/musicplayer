import { Upload, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { extractMetadata, isAudioFile, isValidFileSize, FALLBACK_ARTWORKS, FALLBACK_COLORS } from '../lib/audioUtils';
import { useMusicStore, Track } from '../lib/store';
import { toast } from 'sonner@2.0.3';

interface UploadZoneProps {
  playlistId: string;
}

export function UploadZone({ playlistId }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addTrack = useMusicStore((s) => s.addTrack);
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

          // Create blob URL for audio
          const blobUrl = URL.createObjectURL(file);

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
            blobUrl,
          };

          addTrack(track);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer ${
        isDragging
          ? 'border-white/60 bg-white/10'
          : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center gap-3">
        {isUploading ? (
          <>
            <Loader2 className="w-12 h-12 text-white/60 animate-spin" />
            <p className="text-white/60" style={{ fontSize: '14px' }}>
              Processing files...
            </p>
          </>
        ) : (
          <>
            <Upload className="w-12 h-12 text-white/60" strokeWidth={1.5} />
            <div className="text-center">
              <p className="text-white mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
                Drop MP3 files here
              </p>
              <p className="text-white/60" style={{ fontSize: '14px' }}>
                or click to browse
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
