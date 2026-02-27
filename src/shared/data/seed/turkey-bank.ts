import { supabase } from '@/shared/api/supabase';

export const PERSONA_IDS = {
  CAE_HAKAN: '00000000-0000-4000-8000-000000000001',
  AUDITOR_AHMET: '00000000-0000-4000-8000-000000000002',
  AUDITEE_MEHMET: '00000000-0000-4000-8000-000000000003',
  AUDITEE_AYSE: '00000000-0000-4000-8000-000000000004',
  EXECUTIVE_IBRAHIM: '00000000-0000-4000-8000-000000000005',
  AUDITOR_ZEYNEP: '00000000-0000-4000-8000-000000000006',
} as const;

interface TurkeyBankSeedResult {
  tenant: any;
  users: any[];
  entities: any[];
  risks: any[];
  templates: any[];
  engagements: any[];
  workpapers: any[];
  findings: any[];
}

export class TurkeyBankSeeder {
  private static tenantId: string;
  private static result: Partial<TurkeyBankSeedResult> = {};

  static async seed(): Promise<void> {
    console.log('🏦 Starting Sentinel Katılım Bankası Seeder (HARDENED)...');

    try {
      // Use existing tenant_id from database
      this.tenantId = '11111111-1111-1111-1111-111111111111';
      console.log(`📊 Using existing tenant ID: ${this.tenantId}`);

      await this.step2_CreateUsers();
      await this.step3_CreateHierarchy();
      await this.step4_CreateRiskLibrary();
      await this.step5_CreateAuditTemplates();
      await this.step6_CreateActiveEngagement();
      await this.step7_CreateWorkpapersAndFindings();

      console.log('✅ Sentinel Katılım Bankası Seeder completed successfully!');
      this.printSummary();
    } catch (error) {
      console.error('❌ Turkey Bank Seeder failed:', error);
      throw error;
    }
  }

  private static async step1_CreateTenant(): Promise<void> {
    // DEPRECATED: Using hardcoded tenant_id instead
    // Tenant creation is handled by migrations, not client-side seeding
    console.log('📊 Step 1/7: Skipping tenant creation (using existing tenant)');
    this.result.tenant = { id: this.tenantId, name: 'Demo Bank' };
  }

  private static async step2_CreateUsers(): Promise<void> {
    console.log('📊 Step 2/7: Creating Users (RBAC) with Hardcoded UUIDs');

    const users = [
      {
        id: PERSONA_IDS.CAE_HAKAN,
        tenant_id: this.tenantId,
        email: 'hakan@sentinel.com',
        full_name: 'Hakan Yılmaz',
        role: 'admin',
        title: 'İç Denetim Başkanı (CAE)',
        avatar_url: null,
        metadata: {
          certifications: ['CIA', 'CFE', 'CISA'],
          persona: 'CAE',
          department: 'İç Denetim',
          phone: '+90 212 555 0001',
          years_experience: 15
        }
      },
      {
        id: PERSONA_IDS.AUDITOR_AHMET,
        tenant_id: this.tenantId,
        email: 'ahmet@sentinel.com',
        full_name: 'Ahmet Demir',
        role: 'auditor',
        title: 'Kıdemli Denetçi',
        avatar_url: null,
        metadata: {
          certifications: ['CIA', 'CISA'],
          persona: 'AUDITOR',
          department: 'İç Denetim',
          phone: '+90 212 555 0002',
          years_experience: 8,
          specialization: 'Operasyonel Denetim'
        }
      },
      {
        id: PERSONA_IDS.AUDITEE_MEHMET,
        tenant_id: this.tenantId,
        email: 'mehmet@kadikoy.bank',
        full_name: 'Mehmet Kaya',
        role: 'auditee',
        title: 'Kadıköy Şube Müdürü',
        avatar_url: null,
        metadata: {
          persona: 'AUDITEE',
          department: 'Şube Ağı',
          branch: 'Kadıköy',
          phone: '+90 216 555 1001',
          years_experience: 12
        }
      },
      {
        id: PERSONA_IDS.AUDITEE_AYSE,
        tenant_id: this.tenantId,
        email: 'ayse@umraniye.bank',
        full_name: 'Ayşe Şahin',
        role: 'auditee',
        title: 'Ümraniye Şube Müdürü',
        avatar_url: null,
        metadata: {
          persona: 'AUDITEE',
          department: 'Şube Ağı',
          branch: 'Ümraniye',
          phone: '+90 216 555 1002',
          years_experience: 10
        }
      },
      {
        id: PERSONA_IDS.EXECUTIVE_IBRAHIM,
        tenant_id: this.tenantId,
        email: 'danisma@sentinel.com',
        full_name: 'Prof. Dr. İbrahim Öztürk',
        role: 'guest',
        title: 'Danışma Komitesi Üyesi',
        avatar_url: null,
        metadata: {
          persona: 'EXECUTIVE',
          department: 'Danışma Komitesi',
          phone: '+90 212 555 0100',
          specialization: 'Fıkıh ve İslami Finans'
        }
      },
      {
        id: PERSONA_IDS.AUDITOR_ZEYNEP,
        tenant_id: this.tenantId,
        email: 'zeynep@sentinel.com',
        full_name: 'Zeynep Arslan',
        role: 'auditor',
        title: 'BT Denetçisi',
        avatar_url: null,
        metadata: {
          certifications: ['CISA', 'CISSP'],
          persona: 'AUDITOR',
          department: 'İç Denetim',
          specialization: 'Bilgi Teknolojileri'
        }
      }
    ];

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(users, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('❌ Failed to seed users:', error.message, error);
      throw error;
    }

    this.result.users = data || [];
    console.log(`   ✓ Created/Updated ${data?.length} users`);
    console.log(`   → CAE (Hakan): ${PERSONA_IDS.CAE_HAKAN}`);
    console.log(`   → Auditor (Ahmet): ${PERSONA_IDS.AUDITOR_AHMET}`);
    console.log(`   → Auditee (Mehmet): ${PERSONA_IDS.AUDITEE_MEHMET}`);
  }

