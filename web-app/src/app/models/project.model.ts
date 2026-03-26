export interface Project {
  id: number;
  name: string;
  description?: string;
  taskCount?: number;
  completedCount?: number;
  inProgressCount?: number;
}
