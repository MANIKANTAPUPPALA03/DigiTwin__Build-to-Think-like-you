// Mock API Service - Simulates backend API calls
// In production, this would make real HTTP requests to the backend

import { emails, type Email } from '../data/emails';
import { tasks, type Task } from '../data/tasks';
import { calendarEvents, type CalendarEvent, refreshCalendarEvents } from '../data/calendar';
import { boardTasks, type BoardTask, getTasksByStatus, getTaskById as getBoardTaskById } from '../data/board';
import { initialMessages as messages, type Message } from '../data/messages';
import { productivityData } from '../data/productivity';
import { getTaskStatistics, getTasksByDate } from '../data/dataUtils';
import { API_ENDPOINTS } from '../config/apiEndpoints';

// TOGGLE THIS TO FALSE TO USE REAL KEY
const USE_MOCK_DATA = true;

// Helper to simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for fetch wrapper
const fetchJson = async (url: string, options?: RequestInit) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
};

// Auth API
export const authAPI = {
  async login(email: string, password?: string) {
    if (!USE_MOCK_DATA) {
      return fetchJson(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    }
    await delay(500);
    // Mock Validation
    if (!email.includes('@')) throw new Error('Invalid email');
    
    const user = {
      id: 'usr-' + Date.now(),
      name: 'Michael Chen',
      email: email,
      avatar: undefined
    };
    return { user, token: 'mock-jwt-token' };
  },

  async signup(name: string, email: string, password?: string) {
    if (!USE_MOCK_DATA) {
        return fetchJson(API_ENDPOINTS.AUTH.SIGNUP, {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
    }
    await delay(500);
    if (!name || !email) throw new Error('Missing fields');

    const user = {
        id: 'usr-' + Date.now(),
        name: name,
        email: email,
        avatar: undefined
    };
    return { user, token: 'mock-jwt-token' };
  },

  async loginWithGoogle(token: string) { // Expects Google ID token
      if (!USE_MOCK_DATA) {
          return fetchJson(API_ENDPOINTS.AUTH.GOOGLE, {
              method: 'POST',
              body: JSON.stringify({ token })
          });
      }
      await delay(500);
      return { 
          user: { id: 'g-user', name: 'Google User', email: 'user@gmail.com' }, 
          token: 'mock-google-session-token' 
      };
  },

  async logout() {
      if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
      await delay(200);
      return true;
  },
  
  async me() {
      if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.AUTH.ME);
      await delay();
      return { id: 'usr-1', name: 'Michael Chen', email: 'michael@example.com' };
  }
};


// Email API
export const emailAPI = {
  async getAll(): Promise<Email[]> {
    if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.EMAILS.GET_ALL);
    await delay();
    return emails;
  },

  async getById(id: string): Promise<Email | undefined> {
    if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.EMAILS.GET_BY_ID(id));
    await delay();
    return emails.find(e => e.id === id);
  },

  async markAsRead(id: string): Promise<void> {
    if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.EMAILS.MARK_READ(id), { method: 'PUT' });
    await delay();
    const email = emails.find(e => e.id === id);
    if (email) {
      email.isRead = true;
    }
  },

  async delete(id: string): Promise<void> {
    if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.EMAILS.DELETE(id), { method: 'DELETE' });
    await delay();
    // In mock: filter out in memory (not persistent across refresh unless using state/storage)
    // For demo purposes we just simulate success
  },
};

// Task API
export const taskAPI = {
  async getAll(): Promise<Task[]> {
    if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.TASKS.GET_ALL);
    await delay();
    return tasks;
  },

  async getById(id: string): Promise<Task | undefined> {
    if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.TASKS.GET_BY_ID(id));
    await delay();
    return tasks.find(t => t.id === id);
  },

  async getByDate(date: string): Promise<Task[]> {
    if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.TASKS.GET_BY_DATE(date));
    await delay();
    return getTasksByDate(date);
  },

  async create(taskData: Partial<Task>): Promise<Task> {
    if (!USE_MOCK_DATA) {
      return fetchJson(API_ENDPOINTS.TASKS.CREATE, {
        method: 'POST',
        body: JSON.stringify(taskData)
      });
    }

    await delay();
    const newTask: Task = {
      id: `task-new-${Date.now()}`,
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      progress: 0,
      dueDate: taskData.dueDate || new Date().toISOString(),
      category: taskData.category || 'General',
      emailId: taskData.emailId || '',
      createdAt: new Date().toISOString(),
      assignees: taskData.assignees || [], // Ensure assignees is handled
    };
    tasks.push(newTask);
    refreshCalendarEvents(); // Update calendar
    return newTask;
  },

  async update(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    if (!USE_MOCK_DATA) {
      return fetchJson(API_ENDPOINTS.TASKS.UPDATE(id), {
        method: 'PUT', // or PATCH
        body: JSON.stringify(updates)
      });
    }

    await delay();
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
      refreshCalendarEvents(); // Update calendar
      return tasks[taskIndex];
    }
    return undefined;
  },

  async delete(id: string): Promise<boolean> {
    if (!USE_MOCK_DATA) {
      await fetchJson(API_ENDPOINTS.TASKS.DELETE(id), { method: 'DELETE' });
      return true;
    }

    await delay();
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      tasks.splice(taskIndex, 1);
      refreshCalendarEvents(); // Update calendar
      return true;
    }
    return false;
  },
};