  private static async step3_CreateHierarchy(): Promise<void> {
    console.log('📊 Step 3/7: Creating Organizational Hierarchy');

    const entities = [
      {
        tenant_id: this.tenantId,
        name: 'Genel Müdürlük',
        type: 'HQ',
        code: 'HQ',
        path: 'HQ',
        parent_path: null,
        metadata: {
          address: 'Maslak, İstanbul',
          established: '2012-03-15',
          total_employees: 250
        }
      },
      {
        tenant_id: this.tenantId,
        name: 'Şube Ağı',
        type: 'DIVISION',
        code: 'BRANCHES',
        path: 'HQ.BRANCHES',
        parent_path: 'HQ',
        metadata: {
          total_branches: 15,
          total_customers: 45000
        }
      },
      {
        tenant_id: this.tenantId,
        name: 'Hazine Yönetimi',
        type: 'DEPARTMENT',
        code: 'TREASURY',
        path: 'HQ.TREASURY',
        parent_path: 'HQ',
        metadata: {
          description: 'Likidite yönetimi, Sukuk yatırımları, Döviz pozisyon kontrolü',
          head_count: 12,
          risk_profile: 'HIGH'
        }
      },
      {
        tenant_id: this.tenantId,
        name: 'Bilgi Teknolojileri',
        type: 'DEPARTMENT',
        code: 'IT',
        path: 'HQ.IT',
        parent_path: 'HQ',
        metadata: {
          description: 'Sistemler, siber güvenlik, BDDK raporlama altyapısı',
          head_count: 18,
          risk_profile: 'HIGH'
        }
      },
      {
        tenant_id: this.tenantId,
        name: 'Krediler ve Tahsis',
        type: 'DEPARTMENT',
        code: 'LENDING',
        path: 'HQ.LENDING',
        parent_path: 'HQ',
        metadata: {
          description: 'Murabaha, İcara, İstisna finansman süreçleri',
          head_count: 25,
          risk_profile: 'HIGH'
        }
      },
      {
        tenant_id: this.tenantId,
        name: 'Uyum ve Risk Yönetimi',
        type: 'DEPARTMENT',
        code: 'COMPLIANCE',
        path: 'HQ.COMPLIANCE',
        parent_path: 'HQ',
        metadata: {
          description: 'BDDK mevzuat uyumu, AML/CFT, Şeriat uyumu',
          head_count: 8,
          risk_profile: 'MEDIUM'
        }
      },
      {
        tenant_id: this.tenantId,
        name: 'Kadıköy Şubesi',
        type: 'BRANCH',
        code: 'BR_KADIKOY',
        path: 'HQ.BRANCHES.BR_KADIKOY',
        parent_path: 'HQ.BRANCHES',
        metadata: {
          city: 'İstanbul',
          district: 'Kadıköy',
          manager: 'Mehmet Kaya',
          customer_count: 3200,
          deposit_volume_trl: 125000000,
          branch_grade: 'A',
          opened_date: '2015-06-01'
        }
      },
      {
        tenant_id: this.tenantId,
        name: 'Ümraniye Şubesi',
        type: 'BRANCH',
        code: 'BR_UMRANIYE',
        path: 'HQ.BRANCHES.BR_UMRANIYE',
        parent_path: 'HQ.BRANCHES',
        metadata: {
          city: 'İstanbul',
          district: 'Ümraniye',
          manager: 'Ayşe Şahin',
          customer_count: 2800,
          deposit_volume_trl: 98000000,
          branch_grade: 'B',
          opened_date: '2017-03-15'
        }
      },
      {
        tenant_id: this.tenantId,
        name: 'İkitelli Şubesi',
        type: 'BRANCH',
        code: 'BR_IKITELLI',
        path: 'HQ.BRANCHES.BR_IKITELLI',
        parent_path: 'HQ.BRANCHES',
        metadata: {
          city: 'İstanbul',
          district: 'İkitelli',
          manager: 'Fatma Yıldız',
          customer_count: 1900,
          deposit_volume_trl: 67000000,
          branch_grade: 'C',
          opened_date: '2019-11-20'
        }
      }
    ];

    const { data, error } = await supabase
      .from('audit_entities')
      .upsert(entities, { onConflict: 'tenant_id,code' })
      .select();

    if (error) {
      console.error('❌ Failed to create entities:', error);
      throw error;
    }

    this.result.entities = data || [];
    console.log(`   ✓ Created ${data?.length} entities (HQ + Departments + Branches)`);
  }

