import { expect, test } from "../fixtures/personas";
import { authenticatedRequest, readPersonaState } from "../fixtures/personas";

/**
 * Committee identity (#2). The RLS-scoped app payload and shell must show the
 * authenticated member's committee name/address, never a generic label or the
 * other tenant's identity. Signed-out remains empty.
 */
test.describe("committee identity", () => {
  test("Committee A, Committee B, outsider, and signed-out see only their own identity", async () => {
    const state = readPersonaState();
    const admin = await authenticatedRequest("admin");
    const cross = await authenticatedRequest("crossCommitteeAdmin");
    const outsider = await authenticatedRequest("outsider");

    try {
      const adminData = await admin.get("/api/app-data");
      expect(adminData.status()).toBe(200);
      const adminBody = await adminData.json();
      expect(adminBody.auth?.mode).toBe("active");
      expect(adminBody.committee?.id).toBe(state.committeeAId);
      expect(adminBody.committee?.name).toBe(state.committeeAName);
      expect(adminBody.committee?.address).toBe(state.committeeAAddress);
      expect(JSON.stringify(adminBody)).not.toContain(state.crossCommitteeName);
      expect(JSON.stringify(adminBody)).not.toContain("Strata Governance Command");

      const crossData = await cross.get("/api/app-data");
      expect(crossData.status()).toBe(200);
      const crossBody = await crossData.json();
      expect(crossBody.auth?.mode).toBe("active");
      expect(crossBody.committee?.id).toBe(state.committeeBId);
      expect(crossBody.committee?.name).toBe(state.crossCommitteeName);
      expect(crossBody.committee?.name).not.toBe(state.committeeAName);
      expect(JSON.stringify(crossBody)).not.toContain(state.committeeAName);
      expect(JSON.stringify(crossBody)).not.toContain("Strata Governance Command");

      const outsiderData = await outsider.get("/api/app-data");
      expect(outsiderData.status()).toBe(200);
      const outsiderBody = await outsiderData.json();
      expect(outsiderBody.auth?.mode).toBe("signed-out");
      expect(outsiderBody.committee).toBeNull();
      expect(outsiderBody.cards).toEqual([]);
      expect(outsiderBody.motions).toEqual([]);
      expect(JSON.stringify(outsiderBody)).not.toContain(state.committeeAName);
      expect(JSON.stringify(outsiderBody)).not.toContain(state.crossCommitteeName);
      expect(JSON.stringify(outsiderBody)).not.toContain("Strata Governance Command");
    } finally {
      await admin.dispose();
      await cross.dispose();
      await outsider.dispose();
    }
  });
});
