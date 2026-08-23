import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
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

  // A request JWT must authenticate on its own. Mixing Authorization with the
  // Next cookie store lets empty or stale cookies hide an active member from
  // auth.getUser() and from subsequent RLS queries.
  if (accessToken) {
    return createClient<Database>(url, publishableKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
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
