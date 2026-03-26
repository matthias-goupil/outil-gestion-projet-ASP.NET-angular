import { Component, inject, input, OnChanges, output } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskCard } from '../task-card/task-card';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { TaskStatus } from '../../models/task-status.model';

interface KanbanColumn {
  status: TaskStatus;
  label: string;
  tasks: Task[];
}

@Component({
  selector: 'app-kanban-board',
  imports: [DragDropModule, TaskCard],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.css'
})
export class KanbanBoard implements OnChanges {
  private readonly taskService = inject(TaskService);

  tasks = input.required<Task[]>();
  projectId = input.required<number>();
  editRequested = output<Task>();
  deleteRequested = output<Task>();

  columns: KanbanColumn[] = [
    { status: TaskStatus.NotStarted, label: 'À faire',    tasks: [] },
    { status: TaskStatus.InProgress, label: 'En cours',   tasks: [] },
    { status: TaskStatus.OnHold,     label: 'En attente', tasks: [] },
    { status: TaskStatus.Completed,  label: 'Terminé',    tasks: [] },
  ];

  columnIds = this.columns.map(c => 'col-' + c.status);

  ngOnChanges() {
    for (const col of this.columns) {
      col.tasks = this.tasks()
        .filter(t => t.status === col.status)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
  }

  drop(event: CdkDragDrop<Task[]>, targetColumn: KanbanColumn) {
    const task: Task = event.item.data;

    if (event.previousContainer === event.container) {
      moveItemInArray(targetColumn.tasks, event.previousIndex, event.currentIndex);
      targetColumn.tasks.forEach((t, i) => {
        if (t.order !== i) {
          this.taskService.update(this.projectId(), t.id, { ...t, order: i }).subscribe();
          t.order = i;
        }
      });
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      const newStatus = targetColumn.status;
      this.taskService.update(this.projectId(), task.id, { ...task, status: newStatus, order: event.currentIndex }).subscribe();
      task.status = newStatus;
      task.order = event.currentIndex;
    }
  }
}
