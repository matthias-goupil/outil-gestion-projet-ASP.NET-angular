import { Component, inject, OnInit, signal } from '@angular/core';
import { KanbanBoard } from './components/kanban-board/kanban-board';
import { TaskForm } from './components/task-form/task-form';
import { Modal } from './components/modal/modal';
import { ConfirmModal } from './components/confirm-modal/confirm-modal';
import { TaskService } from './services/task.service';
import { Task } from './models/task.model';

@Component({
  selector: 'app-root',
  imports: [KanbanBoard, TaskForm, Modal, ConfirmModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly taskService = inject(TaskService);

  tasks = signal<Task[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  showCreateModal = signal(false);
  taskToEdit = signal<Task | null>(null);
  taskToDelete = signal<Task | null>(null);

  ngOnInit() {
    this.taskService.getAll().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les tâches.');
        this.loading.set(false);
      }
    });
  }

  onTaskCreated(task: Task) {
    this.tasks.update(tasks => [...tasks, task]);
    this.showCreateModal.set(false);
  }

  onTaskUpdated(updated: Task) {
    this.tasks.update(tasks => tasks.map(t => t.id === updated.id ? updated : t));
    this.taskToEdit.set(null);
  }

  confirmDelete() {
    const task = this.taskToDelete();
    if (!task) return;

    this.taskService.delete(task.id).subscribe({
      next: () => {
        this.tasks.update(tasks => tasks.filter(t => t.id !== task.id));
        this.taskToDelete.set(null);
      }
    });
  }
}
