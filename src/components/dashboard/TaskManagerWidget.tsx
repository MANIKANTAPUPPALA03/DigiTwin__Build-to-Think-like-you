import React, { useState, useRef } from 'react';
import { Calendar as CalendarIcon, Video, Layout, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTasksByDate } from '../../data/dataUtils';
import { Task } from '../../data/tasks';

interface TaskManagerWidgetProps {
  isDark: boolean;
}

const TaskManagerWidget: React.FC<TaskManagerWidgetProps> = ({ isDark }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 11, 10)); // Dec 10, 2025
  const [displayTasks, setDisplayTasks] = useState<Task[]>([]);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate all days in the current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: Date[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const daysInMonth = getDaysInMonth(selectedDate);

  // Format day names
  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };

  // Load tasks for selected date
  React.useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const tasks = getTasksByDate(dateStr);
    // Show only pending tasks (or all tasks if you want)
    setDisplayTasks(tasks.slice(0, 3)); // Show up to 3 tasks
  }, [selectedDate]);

  // Handle month navigation
  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  // Scroll to selected date
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedIndex = selectedDate.getDate() - 1;
      const scrollPosition = selectedIndex * 60; // Approximate width per day item
      scrollContainerRef.current.scrollTo({
        left: scrollPosition - 100,
        behavior: 'smooth'
      });
    }
  }, [selectedDate]);

  // Handle add task


  const monthYear = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <>
      <div className={`rounded-3xl p-6 shadow-sm border flex flex-col h-[450px] ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg">Task Manager</h3>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Updated
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${
                  isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CalendarIcon size={14} />
                <span>{monthYear}</span>
              </button>
              
              {showMonthPicker && (
                <div className={`absolute top-full right-0 mt-2 p-2 rounded-lg shadow-lg border z-10 ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => changeMonth('prev')}
                      className={`p-1 rounded hover:bg-blue-100 dark:hover:bg-purple-900/30`}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-medium px-2">{monthYear}</span>
                    <button
                      onClick={() => changeMonth('next')}
                      className={`p-1 rounded hover:bg-blue-100 dark:hover:bg-purple-900/30`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>

        {/* Horizontally scrollable date selector */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 mb-8 px-4 border-b pb-4 dark:border-slate-800 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-600 dark:scrollbar-thumb-purple-500 scrollbar-track-slate-200 dark:scrollbar-track-slate-800"
          style={{ scrollbarWidth: 'thin' }}
        >
          {daysInMonth.map((date) => {
            const isSelected = date.getDate() === selectedDate.getDate();
            return (
              <div 
                key={date.getTime()} 
                onClick={() => setSelectedDate(date)}
                className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0"
              >
                <span className={`text-xs font-semibold ${
                  isSelected ? 'text-blue-600 dark:text-purple-400' : (isDark ? 'text-slate-500' : 'text-slate-400')
                }`}>
                  {getDayName(date)}
                </span>
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                  isSelected
                    ? `bg-gradient-to-br ${isDark ? 'from-purple-600 to-cyan-600' : 'from-blue-600 to-cyan-600'} text-white shadow-lg scale-110` 
                    : (isDark ? 'text-slate-300 group-hover:bg-slate-800' : 'text-slate-700 group-hover:bg-slate-100')
                }`}>
                  {date.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto">
          {displayTasks.length === 0 ? (
            <div className={`text-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              No tasks for this day
            </div>
          ) : (
            displayTasks.map((task) => (
              <div key={task.id} className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      task.priority === 'high'
                        ? (isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600')
                        : (isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-100 text-blue-600')
                    }`}>
                      {task.category.includes('UI') ? <Layout size={20} /> : <Video size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{task.title}</h4>
                      <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                          {task.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  {task.assignees && task.assignees.length > 0 && (
                    <div className="flex items-center gap-1">
                      {task.assignees.map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800 dark:bg-slate-600 -ml-2 first:ml-0"></div>
                      ))}
                    </div>
                  )}
                </div>
              
                <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {task.description}
                </p>

                {/* Status Badge with Clickable Checkbox */}
                <div className="flex items-center gap-3">
                  {/* Clickable Checkbox Circle */}
                  <button
                    onClick={() => {
                      // Toggle task completion - this would call API in production
                      console.log('Toggle completion for task:', task.id);
                    }}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${
                      task.status === 'completed'
                        ? 'bg-green-500 border-green-500'
                        : isDark
                        ? 'border-slate-600 hover:border-green-500'
                        : 'border-slate-300 hover:border-green-500'
                    }`}
                    title={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                  >
                    {task.status === 'completed' && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                    task.status === 'completed'
                      ? isDark 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-green-50 text-green-700 border border-green-200'
                      : isDark
                      ? 'bg-slate-700/50 text-slate-400 border border-slate-600'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {task.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Task Modal */}
       {/* Modal removed */}
    </>
  );
};

export default TaskManagerWidget;