  private static async step4_CreateRiskLibrary(): Promise<void> {
    console.log('📊 Step 4/7: Creating Participation Bank Risk Library');

    const risks = [
      {
        tenant_id: this.tenantId,
        risk_code: 'SHARIA_001',
        risk_title: 'Danışma Komitesi Onayı Olmayan Ürün Satışı',
        risk_description: 'Şeriat standartlarına uygun olmayan veya Danışma Komitesi tarafından icazet verilmemiş finansal ürünlerin müşterilere sunulması riski.',
        risk_category: 'Compliance Risk',
        inherent_impact: 5,
        inherent_likelihood: 3,
        residual_impact: 3,
        residual_likelihood: 2,
        control_effectiveness: 0.7,
        custom_fields: {
          regulatory_reference: 'TKBB Şeriat Standartları, AAOIFI',
          is_sharia_risk: true,
          framework: 'GIAS2024'
        },
        is_active: true,
        risk_status: 'ACTIVE'
      },
      {
        tenant_id: this.tenantId,
        risk_code: 'FIN_001',
        risk_title: 'Kâr Payı Dağıtım Hesaplama Hatası',
        risk_description: 'Katılma hesaplarına dağıtılan kâr payının yanlış hesaplanması, havuzların karıştırılması veya müşteri hakkının yenmesi riski.',
        risk_category: 'Financial Risk',
        inherent_impact: 5,
        inherent_likelihood: 3,
        residual_impact: 3,
        residual_likelihood: 2,
        control_effectiveness: 0.75,
        custom_fields: {
          regulatory_reference: 'BDDK Katılma Hesapları Yönetmeliği',
          is_financial_crime: false,
          framework: 'GIAS2024'
        },
        is_active: true,
        risk_status: 'ACTIVE'
      },
      {
        tenant_id: this.tenantId,
        risk_code: 'OPS_001',
        risk_title: 'Şube Kasası Limit Aşımı ve Sigorta Zafiyeti',
        risk_description: 'Şube kasasında sigorta limitini aşan nakit bulundurulması, gün sonu fazla nakit transferinin yapılmaması riski.',
        risk_category: 'Operational Risk',
        inherent_impact: 4,
        inherent_likelihood: 4,
        residual_impact: 2,
        residual_likelihood: 2,
        control_effectiveness: 0.8,
        custom_fields: {
          regulatory_reference: 'İç Kontrol Talimatı',
          is_key_control: true,
          framework: 'COSO'
        },
        is_active: true,
        risk_status: 'ACTIVE'
      },
      {
        tenant_id: this.tenantId,
        risk_code: 'IT_001',
        risk_title: 'Core Banking Sistem Kesintisi',
        risk_description: 'Kritik bankacılık sistemlerinin (CBS) çökmesi, yedekliliğin çalışmaması, müşteri işlemlerinin durması riski.',
        risk_category: 'Technology Risk',
        inherent_impact: 5,
        inherent_likelihood: 2,
        residual_impact: 3,
        residual_likelihood: 1,
        control_effectiveness: 0.85,
        custom_fields: {
          regulatory_reference: 'BDDK BT Risk Yönetimi Rehberi',
          disaster_recovery_plan: true,
          framework: 'COBIT'
        },
        is_active: true,
        risk_status: 'ACTIVE'
      },
      {
        tenant_id: this.tenantId,
        risk_code: 'CREDIT_001',
        risk_title: 'Murabaha Kredilerinde Teminat Yetersizliği',
        risk_description: 'Murabaha finansmanı sağlanan müşterilerin teminatlarının yetersiz olması, takibe intikal riski.',
        risk_category: 'Credit Risk',
        inherent_impact: 5,
        inherent_likelihood: 3,
        residual_impact: 3,
        residual_likelihood: 2,
        control_effectiveness: 0.7,
        custom_fields: {
          regulatory_reference: 'BDDK Kredi Sınıflandırma Tebliği',
          is_credit_risk: true,
          framework: 'Basel III'
        },
        is_active: true,
        risk_status: 'ACTIVE'
      },
      {
        tenant_id: this.tenantId,
        risk_code: 'AML_001',
        risk_title: 'Şüpheli İşlem Bildiriminde Gecikme',
        risk_description: 'MASAK\'a yapılması gereken şüpheli işlem bildirimlerinin geç yapılması veya yapılmaması riski.',
        risk_category: 'Compliance Risk',
        inherent_impact: 5,
        inherent_likelihood: 2,
        residual_impact: 2,
        residual_likelihood: 1,
        control_effectiveness: 0.9,
        custom_fields: {
          regulatory_reference: '5549 Sayılı Kanun, MASAK Tebliğleri',
          is_regulatory: true,
          framework: 'GIAS2024'
        },
        is_active: true,
        risk_status: 'ACTIVE'
      }
    ];

    const { data, error } = await supabase
      .from('rkm_risks')
      .upsert(risks, { onConflict: 'tenant_id,risk_code' })
      .select();

    if (error) {
      console.error('❌ Failed to create risks:', error);
      throw error;
    }

    this.result.risks = data || [];
    console.log(`   ✓ Created ${data?.length} participation banking risks`);
  }

