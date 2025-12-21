import { useAgentData, Email } from "../../hooks/useAgentData";

const InboxesWidget = ({ isDark }: { isDark: boolean }) => {
  const { emails } = useAgentData();

  return (
    <div
      className={`rounded-3xl p-6 border h-[450px] flex flex-col ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
    >
      <h3 className="font-bold text-lg mb-4">Inboxes</h3>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {emails.map((email: Email) => (
          <div key={email.id} className="pb-3 border-b border-slate-200 dark:border-slate-700 last:border-0">
            <p className="font-semibold text-sm break-words">{email.subject}</p>
            <p className={`text-xs mt-1 break-words ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {email.sender}
            </p>
            <p className={`text-xs mt-1 line-clamp-2 break-words ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {email.snippet}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InboxesWidget;
