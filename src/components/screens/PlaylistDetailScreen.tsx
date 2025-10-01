import { ChevronLeft, Trash2, GripVertical, Play, Pause } from 'lucide-react';
import { useMusicStore, Track } from '../../lib/store';
import { UploadZone } from '../UploadZone';
import { NavigationMenu } from '../NavigationMenu';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { formatTime, getFallbackArtwork } from '../../lib/audioUtils';
import { toast } from 'sonner@2.0.3';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { useState } from 'react';

interface PlaylistDetailScreenProps {
  playlistId: string;
  onBack: () => void;
  onTrackClick: (trackId: string) => void;
  onNavigateToPlaylists: () => void;
  onNavigateToSongs: () => void;
}

// Track row with delete button
function PlaylistTrackRow({
  track,
  isPlaying = false,
  isCurrentTrack = false,
  onClick,
  onDelete,
  dragHandleProps,
}: {
  track: Track;
  isPlaying?: boolean;
  isCurrentTrack?: boolean;
  onClick: () => void;
  onDelete: () => void;
  dragHandleProps?: any;
}) {
  return (
    <div
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
        isCurrentTrack
          ? 'bg-white/10 border border-white/20'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4 text-white/40" />
      </div>

      {/* Artwork */}
      <button
        onClick={onClick}
        className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative active:scale-95 transition-transform"
      >
        <img
          src={track.artworkUrl || getFallbackArtwork()}
          alt={track.title}
          className="w-full h-full object-cover"
        />
        
        {/* Play indicator */}
        {isCurrentTrack && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white fill-white" strokeWidth={0} />
            ) : (
              <Play className="w-4 h-4 text-white fill-white" strokeWidth={0} />
            )}
          </div>
        )}
      </button>

      {/* Info */}
      <button onClick={onClick} className="flex-1 min-w-0 text-left">
        <div
          className={`truncate ${isCurrentTrack ? 'text-white' : 'text-white/90'}`}
          style={{ fontSize: '15px', fontWeight: 600 }}
        >
          {track.title}
        </div>
        <div
          className="text-white/60 truncate"
          style={{ fontSize: '13px' }}
        >
          {track.artist}
        </div>
      </button>

      {/* Duration */}
      <div className="text-white/50 flex-shrink-0" style={{ fontSize: '13px' }}>
        {formatTime(track.duration)}
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-9 h-9 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-all active:scale-95 opacity-0 group-hover:opacity-100"
        aria-label={`Remove ${track.title} from playlist`}
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <Trash2 className="w-4 h-4 text-red-400" strokeWidth={2} />
      </button>
    </div>
  );
}

export function PlaylistDetailScreen({
  playlistId,
  onBack,
  onTrackClick,
  onNavigateToPlaylists,
  onNavigateToSongs,
}: PlaylistDetailScreenProps) {
  const playlists = useMusicStore((s) => s.playlists);
  const tracks = useMusicStore((s) => s.tracks);
  const currentTrackId = useMusicStore((s) => s.currentTrackId);
  const currentPlaylistId = useMusicStore((s) => s.currentPlaylistId);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const reorderPlaylistTracks = useMusicStore((s) => s.reorderPlaylistTracks);
  const deletePlaylist = useMusicStore((s) => s.deletePlaylist);
  const removeTrackFromPlaylist = useMusicStore((s) => s.removeTrackFromPlaylist);
  const playTrack = useMusicStore((s) => s.playTrack);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [trackToRemove, setTrackToRemove] = useState<string | null>(null);

  const playlist = playlists.find((p) => p.id === playlistId);

  if (!playlist) {
    return null;
  }

  const playlistTracks = playlist.trackIds
    .map((id) => tracks[id])
    .filter(Boolean);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newTrackIds = Array.from(playlist.trackIds);
    const [removed] = newTrackIds.splice(result.source.index, 1);
    newTrackIds.splice(result.destination.index, 0, removed);

    reorderPlaylistTracks(playlistId, newTrackIds);
  };

  const handleDeletePlaylist = () => {
    deletePlaylist(playlistId);
    onBack();
  };

  const handleTrackClick = (trackId: string) => {
    playTrack(trackId, playlistId);
    onTrackClick(trackId);
  };

  const handleRemoveTrack = (trackId: string) => {
    removeTrackFromPlaylist(playlistId, trackId);
    setTrackToRemove(null);
    toast.success('Song removed from playlist');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 custom-scrollbar overflow-y-auto">
      {/* Navigation Menu */}
      <NavigationMenu
        title={playlist.name}
        onBack={onBack}
        onNavigateToPlaylists={onNavigateToPlaylists}
        onNavigateToSongs={onNavigateToSongs}
        currentScreen="playlist-detail"
      />

      {/* Playlist Actions Menu */}
      <div className="max-w-md mx-auto px-5 pt-4">
        <div className="flex justify-end">
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-red-500/20 transition-all active:scale-95 group"
            aria-label="Delete playlist"
            style={{ minHeight: '44px' }}
          >
            <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" strokeWidth={2} />
            <span className="text-red-400 group-hover:text-red-300" style={{ fontSize: '14px', fontWeight: 600 }}>
              Delete Playlist
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-5 pb-6 space-y-6">
        {/* Upload Zone */}
        <UploadZone playlistId={playlistId} />

        {/* Track List */}
        {playlistTracks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60" style={{ fontSize: '14px' }}>
              No tracks yet. Upload some music to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60" style={{ fontSize: '14px' }}>
                {playlistTracks.length} {playlistTracks.length === 1 ? 'track' : 'tracks'}
              </p>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="tracks">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                    {playlistTracks.map((track, index) => (
                      <Draggable key={track.id} draggableId={track.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                            }}
                          >
                            <PlaylistTrackRow
                              track={track}
                              isCurrentTrack={
                                currentTrackId === track.id &&
                                currentPlaylistId === playlistId
                              }
                              isPlaying={
                                isPlaying &&
                                currentTrackId === track.id &&
                                currentPlaylistId === playlistId
                              }
                              onClick={() => handleTrackClick(track.id)}
                              onDelete={() => setTrackToRemove(track.id)}
                              dragHandleProps={provided.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </div>

      {/* Delete Playlist Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-800 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Playlist</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to delete "{playlist.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlaylist}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Track Confirmation Dialog */}
      <AlertDialog open={trackToRemove !== null} onOpenChange={() => setTrackToRemove(null)}>
        <AlertDialogContent className="bg-slate-800 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remove Song</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to remove "
              {trackToRemove && tracks[trackToRemove]?.title}" from this playlist?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => trackToRemove && handleRemoveTrack(trackToRemove)}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
