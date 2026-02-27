import { useEffect, useState } from 'react';
import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';

interface DebugStats {
  userCount: number;
  engagementCount: number;
  findingCount: number;
  error: string | null;
}

export function DebugBar() {
  const [stats, setStats] = useState<DebugStats>({
    userCount: -1,
    engagementCount: -1,
    findingCount: -1,
    error: null,
  });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    async function probe() {
      try {
        const [users, engagements, findings] = await Promise.all([
          supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('tenant_id', ACTIVE_TENANT_ID),
          supabase.from('audit_engagements').select('id', { count: 'exact', head: true }).eq('tenant_id', ACTIVE_TENANT_ID),
          supabase.from('audit_findings').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          userCount: users.count ?? 0,
          engagementCount: engagements.count ?? 0,
          findingCount: findings.count ?? 0,
          error: users.error?.message || engagements.error?.message || findings.error?.message || null,
        });
      } catch (err) {
        setStats(prev => ({ ...prev, error: err instanceof Error ? err.message : 'Unknown error' }));
      }
    }

    probe();
    const interval = setInterval(probe, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  const isAlive = stats.userCount > 0;
  const statusDot = isAlive ? '#22c55e' : stats.error ? '#ef4444' : '#eab308';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 99999,
      background: '#0f172a',
      borderBottom: `2px solid ${statusDot}`,
      padding: '6px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      fontFamily: 'ui-monospace, monospace',
      fontSize: '12px',
      color: '#94a3b8',
    }}>
      <span style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: statusDot,
        boxShadow: `0 0 6px ${statusDot}`,
        flexShrink: 0,
      }} />

      <span style={{ color: '#f87171', fontWeight: 700, letterSpacing: '0.5px' }}>
        DEBUG MODE
      </span>

      <span style={{ color: '#64748b' }}>|</span>

      <span>
        Tenant: <span style={{ color: '#38bdf8' }}>...{ACTIVE_TENANT_ID.slice(-4)}</span>
      </span>

      <span style={{ color: '#64748b' }}>|</span>

      <span>
        Users: <span style={{ color: isAlive ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
          {stats.userCount === -1 ? '...' : stats.userCount}
        </span>
      </span>

      <span style={{ color: '#64748b' }}>|</span>

      <span>
        Engagements: <span style={{ color: '#38bdf8', fontWeight: 600 }}>
          {stats.engagementCount === -1 ? '...' : stats.engagementCount}
        </span>
      </span>

      <span style={{ color: '#64748b' }}>|</span>

      <span>
        Findings: <span style={{ color: '#38bdf8', fontWeight: 600 }}>
          {stats.findingCount === -1 ? '...' : stats.findingCount}
        </span>
      </span>

      {stats.error && (
        <>
          <span style={{ color: '#64748b' }}>|</span>
          <span style={{ color: '#f87171' }}>ERR: {stats.error}</span>
        </>
      )}

      <button
        onClick={() => setVisible(false)}
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          color: '#64748b',
          cursor: 'pointer',
          fontSize: '14px',
          padding: '0 4px',
        }}
      >
        x
      </button>
    </div>
  );
}
