import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
}

const EmailsPage: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/emails")
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
      <div className="flex items-center justify-center h-screen bg-[#0b1220] text-white">
        Loading emails...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0b1220] text-white">

      {/* LEFT PANEL */}
      <div className="w-[380px] border-r border-slate-800 p-4 overflow-y-auto">
        <input
          placeholder="Search emails..."
          className="w-full mb-4 px-3 py-2 rounded bg-slate-900 text-sm outline-none"
        />

        {emails.map((email) => (
          <div
            key={email.id}
            onClick={() => setSelectedEmail(email)}
            className={`p-3 rounded-lg mb-2 cursor-pointer
              ${selectedEmail?.id === email.id
                ? "bg-slate-800"
                : "hover:bg-slate-900"
              }`}
          >
            <p className="font-semibold text-sm truncate">
              {email.sender}
            </p>
            <p className="text-sm truncate">
              {email.subject}
            </p>
            <p className="text-xs text-slate-400 truncate">
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
            <p className="text-slate-400 mb-6">
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