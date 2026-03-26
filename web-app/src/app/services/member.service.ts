import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member } from '../models/member.model';

@Injectable({ providedIn: 'root' })
export class MemberService {
  private readonly http = inject(HttpClient);

  private url(projectId: number) {
    return `/api/projects/${projectId}/members`;
  }

  getAll(projectId: number): Observable<Member[]> {
    return this.http.get<Member[]>(this.url(projectId));
  }

  add(projectId: number, email: string): Observable<Member> {
    return this.http.post<Member>(this.url(projectId), { email });
  }

  remove(projectId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.url(projectId)}/${userId}`);
  }
}
