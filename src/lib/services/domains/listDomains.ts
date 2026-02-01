import type { SupabaseClient } from "@/db/supabase.client";
import type { DomainListItemDTO } from "@/types";

/**
 * List all domains for the authenticated user
 * Ordered by creation date (newest first)
 */
export async function listDomains(
  supabase: SupabaseClient,
  userId: string
): Promise<DomainListItemDTO[]> {
  const { data, error } = await supabase
    .from("domains")
    .select("id, name, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list domains: ${error.message}`);
  }

  return data || [];
}
