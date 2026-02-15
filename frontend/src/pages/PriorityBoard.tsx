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

  const textPrimary = isDark ? "#e2e8f0" : "#1e293b";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const card = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e2e8f0";

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
    <div style={{ padding: 24, fontFamily: "'Inter', sans-serif", color: textPrimary, minHeight: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Priority Board</h1>
          <p style={{ fontSize: 13, color: textSecondary, margin: "4px 0 0" }}>
            Drag tasks between columns to change priority · {totalTasks} tasks
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, minHeight: 500 }}>
        {COLUMNS.map((col) => {
          const colTasks = tasks[col.key] || [];
          const isOver = dragOverColumn === col.key;

          return (
            <div
              key={col.key}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(col.key)}
              style={{
                background: card,
                borderRadius: 14,
                border: isOver ? `2px dashed ${col.color}` : `1px solid ${border}`,
                padding: 16,
                transition: "border 0.2s",
              }}
            >
              {/* Column Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${border}` }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{col.label}</h2>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 10,
                  background: isDark ? `${col.color}20` : col.bg,
                  color: col.color,
                }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 100 }}>
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: isDark ? "#0f172a" : col.bg,
                      borderLeft: `3px solid ${col.color}`,
                      cursor: "grab",
                      transition: "transform 0.15s, box-shadow 0.15s",
                      display: "flex",
                      gap: 8,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
                  >
                    <GripVertical size={14} style={{ color: textSecondary, marginTop: 2, flexShrink: 0, opacity: 0.5 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 13,
                        fontWeight: 600,
                        margin: 0,
                        textDecoration: task.status === "completed" ? "line-through" : "none",
                        opacity: task.status === "completed" ? 0.5 : 1,
                        wordBreak: "break-word",
                      }}>
                        {task.title}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                        <span style={{ fontSize: 10, color: textSecondary }}>{task.date}</span>
                        {task.category && (
                          <span style={{
                            fontSize: 10,
                            padding: "1px 6px",
                            borderRadius: 4,
                            background: isDark ? "#334155" : "#f1f5f9",
                            color: textSecondary,
                          }}>
                            {task.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => completeTask(task)} title="Complete"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#22c55e", padding: 2 }}>
                        <CheckCircle2 size={14} />
                      </button>
                      <button onClick={() => deleteTask(task)} title="Delete"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 2 }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div style={{ textAlign: "center", padding: "30px 0", color: textSecondary, fontSize: 13 }}>
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
