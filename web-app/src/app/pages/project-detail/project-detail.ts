import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { KanbanBoard } from '../../components/kanban-board/kanban-board';
import { TaskForm } from '../../components/task-form/task-form';
import { TaskFilter } from '../../components/task-filter/task-filter';
import { Modal } from '../../components/modal/modal';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';
import { ProjectMembers } from '../../components/project-members/project-members';
import { UserMenu } from '../../components/user-menu/user-menu';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { MemberService } from '../../services/member.service';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model';
import { Member } from '../../models/member.model';

@Component({
  selector: 'app-project-detail',
  imports: [KanbanBoard, TaskForm, TaskFilter, Modal, ConfirmModal, ProjectMembers, UserMenu, RouterLink],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css'
})
export class ProjectDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly taskService = inject(TaskService);
  private readonly memberService = inject(MemberService);

  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  members = signal<Member[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  showCreateModal = signal(false);
  showMembersModal = signal(false);
  taskToEdit = signal<Task | null>(null);
  taskToDelete = signal<Task | null>(null);

  filterMemberIds = signal<number[]>([]);

  filteredTasks = computed(() => {
    const ids = this.filterMemberIds();
    if (ids.length === 0) return this.tasks();
    return this.tasks().filter(t =>
      t.assignees?.some(a => ids.includes(a.id)) ?? false
    );
  });

  get projectId() { return Number(this.route.snapshot.paramMap.get('id')); }

  ngOnInit() {
    const id = this.projectId;
    this.projectService.getById(id).subscribe({
      next: (project) => { this.project.set(project); },
      error: () => this.error.set('Projet introuvable.')
    });
    this.taskService.getAll(id).subscribe({
      next: (tasks) => { this.tasks.set(tasks); this.loading.set(false); },
      error: () => { this.error.set('Impossible de charger les tâches.'); this.loading.set(false); }
    });
    this.memberService.getAll(id).subscribe({
      next: (members) => this.members.set(members)
    });
  }

  onTaskCreated(task: Task) {
    this.tasks.update(list => [...list, task]);
    this.showCreateModal.set(false);
  }

  onTaskUpdated(updated: Task) {
    this.tasks.update(list => list.map(t => t.id === updated.id ? updated : t));
    this.taskToEdit.set(null);
  }

  confirmDelete() {
    const task = this.taskToDelete();
    if (!task) return;
    this.taskService.delete(this.projectId, task.id).subscribe({
      next: () => {
        this.tasks.update(list => list.filter(t => t.id !== task.id));
        this.taskToDelete.set(null);
      }
    });
  }
}
