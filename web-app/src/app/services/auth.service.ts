import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly tokenKey = 'auth_token';
  private readonly emailKey = 'auth_email';

  isAuthenticated = signal(this.isBrowser && !!localStorage.getItem(this.tokenKey));
  currentEmail = signal<string>(this.isBrowser ? (localStorage.getItem(this.emailKey) ?? '') : '');

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>('/api/auth/login', request).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(request: RegisterRequest) {
    return this.http.post<AuthResponse>('/api/auth/register', request).pipe(
      tap(res => this.saveSession(res))
    );
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.emailKey);
    }
    this.isAuthenticated.set(false);
    this.currentEmail.set('');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.tokenKey) : null;
  }

  private saveSession(res: AuthResponse) {
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, res.token);
      localStorage.setItem(this.emailKey, res.email);
    }
    this.isAuthenticated.set(true);
    this.currentEmail.set(res.email);
  }
}
