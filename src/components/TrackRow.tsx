import { GripVertical, Play, Pause } from 'lucide-react';
import { Track } from '../lib/store';
import { formatTime, getFallbackArtwork } from '../lib/audioUtils';

interface TrackRowProps {
  track: Track;
  isPlaying?: boolean;
  isCurrentTrack?: boolean;
  onClick: () => void;
  dragHandleProps?: any;
}

export function TrackRow({
  track,
  isPlaying = false,
  isCurrentTrack = false,
  onClick,
  dragHandleProps,
}: TrackRowProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] ${
        isCurrentTrack
          ? 'bg-white/10 border border-white/20'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4 text-white/40" />
      </div>

      {/* Artwork */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative">
        <img
          src={track.artworkUrl || getFallbackArtwork()}
          alt={track.title}
          className="w-full h-full object-cover"
        />
        
        {/* Play indicator */}
        {isCurrentTrack && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white fill-white" strokeWidth={0} />
            ) : (
              <Play className="w-4 h-4 text-white fill-white" strokeWidth={0} />
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <div
          className={`truncate ${isCurrentTrack ? 'text-white' : 'text-white/90'}`}
          style={{ fontSize: '15px', fontWeight: 600 }}
        >
          {track.title}
        </div>
        <div
          className="text-white/60 truncate"
          style={{ fontSize: '13px' }}
        >
          {track.artist}
        </div>
      </div>

      {/* Duration */}
      <div className="text-white/50 flex-shrink-0" style={{ fontSize: '13px' }}>
        {formatTime(track.duration)}
      </div>
    </button>
  );
}
