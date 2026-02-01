import type { APIRoute } from 'astro';

import {
  getDashboardOverview,
  GetDashboardOverviewServiceError,
} from '../../lib/services/dashboard/getDashboardOverview';
import type { DashboardResponseDTO } from '../../types';

export const prerender = false;

/**
 * GET /api/dashboard
 * Retrieves dashboard overview with deck statistics and due cards count.
 *
 * @returns 200 OK with DashboardResponseDTO
 * @returns 401 Unauthorized if user is not authenticated
 * @returns 500 Internal Server Error for unexpected errors
 */
export const GET: APIRoute = async (context) => {
  try {
    // Get Supabase client from context.locals
    const supabase = context.locals.supabase;
    if (!supabase) {
      console.error('Supabase client not available in context.locals');
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get authenticated user ID
    const userId = context.locals.user?.id;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Retrieve dashboard overview using service layer
    const overview = await getDashboardOverview(supabase, userId);

    // Return success response
    const response: DashboardResponseDTO = overview;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof GetDashboardOverviewServiceError) {
      return new Response(
        JSON.stringify({
          error: 'Failed to retrieve dashboard overview',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in GET /api/dashboard:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
