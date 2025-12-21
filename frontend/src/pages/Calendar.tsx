import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: "task";
}

interface CalendarProps {
  isDark?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ isDark = false }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    date: "",
    priority: "medium" as "high" | "medium" | "low"
  });

  const fetchTasks = () => {
    fetch("http://localhost:8000/calendar/tasks")
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/create-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
      });

      if (response.ok) {
        setShowModal(false);
        setNewTask({ title: "", description: "", date: "", priority: "medium" });
        fetchTasks(); // Refresh tasks
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getTasksForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tasks.filter(t => t.date === dateStr);
  };

  return (
    <>
      <div className={`rounded-2xl p-6 shadow ${isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"
        }`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {today.toLocaleString("default", { month: "long" })} {year}
          </h2>
          <div className="flex gap-3">
            <ChevronLeft className="cursor-pointer" />
            <ChevronRight className="cursor-pointer" />
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} /> New Event
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-7 text-sm mb-2 ${isDark ? "text-slate-400" : "text-slate-500"
          }`}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="text-center">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={i} />
          ))}

          {dates.map(day => (
            <div key={day} className={`border rounded-xl p-2 min-h-[100px] ${isDark ? "border-slate-700" : "border-slate-200"
              }`}>
              <div className="text-sm font-semibold mb-1">{day}</div>
              {getTasksForDate(day).map(task => (
                <div
                  key={task.id}
                  className="text-xs bg-orange-500 text-white px-2 py-1 rounded mb-1 truncate"
                >
                  {task.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-2xl p-6 w-full max-w-md ${isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"
            }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create New Event</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter task description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "high" | "medium" | "low" })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newTask.date}
                  onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-200 hover:bg-slate-300"
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Event
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
