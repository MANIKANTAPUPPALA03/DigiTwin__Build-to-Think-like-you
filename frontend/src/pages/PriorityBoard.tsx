import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { CheckCircle2, Trash2, GripVertical } from "lucide-react";

interface PriorityBoardProps {
  isDark?: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  priority: "high" | "medium" | "low";
  category: string;
  status: string;
}

const COLUMNS: { key: "high" | "medium" | "low"; label: string; color: string; bg: string; border: string }[] = [
  { key: "high", label: "🔴 High Priority", color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
  { key: "medium", label: "🟡 Medium Priority", color: "#f59e0b", bg: "#fefce8", border: "#fde68a" },
  { key: "low", label: "🟢 Low Priority", color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
];

const PriorityBoard = ({ isDark = false }: PriorityBoardProps) => {
  const [tasks, setTasks] = useState<{ [key: string]: Task[] }>({
    high: [],
    medium: [],
    low: [],
  });
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);



  const fetchTasks = () => {
    apiFetch("/priority-tasks")
      .then((res) => res.json())
      .then((data) => {
        const grouped = {
          high: data.tasks?.filter((t: Task) => t.priority === "high") || [],
          medium: data.tasks?.filter((t: Task) => t.priority === "medium") || [],
          low: data.tasks?.filter((t: Task) => t.priority === "low") || [],
        };
        setTasks(grouped);
      });
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleDragStart = (task: Task) => { setDraggedTask(task); };
  const handleDragOver = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    setDragOverColumn(col);
  };
  const handleDragLeave = () => { setDragOverColumn(null); };

  const handleDrop = async (targetPriority: "high" | "medium" | "low") => {
    setDragOverColumn(null);
    if (!draggedTask || draggedTask.priority === targetPriority) {
      setDraggedTask(null);
      return;
    }

    const updatedTasks = { ...tasks };
    Object.keys(updatedTasks).forEach((priority) => {
      updatedTasks[priority as keyof typeof updatedTasks] = updatedTasks[
        priority as keyof typeof updatedTasks
      ].filter((t) => t.id !== draggedTask.id);
    });

    const updatedTask = { ...draggedTask, priority: targetPriority };
    updatedTasks[targetPriority].push(updatedTask);
    setTasks(updatedTasks);
    setDraggedTask(null);

    try {
      await apiFetch("/update-task-priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: draggedTask.title, priority: targetPriority }),
      });
    } catch (error) {
      console.error("Failed to save priority change:", error);
      fetchTasks();
    }
  };

  const completeTask = async (task: Task) => {
    await apiFetch(`/tasks/${task.id}/complete`, { method: "POST" });
    fetchTasks();
  };

  const deleteTask = async (task: Task) => {
    await apiFetch(`/tasks/${task.id}`, { method: "DELETE" });
    fetchTasks();
  };

  const totalTasks = tasks.high.length + tasks.medium.length + tasks.low.length;

  return (
    <div className={`p-4 md:p-6 min-h-full font-sans ${isDark ? "bg-slate-900 text-slate-200" : "bg-slate-50/50 text-slate-900"}`}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl font-bold m-0">Priority Board</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Drag tasks between columns to change priority · {totalTasks} tasks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 min-h-[500px]">
        {COLUMNS.map((col) => {
          const colTasks = tasks[col.key] || [];
          const isOver = dragOverColumn === col.key;

          return (
            <div
              key={col.key}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(col.key)}
              className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"
                } ${isOver ? "ring-2 ring-indigo-500 scale-[1.02]" : ""}`}
              style={{
                borderColor: isOver ? col.color : undefined
              }}
            >
              {/* Column Header */}
              <div className={`flex justify-between items-center mb-4 pb-3 border-b ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                <h2 className="text-sm font-bold m-0 uppercase tracking-wide">{col.label}</h2>
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-lg"
                  style={{
                    background: isDark ? `${col.color}20` : col.bg,
                    color: col.color,
                  }}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="flex flex-col gap-3 flex-1 min-h-[100px]">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className={`p-3 rounded-xl border-l-4 cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5 hover:shadow-md flex gap-3 group ${isDark ? "bg-slate-900/50" : "bg-slate-50"
                      }`}
                    style={{
                      borderLeftColor: col.color,
                      background: isDark ? undefined : col.bg,
                    }}
                  >
                    <GripVertical size={16} className={`mt-0.5 flex-shrink-0 ${isDark ? "text-slate-600" : "text-slate-400 opacity-50"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold m-0 truncate ${task.status === "completed" ? "line-through opacity-50" : ""}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-500"}`}>{task.date}</span>
                        {task.category && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? "bg-slate-800" : "bg-white/50"}`}>
                            {task.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => completeTask(task)} className="p-1 text-green-500 hover:bg-green-500/10 rounded transition-colors">
                        <CheckCircle2 size={14} />
                      </button>
                      <button onClick={() => deleteTask(task)} className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className={`text-center py-8 text-sm italic ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    No {col.key} priority tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriorityBoard;