  private static async step5_CreateAuditTemplates(): Promise<void> {
    console.log('📊 Step 5/7: Creating Audit Program Templates');

    const template = {
      tenant_id: this.tenantId,
      name: 'Şube Operasyonel Denetim Programı v2026',
      description: 'Katılım bankası şubelerinin operasyonel süreçlerinin denetimi için standart program. Kasa yönetimi, teminat mektubu süreci, müşteri şikayetleri ve şeriat uyumu kontrollerini içerir.',
      category: 'Operational Audit',
      framework: 'GIAS2024',
      version: '2.0',
      estimated_hours: 40,
      is_active: true,
      metadata: {
        target_entities: ['BRANCH'],
        frequency: 'Annual',
        risk_focus: ['Operational', 'Compliance', 'Sharia']
      }
    };

    const { data: templateData, error: templateError } = await supabase
      .from('program_templates')
      .upsert(template, { onConflict: 'tenant_id,name' })
      .select()
      .single();

    if (templateError) {
      console.error('❌ Failed to create template:', templateError);
      throw templateError;
    }

    const riskIds = this.result.risks?.map(r => r.id) || [];
    const steps = [
      {
        template_id: templateData.id,
        step_number: 1,
        step_title: 'Kasa Çift Anahtar Kuralı Kontrolü',
        step_description: 'Kasa anahtarlarının iki farklı kişide tutulduğunun teyidi. Kasa açılışının kamera kayıtlarının incelenmesi.',
        testing_method: 'Observation',
        estimated_hours: 4,
        is_key_control: true,
        risk_id: riskIds[2] || null,
        metadata: {
          sample_size: 5,
          control_code: 'CASH_001'
        }
      },
      {
        template_id: templateData.id,
        step_number: 2,
        step_title: 'Gün Sonu Kasa Sayım Doğrulama',
        step_description: 'Gün sonu kasa sayımlarının yapıldığının teyidi. Limit aşımı durumunda zırhlı araca teslim prosedürünün işletildiğinin kontrolü.',
        testing_method: 'Inspection',
        estimated_hours: 5,
        is_key_control: true,
        risk_id: riskIds[2] || null,
        metadata: {
          sample_size: 10
        }
      },
      {
        template_id: templateData.id,
        step_number: 3,
        step_title: 'Teminat Mektubu İade Süreci',
        step_description: 'Süresi dolan teminat mektuplarının müşteriye iade edildiğinin kontrolü. İade formlarının imzalı alındığının teyidi.',
        testing_method: 'Reperformance',
        estimated_hours: 6,
        is_key_control: false,
        risk_id: null,
        metadata: {
          sample_size: 15
        }
      },
      {
        template_id: templateData.id,
        step_number: 4,
        step_title: 'Şeriat Uyumlu Ürün Satış Kontrolü',
        step_description: 'Satılan ürünlerin Danışma Komitesi onaylı ürün kataloğunda olduğunun teyidi. İcazet belgelerinin mevcudiyetinin kontrolü.',
        testing_method: 'Inspection',
        estimated_hours: 8,
        is_key_control: true,
        risk_id: riskIds[0] || null,
        metadata: {
          sample_size: 20
        }
      },
      {
        template_id: templateData.id,
        step_number: 5,
        step_title: 'Müşteri Şikayet Yönetimi',
        step_description: 'Müşteri şikayetlerinin kaydedildiği, cevaplanma süresinin uygun olduğunun kontrolü.',
        testing_method: 'Inquiry',
        estimated_hours: 5,
        is_key_control: false,
        risk_id: null,
        metadata: {
          sample_size: 10
        }
      }
    ];

    await supabase.from('template_steps').delete().eq('template_id', templateData.id);

    const { data: stepsData, error: stepsError } = await supabase
      .from('template_steps')
      .insert(steps)
      .select();

    if (stepsError) {
      console.error('❌ Failed to create template steps:', stepsError);
      throw stepsError;
    }

    this.result.templates = [templateData];
    console.log(`   ✓ Created template: "${templateData.name}" with ${stepsData?.length} steps`);
  }

