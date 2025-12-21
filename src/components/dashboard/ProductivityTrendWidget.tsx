import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getLastFifteenDays, getWeeklyComparison } from '../../data/taskHistory';

interface ProductivityTrendWidgetProps {
  isDark: boolean;
}

const ProductivityTrendWidget: React.FC<ProductivityTrendWidgetProps> = ({ isDark }) => {
  // Get real task data for last 15 days from data layer
  const lastFifteenDays = getLastFifteenDays();
  const weeklyChange = getWeeklyComparison();
  
  // Find max number of tasks for scaling bars
  const maxTasks = Math.max(...lastFifteenDays.map(d => d.totalTasks), 1);
  
  // Get day labels (showing only date numbers to fit 15 days)
  const dayLabels = lastFifteenDays.map(day => {
    const date = new Date(day.date);
    return date.getDate(); // Just the day number (6, 7, 8, etc.)
  });

  return (
    <div className={`rounded-3xl p-6 shadow-sm border ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg mb-1">Task Activity</h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Last 15 days - Completed vs Pending
          </p>
        </div>
        <div className="flex items-center gap-2">
          {weeklyChange >= 0 ? (
            <TrendingUp className="text-green-500" size={20} />
          ) : (
            <TrendingDown className="text-red-500" size={20} />
          )}
          <div className="text-right">
            <div className="text-2xl font-bold">{Math.abs(weeklyChange)}%</div>
            <div className={`text-xs ${weeklyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              vs last week
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-1 h-32">
        {lastFifteenDays.map((day, index) => {
          // Calculate heights based on completed and pending tasks
          const totalHeight = maxTasks > 0 ? (day.totalTasks / maxTasks) * 100 : 0;
          
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full relative flex flex-col-reverse items-center justify-start" style={{ height: '100px' }}>
                {day.totalTasks > 0 && (
                  <div className="w-full flex flex-col-reverse" style={{ height: `${totalHeight}%` }}>
                    {/* Completed tasks - solid color at bottom */}
                    {day.completedTasks > 0 && (
                      <div
                        className={`w-full transition-all ${isDark ? 'bg-gradient-to-t from-purple-600 to-cyan-500 hover:brightness-110' : 'bg-blue-600 group-hover:bg-blue-500'}`}
                        style={{ 
                          height: `${(day.completedTasks / day.totalTasks) * 100}%`,
                          borderTopLeftRadius: day.pendingTasks === 0 ? '4px' : '0',
                          borderTopRightRadius: day.pendingTasks === 0 ? '4px' : '0',
                          borderBottomLeftRadius: '4px',
                          borderBottomRightRadius: '4px'
                        }}
                        title={`${day.completedTasks} completed`}
                      ></div>
                    )}
                    {/* Pending tasks - lighter/transparent color on top */}
                    {day.pendingTasks > 0 && (
                      <div
                        className={`w-full ${
                          isDark ? 'bg-purple-400/30' : 'bg-blue-300/40'
                        } ${isDark ? 'group-hover:bg-purple-400/50' : 'group-hover:bg-blue-400/50'} transition-all`}
                        style={{ 
                          height: `${(day.pendingTasks / day.totalTasks) * 100}%`,
                          borderTopLeftRadius: '4px',
                          borderTopRightRadius: '4px',
                          borderBottomLeftRadius: day.completedTasks === 0 ? '4px' : '0',
                          borderBottomRightRadius: day.completedTasks === 0 ? '4px' : '0'
                        }}
                        title={`${day.pendingTasks} pending`}
                      ></div>
                    )}
                  </div>
                )}
                {/* Show total task count above bar */}
                {day.totalTasks > 0 && (
                  <div className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold ${isDark ? 'text-purple-400' : 'text-blue-600'}`}>
                    {day.totalTasks}
                  </div>
                )}
              </div>
              <span className={`text-[9px] font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                {dayLabels[index]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <div className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded ${isDark ? 'bg-purple-600' : 'bg-blue-600'}`}></div>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded ${isDark ? 'bg-purple-400/30' : 'bg-blue-300/40'}`}></div>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Pending</span>
        </div>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Pending</span>
        </div>
      </div>
    </div>
  );
};

export default ProductivityTrendWidget;
