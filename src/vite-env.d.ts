/// <reference types="vite/client" />

declare module 'json-logic-js' {
  const jsonLogic: {
    apply: (logic: Record<string, unknown>, data: Record<string, unknown>) => unknown;
  };
  export default jsonLogic;
}

// Evrensel Veri Tohumlayıcı'nın (UniversalSeeder) seedleme aşamaları arasında
// geçici olarak taşıdığı ara veriyi tutan global window genişletmesi.
interface SeedData {
  tenant?: { id: string; name: string };
  users?: unknown[];
  entities?: unknown[];
  risks?: unknown[];
  assessments?: unknown[];
  engagements?: unknown[];
  findings?: unknown[];
  actionPlans?: unknown[];
  workpapers?: unknown[];
}

interface Window {
  __seedData?: SeedData;
}
