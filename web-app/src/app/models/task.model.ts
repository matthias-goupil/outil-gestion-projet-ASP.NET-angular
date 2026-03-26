import { TaskStatus } from "./task-status.model"

export interface Task {
  id: number;
  title: string;
  content?: string;
  order?: number;
  status: TaskStatus;
  projectId: number;
}
