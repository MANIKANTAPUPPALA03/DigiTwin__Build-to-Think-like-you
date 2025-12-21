import { useEffect } from "react";
import TaskCompletionWidget from "../components/dashboard/TaskCompletionWidget";
import ProductivityTrendWidget from "../components/dashboard/ProductivityTrendWidget";
import TaskManagerWidget from "../components/dashboard/TaskManagerWidget";
import InboxesWidget from "../components/dashboard/InboxesWidget";

interface DashboardProps {
  isDark: boolean;
}

const Dashboard = ({ isDark }: DashboardProps) => {
  useEffect(() => {
    // Check if user came from OAuth
    const params = new URLSearchParams(window.location.search);
    const isOAuth = params.get('oauth');
    const email = params.get('email');

    if (isOAuth === 'true' && email) {
      // Mark as authenticated via OAuth
      localStorage.setItem('oauth_authenticated', 'true');
      localStorage.setItem('oauth_email', email);

      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');

      // Only trigger agent if it's active
      const isAgentActive = localStorage.getItem('agent_active') !== 'false';
      if (isAgentActive) {
        // Trigger agent to process emails automatically
        fetch("http://localhost:8000/agent/run")
          .then(res => res.json())
          .then(data => console.log("Agent processing complete:", data))
          .catch(err => console.error("Error running agent:", err));
      }
    }
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TaskCompletionWidget isDark={isDark} />
        <ProductivityTrendWidget isDark={isDark} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskManagerWidget isDark={isDark} />
        </div>
        <InboxesWidget isDark={isDark} />
      </div>
    </div>
  );
};

export default Dashboard;
