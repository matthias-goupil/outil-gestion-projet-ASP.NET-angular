import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { TaskStatus } from '../../models/task-status.model';

@Component({
  selector: 'app-task-form',
  imports: [FormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css'
})
export class TaskForm implements OnInit {
  private readonly taskService = inject(TaskService);

  projectId = input.required<number>();
  task = input<Task | null>(null);
  taskCreated = output<Task>();
  taskUpdated = output<Task>();

  title = '';
  content = '';
  submitting = false;
  error: string | null = null;

  get isEditMode() { return this.task() != null; }

  ngOnInit() {
    const task = this.task();
    if (task) {
      this.title = task.title;
      this.content = task.content ?? '';
    }
  }

  submit() {
    if (!this.title.trim()) return;
    this.submitting = true;
    this.error = null;

    const task = this.task();
    if (task) {
      const updated: Task = { ...task, title: this.title.trim(), content: this.content.trim() || undefined };
      this.taskService.update(this.projectId(), task.id, updated).subscribe({
        next: () => { this.taskUpdated.emit(updated); this.submitting = false; },
        error: () => { this.error = 'Erreur lors de la modification.'; this.submitting = false; }
      });
    } else {
      this.taskService.create(this.projectId(), { title: this.title.trim(), content: this.content.trim() || undefined, status: TaskStatus.NotStarted }).subscribe({
        next: (created) => { this.taskCreated.emit(created); this.title = ''; this.content = ''; this.submitting = false; },
        error: () => { this.error = 'Erreur lors de la création.'; this.submitting = false; }
      });
    }
  }
}
