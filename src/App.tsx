import { useState } from 'react';
import { PlaylistsScreen } from './components/screens/PlaylistsScreen';
import { PlaylistDetailScreen } from './components/screens/PlaylistDetailScreen';
import { AllSongsScreen } from './components/screens/AllSongsScreen';
import { FullScreenPlayer } from './components/FullScreenPlayer';
import { NavigationMenu } from './components/NavigationMenu';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';

type Screen =
  | { type: 'playlists' }
  | { type: 'songs' }
  | { type: 'playlist-detail'; playlistId: string }
  | { type: 'player' };

export default function App() {
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
