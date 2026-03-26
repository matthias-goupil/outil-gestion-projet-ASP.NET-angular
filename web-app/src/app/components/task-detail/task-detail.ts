import { Component, input, output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { Task } from '../../models/task.model';
import { TaskStatus } from '../../models/task-status.model';
import { Member } from '../../models/member.model';
import { memberAvatarLetter, memberDisplayName } from '../../models/member.model';

@Component({
  selector: 'app-task-detail',
  imports: [],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css'
})
export class TaskDetail {
  private readonly sanitizer = inject(DomSanitizer);

  task = input.required<Task>();
  editRequested = output<Task>();

  memberDisplayName = memberDisplayName;
  memberAvatarLetter = memberAvatarLetter;

  get statusLabel(): string {
    switch (this.task().status) {
      case TaskStatus.NotStarted: return 'À faire';
      case TaskStatus.InProgress: return 'En cours';
      case TaskStatus.Completed:  return 'Terminé';
      case TaskStatus.OnHold:     return 'En attente';
    }
  }

  get statusClass(): string {
    switch (this.task().status) {
      case TaskStatus.NotStarted: return 'status-not-started';
      case TaskStatus.InProgress: return 'status-in-progress';
      case TaskStatus.Completed:  return 'status-completed';
      case TaskStatus.OnHold:     return 'status-on-hold';
    }
  }

  get safeContent(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.task().content ?? '');
  }
}
