import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "../lib/api";
import { requestGoogleAccessToken } from "../hooks/useGoogleToken";

interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  body: string;
  body_html?: string;
  date: string;
}

interface EmailsPageProps {
  isDark?: boolean;
}

/* ─── Helper: parse sender name ─── */
function parseSender(raw: string) {
  const match = raw.match(/^(.+?)\s*<(.+?)>$/);
  if (match) return { name: match[1].replace(/"/g, "").trim(), email: match[2] };
  return { name: raw, email: raw };
}

/* ─── Helper: format date ─── */
function formatDate(raw: string) {
  try {
    const d = new Date(raw);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diff < 604800000) {
      return d.toLocaleDateString([], { weekday: "short" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return raw;
  }
}

/* ─── Helper: sender initials + color ─── */
function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

const AVATAR_COLORS = [
  "#6366f1", "#ec4899", "#f97316", "#14b8a6",
  "#8b5cf6", "#ef4444", "#3b82f6", "#22c55e",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ─── HTML Email Renderer (sandboxed iframe) ─── */
const HtmlEmailViewer: React.FC<{ html: string }> = ({ html }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #1e293b;
                  padding: 0;
                  margin: 0;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                }
                img { max-width: 100%; height: auto; }
                a { color: #3b82f6; }
                table { max-width: 100% !important; }
                pre { overflow-x: auto; }
              </style>
            </head>
            <body>${html}</body>
          </html>
        `);
        doc.close();

        // Auto-resize iframe to content height
        const resize = () => {
          if (iframeRef.current && doc.body) {
            iframeRef.current.style.height = doc.body.scrollHeight + 20 + "px";
          }
        };
        setTimeout(resize, 200);
        setTimeout(resize, 1000);
      }
    }
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-same-origin"
      style={{
        width: "100%",
        minHeight: 200,
        border: "none",
        background: "white",
        borderRadius: 8,
      }}
      title="Email content"
    />
  );
};

/* ─── Main Component ─── */
const EmailsPage: React.FC<EmailsPageProps> = ({ isDark = false }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEmails = () => {
    setLoading(true);
    setNeedsAuth(false);
    apiFetch("/emails")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEmails(data);
          setSelectedEmail(data[0]);
        } else {
          setEmails([]);
          setNeedsAuth(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch emails:", err);
        setNeedsAuth(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleConnectGmail = async () => {
    try {
      await requestGoogleAccessToken();
      fetchEmails();
    } catch (err) {
      console.error("Failed to connect Gmail:", err);
    }
  };

  const filteredEmails = emails.filter(
    (e) =>
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100%", gap: 12,
        color: isDark ? "#94a3b8" : "#64748b",
      }}>
        <div style={{
          width: 24, height: 24, border: "3px solid",
          borderColor: isDark ? "#334155 #6366f1 #334155 #334155" : "#e2e8f0 #6366f1 #e2e8f0 #e2e8f0",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Fetching your emails...
      </div>
    );
  }

  /* ─── Auth Required ─── */
  if (needsAuth && emails.length === 0) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100%", gap: 16,
        color: isDark ? "#e2e8f0" : "#1e293b",
      }}>
        <div style={{ fontSize: 48 }}>📧</div>
        <p style={{ fontSize: 18, fontWeight: 500 }}>Connect your Gmail to view emails</p>
        <button
          onClick={handleConnectGmail}
          style={{
            padding: "12px 32px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff", border: "none", borderRadius: 12, fontSize: 15,
            fontWeight: 600, cursor: "pointer", transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          🔗 Connect Gmail
        </button>
      </div>
    );
  }

  const selectedSender = selectedEmail ? parseSender(selectedEmail.sender) : null;

  /* ─── Main Layout ─── */
  return (
    <div style={{
      display: "flex", height: "100%", overflow: "hidden",
      background: isDark ? "#0f172a" : "#f8fafc",
      color: isDark ? "#e2e8f0" : "#1e293b",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>

      {/* ═══ LEFT PANEL: Email List ═══ */}
      <div style={{
        width: 380, minWidth: 380, borderRight: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
        display: "flex", flexDirection: "column", background: isDark ? "#0f172a" : "#ffffff",
      }}>
        {/* Search */}
        <div style={{ padding: "16px 16px 8px" }}>
          <div style={{
            position: "relative", display: "flex", alignItems: "center",
          }}>
            <span style={{
              position: "absolute", left: 12, fontSize: 14,
              color: isDark ? "#475569" : "#94a3b8",
            }}>🔍</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails..."
              style={{
                width: "100%", padding: "10px 12px 10px 36px",
                borderRadius: 10, border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
                background: isDark ? "#1e293b" : "#f1f5f9",
                color: isDark ? "#e2e8f0" : "#1e293b",
                fontSize: 13, outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = isDark ? "#1e293b" : "#e2e8f0")}
            />
          </div>
          <p style={{
            fontSize: 11, color: isDark ? "#475569" : "#94a3b8",
            marginTop: 8, paddingLeft: 4,
          }}>
            {filteredEmails.length} email{filteredEmails.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Email List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px" }}>
          {filteredEmails.map((email) => {
            const sender = parseSender(email.sender);
            const isSelected = selectedEmail?.id === email.id;

            return (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                style={{
                  display: "flex", gap: 12, padding: "12px 12px",
                  borderRadius: 10, cursor: "pointer", marginBottom: 2,
                  background: isSelected
                    ? isDark ? "#1e293b" : "#ede9fe"
                    : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = isDark ? "#1e293b80" : "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, minWidth: 40, borderRadius: "50%",
                  background: getAvatarColor(sender.name),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 13, fontWeight: 700, marginTop: 2,
                }}>
                  {getInitials(sender.name)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{
                      fontWeight: 600, fontSize: 13,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      maxWidth: "70%",
                    }}>
                      {sender.name}
                    </span>
                    <span style={{
                      fontSize: 11, color: isDark ? "#475569" : "#94a3b8",
                      whiteSpace: "nowrap", flexShrink: 0,
                    }}>
                      {formatDate(email.date)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 13, fontWeight: 500, margin: "2px 0",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    color: isSelected ? (isDark ? "#c7d2fe" : "#4338ca") : undefined,
                  }}>
                    {email.subject}
                  </p>
                  <p style={{
                    fontSize: 12, margin: 0,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    color: isDark ? "#475569" : "#94a3b8",
                  }}>
                    {email.snippet}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ RIGHT PANEL: Email Detail ═══ */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "32px 40px",
        background: isDark ? "#0f172a" : "#f8fafc",
      }}>
        {selectedEmail && selectedSender ? (
          <>
            {/* Subject */}
            <h1 style={{
              fontSize: 22, fontWeight: 700, margin: "0 0 16px",
              lineHeight: 1.3, color: isDark ? "#f1f5f9" : "#0f172a",
            }}>
              {selectedEmail.subject}
            </h1>

            {/* Sender Info */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: 24, paddingBottom: 20,
              borderBottom: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: getAvatarColor(selectedSender.name),
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 15, fontWeight: 700,
              }}>
                {getInitials(selectedSender.name)}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>
                  {selectedSender.name}
                </p>
                <p style={{
                  fontSize: 12, margin: "2px 0 0", color: isDark ? "#64748b" : "#94a3b8",
                }}>
                  {selectedSender.email} · {formatDate(selectedEmail.date)}
                </p>
              </div>
            </div>

            {/* Email Body */}
            <div style={{
              background: isDark ? "#1e293b" : "#ffffff",
              borderRadius: 12, padding: 24,
              border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
              boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              {selectedEmail.body_html ? (
                <HtmlEmailViewer html={selectedEmail.body_html} />
              ) : selectedEmail.body ? (
                <div style={{
                  fontSize: 14, lineHeight: 1.7,
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                  color: isDark ? "#cbd5e1" : "#334155",
                }}>
                  {selectedEmail.body}
                </div>
              ) : selectedEmail.snippet ? (
                <div style={{
                  fontSize: 14, lineHeight: 1.7,
                  color: isDark ? "#64748b" : "#94a3b8",
                  fontStyle: "italic",
                }}>
                  {selectedEmail.snippet}
                </div>
              ) : (
                <p style={{
                  color: isDark ? "#475569" : "#94a3b8",
                  fontSize: 14, fontStyle: "italic",
                }}>
                  No content available for this email.
                </p>
              )}
            </div>
          </>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "100%", color: isDark ? "#475569" : "#94a3b8",
          }}>
            <p>Select an email to view</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailsPage;
