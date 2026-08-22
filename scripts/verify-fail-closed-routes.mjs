import assert from "node:assert/strict";

const routes = [
  {
    label: "workflow",
    handler: (await import("../src/app/api/workflow/[action]/route.ts")).POST,
    request: () => new Request("http://strata.test/api/workflow/create-card", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Test", description: "Test" }),
    }),
    context: { params: Promise.resolve({ action: "create-card" }) },
  },
  {
    label: "finance",
    handler: (await import("../src/app/api/finance/[action]/route.ts")).POST,
    request: () => new Request("http://strata.test/api/finance/create-vendor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Test" }),
    }),
    context: { params: Promise.resolve({ action: "create-vendor" }) },
  },
  {
    label: "document",
    handler: (await import("../src/app/api/documents/create/route.ts")).POST,
    request: () => new Request("http://strata.test/api/documents/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Test", documentType: "other" }),
    }),
  },
  {
    label: "member accept",
    handler: (await import("../src/app/api/members/accept/route.ts")).POST,
    request: () => new Request("http://strata.test/api/members/accept", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    }),
  },
  {
    label: "member invite",
    handler: (await import("../src/app/api/members/invite/route.ts")).POST,
    request: () => new Request("http://strata.test/api/members/invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "fixture@example.invalid", fullName: "Fixture" }),
    }),
  },
  {
    label: "member update",
    handler: (await import("../src/app/api/members/update/route.ts")).POST,
    request: () => new Request("http://strata.test/api/members/update", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    }),
  },
];

const appDataHandler = (await import("../src/app/api/app-data/route.ts")).GET;
const documentOpenHandler = (await import("../src/app/api/documents/open/route.ts")).POST;
const aiHandler = (await import("../src/app/api/ai/[task]/route.ts")).POST;

function setRuntimeEnvironment(values) {
  for (const key of [
    "STRATA_ENVIRONMENT",
    "STRATA_DATA_MODE",
    "STRATA_AI_RELEASE_MODE",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "VERCEL_ENV",
    "NODE_ENV",
  ]) {
    delete process.env[key];
  }

  Object.assign(process.env, values);
}

async function expectFailure(response, code) {
  const body = await response.json();
  assert.ok(response.status >= 400, `Expected non-2xx response for ${code}`);
  assert.equal(body.code, code);
  assert.equal("id" in body, false);
  assert.notEqual(body.mode, "fallback");
  assert.notEqual(body.mode, "mock");
}

setRuntimeEnvironment({});

for (const route of routes) {
  const response = await route.handler(route.request(), route.context);
  await expectFailure(response, "RUNTIME_ENVIRONMENT_MISSING");
}

await expectFailure(
  await appDataHandler(new Request("http://strata.test/api/app-data")),
  "RUNTIME_ENVIRONMENT_MISSING",
);
await expectFailure(
  await documentOpenHandler(
    new Request("http://strata.test/api/documents/open", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ documentId: "00000000-0000-4000-8000-000000000000" }),
    }),
  ),
  "RUNTIME_ENVIRONMENT_MISSING",
);

setRuntimeEnvironment({
  STRATA_ENVIRONMENT: "test",
  STRATA_DATA_MODE: "fixture",
  STRATA_AI_RELEASE_MODE: "fallback",
});

for (const route of routes) {
  const response = await route.handler(route.request(), route.context);
  await expectFailure(response, "FIXTURE_WRITE_DISABLED");
}

setRuntimeEnvironment({
  VERCEL_ENV: "production",
  STRATA_ENVIRONMENT: "local",
  STRATA_DATA_MODE: "fixture",
  STRATA_AI_RELEASE_MODE: "fallback",
});

await expectFailure(
  await aiHandler(
    new Request("http://strata.test/api/ai/card-brief", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    }),
    { params: Promise.resolve({ task: "card-brief" }) },
  ),
  "RUNTIME_ENVIRONMENT_CONFLICT",
);

setRuntimeEnvironment({
  STRATA_ENVIRONMENT: "test",
  STRATA_DATA_MODE: "fixture",
});

await expectFailure(
  await aiHandler(
    new Request("http://strata.test/api/ai/card-brief", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ forceFallback: "true" }),
    }),
    { params: Promise.resolve({ task: "card-brief" }) },
  ),
  "AI_RELEASE_MODE_INVALID",
);

setRuntimeEnvironment({
  VERCEL_ENV: "production",
  STRATA_ENVIRONMENT: "production",
  STRATA_DATA_MODE: "live",
  STRATA_AI_RELEASE_MODE: "fallback",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-test-key",
});

const productionFallback = await aiHandler(
  new Request("http://strata.test/api/ai/card-brief", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question: "What is the live fire door approval?" }),
  }),
  { params: Promise.resolve({ task: "card-brief" }) },
);
const productionFallbackBody = await productionFallback.json();
assert.ok(productionFallback.status >= 400, "Production fallback without an active member must be non-2xx");
assert.notEqual(productionFallbackBody.code, "AI_FALLBACK_FORBIDDEN");
assert.notEqual(productionFallbackBody.mode, "mock");
assert.notEqual(productionFallbackBody.mode, "fallback");
assert.equal("id" in productionFallbackBody, false);
assert.equal(JSON.stringify(productionFallbackBody).includes("Live fire door approval"), false);

setRuntimeEnvironment({
  VERCEL_ENV: "production",
  STRATA_ENVIRONMENT: "production",
  STRATA_DATA_MODE: "live",
  STRATA_AI_RELEASE_MODE: "live",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-test-key",
});

const productionLive = await aiHandler(
  new Request("http://strata.test/api/ai/card-brief", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question: "What is the live fire door approval?" }),
  }),
  { params: Promise.resolve({ task: "card-brief" }) },
);
const productionLiveBody = await productionLive.json();
assert.ok(productionLive.status >= 400, "Production live AI without a session or gateway must be non-2xx");
assert.notEqual(productionLiveBody.mode, "mock");
assert.equal(JSON.stringify(productionLiveBody).includes("Live fire door approval"), false);

console.log("Behavioural fail-closed route assertions passed (6 writes, app-data, document open, and AI boundaries).");
