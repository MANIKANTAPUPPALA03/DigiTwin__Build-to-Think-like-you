import { tasks } from './tasks';

// Daily task metrics interface
export interface DailyTaskMetrics {
  date: string; // ISO date (YYYY-MM-DD)
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number; // percentage
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

// Generate task history from actual task data for last 15 days
const generateTaskHistory = (): DailyTaskMetrics[] => {
  const history: DailyTaskMetrics[] = [];
  const startDate = new Date('2025-12-06');
  const endDate = new Date('2025-12-20'); // Today
  
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Get tasks created on this specific date
    const tasksForDate = tasks.filter(task => {
      const taskCreatedDate = new Date(task.createdAt).toISOString().split('T')[0];
      return taskCreatedDate === dateStr;
    });
    
    // Also check tasks that were completed on this date
    const tasksCompletedOnDate = tasks.filter(task => {
      if (!task.completedAt) return false;
      const taskCompletedDate = new Date(task.completedAt).toISOString().split('T')[0];
      return taskCompletedDate === dateStr;
    });
    
    const allTasksForDate = [...new Set([...tasksForDate, ...tasksCompletedOnDate])];
    
    const totalTasks = allTasksForDate.length;
    const completedTasks = allTasksForDate.filter(t => t.status === 'completed').length;
    const pendingTasks = allTasksForDate.filter(t => t.status === 'pending').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const priorityDistribution = {
      high: allTasksForDate.filter(t => t.priority === 'high').length,
      medium: allTasksForDate.filter(t => t.priority === 'medium').length,
      low: allTasksForDate.filter(t => t.priority === 'low').length,
    };
    
    // Always push a day for consistent history
    history.push({
      date: dateStr,
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      priorityDistribution
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return history;
};

export const taskHistory: DailyTaskMetrics[] = generateTaskHistory();

// Get last 15 days of history
export const getLastFifteenDays = (): DailyTaskMetrics[] => {
  return taskHistory.slice(-15);
};

// Get last 7 days of history (for backwards compatibility)
export const getLastSevenDays = (): DailyTaskMetrics[] => {
  return taskHistory.slice(-7);
};

// Calculate weekly comparison
export const getWeeklyComparison = (): number => {
  if (taskHistory.length < 7) return 0;
  
  const lastWeek = taskHistory.slice(-7);
  const previousWeek = taskHistory.slice(-14, -7);
  
  if (previousWeek.length === 0) return 0;
  
  const lastWeekAvg = lastWeek.reduce((sum, day) => sum + day.completionRate, 0) / lastWeek.length;
  const previousWeekAvg = previousWeek.reduce((sum, day) => sum + day.completionRate, 0) / previousWeek.length;
  
  const change = lastWeekAvg - previousWeekAvg;
  return Math.round(change);
};
