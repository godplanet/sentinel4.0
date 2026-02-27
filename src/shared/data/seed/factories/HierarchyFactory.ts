import { supabase } from '@/shared/api/supabase';
import { DEPARTMENTS, BRANCH_CITIES } from '../datasets/banking-terms';

export class HierarchyFactory {
  static async createHierarchy(tenantId: string): Promise<any[]> {
    const entities: any[] = [];

    // 1. Create HQ
    const hq = {
      tenant_id: tenantId,
      name: 'Genel Müdürlük',
      type: 'HQ',
      code: 'HQ',
      path: 'HQ',
      parent_path: null,
      metadata: {
        address: 'Ankara, Türkiye',
        established: '2010-01-01'
      }
    };
    entities.push(hq);

    // 2. Create 10 Departments
    DEPARTMENTS.forEach((dept, idx) => {
      const deptEntity = {
        tenant_id: tenantId,
        name: dept.name,
        type: 'DEPARTMENT',
        code: dept.code,
        path: `HQ.${dept.code}`,
        parent_path: 'HQ',
        metadata: {
          description: dept.description,
          head_count: 20 + Math.floor(Math.random() * 50)
        }
      };
      entities.push(deptEntity);
    });

    // 3. Create 50 Branches (distribute across departments)
    BRANCH_CITIES.forEach((city, idx) => {
      const deptIdx = idx % DEPARTMENTS.length;
      const dept = DEPARTMENTS[deptIdx];
      const branchCode = `BR${String(idx + 1).padStart(3, '0')}`;

      const branch = {
        tenant_id: tenantId,
        name: `Şube ${city}`,
        type: 'BRANCH',
        code: branchCode,
        path: `HQ.${dept.code}.${branchCode}`,
        parent_path: `HQ.${dept.code}`,
        metadata: {
          city,
          branch_manager: `Müdür ${idx + 1}`,
          customer_count: 500 + Math.floor(Math.random() * 2000)
        }
      };
      entities.push(branch);
    });

    // Insert in batches
    const { data, error } = await supabase
      .from('audit_entities')
      .insert(entities)
      .select();

    if (error) {
      console.error('Error creating hierarchy:', error);
      throw error;
    }

    return data || [];
  }

  static async getEntityByPath(path: string): Promise<any> {
    const { data } = await supabase
      .from('audit_entities')
      .select('*')
      .eq('path', path)
      .single();
    return data;
  }

  static async getEntitiesByType(type: string): Promise<any[]> {
    const { data } = await supabase
      .from('audit_entities')
      .select('*')
      .eq('type', type);
    return data || [];
  }
}
