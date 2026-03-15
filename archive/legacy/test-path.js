const PERSONAS = {
  AUDITEE: {
    allowedPaths: [
      '/dashboard',
      '/execution/actions',
      '/execution/actions/*',
      '/execution/findings',
      '/execution/findings/*',
      '/auditee',
      '/auditee/*',
      '/auditee-portal',
      '/auditee-portal/*',
    ],
    hiddenPaths: ['*'],
  }
};

const path = process.argv[2];
const config = PERSONAS.AUDITEE;

function isPathAllowed(path) {
  if (config.hiddenPaths.includes('*')) {
    return config.allowedPaths.some(allowed => {
      if (allowed === '*') return true;
      if (allowed.endsWith('/*')) {
        const base = allowed.slice(0, -2);
        return path === base || path.startsWith(base + '/');
      }
      return path === allowed || path.startsWith(allowed + '/');
    });
  }
  return false;
}

console.log(`${path} -> ${isPathAllowed(path)}`);
