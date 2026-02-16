import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin } from "lucide-react";
import { apiFetch } from "../lib/api";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  location: string;
  all_day: boolean;
  color: string;
}

interface Task {
  id: string;
  title: string;
  date: string;
  type: "task";
}

interface CalendarProps {
  isDark?: boolean;
}

/* ─── Color palette for events ─── */
const EVENT_COLORS = [
  { bg: "#ede9fe", text: "#6d28d9", dot: "#7c3aed" },
  { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
  { bg: "#dcfce7", text: "#15803d", dot: "#22c55e" },
  { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  { bg: "#fce7f3", text: "#9d174d", dot: "#ec4899" },
  { bg: "#e0e7ff", text: "#3730a3", dot: "#6366f1" },
  { bg: "#ccfbf1", text: "#0f766e", dot: "#14b8a6" },
  { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
];

function getEventColor(index: number) {
  return EVENT_COLORS[index % EVENT_COLORS.length];
}

/* ─── Format event time ─── */
function formatTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return "";
  }
}

const Calendar: React.FC<CalendarProps> = ({ isDark = false }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    date: "",
    priority: "medium" as "high" | "medium" | "low",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const today = new Date();

  /* ─── Fetch tasks ─── */
  const fetchTasks = () => {
    apiFetch("/calendar/tasks")
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setTasks(data))
      .catch((err) => console.error("Tasks error:", err));
  };

  /* ─── Fetch Google Calendar events ─── */
  const fetchEvents = () => {
    apiFetch(`/calendar/events?year=${year}&month=${month + 1}`)
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setEvents(data))
      .catch((err) => console.error("Calendar events error:", err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [year, month]);

  /* ─── Month navigation ─── */
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date().getDate());
  };

  /* ─── Get items for a date ─── */
  const getItemsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayTasks = tasks.filter((t) => t.date === dateStr);
    const dayEvents = events.filter((e) => {
      const eDate = e.start.substring(0, 10);
      return eDate === dateStr;
    });
    return { tasks: dayTasks, events: dayEvents };
  };

  /* ─── Selected day events ─── */
  const selectedItems = selectedDay ? getItemsForDate(selectedDay) : { tasks: [], events: [] };

  /* ─── Create task ─── */
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiFetch("/create-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (response.ok) {
        setShowModal(false);
        setNewTask({ title: "", description: "", date: "", priority: "medium" });
        fetchTasks();
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <>
      <div className={`flex flex-col lg:flex-row gap-6 h-full font-sans ${isDark ? "text-slate-200" : "text-slate-800"}`}>
        {/* ═══ LEFT: Calendar Grid ═══ */}
        <div className={`flex-1 flex flex-col p-4 md:p-6 rounded-2xl border transition-colors ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl md:text-2xl font-bold m-0">
                {monthName} {year}
              </h2>
              {!isCurrentMonth && (
                <button
                  onClick={goToToday}
                  className={`px-3 py-1 text-xs rounded-md border bg-transparent cursor-pointer transition-colors ${isDark ? "border-slate-600 text-slate-400 hover:text-slate-200" : "border-slate-300 text-slate-500 hover:text-slate-700"
                    }`}
                >
                  Today
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevMonth}
                className={`w-8 h-8 rounded-lg border bg-transparent cursor-pointer flex items-center justify-center transition-colors ${isDark ? "border-slate-600 text-slate-400 hover:bg-slate-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={goToNextMonth}
                className={`w-8 h-8 rounded-lg border bg-transparent cursor-pointer flex items-center justify-center transition-colors ${isDark ? "border-slate-600 text-slate-400 hover:bg-slate-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-1.5 ml-2 bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer shadow-md shadow-indigo-500/20 active:scale-95 transition-transform"
              >
                <Plus size={14} /> <span className="hidden sm:inline">New Event</span><span className="sm:hidden">New</span>
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className={`text-center text-xs font-semibold py-1 uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-1.5 flex-1">
            {/* Empty cells for start day offset */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Date cells */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const items = getItemsForDate(day);
              const totalItems = items.tasks.length + items.events.length;
              const isToday = isCurrentMonth && day === today.getDate();
              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`relative rounded-xl p-1 md:p-2 min-h-[60px] md:min-h-[80px] cursor-pointer border transition-all ${isSelected
                      ? "ring-2 ring-indigo-500 z-10"
                      : isDark ? "border-slate-700 hover:border-slate-600" : "border-slate-100 hover:border-slate-300"
                    } ${isSelected
                      ? (isDark ? "bg-indigo-950/30" : "bg-indigo-50")
                      : (isDark ? "bg-slate-900/50" : "bg-slate-50/50")
                    }`}
                  style={{
                    borderColor: isSelected ? "#6366f1" : undefined
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-sm md:text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday
                          ? "bg-indigo-600 text-white font-bold shadow-sm"
                          : (isDark ? "text-slate-400" : "text-slate-600")
                        }`}
                    >
                      {day}
                    </span>
                    {totalItems > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isDark ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"
                        }`}>
                        {totalItems}
                      </span>
                    )}
                  </div>

                  {/* Event dots (Mobile: just dots, Desktop: text) */}
                  <div className="hidden md:block space-y-0.5">
                    {items.events.slice(0, 2).map((ev, idx) => {
                      const c = getEventColor(idx);
                      return (
                        <div
                          key={ev.id}
                          className="text-[10px] px-1.5 py-0.5 rounded truncate font-medium"
                          style={{ background: c.bg, color: c.text }}
                        >
                          {ev.title}
                        </div>
                      );
                    })}
                    {items.tasks.slice(0, 1).map((t) => (
                      <div
                        key={t.id}
                        className="text-[10px] px-1.5 py-0.5 rounded truncate font-medium bg-amber-100 text-amber-800"
                      >
                        📋 {t.title}
                      </div>
                    ))}
                    {totalItems > 3 && (
                      <div className={`text-[10px] pl-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        +{totalItems - 3} more
                      </div>
                    )}
                  </div>

                  {/* Mobile Dots */}
                  <div className="md:hidden flex gap-0.5 flex-wrap content-end h-full pb-1 pl-1">
                    {items.events.slice(0, 3).map((_, idx) => (
                      <div key={idx} className="w-1.5 h-1.5 rounded-full" style={{ background: getEventColor(idx).dot }} />
                    ))}
                    {items.tasks.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ RIGHT: Selected Day Details ═══ */}
        <div className={`w-full lg:w-80 flex-shrink-0 rounded-2xl p-6 border overflow-y-auto ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
          <h3 className="text-base font-bold mb-4">
            {selectedDay
              ? new Date(year, month, selectedDay).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })
              : "Select a day"}
          </h3>

          {selectedDay && (
            <>
              {/* Google Calendar Events */}
              {selectedItems.events.length > 0 && (
                <div className="mb-6">
                  <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    📅 Calendar Events
                  </p>
                  {selectedItems.events.map((ev, idx) => {
                    const c = getEventColor(idx);
                    return (
                      <div
                        key={ev.id}
                        className={`p-3 rounded-xl mb-2 border-l-4 ${isDark ? "bg-slate-900/50 border-r border-y border-r-slate-800 border-y-slate-800" : ""}`}
                        style={{
                          background: isDark ? undefined : c.bg,
                          borderLeftColor: c.dot,
                        }}
                      >
                        <p className={`text-sm font-semibold mb-1 ${isDark ? "text-slate-200" : ""}`} style={{ color: isDark ? undefined : c.text }}>
                          {ev.title}
                        </p>
                        {!ev.all_day && (
                          <p className={`text-xs flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            <Clock size={12} /> {formatTime(ev.start)} – {formatTime(ev.end)}
                          </p>
                        )}
                        {ev.all_day && (
                          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            All day
                          </p>
                        )}
                        {ev.location && (
                          <p className={`text-xs mt-1 flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            <MapPin size={12} /> {ev.location}
                          </p>
                        )}
                        {ev.description && (
                          <p className={`text-xs mt-2 line-clamp-3 leading-relaxed ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                            {ev.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tasks */}
              {selectedItems.tasks.length > 0 && (
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    📋 Tasks
                  </p>
                  {selectedItems.tasks.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3 rounded-xl mb-2 border-l-4 border-amber-500 ${isDark ? "bg-slate-900/50 border border-slate-800" : "bg-amber-50"}`}
                      style={{ borderLeftColor: "#f59e0b" }}
                    >
                      <p className={`text-sm font-semibold m-0 ${isDark ? "text-slate-200" : "text-amber-900"}`}>
                        {t.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {selectedItems.events.length === 0 && selectedItems.tasks.length === 0 && (
                <div className={`text-center py-10 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                  <div className="text-3xl mb-2">🌤️</div>
                  <p className="text-sm">No events for this day</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══ Create Event Modal ═══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold m-0">Create New Event</h3>
              <button
                onClick={() => setShowModal(false)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors ${isDark ? "bg-slate-700 text-slate-400 hover:text-slate-200" : "bg-slate-100 text-slate-500 hover:text-slate-700"
                  }`}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              {[
                { label: "Title", type: "text", key: "title", required: true, placeholder: "Enter event title" },
                { label: "Date", type: "date", key: "date", required: true },
              ].map(({ label, type, key, required, placeholder }) => (
                <div key={key} className="mb-4">
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {label}
                  </label>
                  <input
                    type={type}
                    required={required}
                    placeholder={placeholder}
                    value={(newTask as any)[key]}
                    onChange={(e) => setNewTask({ ...newTask, [key]: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${isDark ? "bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-600" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                  />
                </div>
              ))}

              <div className="mb-4">
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                  placeholder="Optional description"
                  className={`w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y ${isDark ? "bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-600" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                />
              </div>

              <div className="mb-6">
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Priority
                </label>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, priority: p })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize border-2 transition-all ${newTask.priority === p
                          ? (p === "high" ? "bg-red-50 border-red-500 text-red-600" : p === "medium" ? "bg-amber-50 border-amber-500 text-amber-600" : "bg-green-50 border-green-500 text-green-600")
                          : (isDark ? "border-slate-700 bg-transparent text-slate-400 hover:bg-slate-700" : "border-slate-200 bg-transparent text-slate-500 hover:bg-slate-50")
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border cursor-pointer transition-colors ${isDark ? "border-slate-600 text-slate-400 hover:bg-slate-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 border-none shadow-lg shadow-indigo-500/25 cursor-pointer hover:shadow-indigo-500/40 transition-all active:scale-95"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Calendar;
