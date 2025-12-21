import React from 'react';
import { Search, Filter } from 'lucide-react';
import { emails } from '../../data/emails';

interface InboxesWidgetProps {
  isDark: boolean;
}

const InboxesWidget: React.FC<InboxesWidgetProps> = ({ isDark }) => {
  // Show all emails for scrolling demo
  const displayEmails = emails;
  const unreadCount = emails.filter(e => !e.isRead).length;

  return (
    <div className={`rounded-3xl p-6 shadow-sm border flex flex-col h-[450px] ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg">Inboxes</h3>
          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <button className={isDark ? 'text-slate-400' : 'text-slate-500'}>
          <Filter size={18} />
        </button>
      </div>

      <div className={`relative mb-6`}>
        <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        <input 
          type="text" 
          placeholder="Search emails..." 
          className={`w-full py-2.5 pl-10 pr-4 rounded-xl text-sm outline-none transition-all ${
            isDark ? 'bg-slate-800 text-slate-200 focus:ring-1 focus:ring-purple-500' : 'bg-slate-50 text-slate-700 focus:ring-1 focus:ring-blue-500'
          }`}
        />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {displayEmails.map((email) => (
          <div key={email.id} className="group cursor-pointer">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
                }`}>
                  {email.senderInitials}
                </div>
                <span className={`font-bold text-sm ${!email.isRead ? (isDark ? 'dark:font-extrabold text-purple-400' : 'text-blue-600') : (isDark ? 'text-purple-300' : 'text-slate-600')}`}>
                  {email.sender}
                </span>
                {!email.isRead && (
                  <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-purple-600' : 'bg-blue-600'}`}></span>
                )}
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                email.tagColor === 'purple' 
                  ? (isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600')
                  : email.tagColor === 'orange'
                  ? (isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-600')
                  : email.tagColor === 'green'
                  ? (isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600')
                  : (isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600')
              }`}>
                {email.tag}
              </span>
            </div>
            <div className={`pl-8`}>
              <div className={`font-medium text-xs mb-1 ${!email.isRead ? 'font-bold' : ''}`}>{email.subject}</div>
              <div className={`text-[11px] line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {email.preview}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InboxesWidget;

