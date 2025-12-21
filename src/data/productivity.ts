// Mock data for productivity - simulates backend API response
export interface ProductivityData {
  hourlyActivity: number[];
  weeklyComparison: number; // percentage change vs last week
  timeLabels: string[];
}

export const productivityData: ProductivityData = {
  hourlyActivity: [40, 65, 30, 85, 50, 45, 60, 90, 40, 75, 55, 30, 60, 80, 50, 95, 45],
  weeklyComparison: 28, // 28% increase
  timeLabels: ['09:00', '12:00', '15:00', '18:00']
};
