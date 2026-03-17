export type UserRole = "parent" | "therapist";

export interface SessionUser {
  id: string;
  email: string | null;
  role: UserRole;
}

