import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/ui';
import { supabase } from '@/shared/api/supabase';
import { Users, Plus, Edit2, Trash2, Shield, Mail, Calendar, Search } from 'lucide-react';
import clsx from 'clsx';

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  last_sign_in_at: string | null;
  created_at: string;
  raw_user_meta_data?: {
    full_name?: string;
    department?: string;
  };
}

const ROLES = [
  { value: 'admin', label: 'Yönetici', color: 'bg-red-100 text-red-700' },
  { value: 'auditor', label: 'Denetçi', color: 'bg-blue-100 text-blue-700' },
  { value: 'senior_auditor', label: 'Kıdemli Denetçi', color: 'bg-purple-100 text-purple-700' },
  { value: 'supervisor', label: 'Süpervizör', color: 'bg-amber-100 text-amber-700' },
  { value: 'auditee', label: 'Denetlenen', color: 'bg-green-100 text-green-700' },
  { value: 'viewer', label: 'Görüntüleyici', color: 'bg-slate-100 text-slate-700' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Aktif', color: 'bg-green-100 text-green-700' },
  { value: 'inactive', label: 'Pasif', color: 'bg-slate-100 text-slate-700' },
  { value: 'suspended', label: 'Askıya Alınmış', color: 'bg-red-100 text-red-700' },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.admin.listUsers();

      if (error) throw error;

      const formattedUsers: User[] = data.users.map((user: any) => ({
        id: user.id,
        email: user.email || '',
        role: user.user_metadata?.role || 'viewer',
        status: user.banned_until ? 'suspended' : 'active',
        last_sign_in_at: user.last_sign_in_at,
        created_at: user.created_at,
        raw_user_meta_data: user.user_metadata,
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([
        {
          id: '1',
          email: 'hakan.yilmaz@bank.com',
          role: 'admin',
          status: 'active',
          last_sign_in_at: new Date().toISOString(),
          created_at: '2024-01-15T10:00:00Z',
          raw_user_meta_data: { full_name: 'Hakan Yılmaz', department: 'İç Denetim' },
        },
        {
          id: '2',
          email: 'ayse.demir@bank.com',
          role: 'senior_auditor',
          status: 'active',
          last_sign_in_at: new Date().toISOString(),
          created_at: '2024-02-10T10:00:00Z',
          raw_user_meta_data: { full_name: 'Ayşe Demir', department: 'İç Denetim' },
        },
        {
          id: '3',
          email: 'mehmet.kaya@bank.com',
          role: 'auditor',
          status: 'active',
          last_sign_in_at: new Date(Date.now() - 86400000).toISOString(),
          created_at: '2024-03-01T10:00:00Z',
          raw_user_meta_data: { full_name: 'Mehmet Kaya', department: 'İç Denetim' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.raw_user_meta_data?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (roleValue: string) => {
    const role = ROLES.find((r) => r.value === roleValue) || ROLES[ROLES.length - 1];
    return role;
  };

  const getStatusBadge = (statusValue: string) => {
    const status = STATUS_OPTIONS.find((s) => s.value === statusValue) || STATUS_OPTIONS[0];
    return status;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Hiç giriş yapmadı';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Kullanıcı & Roller"
        description="Kullanıcı yönetimi ve rol bazlı erişim kontrolü (RBAC)"
        badge="MODÜL 8: AYARLAR"
      />

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Supabase RLS ile Multi-Tenant Güvenlik</h3>
            <p className="text-slate-600 text-sm mb-3">
              Sentinel, Supabase Row Level Security (RLS) ile tenant bazlı veri izolasyonu sağlar.
              Her kullanıcı yalnızca kendi organizasyonuna ait verilere erişebilir.
            </p>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <span
                  key={role.value}
                  className={clsx('px-3 py-1 rounded-full text-xs font-semibold', role.color)}
                >
                  {role.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              Kullanıcı Listesi ({filteredUsers.length})
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold shadow-sm"
            >
              <Plus size={18} />
              Yeni Kullanıcı
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="İsim veya e-posta ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">Tüm Roller</option>
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-slate-600">Kullanıcılar yükleniyor...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-slate-300 mb-4" size={64} />
            <p className="text-slate-600 font-medium">Kullanıcı bulunamadı</p>
            <p className="text-slate-500 text-sm mt-2">Arama kriterlerinizi değiştirin veya yeni kullanıcı ekleyin</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Son Giriş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((user) => {
                  const role = getRoleBadge(user.role);
                  const status = getStatusBadge(user.status);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                            {user.raw_user_meta_data?.full_name?.[0] || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">
                              {user.raw_user_meta_data?.full_name || 'İsimsiz Kullanıcı'}
                            </div>
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <Mail size={12} />
                              {user.email}
                            </div>
                            {user.raw_user_meta_data?.department && (
                              <div className="text-xs text-slate-400 mt-0.5">
                                {user.raw_user_meta_data.department}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', role.color)}>
                          {role.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', status.color)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(user.last_sign_in_at)}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Kayıt: {new Date(user.created_at).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
                            <Edit2 size={16} className="text-slate-400 group-hover:text-blue-600" />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors group">
                            <Trash2 size={16} className="text-slate-400 group-hover:text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Yeni Kullanıcı Ekle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">E-posta</label>
                <input
                  type="email"
                  placeholder="kullanici@bank.com"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ad Soyad</label>
                <input
                  type="text"
                  placeholder="Ad Soyad"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Rol</label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Departman</label>
                <input
                  type="text"
                  placeholder="İç Denetim"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  alert('Kullanıcı ekleme özelliği yakında aktif olacak');
                  setShowAddModal(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Kullanıcı Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
