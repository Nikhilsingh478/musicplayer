import { ChevronLeft, Heart, SkipBack, SkipForward, Play, Pause, Shuffle, Repeat, List } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useMusicStore } from '../lib/store';
import { formatTime } from '../lib/audioUtils';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';

interface FullScreenPlayerProps {
  onBack: () => void;
}

export function FullScreenPlayer({ onBack }: FullScreenPlayerProps) {
  const currentTrackId = useMusicStore((s) => s.currentTrackId);
  const tracks = useMusicStore((s) => s.tracks);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const currentTime = useMusicStore((s) => s.currentTime);
  const playbackMode = useMusicStore((s) => s.playbackMode);
  const togglePlayPause = useMusicStore((s) => s.togglePlayPause);
  const setCurrentTime = useMusicStore((s) => s.setCurrentTime);
  const setIsPlaying = useMusicStore((s) => s.setIsPlaying);
  const playNext = useMusicStore((s) => s.playNext);
  const playPrevious = useMusicStore((s) => s.playPrevious);
  const cyclePlaybackMode = useMusicStore((s) => s.cyclePlaybackMode);

  const [isLiked, setIsLiked] = useState(false);

  const track = currentTrackId ? tracks[currentTrackId] : null;

  // Swipe gesture state
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-5, 0, 5]);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with form inputs
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          playPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          playNext();
          break;
        case 'Home':
          e.preventDefault();
          onBack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, playNext, playPrevious, onBack]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!track) return;
    
    const audio = (window as any).__audioElement as HTMLAudioElement;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * track.duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 80; // pixels - lower for better mobile responsiveness
    const swipeVelocity = 400; // pixels per second - lower for easier swipes
    
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Check if swipe was strong enough (either distance or velocity)
    if (Math.abs(offset) > threshold || Math.abs(velocity) > swipeVelocity) {
      // Always set to playing when swiping to change tracks
      if (!isPlaying) {
        setIsPlaying(true);
      }
      
      if (offset > 0 || velocity > 0) {
        // Swipe right - previous
        playPrevious();
      } else {
        // Swipe left - next
        playNext();
      }
    }

    // Smoothly reset position
    x.set(0);
  };

  if (!track) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <p className="text-white/60">No track selected</p>
      </div>
    );
  }

  const progress = track.duration > 0 ? (currentTime / track.duration) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        background: track.dominantColor || '#6ABAD3',
        transition: 'background 420ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Mobile Card Container - True Full Width */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        dragDirectionLock
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, opacity }}
        className="w-full h-full relative"
      >
        <div className="w-full h-full p-5 flex flex-col relative">
          {/* Vignette Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 30%, transparent 0%, rgba(0, 0, 0, 0.2) 100%)',
            }}
          />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Back to previous screen (Home key)"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>

            <div
              className="uppercase text-white opacity-80 tracking-[1.5px]"
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              Now Playing
            </div>

            {/* Playback Mode Selector */}
            <button
              onClick={cyclePlaybackMode}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all"
              aria-label={`Playback mode: ${playbackMode}`}
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              {playbackMode === 'shuffle' && <Shuffle className="w-5 h-5 text-white" strokeWidth={2.5} />}
              {playbackMode === 'repeat' && <Repeat className="w-5 h-5 text-white" strokeWidth={2.5} />}
              {playbackMode === 'ordered' && <List className="w-5 h-5 text-white opacity-60" strokeWidth={2.5} />}
            </button>
          </div>

          {/* Artwork */}
          <AnimatePresence mode="wait">
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              className="relative z-10 flex items-center justify-center mb-8"
              style={{ height: '357px' }}
            >
              <div className="relative w-full max-w-[280px]">
                <img
                  src={track.artworkUrl}
                  alt={track.title}
                  className="w-full h-full object-cover rounded-xl"
                  style={{
                    aspectRatio: '1/1',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
                  }}
                />
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.15) 100%)',
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Title Block */}
          <AnimatePresence mode="wait">
            <motion.div
              key={track.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32 }}
              className="relative z-10 mb-8"
            >
              <h1
                className="text-white mb-3 truncate"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 800,
                  fontSize: '44px',
                  lineHeight: '1',
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                  WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.1)',
                }}
              >
                {track.title}
              </h1>
              <div 
                className="text-white opacity-90 mb-1 truncate"
                style={{ 
                  fontSize: '16px', 
                  fontWeight: 600,
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                {track.artist}
              </div>
              <div 
                className="text-white opacity-70 truncate"
                style={{ 
                  fontSize: '12px', 
                  fontWeight: 500,
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                {track.album} {track.year && `• ${track.year}`}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress Bar & Timers */}
          <div className="relative z-10 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-white opacity-90" style={{ fontSize: '12px', fontWeight: 500 }}>
                {formatTime(currentTime)}
              </span>
              <span className="text-white opacity-70" style={{ fontSize: '12px', fontWeight: 500 }}>
                {formatTime(track.duration)}
              </span>
            </div>

            <div
              onClick={handleProgressClick}
              className="relative h-1 bg-white/20 rounded-full overflow-visible cursor-pointer"
              role="slider"
              aria-label="Song progress"
              aria-valuemin={0}
              aria-valuemax={track.duration}
              aria-valuenow={currentTime}
            >
              <div
                className="absolute left-0 top-0 h-1 bg-white rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 w-3 h-3 bg-white rounded-full transition-all duration-100"
                style={{
                  left: `${progress}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="relative z-10 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="w-9 h-9 rounded-full bg-white/[0.06] backdrop-blur-sm flex items-center justify-center active:scale-96 transition-all hover:bg-white/10"
                aria-label={isLiked ? 'Unlike this song' : 'Like this song'}
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <Heart
                  className={`w-5 h-5 ${isLiked ? 'fill-white text-white' : 'text-white'}`}
                  strokeWidth={2}
                />
              </button>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={playPrevious}
                className="active:scale-96 transition-all p-2"
                aria-label="Previous track (Left arrow)"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <SkipBack className="w-7 h-7 text-white" strokeWidth={2} />
              </button>

              <button
                onClick={togglePlayPause}
                className={`w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center active:scale-96 transition-all hover:scale-105 ${
                  isPlaying ? 'animate-pulse-slow' : ''
                }`}
                style={{
                  boxShadow: '0 20px 36px rgba(0, 0, 0, 0.6)',
                }}
                aria-label={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 text-black fill-black" strokeWidth={0} />
                ) : (
                  <Play className="w-7 h-7 text-black fill-black ml-1" strokeWidth={0} />
                )}
              </button>

              <button
                onClick={playNext}
                className="active:scale-96 transition-all p-2"
                aria-label="Next track (Right arrow)"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <SkipForward className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
            </div>

            <div className="w-9" />
          </div>
        </div>
      </motion.div>

      {/* Screen reader announcements */}
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        Now playing: {track.title} by {track.artist}. {isPlaying ? 'Playing' : 'Paused'}.
        Playback mode: {playbackMode}.
        Use arrow keys to skip tracks, space to play or pause, home to go back.
      </div>
    </div>
  );
}
