import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  year?: string;
  duration: number; // in seconds
  artworkUrl?: string;
  dominantColor: string;
  blobUrl: string;
  file?: File;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
}

export type PlaybackMode = 'ordered' | 'shuffle' | 'repeat';

interface MusicStore {
  // Data
  tracks: Record<string, Track>;
  playlists: Playlist[];
  
  // Player state
  currentTrackId: string | null;
  currentPlaylistId: string | null;
  isPlaying: boolean;
  currentTime: number;
  playbackMode: PlaybackMode;
  queue: string[];
  
  // Actions - Playlists
  createPlaylist: (name?: string) => string;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  
  // Actions - Tracks
  addTrack: (track: Track) => void;
  addTracksToPlaylist: (playlistId: string, trackIds: string[]) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  deleteTrack: (trackId: string) => void;
  reorderPlaylistTracks: (playlistId: string, trackIds: string[]) => void;
  
  // Actions - Player
  playTrack: (trackId: string, playlistId: string) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
  cyclePlaybackMode: () => void;
}

export const useMusicStore = create<MusicStore>()(
  persist(
    (set, get) => ({
      // Initial state
      tracks: {},
      playlists: [],
      currentTrackId: null,
      currentPlaylistId: null,
      isPlaying: false,
      currentTime: 0,
      playbackMode: 'ordered',
      queue: [],

      // Playlist actions
      createPlaylist: (name) => {
        const playlists = get().playlists;
        const id = `p${Date.now()}`;
        const playlistName = name || `My Playlist ${playlists.length + 1}`;
        
        set({
          playlists: [
            ...playlists,
            {
              id,
              name: playlistName,
              trackIds: [],
              createdAt: Date.now(),
            },
          ],
        });
        
        return id;
      },

      deletePlaylist: (id) => {
        set({
          playlists: get().playlists.filter((p) => p.id !== id),
        });
      },

      renamePlaylist: (id, name) => {
        set({
          playlists: get().playlists.map((p) =>
            p.id === id ? { ...p, name } : p
          ),
        });
      },

      // Track actions
      addTrack: (track) => {
        set({
          tracks: {
            ...get().tracks,
            [track.id]: track,
          },
        });
      },

      addTracksToPlaylist: (playlistId, trackIds) => {
        set({
          playlists: get().playlists.map((p) =>
            p.id === playlistId
              ? { ...p, trackIds: [...p.trackIds, ...trackIds] }
              : p
          ),
        });
      },

      removeTrackFromPlaylist: (playlistId, trackId) => {
        set({
          playlists: get().playlists.map((p) =>
            p.id === playlistId
              ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) }
              : p
          ),
        });
      },

      deleteTrack: (trackId) => {
        const { tracks, playlists, currentTrackId } = get();
        
        // Remove from all playlists
        const updatedPlaylists = playlists.map((p) => ({
          ...p,
          trackIds: p.trackIds.filter((id) => id !== trackId),
        }));
        
        // Remove from tracks
        const { [trackId]: removed, ...remainingTracks } = tracks;
        
        // Stop playback if this was the current track
        const updates: any = {
          tracks: remainingTracks,
          playlists: updatedPlaylists,
        };
        
        if (currentTrackId === trackId) {
          updates.isPlaying = false;
          updates.currentTrackId = null;
        }
        
        set(updates);
      },

      reorderPlaylistTracks: (playlistId, trackIds) => {
        set({
          playlists: get().playlists.map((p) =>
            p.id === playlistId ? { ...p, trackIds } : p
          ),
        });
      },

      // Player actions
      playTrack: (trackId, playlistId) => {
        set({
          currentTrackId: trackId,
          currentPlaylistId: playlistId,
          isPlaying: true,
          currentTime: 0,
        });
      },

      togglePlayPause: () => {
        set({ isPlaying: !get().isPlaying });
      },

      playNext: () => {
        const { currentTrackId, currentPlaylistId, playlists, playbackMode } = get();
        if (!currentTrackId || !currentPlaylistId) return;

        const playlist = playlists.find((p) => p.id === currentPlaylistId);
        if (!playlist || playlist.trackIds.length === 0) return;

        // Repeat mode - replay current track
        if (playbackMode === 'repeat') {
          set({ currentTime: 0 });
          return;
        }

        const currentIndex = playlist.trackIds.indexOf(currentTrackId);

        if (playbackMode === 'shuffle') {
          // Shuffle mode - random track (not current)
          const availableIndices = playlist.trackIds
            .map((_, i) => i)
            .filter((i) => i !== currentIndex);
          const randomIndex =
            availableIndices[Math.floor(Math.random() * availableIndices.length)];
          set({
            currentTrackId: playlist.trackIds[randomIndex],
            currentTime: 0,
          });
        } else {
          // Ordered mode
          const nextIndex = (currentIndex + 1) % playlist.trackIds.length;
          set({
            currentTrackId: playlist.trackIds[nextIndex],
            currentTime: 0,
          });
        }
      },

      playPrevious: () => {
        const { currentTrackId, currentPlaylistId, playlists, playbackMode } = get();
        if (!currentTrackId || !currentPlaylistId) return;

        const playlist = playlists.find((p) => p.id === currentPlaylistId);
        if (!playlist || playlist.trackIds.length === 0) return;

        // Repeat mode - replay current track
        if (playbackMode === 'repeat') {
          set({ currentTime: 0 });
          return;
        }

        const currentIndex = playlist.trackIds.indexOf(currentTrackId);

        if (playbackMode === 'shuffle') {
          // Shuffle mode - random track (not current)
          const availableIndices = playlist.trackIds
            .map((_, i) => i)
            .filter((i) => i !== currentIndex);
          const randomIndex =
            availableIndices[Math.floor(Math.random() * availableIndices.length)];
          set({
            currentTrackId: playlist.trackIds[randomIndex],
            currentTime: 0,
          });
        } else {
          // Ordered mode
          const prevIndex =
            currentIndex === 0 ? playlist.trackIds.length - 1 : currentIndex - 1;
          set({
            currentTrackId: playlist.trackIds[prevIndex],
            currentTime: 0,
          });
        }
      },

      setCurrentTime: (time) => {
        set({ currentTime: time });
      },

      setIsPlaying: (playing) => {
        set({ isPlaying: playing });
      },

      setPlaybackMode: (mode) => {
        set({ playbackMode: mode });
      },

      cyclePlaybackMode: () => {
        const { playbackMode } = get();
        const modes: PlaybackMode[] = ['ordered', 'shuffle', 'repeat'];
        const currentIndex = modes.indexOf(playbackMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        set({ playbackMode: modes[nextIndex] });
      },
    }),
    {
      name: 'music-storage',
      // Persist tracks metadata and playlists structure
      // Note: Audio files themselves cannot be persisted in localStorage
      // Only metadata (title, artist, artwork URLs, etc.) is saved
      partialize: (state) => ({
        tracks: state.tracks,
        playlists: state.playlists,
        playbackMode: state.playbackMode,
        currentTrackId: state.currentTrackId,
        currentPlaylistId: state.currentPlaylistId,
      }),
    }
  )
);
