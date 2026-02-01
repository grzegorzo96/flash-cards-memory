import type { SupabaseClient } from "@/db/supabase.client";
import type { CreateDomainCommand, CreateDomainResponseDTO } from "@/types";

/**
 * Create a new domain for the authenticated user
 * Returns the created domain
 */
export async function createDomain(
  supabase: SupabaseClient,
  userId: string,
  command: CreateDomainCommand
): Promise<CreateDomainResponseDTO> {
  // Trim and validate name
  const trimmedName = command.name.trim();
  
  if (trimmedName.length < 2 || trimmedName.length > 100) {
    throw new Error("Domain name must be between 2 and 100 characters");
  }

  // Check if domain already exists for this user
  const { data: existing } = await supabase
    .from("domains")
    .select("id")
    .eq("user_id", userId)
    .eq("name", trimmedName)
    .maybeSingle();

  if (existing) {
    // Return existing domain instead of throwing error
    return { id: existing.id, name: trimmedName };
  }

  // Create new domain
  const { data, error } = await supabase
    .from("domains")
    .insert({
      user_id: userId,
      name: trimmedName,
    })
    .select("id, name")
    .single();

  if (error) {
    throw new Error(`Failed to create domain: ${error.message}`);
  }

  return data;
}
