import { ChevronLeft, Menu, Heart, X, Play, Pause } from 'lucide-react';
import { useState } from 'react';

export type ColorVariant = 'blue' | 'red' | 'black' | 'purple';
export type PlayerState = 'default' | 'playing' | 'paused' | 'loading';

interface MusicPlayerCardProps {
  variant: ColorVariant;
  state?: PlayerState;
  artwork: string;
  title: string;
  artist: string;
  album: string;
  year: string;
  currentTime?: string;
  duration?: string;
  progress?: number;
}

const variantStyles: Record<ColorVariant, string> = {
  blue: 'bg-gradient-to-br from-[#6ABAD3] to-[#70B7D5]',
  red: 'bg-[#D83631]',
  black: 'bg-black relative overflow-hidden',
  purple: 'bg-gradient-to-br from-[#5A4DD8] to-[#6858E0]',
};

export function MusicPlayerCard({
  variant,
  state = 'default',
  artwork,
  title,
  artist,
  album,
  year,
  currentTime = '2:34',
  duration = '4:18',
  progress = 60,
}: MusicPlayerCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>(state);

  const handlePlayPause = () => {
    setPlayerState(playerState === 'playing' ? 'paused' : 'playing');
  };

  return (
    <div className="relative w-[375px] h-[812px] mx-auto">
      {/* Card Container */}
      <div 
        className={`relative w-full h-full rounded-[28px] p-5 flex flex-col overflow-hidden ${variantStyles[variant]}`}
        style={{
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Black variant neon accent streaks */}
        {variant === 'black' && (
          <>
            <div 
              className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 30% 20%, rgba(77, 91, 68, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(77, 255, 68, 0.15) 0%, transparent 50%)',
              }}
            />
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(10, 7, 16, 0) 0%, rgba(6, 5, 8, 0.6) 100%)',
              }}
            />
          </>
        )}

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between h-9 mb-6">
          {/* Back Button */}
          <button 
            className="w-6 h-6 flex items-center justify-center"
            aria-label="Back"
          >
            <ChevronLeft className="w-[18px] h-[18px] text-white opacity-80" strokeWidth={2.5} />
          </button>

          {/* Center Label */}
          <div 
            className="uppercase text-white opacity-80 tracking-[1.5px]"
            style={{ fontSize: '12px', fontWeight: 600 }}
          >
            Recent Added
          </div>

          {/* Menu Button */}
          <button 
            className="w-6 h-6 flex items-center justify-center"
            aria-label="Menu"
          >
            <Menu className="w-[18px] h-[18px] text-white opacity-80" strokeWidth={2.5} />
          </button>
        </div>

        {/* Artwork - ~44% of total height */}
        <div className="relative z-10 flex items-center justify-center mb-8" style={{ height: '357px' }}>
          <div className="relative w-full max-w-[280px]">
            <img
              src={artwork}
              alt={title}
              className="w-full h-full object-cover rounded-xl"
              style={{
                aspectRatio: '1/1',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
              }}
            />
            {/* Optional vignette overlay */}
            <div 
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.15) 100%)',
              }}
            />
          </div>
        </div>

        {/* Title Block */}
        <div className="relative z-10 mb-8">
          <h1 
            className="text-white mb-2"
            style={{ 
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 800,
              fontSize: '52px',
              lineHeight: '0.9',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>
          <div 
            className="text-white opacity-90 mb-1"
            style={{ 
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            {artist}
          </div>
          <div 
            className="text-white opacity-70"
            style={{ 
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {album} • {year}
          </div>
        </div>

        {/* Progress Bar & Timers */}
        <div className="relative z-10 mb-6">
          {/* Timer Labels */}
          <div className="flex justify-between mb-2">
            <span 
              className="text-white opacity-90"
              style={{ fontSize: '12px', fontWeight: 500 }}
            >
              {currentTime}
            </span>
            <span 
              className="text-white opacity-70"
              style={{ fontSize: '12px', fontWeight: 500 }}
            >
              {duration}
            </span>
          </div>

          {/* Progress Track */}
          <div className="relative h-1 bg-white/20 rounded-full overflow-visible">
            {/* Fill */}
            <div 
              className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            {/* Thumb */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full transition-all duration-300"
              style={{ 
                left: `${progress}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.45)',
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="relative z-10 flex items-center justify-between mt-auto">
          {/* Left Cluster */}
          <div className="flex items-center gap-3">
            {/* Heart Button */}
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="w-9 h-9 rounded-full bg-white/[0.06] backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Like"
            >
              <Heart 
                className={`w-4 h-4 ${isLiked ? 'fill-white text-white' : 'text-white'}`} 
                strokeWidth={2}
              />
            </button>

            {/* X Button */}
            <button
              className="w-9 h-9 rounded-full bg-white/[0.06] backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-white" strokeWidth={2} />
            </button>
          </div>

          {/* Main Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            className={`w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center active:scale-96 transition-all ${
              playerState === 'playing' ? 'animate-pulse' : ''
            }`}
            style={{
              boxShadow: '0 20px 36px rgba(0, 0, 0, 0.6)',
            }}
            aria-label={playerState === 'playing' ? 'Pause' : 'Play'}
          >
            {playerState === 'playing' ? (
              <Pause className="w-7 h-7 text-black fill-black" strokeWidth={0} />
            ) : (
              <Play className="w-7 h-7 text-black fill-black ml-1" strokeWidth={0} />
            )}
          </button>

          {/* Right Spacer (to balance layout) */}
          <div className="w-[84px]" />
        </div>

        {/* Loading Overlay */}
        {state === 'loading' && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-[28px] z-20">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
