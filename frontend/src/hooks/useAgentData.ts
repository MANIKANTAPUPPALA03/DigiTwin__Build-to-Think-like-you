import { useEffect, useState } from "react";

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "pending" | "completed";
  priority: string;
  category: string;
}

export interface Email {
  id: string;
  subject: string;
  sender: string;
  snippet: string;
  timestamp?: string;
}

export function useAgentData() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/emails")
      .then(res => res.json())
      .then(setEmails);

    fetch("http://localhost:8000/tasks")
      .then(res => res.json())
      .then(setTasks);
  }, []);

  return { emails, tasks };
}
