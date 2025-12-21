import React, { useState } from 'react';
import { ArrowLeft, Star, Search } from 'lucide-react';
import { emails, type Email } from '../data/emails';

interface EmailsProps {
  isDark: boolean;
}

const Emails: React.FC<EmailsProps> = ({ isDark }) => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(emails[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex">
      {/* Email List */}
      <div className={`w-96 border-r flex flex-col ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`} size={18} />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                isDark 
                  ? 'bg-slate-800 text-slate-200 focus:ring-blue-500' 
                  : 'bg-slate-50 text-slate-700 focus:ring-blue-500'
              } focus:outline-none focus:ring-2`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 dark:scrollbar-thumb-purple-500 scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
          {filteredEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`p-4 border-b cursor-pointer transition-all ${
                selectedEmail?.id === email.id
                  ? (isDark ? 'bg-slate-800 border-l-4 border-l-blue-600' : 'bg-blue-50 border-l-4 border-l-blue-600')
                  : (isDark ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-200 hover:bg-slate-50')
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {email.senderInitials}
                  </div>
                  <div>
                    <div className={`font-semibold text-sm ${!email.isRead ? 'font-bold' : ''} ${isDark ? 'text-purple-400' : 'text-blue-600'}`}>
                      {email.sender}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {email.timestamp}
                    </div>
                  </div>
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
              <div className="font-medium text-sm mb-1 line-clamp-1">{email.subject}</div>
              <div className={`text-xs line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {email.preview}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Detail */}
      {selectedEmail && (
        <div className="flex-1 flex flex-col">
          <div className={`p-6 border-b ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <button className={`p-2 rounded-lg ${
                isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
              }`}>
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-lg ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                }`}>
                  <Star size={20} />
                </button>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">{selectedEmail.subject}</h2>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
              }`}>
                {selectedEmail.senderInitials}
              </div>
              <div>
                <div className="font-semibold">{selectedEmail.sender}</div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  to me
                </div>
              </div>
            </div>
          </div>
          <div className={`flex-1 p-6 overflow-y-auto ${
            isDark ? 'bg-slate-900' : 'bg-slate-50'
          }`}>
            <div className={`${isDark ? 'text-slate-300' : 'text-slate-700'} leading-relaxed`}>
              <p className="mb-4">Hi Michael,</p>
              <p className="mb-4">{selectedEmail.preview}</p>
              <p className="mb-4">
                I wanted to share the latest updates with you and get your feedback on the direction we're heading.
                Please let me know if you have any questions or concerns.
              </p>
              <p className="mb-4">Looking forward to hearing from you!</p>
              <p className="mb-4">
                Best regards,<br />
                {selectedEmail.sender.split(' ')[0]}
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Emails;
