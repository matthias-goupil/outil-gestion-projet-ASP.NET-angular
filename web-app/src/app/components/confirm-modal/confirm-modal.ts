import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css'
})
export class ConfirmModal {
  message = input<string>('Êtes-vous sûr de vouloir continuer ?');
  confirmLabel = input<string>('Confirmer');
  confirmed = output<void>();
  cancelled = output<void>();
}
