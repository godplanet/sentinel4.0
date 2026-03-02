export interface DelphiRisk {
  id: string;
  title: string;
  description: string;
  category: string;
  /** Mevcut DB skorları (slider başlangıç değeri); API'den gelir. */
  currentVote?: Vote;
}

export interface Vote {
  likelihood: number;
  impact: number;
  velocity: number;
}
