export interface DelphiRisk {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface Vote {
  likelihood: number;
  impact: number;
  velocity: number;
}
