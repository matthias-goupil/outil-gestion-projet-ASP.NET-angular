import { TaskStatus } from "./task-status.model";
import { Member } from "./member.model";

export interface Task {
  id: number;
  title: string;
  description?: string;
  content?: string;
  order?: number;
  status: TaskStatus;
  projectId: number;
  assignees?: Member[];
  assigneeIds?: number[];
}
