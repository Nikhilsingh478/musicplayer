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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
        isCurrentTrack
          ? 'bg-white/10 border border-white/20'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      {/* Artwork */}
      <button
        onClick={onClick}
        className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative active:scale-95 transition-transform"
        aria-label={`Play ${track.title}`}
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <img
          src={track.artworkUrl || getFallbackArtwork()}
          alt={track.title}
          className="w-full h-full object-cover"
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        />

        {/* Play indicator overlay */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
            isCurrentTrack ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {isCurrentTrack && isPlaying ? (
            <Pause className="w-5 h-5 text-white fill-white" strokeWidth={0} />
          ) : (
            <Play className="w-5 h-5 text-white fill-white" strokeWidth={0} />
          )}
        </div>
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div
          ref={titleRef}
          className={`${isCurrentTrack ? 'text-white' : 'text-white/90'} ${
            isOverflowing ? 'song-title-marquee' : 'truncate'
          }`}
          style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}
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
        <div className="text-white/60 truncate" style={{ fontSize: '14px' }}>
          {track.artist}
        </div>
      </div>

      {/* Duration */}
      <div className="text-white/50 flex-shrink-0" style={{ fontSize: '13px' }}>
        {formatTime(track.duration)}
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-9 h-9 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-all active:scale-95 opacity-0 group-hover:opacity-100"
        aria-label={`Delete ${track.title}`}
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <Trash2 className="w-4 h-4 text-red-400" strokeWidth={2} />
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
      togglePlayPause();
      if (!isPlaying) {
        onTrackClick(trackId);
      }
    } else {
      // Find which playlist contains this track, or use first playlist
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
        return <Shuffle className="w-4 h-4" strokeWidth={2} />;
      case 'repeat':
        return <Repeat className="w-4 h-4" strokeWidth={2} />;
      case 'ordered':
        return <List className="w-4 h-4" strokeWidth={2} />;
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
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 custom-scrollbar overflow-y-auto">
      {/* Content */}
      <div className="max-w-md mx-auto px-5 py-6 pb-20">
        {/* Playback mode selector */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-white/60" style={{ fontSize: '14px' }}>
            {allTracks.length} {allTracks.length === 1 ? 'song' : 'songs'}
          </p>

          <button
            onClick={cyclePlaybackMode}
            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all active:scale-95 ${
              playbackMode !== 'ordered'
                ? 'bg-white/20 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
            aria-label={`Playback mode: ${getPlaybackModeLabel()}`}
            style={{ minHeight: '36px' }}
          >
            {getPlaybackModeIcon()}
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{getPlaybackModeLabel()}</span>
          </button>
        </div>

        {/* Songs list */}
        {allTracks.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4 text-white/40" style={{ fontSize: '48px' }}>
              🎵
            </div>
            <p className="text-white/60" style={{ fontSize: '16px' }}>
              No songs yet
            </p>
            <p className="text-white/40 mt-2" style={{ fontSize: '14px' }}>
              Go to a playlist and upload some music
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {allTracks.map((track, index) => {
              const trackToDeleteObj = trackToDelete ? tracks[trackToDelete] : null;

              return (
                <SongRow
                  key={track.id}
                  track={track}
                  index={index}
                  isCurrentTrack={currentTrackId === track.id}
                  isPlaying={isPlaying && currentTrackId === track.id}
                  onClick={() => handleTrackClick(track.id)}
                  onDelete={() => setTrackToDelete(track.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={trackToDelete !== null} onOpenChange={() => setTrackToDelete(null)}>
        <AlertDialogContent className="bg-slate-800 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Song</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
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