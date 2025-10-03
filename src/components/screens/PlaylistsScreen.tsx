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
          animate={{ 
            rotate: 360,
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-8"
        >
          <Disc3 className="w-16 h-16 text-purple-400/20" />
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-40 right-12"
        >
          <Headphones className="w-12 h-12 text-pink-400/20" />
        </motion.div>
        
        <motion.div
          animate={{ 
            rotate: -360,
            x: [0, 20, 0],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-32 left-16"
        >
          <Music className="w-20 h-20 text-blue-400/20" />
        </motion.div>

        {/* Gradient Orbs */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl"
        />
        
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.08, 0.12, 0.08]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/3 left-1/3 w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md mx-auto px-6 py-8 pb-24">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-white text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                My Playlists
              </h1>
              <p className="text-white/60 text-sm">
                {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              aria-label="Create playlist"
            >
              <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
            </motion.button>
          </div>
        </motion.div>
        {/* Playlists Grid */}
        {playlists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mb-6 text-6xl"
            >
              🎵
            </motion.div>
            <h2 className="text-white text-xl font-semibold mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Start Your Music Journey
            </h2>
            <p className="text-white/60 mb-8 text-sm leading-relaxed">
              Create your first playlist and organize your favorite songs
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl text-white font-semibold"
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
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: index * 0.1, 
                    duration: 0.4,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -2
                  }}
                  whileTap={{ scale: 0.98 }}
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
