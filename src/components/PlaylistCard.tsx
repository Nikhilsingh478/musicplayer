import { Music2 } from 'lucide-react';
import { getFallbackArtwork } from '../lib/audioUtils';

interface PlaylistCardProps {
  id: string;
  name: string;
  trackCount: number;
  coverArtwork?: string;
  onClick: () => void;
}

export function PlaylistCard({
  id,
  name,
  trackCount,
  coverArtwork,
  onClick,
}: PlaylistCardProps) {
  const gradients = [
    'from-[#6ABAD3] via-[#5AA9C8] to-[#4B98BD]',
    'from-[#D83631] via-[#E8443A] to-[#C82E28]',
    'from-[#5A4DD8] via-[#6858E0] to-[#7867E8]',
    'from-[#4DD88F] via-[#5FE09D] to-[#3BC47A]',
    'from-[#FF6B6B] via-[#FF8787] to-[#F35959]',
    'from-[#FFB84D] via-[#FFC66B] to-[#F0A53C]',
  ];
  
  const gradient = gradients[parseInt(id.slice(1)) % gradients.length];

  return (
    <button
      onClick={onClick}
      className="w-full bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 hover:shadow-2xl hover:shadow-white/5 transition-all active:scale-[0.96] group"
      style={{ minHeight: '44px' }}
    >
      {/* Cover Art */}
      <div className={`w-full aspect-square bg-gradient-to-br ${gradient} relative flex items-center justify-center overflow-hidden`}>
        {coverArtwork ? (
          <img
            src={coverArtwork}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={getFallbackArtwork(parseInt(id.slice(1)))}
              alt={name}
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300"
            />
            <Music2 className="absolute w-16 h-16 text-white/80 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Info */}
      <div className="p-4 text-left">
        <h3 className="text-white mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
          {name}
        </h3>
        <p className="text-white/60" style={{ fontSize: '14px' }}>
          {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
        </p>
      </div>
    </button>
  );
}
