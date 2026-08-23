import { createServerClient, type SupabaseClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { resolveRuntimeConfiguration } from "@/lib/runtime-configuration";
import type { Database } from "./types";

export type AppSupabaseClient = SupabaseClient<Database>;

export function readBearerAccessToken(authorizationHeader: string | null | undefined) {
  if (!authorizationHeader?.toLowerCase().startsWith("bearer ")) {
    return undefined;
  }

  const token = authorizationHeader.slice("bearer ".length).trim();
  return token || undefined;
}

export async function getAuthenticatedUser(supabase: AppSupabaseClient, accessToken?: string) {
  return accessToken
    ? supabase.auth.getUser(accessToken)
    : supabase.auth.getUser();
}

export async function getSupabaseServerClient(accessToken?: string) {
  const configuration = resolveRuntimeConfiguration();

  if (!configuration.supabase) {
    return null;
  }

  const { url, publishableKey } = configuration.supabase;
  const cookieStore = await cookies();

  // A request JWT must authenticate on its own. When a bearer token is provided,
  // use an empty cookie adapter so stale or mismatched cookies don't interfere
  // with the explicit JWT. The Authorization header in global.headers applies to
  // both auth and PostgREST (database RLS) requests.
  return createServerClient<Database>(url, publishableKey, {
    auth: accessToken
      ? {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        }
      : undefined,
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
    cookies: accessToken
      ? {
          getAll() {
            return [];
          },
          setAll() {
            // No-op: bearer requests don't persist cookies.
          },
        }
      : {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Server Components can read sessions but cannot always set cookies.
            }
          },
        },
  });
}
