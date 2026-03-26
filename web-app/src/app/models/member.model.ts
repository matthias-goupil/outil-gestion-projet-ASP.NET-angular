export interface Member {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export function memberDisplayName(m: Member): string {
  const full = [m.firstName, m.lastName].filter(Boolean).join(' ');
  return full || m.email;
}

export function memberAvatarLetter(m: Member): string {
  return (m.firstName?.[0] + m.lastName?.[0]).toUpperCase();
}
