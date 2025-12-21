import { tasks } from './tasks';

// Calendar event interface with task linkage
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  description?: string;
  type: 'meeting' | 'task' | 'event' | 'reminder' | 'birthday' | 'anniversary';
  color: string;
  taskId?: string; // Link to task
}

// Generate calendar events from tasks
const generateCalendarEventsFromTasks = (): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  
  tasks.forEach((task) => {
    const dueDate = new Date(task.dueDate);
    
    // Determine event type based on task category
    let eventType: 'meeting' | 'task' | 'event' | 'reminder' | 'birthday' | 'anniversary' = 'task';
    const lowerCat = task.category.toLowerCase();
    
    if (lowerCat.includes('meeting')) {
      eventType = 'meeting';
    } else if (lowerCat.includes('birthday')) {
      eventType = 'birthday';
    } else if (lowerCat.includes('anniversary')) {
      eventType = 'anniversary';
    } else if (lowerCat.includes('reminder') || task.priority === 'high') {
      eventType = 'reminder';
    } else if (lowerCat.includes('event')) {
      eventType = 'event';
    }
    
    // Determine color based on priority and type
    let color = 'bg-blue-500';
    if (eventType === 'meeting') {
      color = 'bg-purple-500';
    } else if (eventType === 'birthday') {
      color = 'bg-pink-500';
    } else if (eventType === 'anniversary') {
      color = 'bg-rose-500';
    } else if (eventType === 'reminder') {
      color = 'bg-red-500';
    } else if (eventType === 'event') {
      color = 'bg-green-500';
    } else if (task.priority === 'medium') {
      color = 'bg-orange-500';
    } else if (task.priority === 'low') {
      color = 'bg-cyan-500';
    }
    
    // Extract time from due date
    const hours = dueDate.getHours();
    const minutes = dueDate.getMinutes();
    const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Calculate end time (1 hour later for meetings, 30 min for tasks)
    const duration = eventType === 'meeting' ? 60 : 30;
    const endDate = new Date(dueDate.getTime() + duration * 60 * 1000);
    const endHours = endDate.getHours();
    const endMinutes = endDate.getMinutes();
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    events.push({
      id: `cal-${task.id}`,
      title: task.title,
      date: dueDate,
      startTime: eventType === 'meeting' || eventType === 'reminder' ? startTime : undefined,
      endTime: eventType === 'meeting' ? endTime : undefined,
      description: task.description,
      type: eventType,
      color,
      taskId: task.id
    });
  });
  
  return events;
};

export let calendarEvents: CalendarEvent[] = generateCalendarEventsFromTasks();

export const refreshCalendarEvents = () => {
  calendarEvents = generateCalendarEventsFromTasks();
};

export const getEventsForDate = (date: Date): CalendarEvent[] => {
  return calendarEvents.filter(event => 
    event.date.getDate() === date.getDate() &&
    event.date.getMonth() === date.getMonth() &&
    event.date.getFullYear() === date.getFullYear()
  );
};

export const getEventsForMonth = (year: number, month: number): CalendarEvent[] => {
  return calendarEvents.filter(event => 
    event.date.getMonth() === month &&
    event.date.getFullYear() === year
  );
};

// Get upcoming events (events after today)
export const getUpcomingEvents = (): CalendarEvent[] => {
  const today = new Date('2025-12-20');
  today.setHours(0, 0, 0, 0);
  
  return calendarEvents
    .filter(event => event.date > today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Get count of events for a specific date
export const getEventsCountForDate = (date: Date): number => {
  return getEventsForDate(date).length;
};
