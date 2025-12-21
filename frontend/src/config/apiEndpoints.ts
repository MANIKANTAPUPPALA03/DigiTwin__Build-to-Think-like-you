// API Endpoints Configuration
// This file tracks all backend API endpoints for the application
// Update this file when connecting to actual backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    GOOGLE: `${API_BASE_URL}/auth/google`,
    ME: `${API_BASE_URL}/auth/me`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
  },

  // Email endpoints
  EMAILS: {
    GET_ALL: `${API_BASE_URL}/emails`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/emails/${id}`,
    GET_UNREAD: `${API_BASE_URL}/emails/unread`,
    GET_UNREAD_COUNT: `${API_BASE_URL}/emails/unread/count`,
    CREATE: `${API_BASE_URL}/emails`,
    UPDATE: (id: string) => `${API_BASE_URL}/emails/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/emails/${id}`,
    MARK_READ: (id: string) => `${API_BASE_URL}/emails/${id}/read`,
    MARK_UNREAD: (id: string) => `${API_BASE_URL}/emails/${id}/unread`,
    SEARCH: `${API_BASE_URL}/emails/search`,
  },

  // Task endpoints
  TASKS: {
    GET_ALL: `${API_BASE_URL}/tasks`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    GET_BY_DATE: (date: string) => `${API_BASE_URL}/tasks/date/${date}`,
    GET_BY_DATE_RANGE: `${API_BASE_URL}/tasks/range`,
    GET_TODAY: `${API_BASE_URL}/tasks/today`,
    GET_UPCOMING: `${API_BASE_URL}/tasks/upcoming`,
    GET_COMPLETED: `${API_BASE_URL}/tasks/completed`,
    GET_PENDING: `${API_BASE_URL}/tasks/pending`,
    CREATE: `${API_BASE_URL}/tasks`,
    UPDATE: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    TOGGLE_STATUS: (id: string) => `${API_BASE_URL}/tasks/${id}/toggle-status`,
    UPDATE_STATUS: (id: string) => `${API_BASE_URL}/tasks/${id}/status`,
    UPDATE_PRIORITY: (id: string) => `${API_BASE_URL}/tasks/${id}/priority`,
  },

  // Calendar endpoints
  CALENDAR: {
    GET_EVENTS: `${API_BASE_URL}/calendar/events`,
    GET_EVENTS_BY_MONTH: (year: number, month: number) => 
      `${API_BASE_URL}/calendar/events/${year}/${month}`,
    GET_EVENTS_BY_DATE: (date: string) => `${API_BASE_URL}/calendar/events/date/${date}`,
    GET_EVENTS_BY_RANGE: `${API_BASE_URL}/calendar/events/range`,
    CREATE_EVENT: `${API_BASE_URL}/calendar/events`,
    UPDATE_EVENT: (id: string) => `${API_BASE_URL}/calendar/events/${id}`,
    DELETE_EVENT: (id: string) => `${API_BASE_URL}/calendar/events/${id}`,
  },

  // Statistics & Analytics endpoints
  STATISTICS: {
    GET_TASK_STATS: `${API_BASE_URL}/statistics/tasks`,
    GET_COMPLETION_RATE: `${API_BASE_URL}/statistics/completion-rate`,
    GET_TASK_HISTORY: (days: number) => `${API_BASE_URL}/statistics/history/${days}`,
    GET_LAST_7_DAYS: `${API_BASE_URL}/statistics/last-7-days`,
    GET_LAST_15_DAYS: `${API_BASE_URL}/statistics/last-15-days`,
    GET_WEEKLY_COMPARISON: `${API_BASE_URL}/statistics/weekly-comparison`,
    GET_PRIORITY_DISTRIBUTION: `${API_BASE_URL}/statistics/priority-distribution`,
  },

  // Priority Board endpoints
  BOARD: {
    GET_ALL_TASKS: `${API_BASE_URL}/board/tasks`,
    GET_BY_STATUS: (status: string) => `${API_BASE_URL}/board/tasks/status/${status}`,
    GET_TODO: `${API_BASE_URL}/board/tasks/todo`,
    GET_IN_PROGRESS: `${API_BASE_URL}/board/tasks/in-progress`,
    GET_DONE: `${API_BASE_URL}/board/tasks/done`,
    MOVE_TASK: (id: string) => `${API_BASE_URL}/board/tasks/${id}/move`,
    UPDATE_TASK_STATUS: (id: string) => `${API_BASE_URL}/board/tasks/${id}/status`,
  },

  // Messages/Chat endpoints (for Floating Assistant)
  MESSAGES: {
    GET_ALL: `${API_BASE_URL}/messages`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/messages/${id}`,
    SEND: `${API_BASE_URL}/messages`,
    MARK_READ: (id: string) => `${API_BASE_URL}/messages/${id}/read`,
    GET_UNREAD_COUNT: `${API_BASE_URL}/messages/unread/count`,
  },

  // User/Profile endpoints
  USER: {
    GET_PROFILE: `${API_BASE_URL}/user/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/user/profile`,
    GET_PREFERENCES: `${API_BASE_URL}/user/preferences`,
    UPDATE_PREFERENCES: `${API_BASE_URL}/user/preferences`,
  },

  // Productivity endpoints
  PRODUCTIVITY: {
    GET_HOURLY_ACTIVITY: `${API_BASE_URL}/productivity/hourly`,
    GET_WEEKLY_COMPARISON: `${API_BASE_URL}/productivity/weekly`,
    GET_MONTHLY_REPORT: `${API_BASE_URL}/productivity/monthly`,
  },
};

// Export individual endpoint groups for convenience
export const { 
  AUTH,
  EMAILS, 
  TASKS, 
  CALENDAR, 
  STATISTICS, 
  BOARD,
  MESSAGES,
  USER,
  PRODUCTIVITY
} = API_ENDPOINTS;

// Export base URL for direct API calls
export { API_BASE_URL };
