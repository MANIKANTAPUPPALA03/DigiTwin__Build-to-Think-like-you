import React, { useEffect, useState } from "react";

interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
}

interface EmailsPageProps {
  isDark?: boolean;
}

const EmailsPage: React.FC<EmailsPageProps> = ({ isDark = false }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/emails")
      .then((res) => res.json())
      .then((data) => {
        setEmails(data);
        setSelectedEmail(data[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch emails:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
        }`}>
        Loading emails...
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
      }`}>

      {/* LEFT PANEL */}
      <div className={`w-[380px] border-r ${isDark ? "border-slate-800" : "border-slate-200"
        } p-4 overflow-y-auto`}>
        <input
          placeholder="Search emails..."
          className={`w-full mb-4 px-3 py-2 rounded text-sm outline-none ${isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900 border border-slate-200"
            }`}
        />

        {emails.map((email) => (
          <div
            key={email.id}
            onClick={() => setSelectedEmail(email)}
            className={`p-3 rounded-lg mb-2 cursor-pointer
              ${selectedEmail?.id === email.id
                ? isDark ? "bg-slate-800" : "bg-slate-200"
                : isDark ? "hover:bg-slate-900" : "hover:bg-slate-100"
              }`}
          >
            <p className="font-semibold text-sm truncate">
              {email.sender}
            </p>
            <p className="text-sm truncate">
              {email.subject}
            </p>
            <p className={`text-xs truncate ${isDark ? "text-slate-400" : "text-slate-600"
              }`}>
              {email.snippet}
            </p>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-8 overflow-y-auto">
        {selectedEmail ? (
          <>
            <h1 className="text-2xl font-bold mb-2">
              {selectedEmail.subject}
            </h1>
            <p className={`mb-6 ${isDark ? "text-slate-400" : "text-slate-600"
              }`}>
              From: {selectedEmail.sender}
            </p>

            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {selectedEmail.body || "No content available"}
            </div>
          </>
        ) : (
          <p>Select an email to view</p>
        )}
      </div>

    </div>
  );
};

export default EmailsPage;
