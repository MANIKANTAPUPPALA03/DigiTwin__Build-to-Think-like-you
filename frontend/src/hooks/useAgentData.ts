import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

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
  const [emails] = useState<Email[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);

  useEffect(() => {
    apiFetch("/tasks")
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setTasks(data) : setTasks([]))
      .catch(() => setTasks([]));
  }, []);

  return { emails, tasks };
}
