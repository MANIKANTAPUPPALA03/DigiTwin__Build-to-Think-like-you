// Direct mock tasks - not derived from emails
// Task interface with only 2 statuses: completed and pending
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed'; // Removed 'in-progress'
  priority: 'low' | 'medium' | 'high';
  progress: number;
  dueDate: string; // ISO date string
  category: string;
  assignees?: string[];
  createdAt: string; // ISO date string
  completedAt?: string; // ISO date string when completed
  basedOn?: string; // "Based on Alex Brown's email" or undefined for self-created tasks
  emailId?: string; // ID of the email this task is generated from
}

// Create mock tasks spanning December 1-31
// Completed = tasks due before Dec 20 (today)
// Pending = tasks due on or after Dec 20 (today and future)
export const tasks: Task[] = [
  // December 1-5 (Completed tasks)
  {
    id: 'task-001',
    title: 'Design Login Page UI',
    description: 'Create mockups and wireframes for the new login page with modern design patterns',
    status: 'completed',
    priority: 'high',
    progress: 100,
    dueDate: '2025-12-03T17:00:00',
    category: 'UI/UX Phase',
    assignees: ['Sarah', 'Michael'],
    createdAt: '2025-12-01T09:00:00',
    completedAt: '2025-12-03T16:30:00',
    basedOn: "Based on Sarah Johnson's email"
  },
  {
    id: 'task-002',
    title: 'Setup Project Repository',
    description: 'Initialize Git repository with proper folder structure and README',
    status: 'completed',
    priority: 'high',
    progress: 100,
    dueDate: '2025-12-02T17:00:00',
    category: 'Development',
    createdAt: '2025-12-01T10:00:00',
    completedAt: '2025-12-02T15:00:00'
    // No basedOn - self-created task
  },
  {
    id: 'task-003',
    title: 'Review API Documentation',
    description: 'Go through the REST API documentation and prepare integration plan',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    dueDate: '2025-12-04T17:00:00',
    category: 'Documentation',
    createdAt: '2025-12-02T11:00:00',
    completedAt: '2025-12-04T14:00:00',
    basedOn: "Based on David Wilson's email"
  },
  {
    id: 'task-004',
    title: 'Database Schema Design',
    description: 'Design database schema for user authentication and profile management',
    status: 'completed',
    priority: 'high',
    progress: 100,
    dueDate: '2025-12-05T17:00:00',
    category: 'Development',
    assignees: ['Alex'],
    createdAt: '2025-12-03T09:00:00',
    completedAt: '2025-12-05T16:00:00',
    basedOn: "Based on Alex Brown's email"
  },
  
  // December 6-10 (Completed tasks)
  {
    id: 'task-005',
    title: 'Implement User Registration',
    description: 'Build user registration functionality with email verification',
    status: 'completed',
    priority: 'high',
    progress: 100,
    dueDate: '2025-12-08T17:00:00',
    category: 'Development',
    assignees: ['Emily', 'Robert'],
    createdAt: '2025-12-06T09:00:00',
    completedAt: '2025-12-08T15:30:00',
    basedOn: "Based on Emily Chen's email"
  },
  {
    id: 'task-006',
    title: 'Create Dashboard Wireframes',
    description: 'Design wireframes for the main dashboard with all widgets',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    dueDate: '2025-12-09T17:00:00',
    category: 'UI/UX Phase',
    createdAt: '2025-12-07T10:00:00',
    completedAt: '2025-12-09T14:00:00'
  },
  {
    id: 'task-007',
    title: 'Setup Testing Framework',
    description: 'Configure Jest and React Testing Library for unit tests',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    dueDate: '2025-12-10T17:00:00',
    category: 'Testing',
    createdAt: '2025-12-08T09:00:00',
    completedAt: '2025-12-10T16:00:00',
    basedOn: "Based on Lisa Anderson's email"
  },
  
  // December 11-15 (Completed tasks)
  {
    id: 'task-008',
    title: 'Build Authentication API',
    description: 'Develop REST API endpoints for user authentication',
    status: 'completed',
    priority: 'high',
    progress: 100,
    dueDate: '2025-12-12T17:00:00',
    category: 'Development',
    assignees: ['Michael', 'Alex'],
    createdAt: '2025-12-10T09:00:00',
    completedAt: '2025-12-12T17:00:00',
    basedOn: "Based on Michael Davis's email"
  },
  {
    id: 'task-009',
    title: 'Design System Components',
    description: 'Create reusable component library with consistent styling',
    status: 'completed',
    priority: 'high',
    progress: 100,
    dueDate: '2025-12-13T17:00:00',
    category: 'UI/UX Phase',
    createdAt: '2025-12-11T09:00:00',
    completedAt: '2025-12-13T15:00:00',
    basedOn: "Based on Sarah Johnson's email"
  },
  {
    id: 'task-010',
    title: 'Write Unit Tests for Auth',
    description: 'Create comprehensive unit tests for authentication module',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    dueDate: '2025-12-14T17:00:00',
    category: 'Testing',
    createdAt: '2025-12-12T10:00:00',
    completedAt: '2025-12-14T16:00:00'
  },
  {
    id: 'task-011',
    title: 'Deploy to Staging',
    description: 'Deploy current build to staging environment for QA testing',
    status: 'completed',
    priority: 'high',
    progress: 100,
    dueDate: '2025-12-15T17:00:00',
    category: 'Deployment',
    assignees: ['Robert'],
    createdAt: '2025-12-13T09:00:00',
    completedAt: '2025-12-15T14:00:00',
    basedOn: "Based on Robert Miller's email"
  },
  
  // December 16-19 (Completed tasks)
  {
    id: 'task-012',
    title: 'Fix Responsive Layout Issues',
    description: 'Resolve mobile and tablet layout problems reported in QA',
    status: 'completed',
    priority: 'high',
    progress: 100,
    dueDate: '2025-12-17T17:00:00',
    category: 'Development',
    createdAt: '2025-12-15T09:00:00',
    completedAt: '2025-12-17T16:30:00',
    basedOn: "Based on Jennifer Lee's email"
  },
  {
    id: 'task-013',
    title: 'Performance Optimization',
    description: 'Optimize bundle size and improve page load times',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    dueDate: '2025-12-18T17:00:00',
    category: 'Development',
    createdAt: '2025-12-16T10:00:00',
    completedAt: '2025-12-18T15:00:00'
  },
  {
    id: 'task-014',
    title: 'Accessibility Audit',
    description: 'Conduct accessibility audit and fix WCAG compliance issues',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    dueDate: '2025-12-19T17:00:00',
    category: 'Review',
    assignees: ['Emily'],
    createdAt: '2025-12-17T09:00:00',
    completedAt: '2025-12-19T14:00:00',
    basedOn: "Based on Emily Chen's email"
  },
  
  // December 20-23 (Pending tasks - today and future)
  {
    id: 'task-015',
    title: 'Integrate Payment Gateway',
    description: 'Implement Stripe payment integration for subscription plans',
    status: 'pending',
    priority: 'high',
    progress: 0,
    dueDate: '2025-12-21T17:00:00',
    category: 'Development',
    assignees: ['Alex', 'Michael'],
    createdAt: '2025-12-18T09:00:00',
    basedOn: "Based on Alex Brown's email"
  },
  {
    id: 'task-016',
    title: 'User Dashboard Implementation',
    description: 'Build the main user dashboard with all analytics widgets',
    status: 'pending',
    priority: 'high',
    progress: 0,
    dueDate: '2025-12-22T17:00:00',
    category: 'Development',
    createdAt: '2025-12-19T09:00:00',
    basedOn: "Based on Sarah Johnson's email"
  },
  {
    id: 'task-017',
    title: 'Email Notification System',
    description: 'Setup email notification service for user alerts',
    status: 'pending',
    priority: 'medium',
    progress: 0,
    dueDate: '2025-12-23T17:00:00',
    category: 'Development',
    createdAt: '2025-12-20T09:00:00'
  },
  
  // December 24-27 (Pending tasks)
  {
    id: 'task-018',
    title: 'Security Penetration Testing',
    description: 'Conduct security testing and vulnerability assessment',
    status: 'pending',
    priority: 'high',
    progress: 0,
    dueDate: '2025-12-24T17:00:00',
    category: 'Testing',
    assignees: ['David'],
    createdAt: '2025-12-20T10:00:00',
    basedOn: "Based on David Wilson's email"
  },
  {
    id: 'task-019',
    title: 'Analytics Dashboard Design',
    description: 'Design charts and graphs for analytics visualization',
    status: 'pending',
    priority: 'medium',
    progress: 0,
    dueDate: '2025-12-26T17:00:00',
    category: 'UI/UX Phase',
    createdAt: '2025-12-21T09:00:00',
    basedOn: "Based on Lisa Anderson's email"
  },
  {
    id: 'task-020',
    title: 'API Rate Limiting',
    description: 'Implement rate limiting and throttling for API endpoints',
    status: 'pending',
    priority: 'high',
    progress: 0,
    dueDate: '2025-12-27T17:00:00',
    category: 'Development',
    createdAt: '2025-12-22T09:00:00'
  },
  
  // December 28-31 (Pending tasks)
  {
    id: 'task-021',
    title: 'Mobile App Mockups',
    description: 'Create mobile app mockups for iOS and Android',
    status: 'pending',
    priority: 'medium',
    progress: 0,
    dueDate: '2025-12-28T17:00:00',
    category: 'UI/UX Phase',
    assignees: ['Sarah'],
    createdAt: '2025-12-23T09:00:00',
    basedOn: "Based on Sarah Johnson's email"
  },
  {
    id: 'task-022',
    title: 'Database Backup Strategy',
    description: 'Implement automated database backup and recovery system',
    status: 'pending',
    priority: 'high',
    progress: 0,
    dueDate: '2025-12-29T17:00:00',
    category: 'Development',
    createdAt: '2025-12-24T09:00:00',
    basedOn: "Based on Robert Miller's email"
  },
  {
    id: 'task-023',
    title: 'Documentation Update',
    description: 'Update all API documentation and user guides',
    status: 'pending',
    priority: 'low',
    progress: 0,
    dueDate: '2025-12-30T17:00:00',
    category: 'Documentation',
    createdAt: '2025-12-25T09:00:00'
  },
  {
    id: 'task-024',
    title: 'Final Production Deployment',
    description: 'Deploy final version to production with monitoring',
    status: 'pending',
    priority: 'high',
    progress: 0,
    dueDate: '2025-12-31T17:00:00',
    category: 'Deployment',
    assignees: ['Michael', 'Alex', 'Robert'],
    createdAt: '2025-12-26T09:00:00',
    basedOn: "Based on Michael Davis's email"
  }
];

// Calculate task statistics dynamically
export const getTaskStatistics = () => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Calculate percentages for display - only 2 categories now
  const completedPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pendingPercentage = 100 - completedPercentage;
  
  return {
    total,
    completed,
    pending,
    completionRate,
    completedPercentage,
    pendingPercentage
  };
};
