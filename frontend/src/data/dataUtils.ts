import { tasks, Task } from './tasks';

// Calculate current task statistics - ONLY 2 statuses now
export const getTaskStatistics = () => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Calculate percentages for pie chart - only completed and pending
  const completedPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pendingPercentage = 100 - completedPercentage;
  
  return {
    total,
    completed,
    pending,
    completionRate,
    completedPercentage,
    pendingPercentage
  };
};

// Get tasks for a specific date (matches creation date or completion date)
export const getTasksByDate = (dateString: string): Task[] => {
  const targetDate = new Date(dateString);
  const dateOnly = targetDate.toISOString().split('T')[0];
  
  return tasks.filter(task => {
    const createdDate = new Date(task.createdAt).toISOString().split('T')[0];
    const completedDate = task.completedAt ? new Date(task.completedAt).toISOString().split('T')[0] : null;
    return createdDate === dateOnly || completedDate === dateOnly;
  });
};

// Get tasks within a date range
export const getTasksByDateRange = (startDate: string, endDate: string): Task[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    return taskDate >= start && taskDate <= end;
  });
};

// Calculate completion trend (change over time)
export const calculateCompletionTrend = (): number => {
  const now = new Date('2025-12-20');
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  const lastWeekTasks = getTasksByDateRange(sevenDaysAgo.toISOString(), now.toISOString());
  const previousWeekTasks = getTasksByDateRange(fourteenDaysAgo.toISOString(), sevenDaysAgo.toISOString());
  
  const lastWeekCompleted = lastWeekTasks.filter(t => t.status === 'completed').length;
  const previousWeekCompleted = previousWeekTasks.filter(t => t.status === 'completed').length;
  
  const lastWeekRate = lastWeekTasks.length > 0 ? (lastWeekCompleted / lastWeekTasks.length) * 100 : 0;
  const previousWeekRate = previousWeekTasks.length > 0 ? (previousWeekCompleted / previousWeekTasks.length) * 100 : 0;
  
  return Math.round(lastWeekRate - previousWeekRate);
};

// Get priority distribution of current tasks
export const getPriorityDistribution = () => {
  const high = tasks.filter(t => t.priority === 'high').length;
  const medium = tasks.filter(t => t.priority === 'medium').length;
  const low = tasks.filter(t => t.priority === 'low').length;
  
  return { high, medium, low };
};

// Get tasks for today
export const getTodaysTasks = (): Task[] => {
  const today = new Date('2025-12-20').toISOString().split('T')[0];
  return getTasksByDate(today);
};

// Get upcoming tasks (pending only)
export const getUpcomingTasks = (): Task[] => {
  return tasks.filter(task => task.status === 'pending');
};

// Get completed tasks
export const getCompletedTasks = (): Task[] => {
  return tasks.filter(task => task.status === 'completed');
};
