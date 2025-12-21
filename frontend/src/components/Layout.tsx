import React from "react";
import {
  LayoutDashboard,
  Mail,
  Calendar,
  ListTodo,
  Plus,
  Bell,
  Moon,
  Sun,
  X,
  AlertCircle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import FloatingAssistant from "./FloatingAssistant";
import logo from "../assets/logo.png";
import { taskAPI } from "../services/api";
import { tasks } from "../data/tasks";
import { useAuth } from "../context/AuthContext";

interface LayoutProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ isDark, setIsDark, children }) => {
  const location = useLocation();
  const [showNewTaskModal, setShowNewTaskModal] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [isAgentActive, setIsAgentActive] = React.useState(() => {
    // Initialize from localStorage, default to true
    return localStorage.getItem('agent_active') !== 'false';
  });

  const { user } = useAuth();

  // Handle agent toggle
  const handleAgentToggle = async () => {
    const newState = !isAgentActive;

    if (!newState) {
      // When turning OFF - complete shutdown
      localStorage.setItem('agent_active', 'false');
      localStorage.removeItem('oauth_authenticated');
      localStorage.removeItem('oauth_email');
      window.location.href = '/login';
    } else {
      // When turning ON
      setIsAgentActive(newState);
      localStorage.setItem('agent_active', 'true');
    }
  };

