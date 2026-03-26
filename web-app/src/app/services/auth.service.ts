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
  private readonly firstNameKey = 'auth_firstName';
  private readonly lastNameKey = 'auth_lastName';

  isAuthenticated = signal(this.isBrowser && !!localStorage.getItem(this.tokenKey));
  currentEmail = signal<string>(this.isBrowser ? (localStorage.getItem(this.emailKey) ?? '') : '');
  currentFirstName = signal<string | null>(this.isBrowser ? localStorage.getItem(this.firstNameKey) : null);
  currentLastName = signal<string | null>(this.isBrowser ? localStorage.getItem(this.lastNameKey) : null);

  get currentDisplayName(): string {
    const full = [this.currentFirstName(), this.currentLastName()].filter(Boolean).join(' ');
    return full || this.currentEmail();
  }

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
      localStorage.removeItem(this.firstNameKey);
      localStorage.removeItem(this.lastNameKey);
    }
    this.isAuthenticated.set(false);
    this.currentEmail.set('');
    this.currentFirstName.set(null);
    this.currentLastName.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.tokenKey) : null;
  }

  private saveSession(res: AuthResponse) {
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, res.token);
      localStorage.setItem(this.emailKey, res.email);
      if (res.firstName) localStorage.setItem(this.firstNameKey, res.firstName);
      else localStorage.removeItem(this.firstNameKey);
      if (res.lastName) localStorage.setItem(this.lastNameKey, res.lastName);
      else localStorage.removeItem(this.lastNameKey);
    }
    this.isAuthenticated.set(true);
    this.currentEmail.set(res.email);
    this.currentFirstName.set(res.firstName ?? null);
    this.currentLastName.set(res.lastName ?? null);
  }
}
