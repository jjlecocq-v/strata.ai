import assert from "node:assert/strict";
import { getCurrentMember } from "../src/lib/strata-app-data.ts";
import {
  getAuthenticatedUser,
  readBearerAccessToken,
} from "../src/lib/supabase/server.ts";

const SECRETARY_USER_ID = "f9f1d067-eab9-434d-88d9-4dd15328351b";
const STALE_USER_ID = "00000000-0000-0000-0000-000000000099";
const ACCESS_TOKEN = "jwt-secretary-access-token";
const STALE_TOKEN = "jwt-stale-access-token";

const secretaryMember = {
  id: "e34990ae-0000-0000-0000-000000000001",
  committee_id: "11111111-1111-1111-1111-111111111111",
  role: "secretary",
  full_name: "JJ Le Cocq",
  user_id: SECRETARY_USER_ID,
  email: "jj.lecocq@gmail.com",
  access_level: "admin",
  status: "active",
};

const invitedMember = {
  ...secretaryMember,
  id: "e34990ae-0000-0000-0000-000000000002",
  status: "invited",
};

function createMockSupabase({ cookieUser = null, members = [secretaryMember] } = {}) {
  const getUserCalls = [];
  const memberFilters = [];

  return {
    getUserCalls,
    memberFilters,
    auth: {
      async getUser(jwt) {
        getUserCalls.push(jwt);
        if (typeof jwt === "string") {
          if (jwt === ACCESS_TOKEN) {
            return { data: { user: { id: SECRETARY_USER_ID, email: secretaryMember.email } }, error: null };
          }
          if (jwt === STALE_TOKEN) {
            return { data: { user: { id: STALE_USER_ID, email: "stale@example.invalid" } }, error: null };
          }
          return { data: { user: null }, error: { name: "AuthSessionMissingError" } };
        }

        return {
          data: { user: cookieUser },
          error: cookieUser ? null : { name: "AuthSessionMissingError" },
        };
      },
    },
    from(table) {
      assert.equal(table, "members");
      const filters = {};
      const builder = {
        select() {
          return builder;
        },
        eq(column, value) {
          filters[column] = value;
          return builder;
        },
        limit() {
          return builder;
        },
        async maybeSingle() {
          memberFilters.push({ ...filters });
          const row = members.find(
            (candidate) =>
              candidate.user_id === filters.user_id && candidate.status === filters.status,
          );
          return { data: row ?? null, error: null };
        },
      };
      return builder;
    },
  };
}

assert.equal(readBearerAccessToken(null), undefined);
assert.equal(readBearerAccessToken("Basic abc"), undefined);
assert.equal(readBearerAccessToken("Bearer "), undefined);
assert.equal(readBearerAccessToken(`Bearer ${ACCESS_TOKEN}`), ACCESS_TOKEN);
assert.equal(readBearerAccessToken(`bearer ${ACCESS_TOKEN}  `), ACCESS_TOKEN);

{
  const supabase = createMockSupabase({ cookieUser: null });
  const missing = await getAuthenticatedUser(supabase, undefined);
  const explicit = await getAuthenticatedUser(supabase, ACCESS_TOKEN);
  assert.equal(missing.data.user, null);
  assert.equal(explicit.data.user?.id, SECRETARY_USER_ID);
  assert.deepEqual(supabase.getUserCalls, [undefined, ACCESS_TOKEN]);
}

{
  const supabase = createMockSupabase({ cookieUser: null });
  const member = await getCurrentMember(supabase, ACCESS_TOKEN);
  assert.equal(member?.id, secretaryMember.id);
  assert.equal(member?.role, "secretary");
  assert.equal(member?.committee_id, secretaryMember.committee_id);
  assert.deepEqual(supabase.getUserCalls, [ACCESS_TOKEN]);
  assert.deepEqual(supabase.memberFilters, [{ user_id: SECRETARY_USER_ID, status: "active" }]);
}

{
  const supabase = createMockSupabase({
    cookieUser: { id: STALE_USER_ID, email: "stale@example.invalid" },
  });
  const member = await getCurrentMember(supabase, ACCESS_TOKEN);
  assert.equal(member?.user_id, SECRETARY_USER_ID);
  assert.deepEqual(supabase.getUserCalls, [ACCESS_TOKEN]);
  assert.equal(
    supabase.memberFilters[0]?.user_id,
    SECRETARY_USER_ID,
    "stale cookie user must not win over the request JWT",
  );
}

{
  const supabase = createMockSupabase({ cookieUser: null });
  const member = await getCurrentMember(supabase);
  assert.equal(member, null);
  assert.deepEqual(supabase.getUserCalls, [undefined]);
  assert.equal(supabase.memberFilters.length, 0);
}

{
  const supabase = createMockSupabase({ cookieUser: null, members: [invitedMember] });
  const member = await getCurrentMember(supabase, ACCESS_TOKEN);
  assert.equal(member, null);
  assert.deepEqual(supabase.memberFilters, [{ user_id: SECRETARY_USER_ID, status: "active" }]);
}

console.log("Bearer member session verification passed.");