  private static async step6_CreateActiveEngagement(): Promise<void> {
    console.log('📊 Step 6/7: Creating Active Engagement');

    const kadikoybranch = this.result.entities?.find(e => e.code === 'BR_KADIKOY');

    const engagement = {
      tenant_id: this.tenantId,
      name: '2026 Q1 - Kadıköy Şube Operasyonel Denetimi',
      engagement_code: 'AUD-2026-Q1-001',
      engagement_type: 'Operational Audit',
      status: 'FIELDWORK',
      entity_id: kadikoybranch?.id,
      lead_auditor_id: PERSONA_IDS.AUDITOR_AHMET,
      planned_start_date: '2026-01-15',
      planned_end_date: '2026-02-28',
      actual_start_date: '2026-01-15',
      budget_hours: 160,
      metadata: {
        scope: 'Kasa yönetimi, müşteri işlemleri, şeriat uyumu',
        objectives: [
          'Operasyonel kontrollerin etkinliğinin değerlendirilmesi',
          'Şube kasası yönetiminin BDDK talimatlarına uygunluğu',
          'Şeriat standartlarına uyum testi'
        ],
        risk_areas: ['Operational', 'Compliance', 'Sharia']
      }
    };

    const { data, error } = await supabase
      .from('audit_engagements')
      .upsert(engagement, { onConflict: 'tenant_id,engagement_code' })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create engagement:', error);
      throw error;
    }

