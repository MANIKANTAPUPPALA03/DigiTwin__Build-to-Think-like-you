import { useAgentData, AgentTask } from "../../hooks/useAgentData.ts";

const TaskCompletionWidget = ({ isDark }: { isDark: boolean }) => {
  const { tasks } = useAgentData();

  const completed = tasks.filter(
    (t: AgentTask) => t.status === "completed"
  ).length;

  const total = tasks.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      className={`rounded-3xl p-6 border ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}
    >
      <h3 className="font-bold text-lg mb-4">Task Completion</h3>
      <p className="text-4xl font-bold">{percent}%</p>
      <p className="text-sm text-slate-500">
        {completed} completed / {total} total
      </p>
    </div>
  );
};

export default TaskCompletionWidget;
