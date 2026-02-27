export const THEME_CONFIG = {
  environments: {
    PROD: {
      sidebar: 'bg-slate-900',
      badge: 'bg-slate-100 text-slate-800',
      indicator: 'bg-emerald-500'
    },
    UAT: {
      sidebar: 'bg-emerald-900', // Yeşil Ton (Test Ortamı)
      badge: 'bg-emerald-100 text-emerald-800',
      indicator: 'bg-yellow-500'
    },
    DEV: {
      sidebar: 'bg-rose-900', // Kırmızı Ton (Geliştirme Ortamı)
      badge: 'bg-rose-100 text-rose-800',
      indicator: 'bg-blue-500'
    }
  }
} as const;

export const getEnvClasses = (env: keyof typeof THEME_CONFIG.environments) => {
  return THEME_CONFIG.environments[env] || THEME_CONFIG.environments.PROD;
};
