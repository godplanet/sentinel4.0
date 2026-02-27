import { useState } from 'react';
import { Users } from 'lucide-react';
import type { PeerInfo } from '../hooks/useCollaboration';

interface PresenceBarProps {
  userMeta: { name: string; color: string };
  peers: PeerInfo[];
}

function PeerDot({ peer }: { peer: PeerInfo }) {
  const [hovered, setHovered] = useState(false);
  const initials = peer.name
    .split('-')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-sans font-bold text-white ring-2 ring-white shadow-sm cursor-default select-none"
        style={{ backgroundColor: peer.color }}
      >
        {initials}
      </div>
      {hovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-sans rounded-lg whitespace-nowrap shadow-lg pointer-events-none z-50">
          <div className="font-semibold">{peer.name}</div>
          {peer.activeBlockId && (
            <div className="text-slate-400 text-[10px] mt-0.5">Blok görüntülüyor</div>
          )}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
              border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"
          />
        </div>
      )}
    </div>
  );
}

export function PresenceBar({ userMeta, peers }: PresenceBarProps) {
  const totalOnline = peers.length + 1;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-xs font-sans text-slate-500">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="hidden md:inline">{totalOnline} çevrimiçi</span>
      </div>

      <div className="flex items-center -space-x-1.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-sans font-bold text-white ring-2 ring-white shadow-sm relative z-10"
          style={{ backgroundColor: userMeta.color }}
          title={`${userMeta.name} (Siz)`}
        >
          {userMeta.name.slice(0, 2).toUpperCase()}
        </div>
        {peers.slice(0, 4).map((peer, i) => (
          <div key={i} style={{ zIndex: 9 - i }}>
            <PeerDot peer={peer} />
          </div>
        ))}
        {peers.length > 4 && (
          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-sans font-semibold text-slate-600 ring-2 ring-white shadow-sm">
            +{peers.length - 4}
          </div>
        )}
      </div>
    </div>
  );
}
