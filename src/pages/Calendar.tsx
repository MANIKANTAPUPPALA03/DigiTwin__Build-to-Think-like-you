import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { getEventsForMonth, getEventsForDate, getUpcomingEvents, refreshCalendarEvents } from '../data/calendar';
import { taskAPI } from '../services/api';

interface CalendarProps {
  isDark: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ isDark }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1)); // December 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'task',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const monthEvents = getEventsForMonth(currentDate.getFullYear(), currentDate.getMonth());
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const upcomingEvents = getUpcomingEvents();

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = getDaysInMonth();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // Fix: Use local date components instead of toISOString() which converts to UTC
    // causing a one-day lag for timezones ahead of UTC (like IST)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    setNewEvent(prev => ({
      ...prev,
      date: `${year}-${month}-${day}`
    }));
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim()) return;

    // Create a task that maps to the event type
    await taskAPI.create({
      title: newEvent.title,
      description: newEvent.description,
      category: newEvent.type.charAt(0).toUpperCase() + newEvent.type.slice(1), // Capitalize for category
      dueDate: new Date(newEvent.date).toISOString(),
      priority: newEvent.type === 'reminder' ? 'high' : 'medium',
      status: 'pending'
    });

    // Reset and close
    setNewEvent({
      title: '',
      type: 'task',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowEventModal(false);
    
    // Force refresh logic implies state update, but here we rely on data reference update + re-render
    // Manually triggering re-evaluation might be needed if component doesn't re-render on data change
    // Using a dummy state update to force re-render or just standard React flow if tasks prop was used
    // For this simple mock, we'll just close and let the user interact to see changes
    refreshCalendarEvents();
  };

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    return monthEvents.filter(event =>
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  return (
    <div className="p-8 h-full flex gap-6">
      {/* Calendar Grid */}
      <div className="flex-1">
        <div className={`rounded-3xl p-6 shadow-sm border h-full flex flex-col ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{monthName}</h2>
            <div className="flex gap-2">
              <button
                onClick={goToPreviousMonth}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToNextMonth}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              >
                <ChevronRight size={20} />
              </button>
              <button 
                onClick={() => setShowEventModal(true)}
                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all hover:scale-105 ml-4 ${
                  isDark ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:brightness-110' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:brightness-110'
                }`}
              >
                <Plus size={18} />
                New Event
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={`text-center font-semibold text-sm py-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
            {days.map((date, index) => {
              const dayEvents = getEventsForDay(date);
              const displayEvents = dayEvents.slice(0, 2);
              const remainingCount = dayEvents.length - displayEvents.length;
              
              return (
                <div
                  key={index}
                  onClick={() => date && handleDateClick(date)}
                  className={`rounded-lg p-1.5 transition-all relative flex flex-col ${
                    date
                      ? isSelected(date)
                        ? `${isDark ? 'bg-gradient-to-br from-purple-600 to-cyan-600' : 'bg-gradient-to-br from-blue-600 to-cyan-400'} text-white cursor-pointer shadow-lg transform scale-105`
                        : isToday(date)
                        ? `${isDark ? 'bg-purple-900/30 border-purple-500' : 'bg-blue-100 border-blue-600'} border-2 cursor-pointer`
                        : isDark
                        ? 'bg-slate-800 hover:bg-slate-700 cursor-pointer'
                        : 'bg-slate-50 hover:bg-slate-100 cursor-pointer'
                      : ''
                  }`}
                >
                  {date && (
                    <>
                      <div className="text-xs font-semibold mb-1">{date.getDate()}</div>
                      <div className="flex-1 space-y-0.5 overflow-hidden">
                        {displayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`text-[10px] px-1 py-0.5 rounded truncate ${
                              isSelected(date) ? 'bg-white/20 text-white' : event.color + ' text-white'
                            }`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {remainingCount > 0 && (
                          <div className={`text-[9px] px-1 font-medium ${
                            isSelected(date) ? 'text-white/70' : isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            +{remainingCount} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className={`w-96 rounded-3xl p-6 shadow-sm border h-full flex flex-col ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className="text-xl font-bold mb-4">
          {selectedDate
            ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : 'Upcoming Events'
          }
        </h3>
        <div className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-600 dark:scrollbar-thumb-purple-500 scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
          {selectedDate ? (
            selectedEvents.length > 0 ? (
              selectedEvents.map(event => (
                <div
                  key={event.id}
                  className={`p-4 rounded-xl border transition-all ${isDark ? 'bg-slate-800 border-slate-700 hover:border-purple-600' : 'bg-slate-50 border-slate-200 hover:border-blue-600'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${event.color}`}></div>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{event.title}</div>
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {event.startTime && ` • ${event.startTime}`}
                        {event.endTime && ` - ${event.endTime}`}
                      </div>
                      <div className={`text-xs mt-1 px-2 py-0.5 rounded inline-block ${
                        isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {event.type}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No events on this day
              </div>
            )
          ) : (
            upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <div
                  key={event.id}
                  className={`p-4 rounded-xl border transition-all ${isDark ? 'bg-slate-800 border-slate-700 hover:border-purple-600' : 'bg-slate-50 border-slate-200 hover:border-blue-600'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${event.color}`}></div>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{event.title}</div>
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {event.startTime && ` • ${event.startTime}`}
                        {event.endTime && ` - ${event.endTime}`}
                      </div>
                      <div className={`text-xs mt-1 px-2 py-0.5 rounded inline-block ${
                        isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {event.type}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No upcoming events
              </div>
            )
          )}
        </div>
      </div>
      {/* New Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl ${
            isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Add New Event</h3>
              <button 
                onClick={() => setShowEventModal(false)}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Event Title *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-slate-200' 
                      : 'bg-white border-slate-300 text-slate-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g., Team Meeting"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Type
                  </label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 text-slate-200' 
                        : 'bg-white border-slate-300 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="task">Task</option>
                    <option value="meeting">Meeting</option>
                    <option value="event">Event</option>
                    <option value="reminder">Reminder</option>
                    <option value="birthday">Birthday</option>
                    <option value="anniversary">Anniversary</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 text-slate-200' 
                        : 'bg-white border-slate-300 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border resize-none ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-slate-200' 
                      : 'bg-white border-slate-300 text-slate-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows={3}
                  placeholder="Add details..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEventModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    isDark 
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  disabled={!newEvent.title.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
