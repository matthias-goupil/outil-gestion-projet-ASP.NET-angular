import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  private url(projectId: number) {
    return `/api/projects/${projectId}/tasks`;
  }

  getAll(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(this.url(projectId));
  }

  create(projectId: number, task: Omit<Task, 'id' | 'projectId'>): Observable<Task> {
    return this.http.post<Task>(this.url(projectId), {
      ...task,
      assigneeIds: task.assigneeIds ?? task.assignees?.map(a => a.id) ?? []
    });
  }

  update(projectId: number, id: number, task: Task): Observable<void> {
    return this.http.put<void>(`${this.url(projectId)}/${id}`, {
      ...task,
      assigneeIds: task.assigneeIds ?? task.assignees?.map(a => a.id) ?? []
    });
  }

  delete(projectId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.url(projectId)}/${id}`);
  }
}
