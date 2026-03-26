import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-form',
  imports: [FormsModule],
  templateUrl: './project-form.html',
  styleUrl: './project-form.css'
})
export class ProjectForm implements OnInit {
  private readonly projectService = inject(ProjectService);

  project = input<Project | null>(null);
  projectCreated = output<Project>();
  projectUpdated = output<Project>();

  name = '';
  description = '';
  submitting = false;
  error: string | null = null;

  get isEditMode() { return this.project() != null; }

  ngOnInit() {
    const p = this.project();
    if (p) {
      this.name = p.name;
      this.description = p.description ?? '';
    }
  }

  submit() {
    if (!this.name.trim()) return;
    this.submitting = true;
    this.error = null;

    const p = this.project();
    if (p) {
      const updated: Project = { ...p, name: this.name.trim(), description: this.description.trim() || undefined };
      this.projectService.update(p.id, updated).subscribe({
        next: () => { this.projectUpdated.emit(updated); this.submitting = false; },
        error: () => { this.error = 'Erreur lors de la modification.'; this.submitting = false; }
      });
    } else {
      this.projectService.create({ name: this.name.trim(), description: this.description.trim() || undefined }).subscribe({
        next: (created) => { this.projectCreated.emit(created); this.submitting = false; },
        error: () => { this.error = 'Erreur lors de la création.'; this.submitting = false; }
      });
    }
  }
}
