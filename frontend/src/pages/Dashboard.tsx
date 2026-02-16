import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";
import { Bot, CheckCircle2, Trash2, RefreshCw, Zap, Calendar, ListTodo, Sparkles } from "lucide-react";

interface DashboardProps {
  isDark: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  priority: string;
  category: string;
  status: string;
}

interface AgentResult {
  status: string;
  emails_scanned?: number;
  emails_matched?: number;
  tasks_extracted?: number;
  tasks_created?: number;
  tasks?: Task[];
  message?: string;
}

const Dashboard = ({ isDark }: DashboardProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [clearing, setClearing] = useState(false);

  const fetchTasks = () => {
    apiFetch("/tasks")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setTasks(data))
      .catch(() => { });
  };

  useEffect(() => { fetchTasks(); }, []);

  const runAgent = async () => {
    setAgentRunning(true);
    setAgentResult(null);
    try {
      const res = await apiFetch("/agent/run", { method: "POST" });
      const data = await res.json();
      setAgentResult(data);
      fetchTasks();
    } catch (err) {
      setAgentResult({ status: "error" });
    }
    setAgentRunning(false);
  };

  const clearAllTasks = async () => {
    if (!confirm("Delete ALL tasks? This cannot be undone.")) return;
    setClearing(true);
    try {
      await apiFetch("/tasks/clear-all", { method: "POST" });
      setTasks([]);
      setAgentResult(null);
    } catch { }
    setClearing(false);
  };

  const completeTask = async (id: string) => {
    await apiFetch(`/tasks/${id}/complete`, { method: "POST" });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await apiFetch(`/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const highPriority = pendingTasks.filter((t) => t.priority === "high");
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTasks = pendingTasks.filter((t) => t.date === todayStr);

  const priorityColor = (p: string) => {
    if (p === "high") return { bg: "#fef2f2", text: "#dc2626", dot: "#ef4444" };
    if (p === "medium") return { bg: "#fefce8", text: "#ca8a04", dot: "#f59e0b" };
    return { bg: "#f0fdf4", text: "#16a34a", dot: "#22c55e" };
  };

  return (
    <div className={`p-4 md:p-6 min-h-full ${isDark ? "bg-slate-900 text-slate-200" : "bg-slate-50 text-slate-900"}`}>
      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: <ListTodo size={20} />, label: "Total Tasks", value: tasks.length, color: "#6366f1" },
          { icon: <Zap size={20} />, label: "High Priority", value: highPriority.length, color: "#ef4444" },
          { icon: <Calendar size={20} />, label: "Due Today", value: todayTasks.length, color: "#f59e0b" },
          { icon: <CheckCircle2 size={20} />, label: "Completed", value: completedTasks.length, color: "#22c55e" },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className={`p-5 rounded-2xl border flex items-center gap-4 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
            <div style={{ background: `${color}15`, color }} className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
            <div>
              <div className="text-2xl font-bold">{value}</div>
              <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── AI Agent Panel ─── */}
        <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <Bot size={18} color="#fff" />
            </div>
            <div>
              <h3 className="text-base font-bold m-0">AI Agent</h3>
              <p className={`text-xs m-0 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Email → Task extraction with Groq AI</p>
            </div>
          </div>

          <p className={`text-sm mb-4 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            The agent reads your recent emails, checks your Google Calendar for conflicts, and uses AI to extract actionable tasks — no duplicates.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button
              onClick={runAgent}
              disabled={agentRunning}
              className={`flex-1 py-3 px-5 rounded-xl border-none text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all ${agentRunning
                ? (isDark ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-slate-200 text-slate-500 cursor-not-allowed")
                : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 active:scale-95 hover:brightness-110"
                }`}
            >
              {agentRunning ? (
                <><RefreshCw size={14} className="animate-spin" /> Running...</>
              ) : (
                <><Sparkles size={14} /> Run AI Agent</>
              )}
            </button>

            <button
              onClick={clearAllTasks}
              disabled={clearing || tasks.length === 0}
              className={`py-3 px-4 rounded-xl text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 border bg-transparent transition-all ${clearing || tasks.length === 0
                ? "opacity-50 cursor-not-allowed border-slate-200 text-slate-400"
                : isDark
                  ? "border-red-900 text-red-500 hover:bg-red-900/20"
                  : "border-red-200 text-red-500 hover:bg-red-50"
                }`}
            >
              <Trash2 size={14} /> Clear
            </button>
          </div>

          {/* Agent Result */}
          {agentResult && (
            <div className={`p-4 rounded-xl border ${agentResult.status === "success"
              ? (isDark ? "bg-green-950/30 border-green-900" : "bg-green-50 border-green-200")
              : (isDark ? "bg-indigo-950/30 border-indigo-900" : "bg-indigo-50 border-indigo-200")
              }`}>
              {agentResult.status === "success" ? (
                <>
                  <p className={`text-sm font-semibold mb-1 ${isDark ? "text-green-400" : "text-green-600"}`}>
                    ✅ Agent completed
                  </p>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Scanned {agentResult.emails_scanned} emails → {agentResult.emails_matched} matched keywords → Created {agentResult.tasks_created} tasks
                  </p>
                </>
              ) : agentResult.status === "no_matching_emails" ? (
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  📭 Scanned {agentResult.emails_scanned} emails — none matched your keyword filters
                </p>
              ) : agentResult.status === "no_tasks_found" ? (
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  📭 {agentResult.emails_matched} emails matched keywords, but no new actionable tasks found
                </p>
              ) : (
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  ℹ️ Agent status: {agentResult.status}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ─── Today's Tasks ─── */}
        <div className={`p-6 rounded-2xl border flex flex-col max-h-[400px] ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-amber-500" /> Today's Tasks
            {todayTasks.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                {todayTasks.length}
              </span>
            )}
          </h3>

          <div className="flex-1 overflow-y-auto pr-1">
            {todayTasks.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-sm">No tasks due today!</p>
              </div>
            ) : (
              todayTasks.map((task) => {
                const pc = priorityColor(task.priority);
                return (
                  <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl mb-2 border-l-4 transition-colors ${isDark ? "bg-slate-900/50" : ""
                    }`}
                    style={{
                      background: isDark ? undefined : pc.bg,
                      borderLeftColor: pc.dot
                    }}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>{task.title}</p>
                      <p className={`text-xs truncate ${isDark ? "text-slate-500" : "text-slate-500"}`}>{task.category}</p>
                    </div>
                    <button onClick={() => completeTask(task.id)} className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors">
                      <CheckCircle2 size={16} />
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ─── All Tasks ─── */}
      <div className={`mt-6 p-6 rounded-2xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
          <ListTodo size={18} className="text-indigo-500" /> All Pending Tasks
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isDark ? "bg-indigo-900/50 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
            {pendingTasks.length}
          </span>
        </h3>

        {pendingTasks.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            <p className="text-sm">No pending tasks. Run the AI Agent to extract tasks from your emails!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingTasks.slice(0, 12).map((task) => {
              const pc = priorityColor(task.priority);
              return (
                <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${isDark ? "bg-slate-900/50 border-slate-700" : "bg-slate-50 border-slate-100"
                  }`}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: pc.dot }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className={`text-xs truncate ${isDark ? "text-slate-500" : "text-slate-500"}`}>{task.date} · {task.category}</p>
                  </div>
                  <button onClick={() => completeTask(task.id)} className="p-1 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors">
                    <CheckCircle2 size={14} />
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
            {pendingTasks.length > 12 && (
              <p className={`text-xs text-center col-span-1 md:col-span-2 py-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                +{pendingTasks.length - 12} more tasks — view all on Priority Board
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
