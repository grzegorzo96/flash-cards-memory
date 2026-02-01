import type { APIRoute } from "astro";
import { z } from "zod";
import { listDomains } from "@/lib/services/domains/listDomains";
import { createDomain } from "@/lib/services/domains/createDomain";
import type { CreateDomainCommand } from "@/types";

// Schema for POST request
const createDomainSchema = z.object({
  name: z.string().min(2).max(100),
});

/**
 * GET /api/domains
 * List all domains for the authenticated user
 */
export const GET: APIRoute = async ({ locals }) => {
  const supabase = locals.supabase;
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const domains = await listDomains(supabase, user.id);

    return new Response(JSON.stringify(domains), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/domains error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to list domains" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * POST /api/domains
 * Create a new domain for the authenticated user
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validation = createDomainSchema.safeParse(body);
  if (!validation.success) {
    return new Response(
      JSON.stringify({
        error: "Validation failed",
        details: validation.error.errors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const command: CreateDomainCommand = {
    name: validation.data.name,
  };

  try {
    const domain = await createDomain(supabase, user.id, command);

    return new Response(JSON.stringify(domain), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/domains error:", error);
    const message = error instanceof Error ? error.message : "Failed to create domain";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
