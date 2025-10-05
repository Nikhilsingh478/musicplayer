import { useState, useEffect } from 'react';
import { PlaylistsScreen } from './components/screens/PlaylistsScreen';
import { PlaylistDetailScreen } from './components/screens/PlaylistDetailScreen';
import { AllSongsScreen } from './components/screens/AllSongsScreen';
import { FullScreenPlayer } from './components/FullScreenPlayer';
import { NavigationMenu } from './components/NavigationMenu';
import { GlobalAudioPlayer } from './components/GlobalAudioPlayer';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useMusicStore } from './lib/store';

type Screen =
  | { type: 'playlists' }
  | { type: 'songs' }
  | { type: 'playlist-detail'; playlistId: string }
  | { type: 'player' };

export default function App() {
  const initializeFileStorage = useMusicStore((s) => s.initializeFileStorage);
  const recreateBlobUrls = useMusicStore((s) => s.recreateBlobUrls);

  // Initialize file storage and recreate blob URLs on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize file storage
        await initializeFileStorage();
        
        // Recreate blob URLs for existing tracks
        await recreateBlobUrls();
        
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    
    initializeApp();
  }, [initializeFileStorage, recreateBlobUrls]);

  // Set favicon on mount
  useEffect(() => {
    const setFavicon = () => {
      // Create an SVG favicon with a modern music disc/vinyl design
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#1a0b2e;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#0f0f23;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="musicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="22" fill="url(#grad)"/>
          <circle cx="50" cy="50" r="32" fill="url(#musicGrad)" opacity="0.9"/>
          <circle cx="50" cy="50" r="24" fill="#1a0b2e" opacity="0.5"/>
          <circle cx="50" cy="50" r="8" fill="url(#musicGrad)"/>
          <path d="M62 38v18c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6c1.32 0 2.55.43 3.54 1.16V38c0-1.1.9-2 2-2h.46c1.1 0 2 .9 2 2z" fill="white" opacity="0.95"/>
        </svg>
      `.trim();

      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      } else {
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
        document.head.appendChild(newFavicon);
      }

      // Also set title
      document.title = 'Music Player';
    };

    setFavicon();
  }, []);
  const [screen, setScreen] = useState<Screen>({ type: 'playlists' });
  const [previousScreen, setPreviousScreen] = useState<Screen>({ type: 'playlists' });

  const navigateToScreen = (newScreen: Screen) => {
    setPreviousScreen(screen);
    setScreen(newScreen);
  };

  const handlePlaylistClick = (playlistId: string) => {
    navigateToScreen({ type: 'playlist-detail', playlistId });
  };

  const handleTrackClick = () => {
    navigateToScreen({ type: 'player' });
  };

  const handleBackToPlaylists = () => {
    navigateToScreen({ type: 'playlists' });
  };

  const handleBackToSongs = () => {
    navigateToScreen({ type: 'songs' });
  };

  const handleBackFromPlayer = () => {
    // Go back to previous screen (playlist detail, songs, or playlists)
    if (previousScreen.type === 'player') {
      navigateToScreen({ type: 'playlists' });
    } else {
      setScreen(previousScreen);
    }
  };

  const getScreenType = (): 'playlists' | 'songs' | 'playlist-detail' | 'player' => {
    return screen.type;
  };

  return (
    <>
      {/* Global audio player - stays mounted across all screens */}
      <GlobalAudioPlayer />
      
      <AnimatePresence mode="wait">
        {screen.type === 'playlists' && (
          <motion.div
            key="playlists"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <NavigationMenu
              title="Playlists"
              onNavigateToPlaylists={handleBackToPlaylists}
              onNavigateToSongs={() => navigateToScreen({ type: 'songs' })}
              currentScreen={getScreenType()}
            />
            <PlaylistsScreen onPlaylistClick={handlePlaylistClick} />
          </motion.div>
        )}

        {screen.type === 'songs' && (
          <motion.div
            key="songs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <NavigationMenu
              title="All Songs"
              onNavigateToPlaylists={handleBackToPlaylists}
              onNavigateToSongs={handleBackToSongs}
              currentScreen={getScreenType()}
            />
            <AllSongsScreen onTrackClick={handleTrackClick} />
          </motion.div>
        )}

        {screen.type === 'playlist-detail' && (
          <motion.div
            key="playlist-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PlaylistDetailScreen
              playlistId={screen.playlistId}
              onBack={handleBackToPlaylists}
              onTrackClick={handleTrackClick}
              onNavigateToPlaylists={handleBackToPlaylists}
              onNavigateToSongs={() => navigateToScreen({ type: 'songs' })}
            />
          </motion.div>
        )}

        {screen.type === 'player' && (
          <motion.div
            key="player"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <FullScreenPlayer onBack={handleBackFromPlayer} />
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
    </>
  );
}
