/**
 * LIVE SCANNER - PREDATOR TERMINAL
 *
 * Matrix-style scrolling transaction scanner with real-time anomaly detection
 * Visual feedback: GREEN for normal, RED for anomalies
 */

import { useState, useEffect, useRef } from 'react';
import { Play, Square, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanLog {
  id: string;
  transactionId: string;
  amount: number;
  status: 'scanning' | 'ok' | 'anomaly';
  message: string;
  timestamp: string;
}

interface LiveScannerProps {
  onAnomalyDetected?: (log: ScanLog) => void;
  onScanComplete?: (results: { total: number; anomalies: number }) => void;
}

export function LiveScanner({ onAnomalyDetected, onScanComplete }: LiveScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [stats, setStats] = useState({ scanned: 0, anomalies: 0 });
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const generateMockTransaction = (index: number): ScanLog => {
    const id = `TXN-${Date.now()}-${index}`;
    const amount = Math.random() * 100000;

    const isAnomaly = Math.random() < 0.15;

    let message = '';
    let status: 'scanning' | 'ok' | 'anomaly' = 'scanning';

    if (isAnomaly) {
      const anomalyTypes = [
        'Structuring pattern detected',
        'Benford violation: Leading digit anomaly',
        'High-value transaction (>$50k)',
        'Ghost employee salary payment',
        'Duplicate payment detected',
        'Round-dollar amount (potential manipulation)',
      ];
      message = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
      status = 'anomaly';
    } else {
      message = 'Transaction validated';
      status = 'ok';
    }

    return {
      id,
      transactionId: id,
      amount,
      status,
      message,
      timestamp: new Date().toISOString(),
    };
  };

  const runScan = async () => {
    setIsScanning(true);
    setLogs([]);
    setStats({ scanned: 0, anomalies: 0 });

    const totalTransactions = 50;
    let anomalyCount = 0;

    for (let i = 0; i < totalTransactions; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 100));

      const scanningLog: ScanLog = {
        id: `scan-${i}`,
        transactionId: `TXN-${Date.now()}-${i}`,
        amount: Math.random() * 100000,
        status: 'scanning',
        message: 'Analyzing...',
        timestamp: new Date().toISOString(),
      };

      setLogs((prev) => [...prev.slice(-20), scanningLog]);

      await new Promise((resolve) => setTimeout(resolve, 50));

      const resultLog = generateMockTransaction(i);
      if (resultLog.status === 'anomaly') {
        anomalyCount++;
        if (onAnomalyDetected) {
          onAnomalyDetected(resultLog);
        }
      }

      setLogs((prev) => [...prev.slice(-20), resultLog]);
      setStats({ scanned: i + 1, anomalies: anomalyCount });
    }

    setIsScanning(false);
    if (onScanComplete) {
      onScanComplete({ total: totalTransactions, anomalies: anomalyCount });
    }
  };

  const stopScan = () => {
    setIsScanning(false);
  };

  const getStatusIcon = (status: ScanLog['status']) => {
    switch (status) {
      case 'scanning':
        return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'ok':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'anomaly':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ScanLog['status']) => {
    switch (status) {
      case 'scanning':
        return 'text-blue-400';
      case 'ok':
        return 'text-green-500';
      case 'anomaly':
        return 'text-red-500 font-bold';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-green-400 font-mono text-sm font-bold">PREDATOR.SCANNER</span>
          </div>
          <div className="h-4 w-px bg-slate-600" />
          <span className="text-slate-400 text-xs font-mono">
            Continuous Control Monitoring Engine
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isScanning ? (
            <button
              onClick={runScan}
              className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Play className="w-4 h-4" />
              Start Scan
            </button>
          ) : (
            <button
              onClick={stopScan}
              className="flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-mono">SCANNED:</span>
          <span className="text-white font-mono text-sm font-bold">{stats.scanned}</span>
        </div>
        <div className="h-3 w-px bg-slate-600" />
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-mono">ANOMALIES:</span>
          <span className={`font-mono text-sm font-bold ${stats.anomalies > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {stats.anomalies}
          </span>
        </div>
        <div className="h-3 w-px bg-slate-600" />
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-mono">STATUS:</span>
          <span className={`font-mono text-xs font-bold ${isScanning ? 'text-green-400' : 'text-slate-500'}`}>
            {isScanning ? 'ACTIVE' : 'IDLE'}
          </span>
        </div>
      </div>

      <div className="bg-black p-4 h-80 overflow-y-auto font-mono text-xs" style={{ fontFamily: 'Consolas, Monaco, monospace' }}>
        {logs.length === 0 && !isScanning && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Scanner idle. Click "Start Scan" to begin.</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {logs.map((log, index) => (
            <motion.div
              key={`${log.id}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-3 py-1 ${log.status === 'anomaly' ? 'bg-red-950 bg-opacity-30' : ''}`}
            >
              <span className="text-slate-600 select-none">
                {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <div className="flex-shrink-0">{getStatusIcon(log.status)}</div>
              <span className={`font-semibold ${getStatusColor(log.status)}`}>
                {log.transactionId}
              </span>
              <span className="text-slate-400">{formatAmount(log.amount)}</span>
              <span className={`flex-1 ${getStatusColor(log.status)}`}>
                {log.status === 'scanning' ? (
                  <span className="animate-pulse">{log.message}</span>
                ) : (
                  log.message
                )}
              </span>
              {log.status === 'anomaly' && (
                <span className="text-red-500 font-bold text-xs px-2 py-0.5 bg-red-950 rounded">
                  ALERT
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={logsEndRef} />
      </div>

      {isScanning && (
        <div className="px-4 py-2 bg-slate-800 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-600 to-green-400"
                initial={{ width: '0%' }}
                animate={{ width: `${(stats.scanned / 50) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-slate-400 text-xs font-mono">{Math.round((stats.scanned / 50) * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
