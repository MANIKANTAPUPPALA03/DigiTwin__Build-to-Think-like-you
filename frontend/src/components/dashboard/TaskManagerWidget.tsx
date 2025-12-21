import { useEffect, useState } from "react";
import { useAgentData, AgentTask } from "../../hooks/useAgentData.ts";

const TaskManagerWidget = ({ isDark }: { isDark: boolean }) => {
  const { tasks } = useAgentData();
  const [todayTasks, setTodayTasks] = useState<AgentTask[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTodayTasks(
      tasks.filter((t: AgentTask) => t.date === today)
    );
  }, [tasks]);

  return (
    <div
      className={`rounded-3xl p-6 border h-[450px] flex flex-col ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
    >
      <h3 className="font-bold text-lg mb-4">Today’s Tasks</h3>

      {todayTasks.length === 0 ? (
        <p className="text-sm text-slate-500">No tasks today 🎉</p>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {todayTasks.map((task: AgentTask) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-blue-50 border border-blue-100'
                }`}
            >
              <p className="font-semibold break-words">{task.title}</p>
              {task.description && task.description !== task.title && (
                <p className={`text-xs mt-1 break-words ${isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                  {task.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskManagerWidget;
