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
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.05, 
        duration: 0.4,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        y: -2
      }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-4 p-4 rounded-2xl transition-all group backdrop-blur-sm border ${
        isCurrentTrack
          ? 'bg-white/20 shadow-xl border-white/30'
          : 'hover:bg-white/10 border-white/10'
      }`}
    >
      {/* Enhanced Artwork with play/pause button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="w-16 h-16 rounded-xl overflow-hidden bg-black/20 flex-shrink-0 relative transition-all shadow-lg hover:shadow-xl"
        aria-label={isCurrentTrack && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <img
          src={track.artworkUrl || getFallbackArtwork()}
          alt={track.title}
          className="w-full h-full object-cover"
        />

        {/* Enhanced Play/Pause overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isCurrentTrack ? 1 : 0,
            scale: isCurrentTrack ? 1 : 0.8
          }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all"
        >
          {isCurrentTrack && isPlaying ? (
            <Pause className="w-6 h-6 text-white fill-white drop-shadow-lg" strokeWidth={0} />
          ) : (
            <Play className="w-6 h-6 text-white fill-white drop-shadow-lg" strokeWidth={0} />
          )}
        </motion.div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-5 h-5 text-white fill-white" strokeWidth={0} />
        </div>
      </motion.button>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <div
          ref={titleRef}
          className={`${isCurrentTrack ? 'text-white' : 'text-white/95'} ${
            isOverflowing ? 'song-title-marquee' : 'truncate'
          }`}
          style={{ 
            fontSize: '15px', 
            fontWeight: 600, 
            fontFamily: 'Poppins, sans-serif', 
            lineHeight: '1.4',
            minHeight: '21px',
            display: 'flex',
            alignItems: 'center'
          }}
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
        <div 
          className="text-white/60 truncate mt-0.5" 
          style={{ 
            fontSize: '13px',
            minHeight: '17px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {track.artist}
        </div>
      </div>

      {/* Duration */}
      <div className="text-white/50 flex-shrink-0 mr-2" style={{ fontSize: '13px', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
        {formatTime(track.duration)}
      </div>

      {/* Enhanced Delete button - white icon */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500/20 flex items-center justify-center transition-all md:opacity-0 md:group-hover:opacity-100 opacity-100"
        aria-label={`Delete ${track.title}`}
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <Trash2 className="w-4 h-4 text-white" strokeWidth={2.5} />
      </motion.button>
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
      // New track - play it and navigate using 'all-songs' playlist
      playTrack(trackId, 'all-songs');
      onTrackClick(trackId);
    }
  };

  const handleDelete = async (trackId: string) => {
    try {
      await deleteTrack(trackId);
    setTrackToDelete(null);
    toast.success('Song deleted');
    } catch (error) {
      console.error('Failed to delete song:', error);
      toast.error('Failed to delete song');
    }
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
    <div className="min-h-screen custom-scrollbar overflow-y-auto relative" style={{ background: '#1a0b2e' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating Elements */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -90 }}
          animate={{ 
            scale: [1, 1.2, 1],
            y: [0, -30, 0, -25, 0],
            rotate: [0, 180, 360, 540],
            opacity: [0.1, 0.25, 0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 0.5
          }}
          className="absolute top-32 right-8"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 blur-sm" />
        </motion.div>
        
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: 90 }}
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.05, 0.18, 0.05],
            rotate: [0, 360, 720]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-40 left-12"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-lg" />
        </motion.div>

        {/* Additional floating elements */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -15, 0],
            opacity: [0.08, 0.18, 0.08]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
          className="absolute top-1/2 left-1/4"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-md" />
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -25, 0],
            y: [0, 20, 0],
            opacity: [0.06, 0.16, 0.06]
          }}
          transition={{ 
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/3 right-1/4"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-sm" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md mx-auto px-6 py-8 pb-24">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.h1 
                className="text-white text-2xl font-bold mb-1" 
                style={{ fontFamily: 'Poppins, sans-serif' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                All Songs
              </motion.h1>
              <motion.p 
                className="text-white/60 text-sm"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {allTracks.length} {allTracks.length === 1 ? 'song' : 'songs'} in your library
              </motion.p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{
                scale: 1.08,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={cyclePlaybackMode}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all shadow-lg backdrop-blur-sm ${
                playbackMode !== 'ordered'
                  ? 'bg-white/25 text-white border border-white/20'
                  : 'bg-white/15 text-white/80 hover:bg-white/20 border border-white/10'
              }`}
              aria-label={`Playback mode: ${getPlaybackModeLabel()}`}
              style={{ minHeight: '44px' }}
              transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
            >
              {getPlaybackModeIcon()}
              <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
                {getPlaybackModeLabel()}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced Songs list */}
        {allTracks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center py-20"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0],
                opacity: 1
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8
              }}
              className="mb-6 text-6xl"
            >
              🎵
            </motion.div>
            <motion.h2 
              className="text-white text-xl font-semibold mb-3" 
              style={{ fontFamily: 'Poppins, sans-serif' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              Your Music Library is Empty
            </motion.h2>
            <motion.p 
              className="text-white/60 mb-8 text-sm leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              Go to a playlist and upload some music to get started
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="space-y-3"
          >
            {allTracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: index * 0.05 + 1, 
                  duration: 0.5,
                  ease: "easeOut"
                }}
              >
                <SongRow
                  track={track}
                  index={index}
                  isCurrentTrack={currentTrackId === track.id}
                  isPlaying={isPlaying && currentTrackId === track.id}
                  onClick={() => handleTrackClick(track.id)}
                  onDelete={() => setTrackToDelete(track.id)}
                />
              </motion.div>
            ))}
          </motion.div>
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