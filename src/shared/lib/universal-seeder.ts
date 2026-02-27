const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface SeedProgress {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message: string;
  count?: number;
}

async function callSeedManager(path: string, method: 'GET' | 'POST' = 'GET') {
  const url = `${SUPABASE_URL}/functions/v1/seed-manager${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`seed-manager ${path} failed (${res.status}): ${text}`);
  }

  return res.json();
}

export class UniversalSeeder {
  private progress: SeedProgress[] = [];
  private onProgressUpdate?: (progress: SeedProgress[]) => void;

  constructor(onProgressUpdate?: (progress: SeedProgress[]) => void) {
    this.onProgressUpdate = onProgressUpdate;
  }

  private updateProgress(step: string, status: SeedProgress['status'], message: string, count?: number) {
    const existing = this.progress.find(p => p.step === step);
    if (existing) {
      existing.status = status;
      existing.message = message;
      existing.count = count;
    } else {
      this.progress.push({ step, status, message, count });
    }
    this.onProgressUpdate?.([...this.progress]);
  }

  async runFullSeed() {
    this.progress = [];
    this.updateProgress('wipe', 'running', 'Clearing existing data...');

    try {
      this.updateProgress('wipe', 'running', 'Wiping and reseeding via edge function...');
      const result = await callSeedManager('/reseed', 'POST');

      if (!result.ok) {
        throw new Error(result.error || 'Edge function returned error');
      }

      this.updateProgress('wipe', 'completed', 'Data cleared');

      const counts = result.counts || {};
      const tableNames = Object.keys(counts);
      for (const table of tableNames) {
        this.updateProgress(
          `seed_${table}`,
          'completed',
          `${table}: ${counts[table]} records`,
          counts[table]
        );
      }

      return { success: true, progress: this.progress };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.updateProgress('wipe', 'error', `Failed: ${msg}`);
      return { success: false, error, progress: this.progress };
    }
  }

  async getTableCounts(): Promise<Record<string, number>> {
    try {
      const result = await callSeedManager('/counts', 'GET');
      return result.counts || {};
    } catch {
      return {};
    }
  }
}

export async function forceReseedViaEdge(): Promise<void> {
  const result = await callSeedManager('/reseed', 'POST');
  if (!result.ok) {
    throw new Error(result.error || 'Reseed failed');
  }
}
