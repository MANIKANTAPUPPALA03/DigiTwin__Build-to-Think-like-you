import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { getTaskStatistics } from '../../data/dataUtils';

interface TaskCompletionWidgetProps {
  isDark: boolean;
}

const TaskCompletionWidget: React.FC<TaskCompletionWidgetProps> = ({ isDark }) => {
  // REAL DATA: Fetches actual task statistics from tasks.ts
  // This is NOT mock data - it calculates based on actual completed/pending tasks
  const stats = getTaskStatistics();

  return (
    <div className={`rounded-3xl p-6 shadow-sm border transition-all hover:shadow-md ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg">Task Completion</h3>
        <button className={`p-1 rounded-lg transition-colors ${
          isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'
        }`}>
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="flex items-center gap-8">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={isDark ? '#334155' : '#f1f5f9'}
              strokeWidth="12"
              fill="none"
            />
            <defs>
              <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
            </defs>
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={isDark ? 'url(#purpleGradient)' : '#3b82f6'}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - stats.completionRate / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold">{stats.completionRate}%</span>
          </div>
        </div>

        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-purple-600' : 'bg-blue-600'}`}></span>
              <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Completed</span>
            </div>
            <span className="font-semibold">{stats.completedPercentage}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>
              <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Pending</span>
            </div>
            <span className="font-semibold">{stats.pendingPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCompletionWidget;

