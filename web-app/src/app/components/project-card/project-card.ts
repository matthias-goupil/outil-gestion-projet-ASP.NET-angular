import { Component, HostListener, input, output } from '@angular/core';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-card',
  imports: [],
  templateUrl: './project-card.html',
  styleUrl: './project-card.css'
})
export class ProjectCard {
  project = input.required<Project>();
  editRequested = output<Project>();
  deleteRequested = output<Project>();

  menuOpen = false;

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  onEdit(event: MouseEvent) {
    event.stopPropagation();
    this.menuOpen = false;
    this.editRequested.emit(this.project());
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation();
    this.menuOpen = false;
    this.deleteRequested.emit(this.project());
  }

  get completionPercent(): number {
    const total = this.project().taskCount ?? 0;
    if (total === 0) return 0;
    return Math.round(((this.project().completedCount ?? 0) / total) * 100);
  }

  @HostListener('document:click')
  closeMenu() { this.menuOpen = false; }
}
