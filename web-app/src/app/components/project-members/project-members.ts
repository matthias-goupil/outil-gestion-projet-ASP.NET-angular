import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../services/auth.service';
import { Member, memberDisplayName, memberAvatarLetter } from '../../models/member.model';

@Component({
  selector: 'app-project-members',
  imports: [FormsModule],
  templateUrl: './project-members.html',
  styleUrl: './project-members.css'
})
export class ProjectMembers implements OnInit {
  private readonly memberService = inject(MemberService);
  private readonly authService = inject(AuthService);

  projectId = input.required<number>();

  members = signal<Member[]>([]);
  email = '';
  adding = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.memberService.getAll(this.projectId()).subscribe({
      next: members => this.members.set(members)
    });
  }

  addMember() {
    if (!this.email.trim()) return;
    this.adding.set(true);
    this.error.set(null);

    this.memberService.add(this.projectId(), this.email.trim()).subscribe({
      next: (member) => {
        this.members.update(list => [...list, member]);
        this.email = '';
        this.adding.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur lors de l\'ajout.');
        this.adding.set(false);
      }
    });
  }

  removeMember(member: Member) {
    this.memberService.remove(this.projectId(), member.id).subscribe({
      next: () => this.members.update(list => list.filter(m => m.id !== member.id))
    });
  }

  isCurrentUser(member: Member): boolean {
    return member.email === this.authService.currentEmail();
  }

  displayName = memberDisplayName;
  avatarLetter = memberAvatarLetter;
}
