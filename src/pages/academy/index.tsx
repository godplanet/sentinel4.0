import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, FlaskConical, Wallet, Plus, Award, Clock, Star,
  Trash2, CheckCircle2, XCircle, Clock3, RefreshCw, Trophy,
  BarChart2, Zap, BarChart3,
} from 'lucide-react';
import { ManagerDashboard } from '@/features/academy/components/ManagerDashboard';
import { supabase } from '@/shared/api/supabase';
import { PageHeader } from '@/shared/ui/PageHeader';
import { CPEProgressBar } from '@/features/academy/components/CPETracker/CPEProgressBar';
import { CPEUploadModal } from '@/features/academy/components/CPETracker/CPEUploadModal';
import { CertificateGenerator } from '@/features/academy/components/Certificate/CertificateGenerator';
import { ExamRunner } from '@/features/academy/components/ExamRunner';
import type { CertificateData } from '@/features/academy/components/Certificate/CertificateGenerator';
import {
  fetchCpeRecords,
  fetchCpeGoal,
  deleteCpeRecord,
  fetchPassedAttempts,
} from '@/features/academy/api/cpeApi';
import type { UserCpeRecord } from '@/features/academy/types';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_USER_NAME = 'Ahmet Yılmaz';

type Tab = 'learning' | 'exams' | 'cpe' | 'manager';

const TABS: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: 'learning', label: 'My Learning',  icon: BookOpen },
  { id: 'exams',    label: 'Exam Center',  icon: FlaskConical },
  { id: 'cpe',      label: 'CPE Wallet',   icon: Wallet },
  { id: 'manager',  label: 'Manager View', icon: BarChart3 },
];

interface PassedAttempt {
  id: string;
  score: number;
  passed: boolean;
  completed_at: string;
  xp_awarded: number;
  exam: {
    id: string;
    title: string;
    course: { id: string; title: string; category: string };
  };
}

interface CourseRow {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  xp_reward: number;
  estimated_duration: number;
  tags: string[];
}