    this.result.engagements = [data];
    console.log(`   ✓ Created engagement: "${data.name}" (Status: ${data.status})`);
  }

  private static async step7_CreateWorkpapersAndFindings(): Promise<void> {
    console.log('📊 Step 7/7: Creating Workpapers & Findings');

    const engagement = this.result.engagements?.[0];
    const kadikoybranch = this.result.entities?.find(e => e.code === 'BR_KADIKOY');

    const workpapers = [
      {
        tenant_id: this.tenantId,
        engagement_id: engagement?.id,
        ref_number: 'WP-001',
        title: 'Kasa Çift Anahtar Kontrolü',
        description: 'Kadıköy şubesinde kasa anahtarlarının çift kişi kontrolü sürecinin incelenmesi',
        workpaper_type: 'Test of Controls',
        status: 'COMPLETED',
        assigned_to: PERSONA_IDS.AUDITOR_AHMET,
        prepared_by: PERSONA_IDS.AUDITOR_AHMET,
        prepared_date: '2026-01-20',
        reviewed_by: null,
        reviewed_date: null,
        metadata: {
          testing_method: 'Observation',
          sample_size: 5,
          control_tested: 'CASH_001'
        }
      },
      {
        tenant_id: this.tenantId,
        engagement_id: engagement?.id,
        ref_number: 'WP-002',
        title: 'Gün Sonu Kasa Sayım Testi',
        description: 'Son 10 iş gününün kasa sayım tutanaklarının incelenmesi ve limit kontrolü',
        workpaper_type: 'Test of Controls',
        status: 'IN_PROGRESS',
        assigned_to: PERSONA_IDS.AUDITOR_AHMET,
        prepared_by: PERSONA_IDS.AUDITOR_AHMET,
        prepared_date: '2026-01-22',
        reviewed_by: null,
        reviewed_date: null,
        metadata: {
          testing_method: 'Inspection',
          sample_size: 10
        }
      }
    ];

    const { data: wpData, error: wpError } = await supabase
      .from('workpapers')
      .upsert(workpapers, { onConflict: 'tenant_id,engagement_id,ref_number' })
      .select();

    if (wpError) {
      console.error('❌ Failed to create workpapers:', wpError);
      throw wpError;
    }

    this.result.workpapers = wpData || [];
    console.log(`   ✓ Created ${wpData?.length} workpapers`);

    const finding = {
      tenant_id: this.tenantId,
      engagement_id: engagement?.id,
      entity_id: kadikoybranch?.id,
      finding_code: 'F-2026-001',
      title: 'Kasada 50.000 TL Limit Fazlası Tespit Edildi',
      description: 'Kadıköy şubesinde 18.01.2026 tarihli gün sonu kasa sayımında 187.500 TL nakit tespit edilmiştir. Şube kasa sigorta limiti 150.000 TL olup, 37.500 TL fazlalık bulunmaktadır. Fazla nakit zırhlı araca teslim edilmemiş, kasada bırakılmıştır.',
      finding_type: 'Deficiency',
      severity: 'MODERATE',
      status: 'ISSUED_FOR_RESPONSE',
      identified_by: PERSONA_IDS.AUDITOR_AHMET,
      identified_date: '2026-01-22',
      assigned_to: PERSONA_IDS.AUDITEE_MEHMET,
      due_date: '2026-02-05',
      metadata: {
        root_cause: 'Prosedür bilgisi eksikliği',
        impact: 'Hırsızlık durumunda sigorta kapsamı dışı kayıp riski',
        recommendation: 'Gün sonu limit kontrolü yapılmalı, fazla nakit zırhlı araca teslim edilmelidir',
        regulation_reference: 'Kasa Yönetimi İç Talimatı md. 5.3',
        workpaper_ref: 'WP-002'
      }
    };

    const { data: findingData, error: findingError } = await supabase
      .from('audit_findings')
      .upsert(finding, { onConflict: 'tenant_id,finding_code' })
      .select()
      .single();

    if (findingError) {
      console.error('❌ Failed to create finding:', findingError);
      throw findingError;
    }

    const secret = {
      finding_id: findingData.id,
      five_whys: {
        why_1: 'Neden kasa limitinin üzerinde nakit bulunuyordu?',
        answer_1: 'Gün içi yoğun müşteri çekimi oldu, fazla nakit kasada kaldı.',
        why_2: 'Neden gün sonu fazla nakit zırhlı araca verilmedi?',
        answer_2: 'Zırhlı araç şubeye planlanandan erken geldi, kasa henüz sayılmamıştı.',
        why_3: 'Neden kasa sayımı erken tamamlanmadı?',
        answer_3: 'Müşteri yoğunluğu vardı, veznedar kasa sayımını erteledi.',
        why_4: 'Neden yedek veznedar destek vermedi?',
        answer_4: 'Yedek veznedar o gün izinliydi, yerine kimse atanmamıştı.',
        why_5: 'Neden izin planlaması gözden kaçtı?',
        answer_5: 'Şube müdürü izin takibini manuel yapıyor, sistem kullanılmıyor.'
      },
      root_cause_category: 'Process Weakness',
      corrective_action: 'Veznedar izin planlamasında yedekleme sağlanmalı. Kasa sayımı için sabit zaman dilimi belirlenmeli.',
      metadata: {
        interview_date: '2026-01-23',
        interviewer: PERSONA_IDS.AUDITOR_AHMET,
        interviewee: PERSONA_IDS.AUDITEE_MEHMET
      }
    };

    await supabase.from('finding_secrets').upsert(secret, { onConflict: 'finding_id' });

    this.result.findings = [findingData];
    console.log(`   ✓ Created finding: "${findingData.title}" (Assigned to: Mehmet Kaya)`);
  }

  private static printSummary(): void {
    console.log('\n📈 Seed Summary:');
    console.log(`   - Tenant: ${this.result.tenant?.name}`);
    console.log(`   - Users: ${this.result.users?.length}`);
    console.log(`   - Entities: ${this.result.entities?.length} (HQ + Departments + Branches)`);
    console.log(`   - Risks: ${this.result.risks?.length} participation banking risks`);
    console.log(`   - Audit Templates: ${this.result.templates?.length} with 5 steps`);
    console.log(`   - Active Engagements: ${this.result.engagements?.length} (Fieldwork)`);
    console.log(`   - Workpapers: ${this.result.workpapers?.length}`);
    console.log(`   - Findings: ${this.result.findings?.length} (ISSUED_FOR_RESPONSE)`);
    console.log('\n🎯 Demo Ready: Login as hakan@sentinel.com (CAE) or ahmet@sentinel.com (Auditor)');
  }

  static async checkDatabaseEmpty(): Promise<boolean> {
    // Check multiple tables to ensure comprehensive seed detection
    const [entities, engagements, workpapers, findings] = await Promise.all([
      supabase.from('audit_entities').select('*', { count: 'exact', head: true }),
      supabase.from('audit_engagements').select('*', { count: 'exact', head: true }),
      supabase.from('workpapers').select('*', { count: 'exact', head: true }),
      supabase.from('audit_findings').select('*', { count: 'exact', head: true })
    ]);

    // Database is "empty" if ANY critical table has insufficient data
    const isInsufficient =
      (entities.count ?? 0) < 5 ||
      (engagements.count ?? 0) < 3 ||
      (workpapers.count ?? 0) < 5 ||
      (findings.count ?? 0) < 5;

    if (isInsufficient) {
      console.log('📊 Database needs seeding:', {
        entities: entities.count,
        engagements: engagements.count,
        workpapers: workpapers.count,
        findings: findings.count
      });
    }

    return isInsufficient;
  }

  static async emergencyWipe(): Promise<void> {
    console.log('🧹 Starting Emergency Database Wipe...');

    const tables = [
      'finding_secrets',
      'finding_workflow_history',
      'audit_findings',
      'workpapers',
      'audit_engagements',
      'template_steps',
      'program_templates',
      'rkm_risks',
      'audit_entities',
      'user_profiles',
      'tenants'
    ];

    for (const table of tables) {
      try {
        await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log(`   ✓ Wiped ${table}`);
      } catch (error) {
        console.warn(`   ⚠ Could not wipe ${table}:`, error);
      }
    }

    console.log('✅ Emergency Wipe Complete');
  }
}

export default TurkeyBankSeeder;
