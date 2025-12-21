import React from 'react';
import TaskCompletionWidget from '../components/dashboard/TaskCompletionWidget';
import ProductivityTrendWidget from '../components/dashboard/ProductivityTrendWidget';
import TaskManagerWidget from '../components/dashboard/TaskManagerWidget';
import InboxesWidget from '../components/dashboard/InboxesWidget';

interface DashboardProps {
  isDark: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isDark }) => {
  return (
    <div className="p-8 space-y-6">
      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TaskCompletionWidget isDark={isDark} />
        </div>
        <div className="lg:col-span-2">
          <ProductivityTrendWidget isDark={isDark} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskManagerWidget isDark={isDark} />
        </div>
        <div className="lg:col-span-1">
          <InboxesWidget isDark={isDark} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
