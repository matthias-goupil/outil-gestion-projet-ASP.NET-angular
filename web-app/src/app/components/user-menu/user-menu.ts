import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from '../modal/modal';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-menu',
  imports: [FormsModule, Modal],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.css'
})
export class UserMenu {
  readonly authService = inject(AuthService);

  dropdownOpen = false;
  showProfileModal = false;

  firstName = '';
  lastName = '';
  email = '';
  newPassword = '';

  saving = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  get initials(): string {
    const f = this.authService.currentFirstName();
    const l = this.authService.currentLastName();
    if (f && l) return (f[0] + l[0]).toUpperCase();
    return (this.authService.currentEmail()[0] ?? '?').toUpperCase();
  }

  toggleDropdown(e: MouseEvent) {
    e.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  openProfile(e: MouseEvent) {
    e.stopPropagation();
    this.firstName = this.authService.currentFirstName() ?? '';
    this.lastName = this.authService.currentLastName() ?? '';
    this.email = this.authService.currentEmail();
    this.newPassword = '';
    this.error.set(null);
    this.success.set(false);
    this.dropdownOpen = false;
    this.showProfileModal = true;
  }

  saveProfile() {
    if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim()) return;
    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);

    this.authService.updateProfile({
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      newPassword: this.newPassword || undefined
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(true);
        this.newPassword = '';
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur lors de la sauvegarde.');
        this.saving.set(false);
      }
    });
  }

  @HostListener('document:click')
  closeDropdown() {
    this.dropdownOpen = false;
  }
}
