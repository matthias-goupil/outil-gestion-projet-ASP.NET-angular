import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectCard } from '../../components/project-card/project-card';
import { ProjectForm } from '../../components/project-form/project-form';
import { Modal } from '../../components/modal/modal';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-list',
  imports: [ProjectCard, ProjectForm, Modal, ConfirmModal],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css'
})
export class ProjectList implements OnInit {
  private readonly projectService = inject(ProjectService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  showCreateModal = signal(false);
  projectToEdit = signal<Project | null>(null);
  projectToDelete = signal<Project | null>(null);

  ngOnInit() {
    this.projectService.getAll().subscribe({
      next: (projects) => { this.projects.set(projects); this.loading.set(false); },
      error: () => { this.error.set('Impossible de charger les projets.'); this.loading.set(false); }
    });
  }

  openProject(project: Project) {
    this.router.navigate(['/projects', project.id]);
  }

  onProjectCreated(project: Project) {
    this.projects.update(list => [...list, project]);
    this.showCreateModal.set(false);
  }

  onProjectUpdated(updated: Project) {
    this.projects.update(list => list.map(p => p.id === updated.id ? updated : p));
    this.projectToEdit.set(null);
  }

  confirmDelete() {
    const p = this.projectToDelete();
    if (!p) return;
    this.projectService.delete(p.id).subscribe({
      next: () => {
        this.projects.update(list => list.filter(x => x.id !== p.id));
        this.projectToDelete.set(null);
      }
    });
  }
}
