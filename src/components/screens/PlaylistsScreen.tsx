import { Plus } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 custom-scrollbar overflow-y-auto">
      {/* Content */}
      <div className="max-w-md mx-auto px-5 py-6 pb-20">
        {/* Create Playlist Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95"
            aria-label="Create playlist"
            style={{ minHeight: '44px' }}
          >
            <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
            <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
              New Playlist
            </span>
          </button>
        </div>
        {playlists.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4 text-white/40" style={{ fontSize: '48px' }}>🎵</div>
            <p className="text-white/60 mb-6" style={{ fontSize: '16px' }}>
              No playlists yet
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white text-black hover:bg-white/90"
            >
              Create Your First Playlist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {playlists.map((playlist, index) => {
              const firstTrackId = playlist.trackIds[0];
              const firstTrack = firstTrackId ? tracks[firstTrackId] : null;

              return (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.3 }}
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
          </div>
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
