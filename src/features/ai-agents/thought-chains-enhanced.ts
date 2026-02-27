/**
 * Enhanced Thought Chains with Real Mock Integrations
 *
 * These chains actually call the mock adapters to simulate
 * real-world data access and analysis.
 */

import type { ThoughtStep, AgentRole } from './types';
import { dualBrain } from '@/features/ai-persona/DualBrain';

const mockLinkedIn = {
  async getProfile(name: string) {
    return { name, currentCompany: 'Acme Bank', currentRole: 'Senior Auditor', pastExperience: [{ company: 'Acme Consulting', role: 'Vendor Manager', years: '2018-2020' }], education: [], connections: 500, conflictFlags: undefined as string[] | undefined };
  },
  async detectConflictOfInterest(_name: string, vendorCompany: string) {
    const hasConflict = vendorCompany.toLowerCase().includes('consulting') || vendorCompany.toLowerCase().includes('fraud');
    return { hasConflict, evidence: hasConflict ? [`Past employment at ${vendorCompany}`] : [] as string[] };
  },
};

const mockSAP = {
  async getInvoices(_vendorId: string) {
    return [
      { id: 'INV-001', amount: 12500, anomalyFlag: undefined as string | undefined },
      { id: 'INV-002', amount: 9999, anomalyFlag: 'ROUNDED_AMOUNT' },
      { id: 'INV-003', amount: 34200, anomalyFlag: undefined as string | undefined },
    ];
  },
  async getVendorRiskScore(vendorId: string) {
    return { vendorId, riskScore: 45, flags: ['ROUNDED_AMOUNT_PATTERN'] as string[] };
  },
};

const mockSlack = {
  _counter: 0,
  async sendMessage(channel: string, user: string, text: string, threadId?: string) {
    return { id: `msg_${++this._counter}`, channel, user, text, timestamp: new Date().toISOString(), threadId };
  },
};

const mockCoreBanking = {
  async analyzeBenfordsLaw(accountId: string) {
    const anomaly = accountId === 'ACC_FRAUD';
    return {
      accountId,
      totalTransactions: 523,
      digitDistribution: {} as Record<number, number>,
      expectedDistribution: {} as Record<number, number>,
      chiSquareScore: anomaly ? 22.4 : 8.2,
      anomalyDetected: anomaly,
    };
  },
};

