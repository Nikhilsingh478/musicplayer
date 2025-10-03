import { Plus, Music, Disc3, Headphones } from 'lucide-react';
import { useMusicStore } from '../../lib/store';
import { PlaylistCard } from '../PlaylistCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useState } from 'react';
import { motion } from 'motion/react';

interface PlaylistsScreenProps {
  onPlaylistClick: (playlistId: string) => void;
}

export function PlaylistsScreen({ onPlaylistClick }: PlaylistsScreenProps) {
  const playlists = useMusicStore((s) => s.playlists);
  const tracks = useMusicStore((s) => s.tracks);
  const createPlaylist = useMusicStore((s) => s.createPlaylist);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = () => {
    const id = createPlaylist(newPlaylistName || undefined);
    setNewPlaylistName('');
    setIsCreateModalOpen(false);
    onPlaylistClick(id);
  };

  return (
    <div className="min-h-screen custom-scrollbar overflow-y-auto relative" style={{ background: '#1a0b2e' }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating Music Elements */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -180 }}
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 360, 720],
            y: [0, -20, 0, -15, 0],
            opacity: [0.1, 0.3, 0.1, 0.25, 0.1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 0.5
          }}
          className="absolute top-20 left-8"
        >
          <Disc3 className="w-16 h-16 text-purple-400/20" />
        </motion.div>
        
        <motion.div
          initial={{ scale: 0, opacity: 0, x: 50 }}
          animate={{ 
            scale: [1, 1.2, 1],
            y: [0, 30, 0, 25, 0],
            x: [0, 10, -5, 0],
            opacity: [0.1, 0.25, 0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-40 right-12"
        >
          <Headphones className="w-12 h-12 text-pink-400/20" />
        </motion.div>
        
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: 180 }}
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [-360, -720, -360],
            x: [0, 20, 0, 15, 0],
            y: [0, -10, 5, 0],
            opacity: [0.1, 0.25, 0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 30,
            repeat: Infinity,
            ease: "linear",
            delay: 1.5
          }}
          className="absolute bottom-32 left-16"
        >
          <Music className="w-20 h-20 text-blue-400/20" />
        </motion.div>

        {/* Additional floating elements with complex animations */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/3 left-1/4"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-sm" />
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [1, 1.4, 1],
            y: [0, -25, 0],
            x: [0, 15, 0],
            opacity: [0.08, 0.18, 0.08]
          }}
          transition={{ 
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.5
          }}
          className="absolute bottom-1/4 right-1/3"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-sm" />
        </motion.div>

        {/* Enhanced Gradient Orbs */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -90 }}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.2, 0.05],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8
          }}
          className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl"
        />
        
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: 90 }}
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.08, 0.15, 0.08],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2
          }}
          className="absolute bottom-1/3 left-1/3 w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl"
        />

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.06, 0.18, 0.06],
            x: [0, 20, 0],
            y: [0, -15, 0]
          }}
          transition={{ 
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.8
          }}
          className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-lg"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md mx-auto px-6 py-8 pb-24">
        {/* Enhanced Header Section */}
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
                className="text-white text-3xl font-bold mb-2" 
                style={{ fontFamily: 'Poppins, sans-serif' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                My Playlists
              </motion.h1>
              <motion.p 
                className="text-white/60 text-sm"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
              </motion.p>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              whileHover={{ 
                scale: 1.05,
                rotate: 5,
                boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              aria-label="Create playlist"
              transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 200 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
              >
                <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
              </motion.div>
            </motion.button>
          </div>
        </motion.div>
        {/* Enhanced Playlists Grid */}
        {playlists.length === 0 ? (
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
                rotate: [0, 5, -5, 0],
                opacity: 1
              }}
              transition={{ 
                duration: 4,
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
              Start Your Music Journey
            </motion.h2>
            <motion.p 
              className="text-white/60 mb-8 text-sm leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              Create your first playlist and organize your favorite songs
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)",
                y: -2
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl text-white font-semibold"
              transition={{ duration: 0.6, delay: 1.4, type: "spring", stiffness: 200 }}
            >
              Create Your First Playlist
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            {playlists.map((playlist, index) => {
              const firstTrackId = playlist.trackIds[0];
              const firstTrack = firstTrackId ? tracks[firstTrackId] : null;

              return (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, y: 30, scale: 0.8, rotateY: -15 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
                  transition={{ 
                    delay: index * 0.15 + 1, 
                    duration: 0.6,
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -5,
                    rotateY: 5,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <PlaylistCard
                    id={playlist.id}
                    name={playlist.name}
                    trackCount={playlist.trackIds.length}
                    coverArtwork={firstTrack?.artworkUrl}
                    onClick={() => onPlaylistClick(playlist.id)}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Create Playlist Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-slate-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name (optional)"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreatePlaylist();
                }
              }}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePlaylist} className="bg-white text-black hover:bg-white/90">
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
