import { ChevronLeft, Menu, Music, ListMusic } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NavigationMenuProps {
  title: string;
  onBack?: () => void;
  onNavigateToPlaylists: () => void;
  onNavigateToSongs: () => void;
  currentScreen: 'playlists' | 'songs' | 'playlist-detail' | 'player';
}

export function NavigationMenu({
  title,
  onBack,
  onNavigateToPlaylists,
  onNavigateToSongs,
  currentScreen,
}: NavigationMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuItemClick = (action: () => void) => {
    setIsMenuOpen(false);
    action();
  };

  return (
    <>
      <div className="sticky top-0 z-20 bg-transparent backdrop-blur-sm">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          {onBack ? (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all active:scale-95"
              aria-label="Back"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>
          ) : (
            <div className="w-10" />
          )}

          <h1
            className="text-white flex-1 mx-4 truncate text-center"
            style={{
              fontSize: currentScreen === 'playlists' ? '28px' : '20px',
              fontWeight: 800,
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            {title}
          </h1>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all active:scale-95 relative"
            aria-label="Menu"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <Menu className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Slide-in menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Menu panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-64 border-l border-white/10 shadow-2xl z-50"
              style={{ background: 'linear-gradient(180deg, rgba(26, 11, 46, 0.98) 0%, rgba(15, 15, 35, 0.98) 100%)' }}
            >
              <div className="p-6 space-y-2">
                <div className="mb-6">
                  <h2
                    className="text-white mb-1"
                    style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}
                  >
                    Navigation
                  </h2>
                  <p className="text-white/60" style={{ fontSize: '14px' }}>
                    Jump to any section
                  </p>
                </div>

                <button
                  onClick={() => handleMenuItemClick(onNavigateToPlaylists)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95 ${
                    currentScreen === 'playlists'
                      ? 'bg-white/20 text-white'
                      : 'hover:bg-white/10 text-white/80'
                  }`}
                  style={{ minHeight: '44px' }}
                  aria-label="Go to Playlists"
                >
                  <ListMusic className="w-5 h-5" strokeWidth={2} />
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>Playlists</span>
                </button>

                <button
                  onClick={() => handleMenuItemClick(onNavigateToSongs)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95 ${
                    currentScreen === 'songs'
                      ? 'bg-white/20 text-white'
                      : 'hover:bg-white/10 text-white/80'
                  }`}
                  style={{ minHeight: '44px' }}
                  aria-label="Go to All Songs"
                >
                  <Music className="w-5 h-5" strokeWidth={2} />
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>All Songs</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}