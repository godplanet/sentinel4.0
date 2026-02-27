import { supabase } from '@/shared/api/supabase';
import { getRandomTurkishName, getRandomEmail } from '../datasets/turkish-names';

type UserRole = 'admin' | 'manager' | 'auditor' | 'auditee' | 'guest';

interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  title?: string;
  certifications?: string[];
}

export class UserFactory {
  static async createBatch(tenantId: string, count: number = 20): Promise<any[]> {
    const roles: UserRole[] = [
      'admin', 'admin', 'admin', // 3 admins
      'manager', 'manager', 'manager', 'manager', 'manager', // 5 managers
      'auditor', 'auditor', 'auditor', 'auditor', 'auditor',
      'auditor', 'auditor', 'auditor', 'auditor', 'auditor', // 10 auditors
      'guest', 'guest' // 2 guest experts
    ];

    const titles = [
      'Baş Denetçi',
      'Kıdemli Denetçi',
      'Denetçi',
      'Denetim Müdürü',
      'Denetim Grup Başkanı',
      'Risk Uzmanı',
      'BT Denetçisi',
      'Uyum Uzmanı'
    ];

    const certifications = [
      'CIA', 'CISA', 'CFE', 'CPA', 'ACCA', 'CAMS', 'FRM', 'CFA'
    ];

    const users: UserProfile[] = [];

    for (let i = 0; i < count; i++) {
      const name = getRandomTurkishName();
      const email = getRandomEmail(name);
      const role = roles[i] || 'auditor';
      const title = titles[Math.floor(Math.random() * titles.length)];
      const userCerts = Math.random() > 0.5
        ? [certifications[Math.floor(Math.random() * certifications.length)]]
        : [];

      users.push({
        name,
        email,
        role,
        title,
        certifications: userCerts
      });
    }

    // Insert into auth.users would require admin API, so we'll create user_profiles directly
    // In production, this would use Supabase Auth API
    const userRecords = users.map(user => ({
      tenant_id: tenantId,
      full_name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      metadata: {
        certifications: user.certifications || [],
        active: true,
        hire_date: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), 1).toISOString()
      }
    }));

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(userRecords, { onConflict: 'email' })
      .select();

    if (error) {
      console.error('Error creating users:', error);
      throw error;
    }

    return data || [];
  }
}
