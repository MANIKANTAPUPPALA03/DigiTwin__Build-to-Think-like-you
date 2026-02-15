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
      <div
        style={{
          display: "flex",
          gap: 24,
          height: "100%",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: isDark ? "#e2e8f0" : "#1e293b",
        }}
      >
        {/* ═══ LEFT: Calendar Grid ═══ */}
        <div
          style={{
            flex: 1,
            background: isDark ? "#1e293b" : "#ffffff",
            borderRadius: 16,
            padding: 24,
            boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                {monthName} {year}
              </h2>
              {!isCurrentMonth && (
                <button
                  onClick={goToToday}
                  style={{
                    padding: "4px 12px",
                    fontSize: 12,
                    borderRadius: 6,
                    border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
                    background: "transparent",
                    color: isDark ? "#94a3b8" : "#64748b",
                    cursor: "pointer",
                  }}
                >
                  Today
                </button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={goToPrevMonth}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isDark ? "#94a3b8" : "#64748b",
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={goToNextMonth}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isDark ? "#94a3b8" : "#64748b",
                }}
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 16px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginLeft: 8,
                }}
              >
                <Plus size={14} /> New Event
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              marginBottom: 8,
            }}
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  color: isDark ? "#64748b" : "#94a3b8",
                  padding: "4px 0",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 4,
              flex: 1,
            }}
          >
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
                  style={{
                    borderRadius: 10,
                    padding: "6px 8px",
                    minHeight: 80,
                    cursor: "pointer",
                    border: isSelected
                      ? "2px solid #6366f1"
                      : `1px solid ${isDark ? "#334155" : "#f1f5f9"}`,
                    background: isSelected
                      ? isDark
                        ? "#1e1b4b"
                        : "#eef2ff"
                      : isDark
                        ? "#0f172a"
                        : "#fafafa",
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: isToday ? 700 : 500,
                        width: isToday ? 26 : undefined,
                        height: isToday ? 26 : undefined,
                        borderRadius: "50%",
                        background: isToday ? "#6366f1" : "transparent",
                        color: isToday ? "#fff" : isDark ? "#cbd5e1" : "#334155",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {day}
                    </span>
                    {totalItems > 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          background: isDark ? "#334155" : "#e2e8f0",
                          borderRadius: 10,
                          padding: "1px 6px",
                          color: isDark ? "#94a3b8" : "#64748b",
                        }}
                      >
                        {totalItems}
                      </span>
                    )}
                  </div>

                  {/* Event dots */}
                  {items.events.slice(0, 2).map((ev, idx) => {
                    const c = getEventColor(idx);
                    return (
                      <div
                        key={ev.id}
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          borderRadius: 4,
                          marginBottom: 2,
                          background: c.bg,
                          color: c.text,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontWeight: 500,
                        }}
                      >
                        {ev.title}
                      </div>
                    );
                  })}
                  {items.tasks.slice(0, 1).map((t) => (
                    <div
                      key={t.id}
                      style={{
                        fontSize: 10,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "#fef3c7",
                        color: "#92400e",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: 500,
                      }}
                    >
                      📋 {t.title}
                    </div>
                  ))}
                  {totalItems > 3 && (
                    <div style={{ fontSize: 10, color: isDark ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                      +{totalItems - 3} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ RIGHT: Selected Day Details ═══ */}
        <div
          style={{
            width: 320,
            minWidth: 320,
            background: isDark ? "#1e293b" : "#ffffff",
            borderRadius: 16,
            padding: 24,
            boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            overflowY: "auto",
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
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
                <div style={{ marginBottom: 20 }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: isDark ? "#64748b" : "#94a3b8",
                      marginBottom: 8,
                    }}
                  >
                    📅 Calendar Events
                  </p>
                  {selectedItems.events.map((ev, idx) => {
                    const c = getEventColor(idx);
                    return (
                      <div
                        key={ev.id}
                        style={{
                          padding: 12,
                          borderRadius: 10,
                          marginBottom: 8,
                          background: isDark ? "#0f172a" : c.bg,
                          border: `1px solid ${isDark ? "#334155" : "transparent"}`,
                          borderLeft: `4px solid ${c.dot}`,
                        }}
                      >
                        <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 4px", color: isDark ? "#e2e8f0" : c.text }}>
                          {ev.title}
                        </p>
                        {!ev.all_day && (
                          <p style={{ fontSize: 12, color: isDark ? "#94a3b8" : "#64748b", margin: "0 0 2px", display: "flex", alignItems: "center", gap: 4 }}>
                            <Clock size={12} /> {formatTime(ev.start)} – {formatTime(ev.end)}
                          </p>
                        )}
                        {ev.all_day && (
                          <p style={{ fontSize: 12, color: isDark ? "#94a3b8" : "#64748b", margin: "0 0 2px" }}>
                            All day
                          </p>
                        )}
                        {ev.location && (
                          <p style={{ fontSize: 12, color: isDark ? "#94a3b8" : "#64748b", margin: "2px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                            <MapPin size={12} /> {ev.location}
                          </p>
                        )}
                        {ev.description && (
                          <p style={{ fontSize: 12, color: isDark ? "#64748b" : "#94a3b8", margin: "6px 0 0", lineHeight: 1.4 }}>
                            {ev.description.substring(0, 120)}{ev.description.length > 120 ? "..." : ""}
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
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: isDark ? "#64748b" : "#94a3b8",
                      marginBottom: 8,
                    }}
                  >
                    📋 Tasks
                  </p>
                  {selectedItems.tasks.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        marginBottom: 8,
                        background: isDark ? "#0f172a" : "#fef3c7",
                        border: `1px solid ${isDark ? "#334155" : "transparent"}`,
                        borderLeft: "4px solid #f59e0b",
                      }}
                    >
                      <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: isDark ? "#e2e8f0" : "#92400e" }}>
                        {t.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {selectedItems.events.length === 0 && selectedItems.tasks.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: isDark ? "#475569" : "#94a3b8",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🌤️</div>
                  <p style={{ fontSize: 14 }}>No events for this day</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══ Create Event Modal ═══ */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: isDark ? "#1e293b" : "#ffffff",
              borderRadius: 16,
              padding: 24,
              width: "100%",
              maxWidth: 420,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Create New Event</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "none",
                  background: isDark ? "#334155" : "#f1f5f9",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isDark ? "#94a3b8" : "#64748b",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              {[
                { label: "Title", type: "text", key: "title", required: true, placeholder: "Enter event title" },
                { label: "Date", type: "date", key: "date", required: true },
              ].map(({ label, type, key, required, placeholder }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: isDark ? "#94a3b8" : "#475569" }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    required={required}
                    placeholder={placeholder}
                    value={(newTask as any)[key]}
                    onChange={(e) => setNewTask({ ...newTask, [key]: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                      background: isDark ? "#0f172a" : "#f8fafc",
                      color: isDark ? "#e2e8f0" : "#1e293b",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: isDark ? "#94a3b8" : "#475569" }}>
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                  placeholder="Optional description"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                    background: isDark ? "#0f172a" : "#f8fafc",
                    color: isDark ? "#e2e8f0" : "#1e293b",
                    fontSize: 14,
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: isDark ? "#94a3b8" : "#475569" }}>
                  Priority
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["low", "medium", "high"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, priority: p })}
                      style={{
                        flex: 1,
                        padding: "8px 0",
                        borderRadius: 8,
                        border: newTask.priority === p ? "2px solid" : `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                        borderColor: newTask.priority === p
                          ? p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#22c55e"
                          : undefined,
                        background: newTask.priority === p
                          ? p === "high" ? "#fef2f2" : p === "medium" ? "#fefce8" : "#f0fdf4"
                          : "transparent",
                        color: p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#22c55e",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                    background: "transparent",
                    color: isDark ? "#94a3b8" : "#64748b",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 24px",
                    borderRadius: 8,
                    border: "none",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
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
