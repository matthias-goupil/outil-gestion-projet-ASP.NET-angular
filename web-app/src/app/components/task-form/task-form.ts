import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { Member, memberDisplayName, memberAvatarLetter } from '../../models/member.model';
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
  members = input<Member[]>([]);
  taskCreated = output<Task>();
  taskUpdated = output<Task>();

  title = '';
  content = '';
  selectedAssigneeIds: number[] = [];
  submitting = false;
  error: string | null = null;

  get isEditMode() { return this.task() != null; }

  ngOnInit() {
    const task = this.task();
    if (task) {
      this.title = task.title;
      this.content = task.content ?? '';
      this.selectedAssigneeIds = task.assignees?.map(a => a.id) ?? [];
    }
  }

  toggleAssignee(id: number) {
    const idx = this.selectedAssigneeIds.indexOf(id);
    if (idx === -1) {
      this.selectedAssigneeIds = [...this.selectedAssigneeIds, id];
    } else {
      this.selectedAssigneeIds = this.selectedAssigneeIds.filter(i => i !== id);
    }
  }

  isAssigned(id: number) {
    return this.selectedAssigneeIds.includes(id);
  }

  displayName = memberDisplayName;
  avatarLetter = memberAvatarLetter;

  submit() {
    if (!this.title.trim()) return;
    this.submitting = true;
    this.error = null;

    const task = this.task();
    if (task) {
      const updated: Task = {
        ...task,
        title: this.title.trim(),
        content: this.content.trim() || undefined,
        assigneeIds: this.selectedAssigneeIds
      };
      this.taskService.update(this.projectId(), task.id, updated).subscribe({
        next: () => {
          const withAssignees: Task = {
            ...updated,
            assignees: this.members().filter(m => this.selectedAssigneeIds.includes(m.id))
          };
          this.taskUpdated.emit(withAssignees);
          this.submitting = false;
        },
        error: () => { this.error = 'Erreur lors de la modification.'; this.submitting = false; }
      });
    } else {
      this.taskService.create(this.projectId(), {
        title: this.title.trim(),
        content: this.content.trim() || undefined,
        status: TaskStatus.NotStarted,
        assigneeIds: this.selectedAssigneeIds
      }).subscribe({
        next: (created) => {
          const withAssignees: Task = {
            ...created,
            assignees: this.members().filter(m => this.selectedAssigneeIds.includes(m.id))
          };
          this.taskCreated.emit(withAssignees);
          this.title = '';
          this.content = '';
          this.selectedAssigneeIds = [];
          this.submitting = false;
        },
        error: () => { this.error = 'Erreur lors de la création.'; this.submitting = false; }
      });
    }
  }
}
