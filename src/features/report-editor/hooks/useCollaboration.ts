import { useEffect, useMemo, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

const PEER_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#06B6D4', '#F97316', '#14B8A6',
];

function randomColor() {
  return PEER_COLORS[Math.floor(Math.random() * PEER_COLORS.length)];
}

function getSessionUser(): { name: string; color: string } {
  const key = 'sentinel-collab-user';
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  const meta = {
    name: `Denetçi-${Math.floor(Math.random() * 900) + 100}`,
    color: randomColor(),
  };
  try { sessionStorage.setItem(key, JSON.stringify(meta)); } catch {}
  return meta;
}

export interface PeerInfo {
  name: string;
  color: string;
  activeBlockId?: string;
}

export interface CollabContext {
  ydoc: Y.Doc;
  provider: WebrtcProvider | null;
  userMeta: { name: string; color: string };
  peers: PeerInfo[];
  broadcastActiveBlock: (blockId: string | null) => void;
}

export function useCollaboration(reportId: string): CollabContext {
  const userMeta = useMemo(() => getSessionUser(), []);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);
  const [peers, setPeers] = useState<PeerInfo[]>([]);

  if (!ydocRef.current) {
    ydocRef.current = new Y.Doc();
  }

  useEffect(() => {
    if (!reportId) return;
    const ydoc = ydocRef.current!;
    let provider: WebrtcProvider | null = null;

    try {
      provider = new WebrtcProvider(`sentinel-report-${reportId}`, ydoc, {
        signaling: ['wss://signaling.yjs.dev'],
      });
      provider.awareness.setLocalStateField('user', {
        ...userMeta,
        activeBlockId: null,
      });
      provider.awareness.on('change', () => {
        const states = Array.from(provider!.awareness.getStates().values()) as any[];
        const updated: PeerInfo[] = states
          .filter((s) => s.user && s.user.name !== userMeta.name)
          .map((s) => ({
            name: s.user.name,
            color: s.user.color,
            activeBlockId: s.user.activeBlockId ?? undefined,
          }));
        setPeers(updated);
      });
      providerRef.current = provider;
    } catch (err) {
      console.warn('[Collab] WebRTC provider could not connect:', err);
    }

    return () => {
      provider?.destroy();
      providerRef.current = null;
    };
  }, [reportId]);

  const broadcastActiveBlock = (blockId: string | null) => {
    providerRef.current?.awareness.setLocalStateField('user', {
      ...userMeta,
      activeBlockId: blockId,
    });
  };

  return {
    ydoc: ydocRef.current,
    provider: providerRef.current,
    userMeta,
    peers,
    broadcastActiveBlock,
  };
}
