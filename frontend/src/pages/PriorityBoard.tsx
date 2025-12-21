import { useEffect, useState } from "react";

interface PriorityBoardProps {
  isDark?: boolean;
}

interface Task {
  title: string;
  date: string;
  priority: "high" | "medium" | "low";
}

const PriorityBoard = ({ isDark = false }: PriorityBoardProps) => {
  const [tasks, setTasks] = useState<{ [key: string]: Task[] }>({
    high: [],
    medium: [],
    low: []
  });
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/priority-tasks")
      .then((res) => res.json())
      .then((data) => {
        const grouped = {
          high: data.tasks?.filter((t: Task) => t.priority === "high") || [],
          medium: data.tasks?.filter((t: Task) => t.priority === "medium") || [],
          low: data.tasks?.filter((t: Task) => t.priority === "low") || []
        };
        setTasks(grouped);
      });
  }, []);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetPriority: "high" | "medium" | "low") => {
    if (!draggedTask) return;

    // Remove from old priority
    const updatedTasks = { ...tasks };
    Object.keys(updatedTasks).forEach((priority) => {
      updatedTasks[priority as keyof typeof updatedTasks] = updatedTasks[
        priority as keyof typeof updatedTasks
      ].filter((t) => t.title !== draggedTask.title);
    });

    // Add to new priority
    const updatedTask = { ...draggedTask, priority: targetPriority };
    updatedTasks[targetPriority].push(updatedTask);

    setTasks(updatedTasks);
    setDraggedTask(null);

    // Save to backend
    try {
      await fetch("http://localhost:8000/update-task-priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draggedTask.title,
          priority: targetPriority
        })
      });
      console.log(`Saved: "${draggedTask.title}" to ${targetPriority} priority`);
    } catch (error) {
      console.error("Failed to save priority change:", error);
    }
  };

  return (
    <div className={`p-6 ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      <h1 className="text-2xl font-semibold mb-4">Priority Board</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["high", "medium", "low"] as const).map((level) => (
          <div
            key={level}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(level)}
            className={`rounded-xl shadow p-4 min-h-[400px] ${isDark ? "bg-slate-900" : "bg-white"
              }`}
          >
            <h2 className="font-bold mb-3 capitalize flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${level === "high"
                  ? "bg-red-500"
                  : level === "medium"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                  }`}
              ></span>
              {level} Priority
            </h2>
            <div className="space-y-2">
              {tasks[level].map((task, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  className={`p-3 rounded-lg cursor-move transition-all hover:scale-105 ${isDark
                    ? "bg-slate-800 hover:bg-slate-700"
                    : "bg-slate-100 hover:bg-slate-200"
                    }`}
                >
                  <p className="font-medium text-sm break-words">{task.title}</p>
                  <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {task.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityBoard;
