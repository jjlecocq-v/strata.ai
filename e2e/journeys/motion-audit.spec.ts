import { expect, test } from "../fixtures/personas";
import { authenticatedRequest, readPersonaState } from "../fixtures/personas";

/**
 * Motion audit read (#3). Workflow writes persist motion_id; /api/app-data must
 * return those events on the creating motion only, never on another motion or
 * across committee.
 */
test.describe("motion audit read", () => {
  test("create/open/approval/decide events stay on the owning motion and never cross tenant", async () => {
    const { marker } = readPersonaState();
    const title = `${marker} Motion Audit`;
    const otherTitle = `${marker} Motion Audit Other`;

    const admin = await authenticatedRequest("admin");
    const cross = await authenticatedRequest("crossCommitteeAdmin");

    try {
      const create = await admin.post("/api/workflow/create-motion", {
        data: { title, context: "E2E motion audit probe" },
      });
      expect(create.status()).toBe(200);
      const motionId = (await create.json()).id as string;

      const other = await admin.post("/api/workflow/create-motion", {
        data: { title: otherTitle, context: "Sibling motion must not inherit audit" },
      });
      expect(other.status()).toBe(200);
      const otherId = (await other.json()).id as string;

      expect((await admin.post("/api/workflow/advance-motion", { data: { motionId, to: "open" } })).status()).toBe(200);
      expect((await admin.post("/api/workflow/request-approval", { data: { motionId } })).status()).toBe(200);
      expect((await admin.post("/api/workflow/respond-approval", { data: { motionId, response: "approve" } })).status()).toBe(200);
      expect((await admin.post("/api/workflow/advance-motion", { data: { motionId, to: "decided" } })).status()).toBe(200);

      const data = await admin.get("/api/app-data");
      expect(data.status()).toBe(200);
      const body = await data.json();
      const motion = (body.motions ?? []).find((item: { id: string }) => item.id === motionId);
      const sibling = (body.motions ?? []).find((item: { id: string }) => item.id === otherId);
      expect(motion).toBeTruthy();
      expect(sibling).toBeTruthy();

      const actions = (motion.audit ?? []).map((event: { action: string; motionId?: string }) => event.action);
      expect(actions).toEqual(expect.arrayContaining([
        "Created motion",
        "Advanced motion",
        "Requested approval",
        "Responded to approval",
      ]));
      for (const event of motion.audit ?? []) {
        expect(event.motionId).toBe(motionId);
      }

      const siblingActions = (sibling.audit ?? []).map((event: { action: string }) => event.action);
      expect(siblingActions).toContain("Created motion");
      expect(siblingActions).not.toContain("Requested approval");
      expect(siblingActions).not.toContain("Responded to approval");
      for (const event of sibling.audit ?? []) {
        expect(event.motionId).toBe(otherId);
      }

      const crossData = await cross.get("/api/app-data");
      expect(crossData.status()).toBe(200);
      const crossBody = await crossData.json();
      const crossIds = (crossBody.motions ?? []).map((item: { id: string }) => item.id);
      expect(crossIds).not.toContain(motionId);
      const crossAudit = (crossBody.activity ?? []).filter((event: { motionId?: string }) => event.motionId === motionId);
      expect(crossAudit).toEqual([]);
    } finally {
      await admin.dispose();
      await cross.dispose();
    }
  });
});