async function getInvestigatorChainEnhanced(target: string): Promise<ThoughtStep[]> {
  const steps: ThoughtStep[] = [];

  steps.push({
    type: 'THINKING',
    delay: 800,
    content: `Hedef varlik alindi: "${target}". OSINT taramasi baslatiliyor. LinkedIn profilinde COI (Conflict of Interest) kontrolu yapiliyor.`,
  });

  steps.push({
    type: 'ACTION',
    delay: 1200,
    content: `LinkedIn API'ye sorgu gonderiliyor... Profil: "${target}"`,
    action: 'QUERY_LINKEDIN',
    toolOutput: { api: 'LinkedIn', status: 'QUERYING', profile: target },
  });

  try {
    const profile = await mockLinkedIn.getProfile(target);

    if (profile) {
      const conflictCheck = await mockLinkedIn.detectConflictOfInterest(
        target,
        profile.pastExperience[0]?.company || 'Unknown'
      );

      steps.push({
        type: 'OBSERVATION',
        delay: 1500,
        content: `Profil bulundu. ${profile.name} - ${profile.currentRole} at ${profile.currentCompany}.
COI Analizi: ${conflictCheck.hasConflict ? 'TESPIT EDILDI' : 'Temiz'}.
Kanit: ${conflictCheck.evidence.join(', ')}`,
        toolOutput: {
          profile: {
            name: profile.name,
            company: profile.currentCompany,
            role: profile.currentRole,
          },
          conflictOfInterest: conflictCheck,
        },
      });

      if (conflictCheck.hasConflict) {
        steps.push({
          type: 'THINKING',
          delay: 1000,
          content: 'Cikarcatisma tespit edildi! SAP sisteminde ilgili tedarikci faturalari analiz ediliyor...',
        });

        const vendorId = 'V001';
        steps.push({
          type: 'ACTION',
          delay: 1300,
          content: `SAP ERP'den tedarikci ${vendorId} faturalari yukleniyor...`,
          action: 'QUERY_SAP',
          toolOutput: { vendor_id: vendorId, system: 'SAP' },
        });

        const invoices = await mockSAP.getInvoices(vendorId);
        const riskScore = await mockSAP.getVendorRiskScore(vendorId);

        steps.push({
          type: 'OBSERVATION',
          delay: 1400,
          content: `${invoices.length} fatura bulundu. Anomali bayragi: ${invoices.filter((inv) => inv.anomalyFlag).length}.
Tedarikci risk skoru: ${riskScore.riskScore}/100.
Risk bayraklari: ${riskScore.flags.join(', ')}`,
          toolOutput: {
            totalInvoices: invoices.length,
            anomalyCount: invoices.filter((inv) => inv.anomalyFlag).length,
            riskScore: riskScore,
          },
        });

        if (riskScore.riskScore > 60) {
          steps.push({
            type: 'CONCLUSION',
            delay: 600,
            content: `YUKSEK RISK. Cikarcatisma + Yuksek tedarikci riski tespit edildi.
Sorusturma Kasasina sevk onerilir. Onerilen aksiyon: ESCALATE_TO_VAULT. Guven: %94.`,
            toolOutput: {
              risk_level: 'HIGH',
              recommended_action: 'ESCALATE_TO_VAULT',
              confidence: 0.94,
              reasons: ['CONFLICT_OF_INTEREST', 'HIGH_VENDOR_RISK', 'INVOICE_ANOMALIES'],
            },
          });
        } else {
          steps.push({
            type: 'CONCLUSION',
            delay: 600,
            content: `ORTA RISK. Cikarcatisma tespit edildi ancak fatura orntusu normal.
Izlemeye devam edilmeli. Onerilen aksiyon: MONITOR.`,
            toolOutput: {
              risk_level: 'MEDIUM',
              recommended_action: 'MONITOR',
              confidence: 0.78,
            },
          });
        }
      } else {
        steps.push({
          type: 'CONCLUSION',
          delay: 600,
          content: `DUSUK RISK. Profil temiz, cikarcatisma tespit edilmedi. Rutin kontrol devam etsin.`,
          toolOutput: {
            risk_level: 'LOW',
            recommended_action: 'CONTINUE_MONITORING',
            confidence: 0.85,
          },
        });
      }
    } else {
      steps.push({
        type: 'OBSERVATION',
        delay: 1200,
        content: `Profil bulunamadi. Bu kendisi bir risk goestergesi olabilir (hayalet calisan?).
IK veritabani ile capraz kontrol onerilir.`,
        toolOutput: { profile_found: false, risk_flag: 'GHOST_EMPLOYEE' },
      });

      steps.push({
        type: 'CONCLUSION',
        delay: 600,
        content: `ORTA-YUKSEK RISK. Profil eksikligi supheli. Manuel inceleme gerekli.`,
        toolOutput: {
          risk_level: 'MEDIUM_HIGH',
          recommended_action: 'MANUAL_REVIEW',
          confidence: 0.72,
        },
      });
    }
  } catch (error) {
    steps.push({
      type: 'OBSERVATION',
      delay: 800,
      content: `Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
      toolOutput: { error: true },
    });
  }

  return steps;
}

async function getNegotiatorChainEnhanced(target: string): Promise<ThoughtStep[]> {
  const steps: ThoughtStep[] = [];

  steps.push({
    type: 'THINKING',
    delay: 800,
    content: `Bulgu muzakere talebi alindi: "${target}". Denetlenen birim yaniti analiz ediliyor...`,
  });

  steps.push({
    type: 'ACTION',
    delay: 1200,
    content: 'Slack API uzerinden denetlenen birimle iletisim kuruluyor... Karsi arguman isteniyor.',
    action: 'SLACK_MESSAGE',
    toolOutput: { channel: '#audit-negotiations', action: 'request_counter_argument' },
  });

  try {
    const initialMessage = await mockSlack.sendMessage(
      '#audit-negotiations',
      'Sentinel Negotiator Bot',
      `Sayin Denetlenen, "${target}" bulgusuna iliskin karsi argumaninizi lutfen paylasir misiniz?`
    );

    steps.push({
      type: 'OBSERVATION',
      delay: 1400,
      content: `Slack mesaji gonderildi (Thread ID: ${initialMessage.threadId || initialMessage.id}).
Denetlenen birim yaniti bekleniyor... (Simulasyon: Otomatik yanit uretiliyor)`,
      toolOutput: { message_sent: true, thread_id: initialMessage.threadId || initialMessage.id },
    });

    const simulatedResponse = await mockSlack.sendMessage(
      '#audit-negotiations',
      'Auditee User',
      `Kontrol eksikligi dogru ancak risk seviyesi cok yuksek. Operasyonel etkisi sinirli.
Kompanzasyon kontrolleri mevcut. Siddetin ORTA'ya dusurulmesini talep ediyoruz.`,
      initialMessage.id
    );

    steps.push({
      type: 'THINKING',
      delay: 1000,
      content: `Karsi arguman alindi. COSO Cercevesi ve Risk Anayasasi uzerinden analiz ediliyor...
Kompanzasyon kontrolleri iddiasi dogrulanacak.`,
    });

    steps.push({
      type: 'ACTION',
      delay: 1500,
      content: `Risk Anayasasi'ndan kontrol etkinligi kurallarini sorguluyorum...
Kompanzasyon kontrolleri siddet dusurme icin yeterli mi?`,
      action: 'QUERY_CONSTITUTION',
      toolOutput: { query: 'compensating_controls_policy', framework: 'COSO' },
    });

    steps.push({
      type: 'OBSERVATION',
      delay: 1300,
      content: `Anayasa Kurali: Kompanzasyon kontrolleri siddet dusurumune izin verir ANCAK:
1. Kontroller formally documented olmali
2. Test edilmis olmali (son 6 ay)
3. Ayni risk seviyesini yakaliyorsa

Denetlenen birim bu kaniti sunmadi. Arguman ZAYIF.`,
      toolOutput: {
        constitutional_rule: 'COMPENSATING_CONTROLS_POLICY',
        requirements: ['documented', 'tested', 'equivalent_coverage'],
        auditee_evidence: 'INSUFFICIENT',
      },
    });

    steps.push({
      type: 'THINKING',
      delay: 900,
      content: `Kanit yetersiz. Emsal veritabaninda benzer vakalari inceliyorum...`,
    });

    steps.push({
      type: 'ACTION',
      delay: 800,
      content: `Benzer bulgular icin muzakere emsal veritabani sorgulanıyor...`,
      action: 'QUERY_PRECEDENTS',
      toolOutput: { category: 'control_gap', framework: 'COSO', severity: 'HIGH' },
    });

    steps.push({
      type: 'OBSERVATION',
      delay: 1200,
      content: `3 emsal bulundu:
1. Benzer kontrol acigi - YUKSEK siddet korundu (2024-Q1)
2. Kontrol acigi + kanit - ORTA'ya dusuruldu (2023-Q4)
3. Kontrol acigi - Ust yonetime sevk (2024-Q2)

Ortalama cozum suresi: 14 gun. Basari orani: %67.`,
      toolOutput: {
        precedents_found: 3,
        maintained_high: 1,
        reduced: 1,
        escalated: 1,
        avg_resolution_days: 14,
      },
    });

    await mockSlack.sendMessage(
      '#audit-negotiations',
      'Sentinel Negotiator Bot',
      `Sayin Denetlenen, karsi argumaniniz incelendi.
Kompanzasyon kontrolleri iddiasi icin formal dokumantasyon ve test kaniti gereklidir (Risk Anayasasi Madde 4.2.3).
Mevcut durumda siddet YUKSEK olarak korunmaktadir.
Ancak, aksiyon zaman cizelgesini 60 gun'den 90 gun'e uzatmayi onerebildik.`,
      simulatedResponse.id
    );

    steps.push({
      type: 'CONCLUSION',
      delay: 600,
      content: `Muzakere tamamlandi. Sonuc: YUKSEK siddeti korumak.
Uzlasma: Zaman cizelgesi 60 gun -> 90 gun.
Denetlenen birim itirazda bulunmazsa SONLANDIRILDI.`,
      toolOutput: {
        final_severity: 'HIGH',
        timeline_adjustment: '60d->90d',
        negotiation_status: 'COMPLETED',
        confidence: 0.89,
      },
    });
  } catch (error) {
    steps.push({
      type: 'OBSERVATION',
      delay: 800,
      content: `Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
      toolOutput: { error: true },
    });
  }

  return steps;
}

async function getChaosMonkeyChainEnhanced(target: string): Promise<ThoughtStep[]> {
  const steps: ThoughtStep[] = [];

  steps.push({
    type: 'THINKING',
    delay: 800,
    content: `Kaos testi baslatiliyor. Hedef: "${target}".
Test 1: Core Banking sisteminde Benford's Law anomali kontrolu...`,
  });

  steps.push({
    type: 'ACTION',
    delay: 1500,
    content: `Core Banking API'den ${target} hesap islemleri yukleniyor... Benford analizi baslatiliyor.`,
    action: 'FETCH_TRANSACTIONS',
    toolOutput: { account_id: target, system: 'CoreBanking' },
  });

  try {
    const accountId = target.includes('ACC') ? target : 'ACC_FRAUD';

    const benfordResult = await mockCoreBanking.analyzeBenfordsLaw(accountId);

    steps.push({
      type: 'OBSERVATION',
      delay: 1200,
      content: `Benford analizi tamamlandi.
Toplam islem: ${benfordResult.totalTransactions}
Chi-kare skoru: ${benfordResult.chiSquareScore.toFixed(2)} (Kritik esik: 15.51)
Anomali: ${benfordResult.anomalyDetected ? 'TESPIT EDILDI' : 'Yok'}`,
      toolOutput: benfordResult,
    });

    if (benfordResult.anomalyDetected) {
      steps.push({
        type: 'THINKING',
        delay: 900,
        content: `ANOMALI TESPIT EDILDI! Dual-Brain Orange Mode'a geciliyor...
ComputeAI: Ilk basamak dagilimi analiz ediliyor.`,
      });

      const computation = await dualBrain.executeComputation({
        type: 'BENFORD',
        parameters: {
          data: Array.from({ length: benfordResult.totalTransactions }, (_, i) =>
            Math.floor(Math.random() * 10000)
          ),
        },
      });

      if (computation.success) {
        steps.push({
          type: 'ACTION',
          delay: 1800,
          content: `Orange Brain: Benford analiz kodu yurutuldu.
\`\`\`typescript
${computation.code}
\`\`\``,
          action: 'RUN_COMPUTE_ENGINE',
          toolOutput: computation,
        });

        steps.push({
          type: 'OBSERVATION',
          delay: 1400,
          content: `Orange Brain Sonuc: Anomali dogrulandi.
Chi-kare: ${(computation.result as any).chiSquareScore.toFixed(2)}
Bu, manual manipulasyonun istatistiksel kaniti.`,
          toolOutput: computation.result,
        });
      }

      steps.push({
        type: 'CONCLUSION',
        delay: 600,
        content: `KAOS TESTI BASARISIZ (Beklenen Sonuc).
Hesap ${accountId} anomali gosterdi - sistem dogrru tespit etti.
Fraud Detection Engine calisiyor. TEST BASARILI.`,
        toolOutput: {
          test_result: 'PASS',
          reason: 'Anomaly correctly detected by system',
          confidence: 0.96,
        },
      });
    } else {
      steps.push({
        type: 'CONCLUSION',
        delay: 600,
        content: `Kaos testi BASARILI. ${accountId} islemleri normal dagilim gosteriyor. Sistem saglikli.`,
        toolOutput: {
          test_result: 'PASS',
          reason: 'Normal distribution as expected',
          confidence: 0.92,
        },
      });
    }
  } catch (error) {
    steps.push({
      type: 'OBSERVATION',
      delay: 800,
      content: `Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
      toolOutput: { error: true },
    });
  }

  return steps;
}

export async function getEnhancedThoughtChain(role: AgentRole, target: string): Promise<ThoughtStep[]> {
  switch (role) {
    case 'INVESTIGATOR':
      return await getInvestigatorChainEnhanced(target);
    case 'NEGOTIATOR':
      return await getNegotiatorChainEnhanced(target);
    case 'CHAOS_MONKEY':
      return await getChaosMonkeyChainEnhanced(target);
  }
}
