import { Component, HostListener, input, output } from '@angular/core';
import { Task } from '../../models/task.model';
import { TaskStatus } from '../../models/task-status.model';
import { memberAvatarLetter } from '../../models/member.model';

@Component({
  selector: 'app-task-card',
  imports: [],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  task = input.required<Task>();
  editRequested = output<Task>();
  deleteRequested = output<Task>();

  menuOpen = false;

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

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  onEdit(event: MouseEvent) {
    event.stopPropagation();
    this.menuOpen = false;
    this.editRequested.emit(this.task());
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation();
    this.menuOpen = false;
    this.deleteRequested.emit(this.task());
  }

    avatarLetter = memberAvatarLetter;

  @HostListener('document:click')
  closeMenu() {
    this.menuOpen = false;
  }
}
