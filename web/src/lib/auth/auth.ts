import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../supabase/serverClient";
import type { SessionUser, UserRole } from "@/types/auth";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const role = (user.app_metadata.role ?? user.user_metadata.role) as UserRole | undefined;

  if (!role) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    role,
  };
}

export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user || user.role !== role) {
    redirect("/login");
  }

  return user;
}

export async function requireParent() {
  return requireRole("parent");
}

export async function requireTherapist() {
  return requireRole("therapist");
}

