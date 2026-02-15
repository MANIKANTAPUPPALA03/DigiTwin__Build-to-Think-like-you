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

  const bg = isDark ? "#0f172a" : "#f8fafc";
  const card = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e2e8f0";
  const textPrimary = isDark ? "#e2e8f0" : "#1e293b";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const textMuted = isDark ? "#64748b" : "#94a3b8";

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
    <div style={{ padding: 24, fontFamily: "'Inter', sans-serif", color: textPrimary, background: bg, minHeight: "100%" }}>
      {/* ─── Stats Cards ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { icon: <ListTodo size={20} />, label: "Total Tasks", value: tasks.length, color: "#6366f1" },
          { icon: <Zap size={20} />, label: "High Priority", value: highPriority.length, color: "#ef4444" },
          { icon: <Calendar size={20} />, label: "Due Today", value: todayTasks.length, color: "#f59e0b" },
          { icon: <CheckCircle2 size={20} />, label: "Completed", value: completedTasks.length, color: "#22c55e" },
        ].map(({ icon, label, value, color }) => (
          <div key={label} style={{ background: card, borderRadius: 14, padding: "20px 24px", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: 12, color: textSecondary }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* ─── AI Agent Panel ─── */}
        <div style={{ background: card, borderRadius: 16, padding: 24, border: `1px solid ${border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>AI Agent</h3>
              <p style={{ fontSize: 12, color: textSecondary, margin: 0 }}>Email → Task extraction with Groq AI</p>
            </div>
          </div>

          <p style={{ fontSize: 13, color: textSecondary, lineHeight: 1.6, marginBottom: 16 }}>
            The agent reads your recent emails, checks your Google Calendar for conflicts, and uses AI to extract actionable tasks — no duplicates.
          </p>

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button
              onClick={runAgent}
              disabled={agentRunning}
              style={{
                flex: 1,
                padding: "12px 20px",
                borderRadius: 10,
                border: "none",
                background: agentRunning ? (isDark ? "#334155" : "#e2e8f0") : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: agentRunning ? textSecondary : "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: agentRunning ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {agentRunning ? (
                <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Running...</>
              ) : (
                <><Sparkles size={14} /> Run AI Agent</>
              )}
            </button>

            <button
              onClick={clearAllTasks}
              disabled={clearing || tasks.length === 0}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: `1px solid ${isDark ? "#7f1d1d" : "#fecaca"}`,
                background: "transparent",
                color: "#ef4444",
                fontSize: 13,
                fontWeight: 600,
                cursor: clearing || tasks.length === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: tasks.length === 0 ? 0.4 : 1,
              }}
            >
              <Trash2 size={14} /> Clear All
            </button>
          </div>

          {/* Agent Result */}
          {agentResult && (
            <div style={{
              padding: 14,
              borderRadius: 10,
              background: agentResult.status === "success" ? (isDark ? "#052e16" : "#f0fdf4") : (isDark ? "#1e1b4b" : "#eef2ff"),
              border: `1px solid ${agentResult.status === "success" ? (isDark ? "#166534" : "#bbf7d0") : (isDark ? "#3730a3" : "#c7d2fe")}`,
            }}>
              {agentResult.status === "success" ? (
                <>
                  <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? "#4ade80" : "#16a34a", margin: "0 0 4px" }}>
                    ✅ Agent completed
                  </p>
                  <p style={{ fontSize: 12, color: textSecondary, margin: 0 }}>
                    Scanned {agentResult.emails_scanned} emails → {agentResult.emails_matched} matched keywords → Created {agentResult.tasks_created} tasks
                  </p>
                </>
              ) : agentResult.status === "no_matching_emails" ? (
                <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
                  📭 Scanned {agentResult.emails_scanned} emails — none matched your keyword filters
                </p>
              ) : agentResult.status === "no_tasks_found" ? (
                <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
                  📭 {agentResult.emails_matched} emails matched keywords, but no new actionable tasks found
                </p>
              ) : (
                <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
                  ℹ️ Agent status: {agentResult.status}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ─── Today's Tasks ─── */}
        <div style={{ background: card, borderRadius: 16, padding: 24, border: `1px solid ${border}`, maxHeight: 360, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={18} style={{ color: "#f59e0b" }} /> Today's Tasks
            {todayTasks.length > 0 && (
              <span style={{ fontSize: 12, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                {todayTasks.length}
              </span>
            )}
          </h3>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {todayTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: textMuted }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>🎉</div>
                <p style={{ fontSize: 13 }}>No tasks due today!</p>
              </div>
            ) : (
              todayTasks.map((task) => {
                const pc = priorityColor(task.priority);
                return (
                  <div key={task.id} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
                    marginBottom: 6, background: isDark ? "#0f172a" : pc.bg, borderLeft: `3px solid ${pc.dot}`,
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: textPrimary }}>{task.title}</p>
                      <p style={{ fontSize: 11, color: textSecondary, margin: "2px 0 0" }}>{task.category}</p>
                    </div>
                    <button onClick={() => completeTask(task.id)} title="Complete"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#22c55e", padding: 4 }}>
                      <CheckCircle2 size={16} />
                    </button>
                    <button onClick={() => deleteTask(task.id)} title="Delete"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4 }}>
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
      <div style={{ marginTop: 24, background: card, borderRadius: 16, padding: 24, border: `1px solid ${border}` }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <ListTodo size={18} style={{ color: "#6366f1" }} /> All Pending Tasks
          <span style={{ fontSize: 12, background: isDark ? "#312e81" : "#eef2ff", color: "#6366f1", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
            {pendingTasks.length}
          </span>
        </h3>

        {pendingTasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: textMuted }}>
            <p style={{ fontSize: 14 }}>No pending tasks. Run the AI Agent to extract tasks from your emails!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {pendingTasks.slice(0, 12).map((task) => {
              const pc = priorityColor(task.priority);
              return (
                <div key={task.id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  borderRadius: 10, background: isDark ? "#0f172a" : "#fafafa",
                  border: `1px solid ${isDark ? "#334155" : "#f1f5f9"}`,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: pc.dot, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</p>
                    <p style={{ fontSize: 11, color: textSecondary, margin: "1px 0 0" }}>{task.date} · {task.category}</p>
                  </div>
                  <button onClick={() => completeTask(task.id)} title="Complete"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#22c55e", padding: 4 }}>
                    <CheckCircle2 size={14} />
                  </button>
                  <button onClick={() => deleteTask(task.id)} title="Delete"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4 }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
            {pendingTasks.length > 12 && (
              <p style={{ fontSize: 12, color: textMuted, gridColumn: "span 2", textAlign: "center", padding: "8px 0" }}>
                +{pendingTasks.length - 12} more tasks — view all on Priority Board
              </p>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Dashboard;
