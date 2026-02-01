import { describe, it, expect, beforeEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import { listDomains } from "@/lib/services/domains/listDomains";

const supabaseUrl = import.meta.env.SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseServiceKey =
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

describe("listDomains", () => {
  const testUserId = "8db7f0bc-a0a3-4cb9-9a6c-ea874aaf85bc"; // from seed.sql

  beforeEach(async () => {
    // Clean up test domains
    await supabase.from("domains").delete().eq("user_id", testUserId);
  });

  it("should return empty array when user has no domains", async () => {
    const domains = await listDomains(supabase, testUserId);
    expect(domains).toEqual([]);
  });

  it("should return user domains ordered by created_at desc", async () => {
    // Create test domains with explicit timestamps to ensure ordering
    const now = new Date();
    const domains = [
      { user_id: testUserId, name: "Domain A", created_at: new Date(now.getTime() - 2000).toISOString() },
      { user_id: testUserId, name: "Domain B", created_at: new Date(now.getTime() - 1000).toISOString() },
      { user_id: testUserId, name: "Domain C", created_at: now.toISOString() },
    ];
    
    await supabase.from("domains").insert(domains);

    const result = await listDomains(supabase, testUserId);

    expect(result.length).toBeGreaterThanOrEqual(3);
    
    // Find our test domains
    const testDomains = result.filter(d => 
      d.name === "Domain A" || d.name === "Domain B" || d.name === "Domain C"
    );
    
    expect(testDomains).toHaveLength(3);
    expect(testDomains[0].name).toBe("Domain C"); // newest first
    expect(testDomains[1].name).toBe("Domain B");
    expect(testDomains[2].name).toBe("Domain A");
  });

  it("should only return domains for the specified user", async () => {
    // Create domains for test user
    const { error } = await supabase.from("domains").insert([
      { user_id: testUserId, name: "My Unique Domain" },
    ]);

    expect(error).toBeNull();

    const domains = await listDomains(supabase, testUserId);

    // Find our specific test domain
    const myDomain = domains.find(d => d.name === "My Unique Domain");
    expect(myDomain).toBeDefined();
    expect(myDomain?.name).toBe("My Unique Domain");
  });
});