// Calendar API
export const calendarAPI = {
  async getEventsByMonth(year: number, month: number): Promise<CalendarEvent[]> {
    if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.CALENDAR.GET_EVENTS_BY_MONTH(year, month));
    await delay();
    return calendarEvents.filter(event =>
      event.date.getFullYear() === year && event.date.getMonth() === month
    );
  },

  async getEventsByDate(date: Date): Promise<CalendarEvent[]> {
    if (!USE_MOCK_DATA) {
      const dateStr = date.toISOString().split('T')[0];
      return fetchJson(API_ENDPOINTS.CALENDAR.GET_EVENTS_BY_DATE(dateStr));
    }
    await delay();
    return calendarEvents.filter(event =>
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  },

  async createEvent(event: Partial<CalendarEvent>) {
      if (!USE_MOCK_DATA) {
          return fetchJson(API_ENDPOINTS.CALENDAR.CREATE_EVENT, { method: 'POST', body: JSON.stringify(event) });
      }
      await delay();
      // Mock logic would go here
      return { ...event, id: 'evt-' + Date.now() };
  }
};

// Priority Board API
export const boardAPI = {
    async getAllTasks(): Promise<BoardTask[]> {
        if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.BOARD.GET_ALL_TASKS);
        await delay();
        return boardTasks;
    },
    
    async getByStatus(status: 'todo' | 'in-progress' | 'done'): Promise<BoardTask[]> {
        if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.BOARD.GET_BY_STATUS(status));
        await delay();
        return getTasksByStatus(status);
    },

    async updateStatus(id: string, status: 'todo' | 'in-progress' | 'done') {
        if (!USE_MOCK_DATA) {
            return fetchJson(API_ENDPOINTS.BOARD.UPDATE_TASK_STATUS(id), {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
        }
        await delay();
        const task = getBoardTaskById(id);
        if (task) {
            task.status = status;
            return task;
        }
        throw new Error('Task not found');
    }
};


// Messages API
export const messageAPI = {
    async getAll(): Promise<Message[]> {
        if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.MESSAGES.GET_ALL);
        await delay();
        return messages;
    },

    async sendMessage(text: string): Promise<Message> {
        if (!USE_MOCK_DATA) {
            return fetchJson(API_ENDPOINTS.MESSAGES.SEND, {
                method: 'POST',
                body: JSON.stringify({ text })
            });
        }
        await delay(500); // Simulate bot thinking
        return {
            id: 'msg-' + Date.now(),
            text: text, // Echo or Bot Logic
            sender: 'bot',
            timestamp: new Date()
        };
    }
};


// User API
export const userAPI = {
    async getProfile() {
        if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.USER.GET_PROFILE);
        await delay();
        return {
            name: 'Michael Chen',
            role: 'Product Designer',
            email: 'michael.chen@digitwin.com',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            location: 'San Francisco, CA',
            joinDate: 'September 2024'
        };
    },

    async updateProfile(data: { name?: string; email?: string; role?: string; location?: string }) {
        if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.USER.UPDATE_PROFILE, { method: 'PUT', body: JSON.stringify(data) });
        await delay();
        return { ...data };
    }
};

// Productivity API
export const productivityAPI = {
    async getHourly() {
        if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.PRODUCTIVITY.GET_HOURLY_ACTIVITY);
        await delay();
        return productivityData.hourlyActivity;
    },
    async getWeekly() {
        if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.PRODUCTIVITY.GET_WEEKLY_COMPARISON);
        await delay();
        return productivityData.weeklyComparison;
    },
    async getMonthly() {
        if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.PRODUCTIVITY.GET_MONTHLY_REPORT);
        await delay();
        // Since we don't have monthly data in the mock yet, return a placeholder
        return { month: 'December', tasksCompleted: 45, hoursSaved: 12 };
    }
};

// Statistics API
export const statisticsAPI = {
  async getTaskStats() {
    if (!USE_MOCK_DATA) return fetchJson(API_ENDPOINTS.STATISTICS.GET_TASK_STATS);
    await delay();
    return getTaskStatistics();
  },
};
