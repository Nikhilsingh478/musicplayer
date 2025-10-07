import { useRef, useEffect, useState } from 'react';
import { useMusicStore } from '../lib/store';
import { toast } from 'sonner@2.0.3';

/**
 * Global audio player that stays mounted across all screens
 * This ensures music continues playing when navigating between pages
 */
export function GlobalAudioPlayer() {
  const currentTrackId = useMusicStore((s) => s.currentTrackId);
  const tracks = useMusicStore((s) => s.tracks);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const setCurrentTime = useMusicStore((s) => s.setCurrentTime);
  const setIsPlaying = useMusicStore((s) => s.setIsPlaying);
  const playNext = useMusicStore((s) => s.playNext);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasShownRefreshWarning, setHasShownRefreshWarning] = useState(false);
  
  const track = currentTrackId ? tracks[currentTrackId] : null;
  
  // Handle track changes and play/pause state
  useEffect(() => {
    if (!track || !audioRef.current) return;
    
    const audio = audioRef.current;
    
    // Check if blob URL is valid (not lost after refresh)
    const isBlobUrlValid = track.blobUrl && track.blobUrl.startsWith('blob:');
    
    if (!isBlobUrlValid) {
      console.warn('Audio file lost after refresh. Please re-upload.');
      setIsPlaying(false);
      
      // Show warning toast only once per session
      if (!hasShownRefreshWarning) {
        toast.error('Audio files lost. Please re-upload your music.', {
          duration: 4000,
        });
        setHasShownRefreshWarning(true);
      }
      return;
    }
    
    // Only update src if it's a different track
    if (audio.src !== track.blobUrl) {
      audio.src = track.blobUrl;
      audio.currentTime = 0;
    }
    
    if (isPlaying) {
      audio.play().catch((error) => {
        console.error('Audio playback error:', error);
        // Auto-pause on error
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [track, isPlaying, setIsPlaying, hasShownRefreshWarning]);
  
  // Set up event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      const playbackMode = useMusicStore.getState().playbackMode;

      if (playbackMode === 'repeat') {
        audio.currentTime = 0;
        audio.play().catch((error) => {
          console.error('Auto-replay error:', error);
          setIsPlaying(false);
        });
      } else {
        playNext();
      }
    };

    const handleError = (e: ErrorEvent) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as any);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as any);
    };
  }, [playNext, setCurrentTime, setIsPlaying]);
  
  // Expose audio element to store for seeking
  useEffect(() => {
    if (audioRef.current) {
      // Store audio ref globally for seeking operations
      (window as any).__audioElement = audioRef.current;
    }
  }, []);
  
  return <audio ref={audioRef} preload="auto" />;
}
