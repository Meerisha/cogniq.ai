"use server";

import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

export async function joinWaitlist(formData: FormData) {
  const name = (formData.get("name") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const role = (formData.get("role") || "").toString().trim();

  if (!name || !email || !role) {
    throw new Error("Please fill in all fields.");
  }

  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("waitlist").insert({
    name,
    email,
    role,
  });

  if (error) {
    console.error("Error inserting waitlist entry", error);
    throw new Error("Something went wrong joining the waitlist. Please try again.");
  }

  // Placeholder: this is where a real email service
  // integration would send a confirmation email.
}

