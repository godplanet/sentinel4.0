/**
 * System Health Widget - Live System Status Monitor
 *
 * Displays real-time health metrics:
 * - Neural Mesh: ONLINE (Simulated)
 * - Active Agents: 2/5
 * - Risk Velocity: STABLE
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Brain,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Users,
  Network,
  Shield,
} from 'lucide-react';
import { supabase } from '@/shared/api/supabase';

interface SystemMetrics {
  neuralMeshStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  activeAgents: number;
  totalAgents: number;
  riskVelocity: 'INCREASING' | 'STABLE' | 'DECREASING';
  velocityValue: number;
  criticalAlerts: number;
  systemUptime: number;
}

export function SystemHealthWidget() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    neuralMeshStatus: 'ONLINE',
    activeAgents: 2,
    totalAgents: 5,
    riskVelocity: 'STABLE',
    velocityValue: 0,
    criticalAlerts: 0,
    systemUptime: 99.9,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      const { data: findings } = await supabase
        .from('audit_findings')
        .select('severity, created_at, risk_score')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: entities } = await supabase
        .from('audit_universe')
        .select('risk_score, risk_velocity');

      const criticalCount = findings?.filter((f) => f.severity === 'Critical').length || 0;

      const avgVelocity =
        entities && entities.length > 0
          ? entities.reduce((sum, e) => sum + (e.risk_velocity || 0), 0) / entities.length
          : 0;

      let velocityStatus: 'INCREASING' | 'STABLE' | 'DECREASING' = 'STABLE';
      if (avgVelocity > 5) velocityStatus = 'INCREASING';
      else if (avgVelocity < -5) velocityStatus = 'DECREASING';

      setMetrics({
        neuralMeshStatus: criticalCount > 5 ? 'DEGRADED' : 'ONLINE',
        activeAgents: 2,
        totalAgents: 5,
        riskVelocity: velocityStatus,
        velocityValue: Math.abs(avgVelocity),
        criticalAlerts: criticalCount,
        systemUptime: 99.9,
      });
    } catch (err) {
      console.error('Failed to fetch system metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
      case 'STABLE':
      case 'DECREASING':
        return 'text-green-500';
      case 'DEGRADED':
      case 'INCREASING':
        return 'text-yellow-500';
      case 'OFFLINE':
        return 'text-red-500';
      default:
        return 'text-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ONLINE':
      case 'STABLE':
      case 'DECREASING':
        return CheckCircle2;
      case 'DEGRADED':
      case 'INCREASING':
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  const getRiskVelocityIcon = () => {
    switch (metrics.riskVelocity) {
      case 'INCREASING':
        return TrendingUp;
      case 'DECREASING':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-center h-40">
          <Activity className="w-8 h-8 text-blue-500 animate-pulse" />
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(metrics.neuralMeshStatus);
  const VelocityIcon = getRiskVelocityIcon();

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-lg">
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <h3 className="font-bold text-white text-sm">System Health</h3>
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </motion.div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-300 font-medium">Neural Mesh</span>
            </div>
            <StatusIcon className={`w-4 h-4 ${getStatusColor(metrics.neuralMeshStatus)}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-lg font-bold ${getStatusColor(metrics.neuralMeshStatus)}`}
            >
              {metrics.neuralMeshStatus}
            </span>
            <span className="text-xs text-slate-500">(Simulated)</span>
          </div>
          <div className="mt-2 w-full bg-slate-700 rounded-full h-1">
            <motion.div
              className="bg-green-500 h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-300 font-medium">Active Agents</span>
            </div>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-purple-400">
              {metrics.activeAgents}
            </span>
            <span className="text-slate-400 text-sm">/ {metrics.totalAgents}</span>
          </div>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: metrics.totalAgents }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i < metrics.activeAgents ? 'bg-purple-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="mt-2 text-[10px] text-slate-500">
            Sentinel Prime • Investigator
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-slate-300 font-medium">Risk Velocity</span>
            </div>
            <VelocityIcon className={`w-4 h-4 ${getStatusColor(metrics.riskVelocity)}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-lg font-bold ${getStatusColor(metrics.riskVelocity)}`}
            >
              {metrics.riskVelocity}
            </span>
            <span className="text-xs text-slate-500">
              {metrics.velocityValue.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
            <div className="text-center">
              <div className="text-slate-500">Trend</div>
              <div className="font-bold text-slate-300">
                {metrics.riskVelocity === 'INCREASING' ? '+' : metrics.riskVelocity === 'DECREASING' ? '-' : '→'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-slate-500">Alerts</div>
              <div className="font-bold text-red-400">{metrics.criticalAlerts}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-500">Uptime</div>
              <div className="font-bold text-green-400">{metrics.systemUptime}%</div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Last Updated</span>
            <span className="text-slate-400">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
