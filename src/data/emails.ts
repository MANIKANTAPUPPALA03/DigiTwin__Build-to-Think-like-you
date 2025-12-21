// Mock data for emails - simulates backend API response with CONSISTENT data
export interface Email {
  id: string;
  sender: string;
  senderInitials: string;
  subject: string;
  preview: string;
  timestamp: string;
  tag: string;
  tagColor: 'blue' | 'purple' | 'orange' | 'green';
  isRead: boolean;
  createdAt: string; // ISO date string
  hasTask: boolean;
  taskMetadata?: {
    priority: 'low' | 'medium' | 'high';
    category: string;
    estimatedHours?: number;
    dueDate: string; // ISO date string
  };
}

// Seeded random function for consistent results
let seed = 12345;
const seededRandom = () => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

// Generate comprehensive email dataset for entire December with CONSISTENT data
const generateDecemberEmails = (): Email[] => {
  const emails: Email[] = [];
  const senders = [
    { name: 'Alex Brown', initials: 'AB', tag: 'Work', tagColor: 'blue' as const },
    { name: 'Sarah Johnson', initials: 'SJ', tag: 'Work', tagColor: 'orange' as const },
    { name: 'Robert Miller', initials: 'RM', tag: 'Updates', tagColor: 'orange' as const },
    { name: 'Emily Chen', initials: 'EC', tag: 'Work', tagColor: 'blue' as const },
    { name: 'David Wilson', initials: 'DW', tag: 'Meeting', tagColor: 'purple' as const },
    { name: 'Lisa Anderson', initials: 'LA', tag: 'Work', tagColor: 'green' as const },
    { name: 'Michael Davis', initials: 'MD', tag: 'Updates', tagColor: 'blue' as const },
    { name: 'Jennifer Lee', initials: 'JL', tag: 'Meeting', tagColor: 'purple' as const },
  ];

  const categories = ['Development', 'UI/UX Phase', 'Meeting', 'Documentation', 'Review', 'Testing', 'Deployment', 'Analytics'];
  const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

  // Reset seed for consistent generation
  seed = 12345;

  // Generate 2-4 emails per day for December 1-31
  for (let day = 1; day <= 31; day++) {
    const emailsPerDay = Math.floor(seededRandom() * 3) + 2; // 2-4 emails per day
    
    for (let i = 0; i < emailsPerDay; i++) {
      const sender = senders[Math.floor(seededRandom() * senders.length)];
      const category = categories[Math.floor(seededRandom() * categories.length)];
      const priority = priorities[Math.floor(seededRandom() * priorities.length)];
      const hour = 8 + Math.floor(seededRandom() * 10); // 8 AM to 6 PM
      const minute = Math.floor(seededRandom() * 60);
      
      const emailDate = new Date(2025, 11, day, hour, minute);
      const dueDate = new Date(2025, 11, day + Math.floor(seededRandom() * 3) + 1, 17, 0); // Due 1-3 days later
      
      const id = `e-dec-${day}-${i}`;
      
      emails.push({
        id,
        sender: sender.name,
        senderInitials: sender.initials,
        subject: `${category} Task - Day ${day}`,
        preview: `Task related to ${category.toLowerCase()} scheduled for completion.`,
        timestamp: day === 20 ? `${hour}:${minute.toString().padStart(2, '0')}` : 
                   day === 19 ? 'Yesterday' : `Dec ${day}`,
        tag: sender.tag,
        tagColor: sender.tagColor,
        isRead: day < 20,
        createdAt: emailDate.toISOString(),
        hasTask: true,
        taskMetadata: {
          priority,
          category,
          dueDate: dueDate.toISOString()
        }
      });
    }
  }
  
  return emails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const emails: Email[] = generateDecemberEmails();