export default function AcademyPage() {
  const [activeTab, setActiveTab] = useState<Tab>('learning');
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  const [courses, setCourses]       = useState<CourseRow[]>([]);
  const [exams, setExams]           = useState<{ id: string; title: string; course_id: string; course_title: string; time_limit_minutes: number; passing_score: number }[]>([]);
  const [cpeRecords, setCpeRecords] = useState<UserCpeRecord[]>([]);
  const [cpeGoal, setCpeGoal]       = useState(40);
  const [attempts, setAttempts]     = useState<PassedAttempt[]>([]);
  const [loading, setLoading]       = useState(true);

  const [showCpeModal, setShowCpeModal]     = useState(false);
  const [certificate, setCertificate]       = useState<CertificateData | null>(null);

  const currentYear = new Date().getFullYear();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        coursesRes, examsRes, cpeRes, goalRes, attemptsRes
      ] = await Promise.allSettled([
        supabase.from('academy_courses').select('id,title,category,difficulty,xp_reward,estimated_duration,tags').eq('is_active', true).limit(20),
        supabase.from('academy_exams').select('id,title,course_id,time_limit_minutes,passing_score,academy_courses(title)').eq('is_active', true).limit(20),
        fetchCpeRecords(DEMO_USER_ID, currentYear),
        fetchCpeGoal(DEMO_USER_ID, currentYear),
        fetchPassedAttempts(DEMO_USER_ID),
      ]);

      if (coursesRes.status === 'fulfilled' && coursesRes.value.data) {
        setCourses(coursesRes.value.data as CourseRow[]);
      }
      if (examsRes.status === 'fulfilled' && examsRes.value.data) {
        setExams(
          (examsRes.value.data as unknown as Array<{
            id: string; title: string; course_id: string;
            time_limit_minutes: number; passing_score: number;
            academy_courses: { title: string } | null;
          }>).map((e) => ({
            id: e.id, title: e.title, course_id: e.course_id,
            course_title: e.academy_courses?.title ?? '',
            time_limit_minutes: e.time_limit_minutes,
            passing_score: e.passing_score,
          }))
        );
      }
      if (cpeRes.status === 'fulfilled')  setCpeRecords(cpeRes.value);
      if (goalRes.status === 'fulfilled' && goalRes.value) setCpeGoal(goalRes.value.goal_hours);
      if (attemptsRes.status === 'fulfilled') setAttempts(attemptsRes.value as PassedAttempt[]);
    } finally {
      setLoading(false);
    }
  }, [currentYear]);

  useEffect(() => { loadData(); }, [loadData]);

  const earnedHours   = cpeRecords.filter((r) => r.status === 'approved').reduce((s, r) => s + r.credit_hours, 0);
  const pendingHours  = cpeRecords.filter((r) => r.status === 'pending').reduce((s, r) => s + r.credit_hours, 0);
  const totalXP       = attempts.reduce((s, a) => s + a.xp_awarded, 0);

  if (activeExamId) {
    return (
      <ExamRunner
        examId={activeExamId}
        userId={DEMO_USER_ID}
        onBack={() => { setActiveExamId(null); loadData(); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Academy & Competency"
        description="Professional development, exams, and CPE tracking"
        icon={BookOpen}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard icon={<Trophy size={18} className="text-amber-500" />} label="Total XP Earned" value={totalXP.toLocaleString()} sub="from passed exams" color="amber" />
          <StatCard icon={<Award size={18} className="text-emerald-500" />} label="Certificates" value={String(attempts.length)} sub="exams passed" color="emerald" />
          <StatCard icon={<Zap size={18} className="text-blue-500" />} label="CPE Hours" value={`${earnedHours.toFixed(1)} / ${cpeGoal}`} sub={`${currentYear} approved`} color="blue" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-2 pt-2">
            <nav className="flex gap-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                    transition-colors duration-150 mb-1
                    ${activeTab === id
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'learning' && (
              <LearningTab courses={courses} loading={loading} />
            )}
            {activeTab === 'exams' && (
              <ExamCenterTab
                exams={exams}
                attempts={attempts}
                loading={loading}
                onStartExam={setActiveExamId}
                onViewCertificate={(a) =>
                  setCertificate({
                    recipientName: DEMO_USER_NAME,
                    courseTitle:   a.exam.course.title,
                    examTitle:     a.exam.title,
                    score:         a.score,
                    xpAwarded:     a.xp_awarded,
                    completedAt:   a.completed_at,
                    category:      a.exam.course.category,
                  })
                }
              />
            )}
            {activeTab === 'manager' && <ManagerDashboard />}
            {activeTab === 'cpe' && (
              <CPEWalletTab
                records={cpeRecords}
                earnedHours={earnedHours}
                pendingHours={pendingHours}
                goalHours={cpeGoal}
                year={currentYear}
                loading={loading}
                onAddRecord={() => setShowCpeModal(true)}
                onDeleteRecord={async (id) => {
                  await deleteCpeRecord(id);
                  setCpeRecords((r) => r.filter((x) => x.id !== id));
                }}
              />
            )}
          </div>
        </div>
      </div>

      {showCpeModal && (
        <CPEUploadModal
          userId={DEMO_USER_ID}
          onClose={() => setShowCpeModal(false)}
          onCreated={(record) => {
            setCpeRecords((prev) => [record, ...prev]);
            setShowCpeModal(false);
          }}
        />
      )}

      {certificate && (
        <CertificateGenerator
          data={certificate}
          onClose={() => setCertificate(null)}
        />
      )}
    </div>
  );
}

function LearningTab({ courses, loading }: { courses: CourseRow[]; loading: boolean }) {
  const DIFFICULTY_COLORS: Record<string, string> = {
    beginner:     'bg-emerald-50 text-emerald-700 border-emerald-200',
    intermediate: 'bg-blue-50 text-blue-700 border-blue-200',
    advanced:     'bg-amber-50 text-amber-700 border-amber-200',
    expert:       'bg-rose-50 text-rose-700 border-rose-200',
  };

  if (loading) return <LoadingSkeleton rows={6} />;

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen size={32} className="text-slate-300" />}
        title="No courses available"
        description="Course catalog will appear here once published by your administrator."
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Available Courses ({courses.length})</h3>
        <span className="text-xs text-slate-400">Click a course to view exams</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div key={course.id}
               className="rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm
                          transition-all duration-150 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <BookOpen size={16} className="text-blue-600" />
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium
                ${DIFFICULTY_COLORS[course.difficulty] ?? DIFFICULTY_COLORS.intermediate}`}>
                {course.difficulty}
              </span>
            </div>
            <div>
              <p className="text-slate-900 font-semibold text-sm leading-snug">{course.title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{course.category}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-auto pt-2 border-t border-slate-50">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {course.estimated_duration} min
              </span>
              <span className="flex items-center gap-1">
                <Star size={11} className="text-amber-400" />
                +{course.xp_reward} XP
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExamCenterTab({
  exams, attempts, loading, onStartExam, onViewCertificate,
}: {
  exams: { id: string; title: string; course_id: string; course_title: string; time_limit_minutes: number; passing_score: number }[];
  attempts: PassedAttempt[];
  loading: boolean;
  onStartExam: (examId: string) => void;
  onViewCertificate: (a: PassedAttempt) => void;
}) {
  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Available Exams</h3>
        {exams.length === 0 ? (
          <EmptyState icon={<FlaskConical size={28} className="text-slate-300" />}
                      title="No exams available" description="Exams will appear here when published." />
        ) : (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Exam</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Course</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Time</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Pass Score</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-800 font-medium">{exam.title}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{exam.course_title}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                        <Clock3 size={11} />
                        {exam.time_limit_minutes} min
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 text-xs">%{exam.passing_score}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onStartExam(exam.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white
                                   text-xs font-semibold transition-colors shadow-sm shadow-blue-200"
                      >
                        Take Exam
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Award size={15} className="text-amber-500" />
          My Certificates ({attempts.length})
        </h3>
        {attempts.length === 0 ? (
          <EmptyState icon={<Award size={28} className="text-slate-300" />}
                      title="No certificates yet"
                      description="Pass an exam to earn your first certificate and XP." />
        ) : (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Course</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Exam</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Score</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">XP</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Date</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {attempts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-slate-800 font-medium text-xs">{a.exam.course.title}</p>
                      <p className="text-slate-400 text-xs">{a.exam.course.category}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{a.exam.title}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                        <CheckCircle2 size={11} />
                        {Math.round(a.score)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-amber-500 font-semibold text-xs">+{a.xp_awarded}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {a.completed_at
                        ? new Date(a.completed_at).toLocaleDateString('en-GB')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onViewCertificate(a)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200
                                   text-xs text-slate-600 hover:bg-slate-100 transition-colors ml-auto"
                      >
                        <Award size={12} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function CPEWalletTab({
  records, earnedHours, pendingHours, goalHours, year, loading, onAddRecord, onDeleteRecord,
}: {
  records: UserCpeRecord[];
  earnedHours: number;
  pendingHours: number;
  goalHours: number;
  year: number;
  loading: boolean;
  onAddRecord: () => void;
  onDeleteRecord: (id: string) => void;
}) {
  if (loading) return <LoadingSkeleton rows={4} />;

  const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; label: string; cls: string }> = {
    approved: { icon: CheckCircle2, label: 'Approved',  cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    pending:  { icon: Clock3,       label: 'Pending',   cls: 'text-amber-600 bg-amber-50 border-amber-200' },
    rejected: { icon: XCircle,      label: 'Rejected',  cls: 'text-rose-600 bg-rose-50 border-rose-200' },
  };

  return (
    <div className="space-y-6">
      <CPEProgressBar
        earnedHours={earnedHours}
        pendingHours={pendingHours}
        goalHours={goalHours}
        year={year}
      />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">
            CPE History — {year}
            <span className="ml-2 font-normal text-slate-400">({records.length} entries)</span>
          </h3>
          <button
            onClick={onAddRecord}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500
                       text-white text-xs font-semibold transition-colors shadow-sm shadow-blue-200"
          >
            <Plus size={13} />
            Log External CPE
          </button>
        </div>

        {records.length === 0 ? (
          <EmptyState
            icon={<Wallet size={28} className="text-slate-300" />}
            title="No CPE records yet"
            description="Use 'Log External CPE' to record training hours from conferences, webinars, or certifications."
            action={<button onClick={onAddRecord}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white
                                       text-sm font-medium hover:bg-blue-500 transition-colors">
              <Plus size={14} /> Log your first CPE
            </button>}
          />
        ) : (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Course / Training</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Provider</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Hours</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Date</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map((r) => {
                  const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3">
                        <p className="text-slate-800 font-medium">{r.title}</p>
                        {r.notes && <p className="text-slate-400 text-xs mt-0.5 truncate max-w-xs">{r.notes}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100
                                         text-slate-600 text-xs font-medium">
                          {r.provider}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-700">
                        {r.credit_hours}h
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {new Date(r.date_earned).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border
                                         text-xs font-medium ${cfg.cls}`}>
                          <StatusIcon size={10} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {r.status === 'pending' && (
                          <button
                            onClick={() => onDeleteRecord(r.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400
                                       hover:text-rose-500 hover:bg-rose-50 transition-all"
                            title="Delete record"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: 'amber' | 'emerald' | 'blue';
}) {
  const bg = { amber: 'bg-amber-50 border-amber-100', emerald: 'bg-emerald-50 border-emerald-100', blue: 'bg-blue-50 border-blue-100' }[color];
  return (
    <div className={`rounded-xl border ${bg} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode; title: string; description: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-slate-700 font-semibold">{title}</p>
      <p className="text-slate-400 text-sm max-w-xs">{description}</p>
      {action}
    </div>
  );
}

function LoadingSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}
