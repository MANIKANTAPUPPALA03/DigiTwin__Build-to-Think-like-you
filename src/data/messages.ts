// Mock data for assistant messages - simulates backend API response
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const initialMessages: Message[] = [
  {
    id: '1',
    text: "Hello! I'm your DigiTwin assistant. How can I help you manage your tasks today?",
    sender: 'bot',
    timestamp: new Date()
  }
];

export const botResponses = [
  "I've added that to your priority board.",
  "I can help you reschedule that meeting.",
  "Here's a summary of your unread emails.",
  "I've updated the task status to 'In Progress'.",
  "Would you like me to draft a reply?",
  "I found 3 tasks due this week.",
  "Your next meeting is scheduled for 2:00 PM today.",
  "I've created a calendar reminder for you."
];

export const getRandomResponse = (): string => {
  return botResponses[Math.floor(Math.random() * botResponses.length)];
};
