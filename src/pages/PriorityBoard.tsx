import React from 'react';
import { MoreHorizontal, Clock } from 'lucide-react';
import { getBoardTasks, type BoardTask } from '../data/board';

interface PriorityBoardProps {
  isDark: boolean;
}

const PriorityBoard: React.FC<PriorityBoardProps> = ({ isDark }) => {
  // Fetch tasks dynamically
  const allTasks = getBoardTasks();

  const getTaskTimeCategory = (task: BoardTask): 'past' | 'upcoming' | 'unknown' => {
    if (!task.dueDate) return 'unknown';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0); // Compare dates only
    
    // Past: before today
    if (taskDate.getTime() < today.getTime()) return 'past';
    // Upcoming: today or future
    return 'upcoming';
  };

  const pastTasks = allTasks.filter(t => getTaskTimeCategory(t) === 'past');
  const upcomingTasks = allTasks.filter(t => getTaskTimeCategory(t) === 'upcoming');

  // Columns: Past, Upcoming (Today + Future)
  const columns = [
    { id: 'past', title: 'Past Tasks', tasks: pastTasks, color: 'bg-green-500' }, 
    { id: 'upcoming', title: 'Upcoming Tasks', tasks: upcomingTasks, color: 'bg-slate-500' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-600';
      case 'medium':
        return 'bg-orange-100 text-orange-600';
      case 'low':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Priority Board</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {columns.map(column => (
          <div key={column.id} className={`rounded-3xl p-6 shadow-sm border h-full flex flex-col min-h-0 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                <h3 className="font-bold">{column.title}</h3>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {column.tasks.length}
                </span>
              </div>
              <button className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-600 dark:scrollbar-thumb-purple-500 scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
              {column.tasks.map(task => (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all hover:shadow-lg ${
                    isDark ? 'bg-slate-800 border-slate-700 hover:border-blue-600' : 'bg-slate-50 border-slate-200 hover:border-blue-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{task.title}</h4>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    {task.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-2 py-0.5 text-xs rounded ${
                          isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    {task.assignee && (
                      <div className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {task.assignee.charAt(0)}
                        </div>
                        <span>{task.assignee}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Clock size={12} />
                        <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityBoard;
