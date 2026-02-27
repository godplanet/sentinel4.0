import { useState, useEffect } from 'react';
import { useWorkpaperStore } from '@/entities/workpaper';
import type { Workpaper, TestResult } from '@/entities/workpaper';

interface WorkpaperEditorProps {
  workpaperId: string;
  onClose?: () => void;
}

export function WorkpaperEditor({ workpaperId, onClose }: WorkpaperEditorProps) {
  const { getWorkpaperById, getStepById, updateWorkpaperData, updateWorkpaperStatus } = useWorkpaperStore();
  const workpaper = getWorkpaperById(workpaperId);
  const step = workpaper ? getStepById(workpaper.step_id) : undefined;

  const [testResults, setTestResults] = useState<Record<string, TestResult>>(
    workpaper?.data.test_results || {}
  );
  const [notes, setNotes] = useState(workpaper?.data.notes || '');

  useEffect(() => {
    if (workpaper) {
      setTestResults(workpaper.data.test_results || {});
      setNotes(workpaper.data.notes || '');
    }
  }, [workpaper]);

  if (!workpaper || !step) {
    return (
      <div className="p-6 bg-white/80 backdrop-blur-xl rounded-lg border border-gray-200">
        <p className="text-gray-600">Workpaper not found</p>
      </div>
    );
  }

  const handleSave = () => {
    updateWorkpaperData({
      workpaper_id: workpaperId,
      data: {
        test_results: testResults,
        notes,
      },
    });
  };

  const handleStatusChange = (newStatus: Workpaper['status']) => {
    updateWorkpaperStatus({
      workpaper_id: workpaperId,
      status: newStatus,
    });
  };

  const addTestItem = () => {
    const testName = prompt('Enter test name:');
    if (testName && !testResults[testName]) {
      setTestResults({ ...testResults, [testName]: 'n/a' });
    }
  };

  const updateTestResult = (testName: string, result: TestResult) => {
    setTestResults({ ...testResults, [testName]: result });
  };

  const removeTestItem = (testName: string) => {
    const newResults = { ...testResults };
    delete newResults[testName];
    setTestResults(newResults);
  };

  const getStatusColor = (status: Workpaper['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'review':
        return 'bg-blue-100 text-blue-700';
      case 'finalized':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getResultColor = (result: TestResult) => {
    switch (result) {
      case 'pass':
        return 'bg-green-500 hover:bg-green-600';
      case 'fail':
        return 'bg-red-500 hover:bg-red-600';
      case 'n/a':
        return 'bg-gray-400 hover:bg-gray-500';
      default:
        return 'bg-gray-400 hover:bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-semibold text-gray-900">{step.title}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(workpaper.status)}`}>
                {workpaper.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Step Code: {step.step_code}</p>
            {step.description && (
              <p className="text-sm text-gray-600">{step.description}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleStatusChange('draft')}
            disabled={workpaper.status === 'draft'}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Mark as Draft
          </button>
          <button
            onClick={() => handleStatusChange('review')}
            disabled={workpaper.status === 'review'}
            className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit for Review
          </button>
          <button
            onClick={() => handleStatusChange('finalized')}
            disabled={workpaper.status === 'finalized'}
            className="px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Finalize
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
            <button
              onClick={addTestItem}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              + Add Test
            </button>
          </div>
          <div className="space-y-2">
            {Object.entries(testResults).map(([testName, result]) => (
              <div key={testName} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <span className="flex-1 text-sm font-medium text-gray-700">{testName}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateTestResult(testName, 'pass')}
                    className={`px-3 py-1 rounded text-white text-sm transition-colors ${
                      result === 'pass' ? getResultColor('pass') : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  >
                    Pass
                  </button>
                  <button
                    onClick={() => updateTestResult(testName, 'fail')}
                    className={`px-3 py-1 rounded text-white text-sm transition-colors ${
                      result === 'fail' ? getResultColor('fail') : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  >
                    Fail
                  </button>
                  <button
                    onClick={() => updateTestResult(testName, 'n/a')}
                    className={`px-3 py-1 rounded text-white text-sm transition-colors ${
                      result === 'n/a' ? getResultColor('n/a') : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  >
                    N/A
                  </button>
                </div>
                <button
                  onClick={() => removeTestItem(testName)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {Object.keys(testResults).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No tests added yet. Click "Add Test" to start.</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
            rows={6}
            placeholder="Enter audit notes, observations, or additional details..."
          />
        </div>

        <div className="flex justify-end gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Version {workpaper.version} • Last updated: {new Date(workpaper.updated_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
