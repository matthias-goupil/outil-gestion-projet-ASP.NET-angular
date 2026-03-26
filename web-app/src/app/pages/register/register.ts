import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  submitting = signal(false);
  error = signal<string | null>(null);

  submit() {
    if (!this.firstName.trim() || !this.lastName.trim() || !this.email || !this.password) return;
    this.submitting.set(true);
    this.error.set(null);

    this.authService.register({
      email: this.email,
      password: this.password,
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim()
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(err.error?.message ?? 'Une erreur est survenue.');
        this.submitting.set(false);
      }
    });
  }
}
