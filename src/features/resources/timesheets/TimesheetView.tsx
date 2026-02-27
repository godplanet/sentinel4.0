import { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabase';
import { Clock, Calendar, Download, FileText, Plus } from 'lucide-react';
import clsx from 'clsx';

interface TimeEntry {
  id: string;
  workpaper_id: string;
  auditor_id: string;
  date: string;
  hours: number;
  description?: string;
  workpaper?: {
    title: string;
    engagement?: {
      title: string;
    };
  };
}

interface DailySummary {
  date: string;
  total_hours: number;
  entries: TimeEntry[];
}

export function TimesheetView() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());

  useEffect(() => {
    loadTimeEntries();
  }, [selectedWeek]);

  const loadTimeEntries = async () => {
    try {
      setLoading(true);
      const weekStart = getWeekStart(selectedWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const { data, error } = await supabase
        .from('time_tracking')
        .select(`
          *,
          workpaper:workpapers(
            title,
            engagement:audit_engagements(title)
          )
        `)
        .gte('date', weekStart.toISOString())
        .lte('date', weekEnd.toISOString())
        .order('date', { ascending: true });

      if (error) throw error;
      setTimeEntries(data || []);
    } catch (error) {
      console.error('Failed to load time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getDailySummary = (date: Date): DailySummary => {
    const dateStr = date.toISOString().split('T')[0];
    const dayEntries = timeEntries.filter(e => e.date.startsWith(dateStr));
    return {
      date: dateStr,
      total_hours: dayEntries.reduce((sum, e) => sum + e.hours, 0),
      entries: dayEntries
    };
  };

  const weekStart = getWeekStart(selectedWeek);
  const weekDays = getWeekDays(weekStart);
  const weekTotal = timeEntries.reduce((sum, e) => sum + e.hours, 0);

  const previousWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Zaman Çizelgeleri</h2>
          <p className="text-slate-600 mt-1">
            Haftalık zaman takibi ve onay süreci
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Download size={16} />
            Excel İndir
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={16} />
            Zaman Ekle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Bu Hafta</p>
              <p className="text-2xl font-bold text-slate-900">{weekTotal}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FileText className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Kayıtlı Giriş</p>
              <p className="text-2xl font-bold text-slate-900">{timeEntries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Calendar className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Günlük Ort.</p>
              <p className="text-2xl font-bold text-slate-900">
                {timeEntries.length > 0 ? (weekTotal / 7).toFixed(1) : 0}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Clock className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Hedef</p>
              <p className="text-2xl font-bold text-slate-900">40h</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={previousWeek}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              {weekStart.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} -{' '}
              {weekDays[6].toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={nextWeek}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="text-sm">
            <span className="text-slate-600">Toplam: </span>
            <span className="font-bold text-slate-900">{weekTotal}h</span>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {weekDays.map((day, index) => {
                const summary = getDailySummary(day);
                const dayName = day.toLocaleDateString('tr-TR', { weekday: 'long' });
                const isWeekend = index >= 5;

                return (
                  <div
                    key={day.toISOString()}
                    className={clsx(
                      'border rounded-lg p-4 transition-all',
                      isToday(day)
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : isWeekend
                        ? 'border-slate-100 bg-slate-50'
                        : 'border-slate-200 hover:border-blue-300'
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'w-12 h-12 rounded-lg flex flex-col items-center justify-center',
                          isToday(day)
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        )}>
                          <span className="text-xs font-medium uppercase">
                            {dayName.substring(0, 3)}
                          </span>
                          <span className="text-lg font-bold">{day.getDate()}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 capitalize">{dayName}</h4>
                          <p className="text-sm text-slate-500">
                            {day.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'px-4 py-2 rounded-lg font-bold',
                          summary.total_hours > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-400'
                        )}>
                          {summary.total_hours}h
                        </div>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <Plus size={18} className="text-slate-600" />
                        </button>
                      </div>
                    </div>

                    {summary.entries.length > 0 && (
                      <div className="space-y-2 mt-3 pt-3 border-t border-slate-200">
                        {summary.entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-start justify-between text-sm"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">
                                {entry.workpaper?.engagement?.title || 'Denetim'}
                              </p>
                              <p className="text-xs text-slate-500">
                                {entry.workpaper?.title || 'İş Kağıdı'}
                              </p>
                            </div>
                            <span className="text-blue-600 font-medium ml-3">
                              {entry.hours}h
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
