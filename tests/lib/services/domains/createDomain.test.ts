import { describe, it, expect, beforeEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import { createDomain } from "@/lib/services/domains/createDomain";

const supabaseUrl = import.meta.env.SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseServiceKey =
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

describe("createDomain", () => {
  const testUserId = "8db7f0bc-a0a3-4cb9-9a6c-ea874aaf85bc"; // from seed.sql

  beforeEach(async () => {
    // Clean up test domains
    await supabase.from("domains").delete().eq("user_id", testUserId);
  });

  it("should create a new domain", async () => {
    const domain = await createDomain(supabase, testUserId, {
      name: "Test Domain",
    });

    expect(domain).toHaveProperty("id");
    expect(domain.name).toBe("Test Domain");
  });

  it("should trim whitespace from domain name", async () => {
    const domain = await createDomain(supabase, testUserId, {
      name: "  Spaced Domain  ",
    });

    expect(domain.name).toBe("Spaced Domain");
  });

  it("should return existing domain if it already exists", async () => {
    // Create first domain
    const domain1 = await createDomain(supabase, testUserId, {
      name: "Duplicate Domain",
    });

    // Try to create the same domain again
    const domain2 = await createDomain(supabase, testUserId, {
      name: "Duplicate Domain",
    });

    expect(domain1.id).toBe(domain2.id);
    expect(domain2.name).toBe("Duplicate Domain");

    // Verify only one domain exists
    const { count } = await supabase
      .from("domains")
      .select("*", { count: "exact", head: true })
      .eq("user_id", testUserId)
      .eq("name", "Duplicate Domain");

    expect(count).toBe(1);
  });

  it("should throw error for domain name too short", async () => {
    await expect(
      createDomain(supabase, testUserId, { name: "A" })
    ).rejects.toThrow("Domain name must be between 2 and 100 characters");
  });

  it("should throw error for domain name too long", async () => {
    const longName = "A".repeat(101);
    await expect(
      createDomain(supabase, testUserId, { name: longName })
    ).rejects.toThrow("Domain name must be between 2 and 100 characters");
  });

  it("should handle multiple domains for the same user", async () => {
    await createDomain(supabase, testUserId, { name: "Domain 1" });
    await createDomain(supabase, testUserId, { name: "Domain 2" });
    await createDomain(supabase, testUserId, { name: "Domain 3" });

    const { count } = await supabase
      .from("domains")
      .select("*", { count: "exact", head: true })
      .eq("user_id", testUserId);

    expect(count).toBe(3);
  });
});
