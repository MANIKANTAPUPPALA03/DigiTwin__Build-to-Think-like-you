import { useAgentData, AgentTask } from "../../hooks/useAgentData.ts";

const ProductivityTrendWidget = ({ isDark }: { isDark: boolean }) => {
  const { tasks } = useAgentData();

  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];

    return {
      date,
      count: tasks.filter((t: AgentTask) => t.date === date).length,
    };
  }).reverse();

  return (
    <div
      className={`rounded-3xl p-6 border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
    >
      <h3 className="font-bold text-lg mb-4">
        Productivity (7 days)
      </h3>

      <div className="flex gap-2 items-end h-32">
        {last7.map((d) => (
          <div
            key={d.date}
            className={`flex-1 rounded-t ${isDark ? "bg-purple-500" : "bg-blue-500"
              }`}
            style={{
              height: d.count > 0 ? `${Math.min(d.count * 20, 100)}%` : '4px',
              minHeight: '4px'
            }}
          />
        ))}
      </div>

      {/* Day labels */}
      <div className="flex gap-2 mt-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className={`flex-1 text-center text-xs ${isDark ? "text-slate-400" : "text-slate-500"
            }`}>
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductivityTrendWidget;
