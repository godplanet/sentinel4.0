import {
 addTimeLog,
 deleteTimeLog,
 fetchTimeLogs,
 fetchWorkpaperTimeSummary,
} from '@/entities/workpaper/api/timeLogApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Plus, Save, Trash2, User } from 'lucide-react';
import { useState } from 'react';

interface TimeTrackerProps {
 workpaperId: string;
}

export function TimeTracker({ workpaperId }: TimeTrackerProps) {
 const queryClient = useQueryClient();
 const [showAddForm, setShowAddForm] = useState(false);
 const [formData, setFormData] = useState({
 hours_spent: '',
 activity_date: new Date().toISOString().split('T')[0],
 description: '',
 });

 const { data: timeLogs = [], isLoading } = useQuery({
 queryKey: ['time-logs', workpaperId],
 queryFn: () => fetchTimeLogs(workpaperId),
 });

 const { data: summary } = useQuery({
 queryKey: ['time-summary', workpaperId],
 queryFn: () => fetchWorkpaperTimeSummary(workpaperId),
 });

 const addMutation = useMutation({
 mutationFn: (logData: { hours_spent: number; activity_date: string; description: string }) =>
 addTimeLog({ workpaperId, ...logData }),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['time-logs', workpaperId] });
 queryClient.invalidateQueries({ queryKey: ['time-summary', workpaperId] });
 setShowAddForm(false);
 setFormData({
 hours_spent: '',
 activity_date: new Date().toISOString().split('T')[0],
 description: '',
 });
 },
 });

 const deleteMutation = useMutation({
 mutationFn: (logId: string) => deleteTimeLog(logId),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['time-logs', workpaperId] });
 queryClient.invalidateQueries({ queryKey: ['time-summary', workpaperId] });
 },
 });

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 const hours = parseFloat(formData.hours_spent);
 if (hours <= 0 || hours > 24) {
 alert('Hours must be between 0 and 24');
 return;
 }

 addMutation.mutate({
 hours_spent: hours,
 activity_date: formData.activity_date,
 description: formData.description,
 });
 };

 if (isLoading) {
 return <div className="text-sm text-slate-500">Loading time logs...</div>;
 }

 return (
 <div className="space-y-4">
 {/* SUMMARY CARD */}
 <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
 <div className="flex items-center justify-between mb-3">
 <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
 <Clock className="w-5 h-5 text-blue-600" />
 Time Tracking Summary
 </h3>
 <button
 onClick={() => setShowAddForm(!showAddForm)}
 className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1 text-sm"
 >
 <Plus className="w-4 h-4" />
 Log Time
 </button>
 </div>

 {summary && (
 <div className="grid grid-cols-4 gap-4">
 <div className="bg-surface rounded-lg p-3 border border-blue-100">
 <div className="text-2xl font-bold text-blue-600">
 {summary.total_hours.toFixed(1)}h
 </div>
 <div className="text-xs text-slate-600 mt-1">Total Hours</div>
 </div>
 <div className="bg-surface rounded-lg p-3 border border-blue-100">
 <div className="text-2xl font-bold text-slate-700">
 {summary.total_entries}
 </div>
 <div className="text-xs text-slate-600 mt-1">Log Entries</div>
 </div>
 <div className="bg-surface rounded-lg p-3 border border-blue-100">
 <div className="text-2xl font-bold text-slate-700">
 {summary.contributors}
 </div>
 <div className="text-xs text-slate-600 mt-1">Contributors</div>
 </div>
 <div className="bg-surface rounded-lg p-3 border border-blue-100">
 <div className="text-2xl font-bold text-slate-700">
 {summary.avg_hours_per_day.toFixed(1)}h
 </div>
 <div className="text-xs text-slate-600 mt-1">Avg per Entry</div>
 </div>
 </div>
 )}
 </div>

 {/* ADD TIME LOG FORM */}
 {showAddForm && (
 <div className="bg-surface rounded-lg border border-slate-200 p-4">
 <h4 className="text-sm font-semibold text-primary mb-3">Log Time Entry</h4>
 <form onSubmit={handleSubmit} className="space-y-3">
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-medium text-slate-700 mb-1">
 Hours Spent *
 </label>
 <input
 type="number"
 step="0.5"
 min="0.5"
 max="24"
 value={formData.hours_spent}
 onChange={(e) => setFormData({ ...formData, hours_spent: e.target.value })}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
 placeholder="e.g., 2.5"
 required
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-slate-700 mb-1">
 Activity Date *
 </label>
 <input
 type="date"
 value={formData.activity_date}
 onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
 required
 />
 </div>
 </div>
 <div>
 <label className="block text-xs font-medium text-slate-700 mb-1">
 Description
 </label>
 <textarea
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
 rows={2}
 placeholder="What did you work on?"
 />
 </div>
 <div className="flex justify-end gap-2">
 <button
 type="button"
 onClick={() => setShowAddForm(false)}
 className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={addMutation.isPending}
 className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1 text-sm disabled:opacity-50"
 >
 <Save className="w-3.5 h-3.5" />
 {addMutation.isPending ? 'Saving...' : 'Save Entry'}
 </button>
 </div>
 </form>
 </div>
 )}

 {/* TIME LOGS LIST */}
 <div className="bg-surface rounded-lg border border-slate-200">
 <div className="p-3 border-b border-slate-200 bg-canvas">
 <h4 className="text-sm font-semibold text-primary">Time Log History</h4>
 </div>

 {timeLogs.length === 0 ? (
 <div className="p-5 text-center text-slate-500">
 <Clock className="w-12 h-12 mx-auto mb-2 text-slate-300" />
 <p className="text-sm">No time logs recorded yet</p>
 <button
 onClick={() => setShowAddForm(true)}
 className="mt-3 text-sm text-blue-600 hover:text-blue-700"
 >
 Log your first entry
 </button>
 </div>
 ) : (
 <div className="divide-y divide-slate-100">
 {(timeLogs || []).map((log) => (
 <div key={log.id} className="p-3 hover:bg-canvas transition-colors">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-1">
 <div className="flex items-center gap-1.5 text-sm">
 <Calendar className="w-3.5 h-3.5 text-slate-400" />
 <span className="text-slate-700 font-medium">
 {new Date(log.activity_date).toLocaleDateString()}
 </span>
 </div>
 <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
 {log.hours_spent}h
 </div>
 </div>
 {log.description && (
 <p className="text-sm text-slate-600 mt-1">{log.description}</p>
 )}
 <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
 <User className="w-3 h-3" />
 <span>Logged {new Date(log.created_at).toLocaleString()}</span>
 </div>
 </div>
 <button
 onClick={() => {
 if (confirm('Delete this time log?')) {
 deleteMutation.mutate(log.id);
 }
 }}
 className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
 title="Delete log"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
}
