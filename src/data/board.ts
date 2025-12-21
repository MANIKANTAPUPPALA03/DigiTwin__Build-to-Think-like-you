import { tasks } from './tasks';

// Board task interface
export interface BoardTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  tags?: string[];
}

// Convert email-derived tasks to board tasks
const generateBoardTasksFromTasks = (): BoardTask[] => {
  return tasks.map(task => {
    // Map task status to board status
    let boardStatus: 'todo' | 'in-progress' | 'done' = 'todo';
    if (task.status === 'completed') {
      boardStatus = 'done';
    } else if (task.status === 'pending') {
      boardStatus = 'todo';
    }
    
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: boardStatus,
      priority: task.priority,
      assignee: task.assignees && task.assignees.length > 0 ? 'Team Member' : undefined,
      dueDate: task.dueDate,
      tags: [task.category.toLowerCase().replace(/\s+/g, '-')]
    };
  });
};

// Export a function to get fresh board tasks directly
export const getBoardTasks = (): BoardTask[] => {
  return generateBoardTasksFromTasks();
};

export const boardTasks: BoardTask[] = generateBoardTasksFromTasks(); // Keep for backward compatibility if needed, but prefer getBoardTasks

export const getTasksByStatus = (status: 'todo' | 'in-progress' | 'done'): BoardTask[] => {
  return getBoardTasks().filter(task => task.status === status);
};

export const getTaskById = (id: string): BoardTask | undefined => {
  return getBoardTasks().find(task => task.id === id);
};