  // High priority tasks for notification
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status === 'pending');

  // New task state
  const [newTask, setNewTask] = React.useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'General',
    dueDate: new Date().toISOString().split('T')[0], // Default today
  });

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    await taskAPI.create({
      ...newTask,
      dueDate: new Date(newTask.dueDate).toISOString()
    });

    // Reset and close
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: 'General',
      dueDate: new Date().toISOString().split('T')[0],
    });
    setShowNewTaskModal(false);

    // Optional: Refresh page or context could be better, but mock API updates live array reference
  };

  // Close notifications on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const isActive = (path: string) => {
    return location.pathname === path
      ? isDark
        ? "bg-gradient-to-r from-purple-900/60 to-cyan-900/20 text-purple-300 border-l-2 border-purple-500"
        : "bg-blue-50 text-blue-700"
      : isDark
        ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900";
  };

  return (
    <div
      className={`flex h-screen overflow-hidden ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
        }`}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="neural"
            x="0"
            y="0"
            width="400"
            height="400"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="50" cy="50" r="2" fill="currentColor" />
            <circle cx="150" cy="80" r="2" fill="currentColor" />
            <circle cx="280" cy="100" r="2" fill="currentColor" />
            <circle cx="350" cy="150" r="2" fill="currentColor" />
            <circle cx="100" cy="200" r="2" fill="currentColor" />
            <circle cx="250" cy="220" r="2" fill="currentColor" />
            <circle cx="380" cy="280" r="2" fill="currentColor" />
            <circle cx="70" cy="320" r="2" fill="currentColor" />
            <circle cx="200" cy="350" r="2" fill="currentColor" />
            <line
              x1="50"
              y1="50"
              x2="150"
              y2="80"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line
              x1="150"
              y1="80"
              x2="280"
              y2="100"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line
              x1="280"
              y1="100"
              x2="350"
              y2="150"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line
              x1="100"
              y1="200"
              x2="250"
              y2="220"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line
              x1="250"
              y1="220"
              x2="380"
              y2="280"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line
              x1="50"
              y1="50"
              x2="100"
              y2="200"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line
              x1="150"
              y1="80"
              x2="100"
              y2="200"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line
              x1="280"
              y1="100"
              x2="250"
              y2="220"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line
              x1="350"
              y1="150"
              x2="380"
              y2="280"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line
              x1="70"
              y1="320"
              x2="200"
              y2="350"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#neural)" />
      </svg>

      <aside
        className={`w-64 border-r flex flex-col relative z-10 flex-shrink-0 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}
      >
        <div
          className={`p-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"
            }`}
        >
          <Link to="/dashboard" className="flex items-center gap-3">
            <img src={logo} alt="DigiTwin Logo" className="w-10 h-10 object-contain" />
            <span className="font-bold text-lg">DigiTwin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive(
              "/dashboard"
            )}`}
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </Link>
          <Link
            to="/emails"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive(
              "/emails"
            )}`}
          >
            <Mail size={20} />
            <span>Emails</span>
          </Link>
          <Link
            to="/calendar"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive(
              "/calendar"
            )}`}
          >
            <Calendar size={20} />
            <span>Calendar</span>
          </Link>
          <Link
            to="/priority-board"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive(
              "/priority-board"
            )}`}
          >
            <ListTodo size={20} />
            <span>Priority Board</span>
          </Link>
        </nav>



        <div
          className={`p-4 border-t ${isDark ? "border-slate-800" : "border-slate-200"
            }`}
        >
          <Link to="/profile" className="flex items-center gap-3 px-3 py-2 hover:opacity-80 transition-opacity">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${isDark ? 'from-cyan-500 to-purple-600' : 'from-blue-500 to-cyan-500'} flex items-center justify-center text-white font-bold`}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{user?.name || 'User'}</div>
              <div
                className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"
                  }`}
              >
                View Profile
              </div>
            </div>
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <header
          className={`border-b flex-shrink-0 ${isDark
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200"
            } px-8 py-6`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
              <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                Here's what's happening with your tasks today
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isAgentActive
                    ? isDark ? "#1e293b" : "#f1f5f9"
                    : isDark ? "#450a0a" : "#fee2e2"
                    }`}
                  style={{ background: isAgentActive ? (isDark ? "#1e293b" : "#f1f5f9") : (isDark ? "#450a0a" : "#fee2e2") }}
                >
                  <div className={`w-2 h-2 rounded-full ${isAgentActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-xs font-medium ${!isAgentActive && !isDark ? 'text-red-700' : ''}`}>
                    Agent {isAgentActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button
                  onClick={handleAgentToggle}
                  className={`w-11 h-6 rounded-full transition-colors relative ${isAgentActive
                    ? isDark ? 'bg-green-600' : 'bg-green-500'
                    : isDark ? 'bg-red-600' : 'bg-red-500'
                    }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isAgentActive ? 'left-5' : 'left-0.5'
                      }`}
                  ></div>
                </button>
              </div>
              <div className="relative notification-container">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 rounded-xl transition-all relative"
                  style={{ background: isDark ? "#1e293b" : "#f1f5f9" }}
                >
                  <Bell size={20} />
                  {highPriorityTasks.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className={`absolute top-full right-0 mt-2 w-80 rounded-2xl shadow-xl border z-50 overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    }`}>
                    <div className={`p-4 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                      <h3 className="font-bold">High Priority Tasks</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {highPriorityTasks.length > 0 ? (
                        highPriorityTasks.map(task => (
                          <div key={task.id} className={`p-4 border-b last:border-0 hover:bg-opacity-50 transition-colors ${isDark ? "border-slate-800 hover:bg-slate-800" : "border-slate-100 hover:bg-slate-50"
                            }`}>
                            <div className="flex items-start gap-3">
                              <div className="mt-1 text-red-500">
                                <AlertCircle size={16} />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                  {task.date}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={`p-8 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          No high priority tasks
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2.5 rounded-xl transition-all"
                style={{ background: isDark ? "#1e293b" : "#f1f5f9" }}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setShowNewTaskModal(true)}
                className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-lg hover:-translate-y-0.5 ${isDark ? 'bg-gradient-to-r from-purple-600 to-cyan-600' : 'bg-gradient-to-r from-blue-600 to-cyan-600'
                  }`}
              >
                <Plus size={18} />
                <span>New Task</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
      <FloatingAssistant isDark={isDark} />

      {/* Global New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
            }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Create New Task</h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border resize-none ${isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows={3}
                  placeholder="Enter task details"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-white border-slate-300 text-slate-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-white border-slate-300 text-slate-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${isDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!newTask.title.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
