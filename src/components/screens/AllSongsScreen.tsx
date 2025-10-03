import { Play, Pause, Trash2, Shuffle, Repeat, List } from 'lucide-react';
import { useMusicStore } from '../../lib/store';
import { formatTime, getFallbackArtwork } from '../../lib/audioUtils';
import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { toast } from 'sonner@2.0.3';

interface AllSongsScreenProps {
  onTrackClick: (trackId: string) => void;
}

function SongRow({
  track,
  index,
  isCurrentTrack,
  isPlaying,
  onClick,
  onDelete,
}: {
  track: any;
  index: number;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      setIsOverflowing(titleRef.current.scrollWidth > titleRef.current.clientWidth);
    }
  }, [track.title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className={`flex items-center gap-4 p-4 rounded-2xl transition-all group ${
        isCurrentTrack
          ? 'bg-white/15 shadow-lg'
          : 'hover:bg-white/10'
      }`}
    >
      {/* Artwork with play/pause button */}
      <button
        onClick={onClick}
        className="w-16 h-16 rounded-xl overflow-hidden bg-black/20 flex-shrink-0 relative active:scale-95 transition-transform shadow-md"
        aria-label={isCurrentTrack && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <img
          src={track.artworkUrl || getFallbackArtwork()}
          alt={track.title}
          className="w-full h-full object-cover"
        />

        {/* Play/Pause overlay */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity ${
            isCurrentTrack ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {isCurrentTrack && isPlaying ? (
            <Pause className="w-6 h-6 text-white fill-white" strokeWidth={0} />
          ) : (
            <Play className="w-6 h-6 text-white fill-white" strokeWidth={0} />
          )}
        </div>
      </button>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <div
          ref={titleRef}
          className={`${isCurrentTrack ? 'text-white' : 'text-white/95'} ${
            isOverflowing ? 'song-title-marquee' : 'truncate'
          }`}
          style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'Poppins, sans-serif', lineHeight: '1.4' }}
        >
          {isOverflowing ? (
            <div className="marquee-container">
              <span className="marquee-content">{track.title}</span>
              <span className="marquee-content" aria-hidden="true">
                {track.title}
              </span>
            </div>
          ) : (
            track.title
          )}
        </div>
        <div className="text-white/60 truncate mt-0.5" style={{ fontSize: '13px' }}>
          {track.artist}
        </div>
      </div>

      {/* Duration */}
      <div className="text-white/50 flex-shrink-0 mr-2" style={{ fontSize: '13px', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
        {formatTime(track.duration)}
      </div>

      {/* Delete button - white icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95 md:opacity-0 md:group-hover:opacity-100 opacity-100"
        aria-label={`Delete ${track.title}`}
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <Trash2 className="w-4 h-4 text-white/90" strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}

export function AllSongsScreen({ onTrackClick }: AllSongsScreenProps) {
  const tracks = useMusicStore((s) => s.tracks);
  const playlists = useMusicStore((s) => s.playlists);
  const currentTrackId = useMusicStore((s) => s.currentTrackId);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const playbackMode = useMusicStore((s) => s.playbackMode);
  const playTrack = useMusicStore((s) => s.playTrack);
  const togglePlayPause = useMusicStore((s) => s.togglePlayPause);
  const deleteTrack = useMusicStore((s) => s.deleteTrack);
  const cyclePlaybackMode = useMusicStore((s) => s.cyclePlaybackMode);

  const [trackToDelete, setTrackToDelete] = useState<string | null>(null);

  const allTracks = Object.values(tracks);

  const handleTrackClick = (trackId: string) => {
    if (currentTrackId === trackId) {
      // If clicking the same track, toggle play/pause
      togglePlayPause();
      // Don't navigate if we're pausing
      if (!isPlaying) {
        onTrackClick(trackId);
      }
    } else {
      // New track - play it and navigate
      const playlistWithTrack = playlists.find((p) => p.trackIds.includes(trackId));
      const playlistId = playlistWithTrack?.id || playlists[0]?.id || 'all';
      playTrack(trackId, playlistId);
      onTrackClick(trackId);
    }
  };

  const handleDelete = (trackId: string) => {
    deleteTrack(trackId);
    setTrackToDelete(null);
    toast.success('Song deleted');
  };

  const getPlaybackModeIcon = () => {
    switch (playbackMode) {
      case 'shuffle':
        return <Shuffle className="w-4 h-4" strokeWidth={2.5} />;
      case 'repeat':
        return <Repeat className="w-4 h-4" strokeWidth={2.5} />;
      case 'ordered':
        return <List className="w-4 h-4" strokeWidth={2.5} />;
    }
  };

  const getPlaybackModeLabel = () => {
    switch (playbackMode) {
      case 'shuffle':
        return 'Shuffle';
      case 'repeat':
        return 'Repeat';
      case 'ordered':
        return 'Ordered';
    }
  };

  return (
    <div className="min-h-screen custom-scrollbar overflow-y-auto" style={{ background: '#EC4899' }}>
      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-8 pb-24">
        {/* Header with count and playback mode */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/70" style={{ fontSize: '13px', fontWeight: 500 }}>
              {allTracks.length} {allTracks.length === 1 ? 'song' : 'songs'}
            </p>
          </div>

          <button
            onClick={cyclePlaybackMode}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all active:scale-95 shadow-md ${
              playbackMode !== 'ordered'
                ? 'bg-white/25 text-white backdrop-blur-sm'
                : 'bg-white/15 text-white/80 hover:bg-white/20'
            }`}
            aria-label={`Playback mode: ${getPlaybackModeLabel()}`}
            style={{ minHeight: '40px' }}
          >
            {getPlaybackModeIcon()}
            <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
              {getPlaybackModeLabel()}
            </span>
          </button>
        </div>

        {/* Songs list */}
        {allTracks.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-6 text-white/30" style={{ fontSize: '64px' }}>
              🎵
            </div>
            <p className="text-white/70" style={{ fontSize: '17px', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
              No songs yet
            </p>
            <p className="text-white/50 mt-2" style={{ fontSize: '14px' }}>
              Go to a playlist and upload some music
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {allTracks.map((track, index) => (
              <SongRow
                key={track.id}
                track={track}
                index={index}
                isCurrentTrack={currentTrackId === track.id}
                isPlaying={isPlaying && currentTrackId === track.id}
                onClick={() => handleTrackClick(track.id)}
                onDelete={() => setTrackToDelete(track.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={trackToDelete !== null} onOpenChange={() => setTrackToDelete(null)}>
        <AlertDialogContent className="bg-slate-900 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Delete Song
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete "
              {trackToDelete && tracks[trackToDelete]?.title}"? This will remove it from all
              playlists.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => trackToDelete && handleDelete(trackToDelete)}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}