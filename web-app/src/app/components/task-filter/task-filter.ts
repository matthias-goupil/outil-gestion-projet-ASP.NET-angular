import { Component, input, output } from '@angular/core';
import { Member, memberDisplayName, memberAvatarLetter } from '../../models/member.model';

@Component({
  selector: 'app-task-filter',
  imports: [],
  templateUrl: './task-filter.html',
  styleUrl: './task-filter.css'
})
export class TaskFilter {
  members = input.required<Member[]>();
  filterChanged = output<number[]>();

  selectedIds: number[] = [];

  toggle(id: number) {
    const idx = this.selectedIds.indexOf(id);
    this.selectedIds = idx === -1
      ? [...this.selectedIds, id]
      : this.selectedIds.filter(i => i !== id);
    this.filterChanged.emit(this.selectedIds);
  }

  clearFilter() {
    this.selectedIds = [];
    this.filterChanged.emit([]);
  }

  isSelected(id: number) {
    return this.selectedIds.includes(id);
  }

  displayName = memberDisplayName;
  avatarLetter = memberAvatarLetter;
}
