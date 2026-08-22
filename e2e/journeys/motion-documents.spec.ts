import { expect, test } from "../fixtures/personas";
import { authenticatedRequest, readPersonaState } from "../fixtures/personas";

/**
 * Motion attach + open (#1). Uploads a real file from a motion, reloads it from
 * /api/app-data, opens the exact bytes through a short-lived signed URL, and
 * proves hidden, expired, and cross-committee denial.
 */
test.describe("motion attach and open", () => {
  test("same-committee members attach and open exact bytes; hidden/expired/cross-tenant fail closed", async () => {
    const { marker } = readPersonaState();
    const title = `${marker} Motion Document`;
    const visibleBytes = `Visible motion attachment ${marker}`;
    const hiddenBytes = `Hidden motion attachment ${marker}`;

    const admin = await authenticatedRequest("admin");
    const member = await authenticatedRequest("member");
    const cross = await authenticatedRequest("crossCommitteeAdmin");

    try {
      const create = await admin.post("/api/workflow/create-motion", {
        data: { title, context: "E2E motion document probe" },
      });
      expect(create.status()).toBe(200);
      const motionId = (await create.json()).id as string;

      const attach = await admin.post("/api/documents/create", {
        multipart: {
          title: `${title} visible.txt`,
          documentType: "Motion attachment",
          visibility: "all",
          motionId,
          file: {
            name: "visible-motion.txt",
            mimeType: "text/plain",
            buffer: Buffer.from(visibleBytes),
          },
        },
      });
      expect(attach.status()).toBe(200);
      const visibleId = (await attach.json()).id as string;

      const hiddenAttach = await admin.post("/api/documents/create", {
        multipart: {
          title: `${title} hidden.txt`,
          documentType: "Motion attachment",
          visibility: "admins",
          motionId,
          file: {
            name: "hidden-motion.txt",
            mimeType: "text/plain",
            buffer: Buffer.from(hiddenBytes),
          },
        },
      });
      expect(hiddenAttach.status()).toBe(200);
      const hiddenId = (await hiddenAttach.json()).id as string;

      const data = await member.get("/api/app-data");
      expect(data.status()).toBe(200);
      const body = await data.json();
      const motion = (body.motions ?? []).find((item: { id: string }) => item.id === motionId);
      expect(motion).toBeTruthy();
      const names = (motion.documents ?? []).map((item: { name: string }) => item.name);
      expect(names).toContain(`${title} visible.txt`);
      expect(names).not.toContain(`${title} hidden.txt`);

      const opened = await member.post("/api/documents/open", {
        data: { documentId: visibleId },
      });
      expect(opened.status()).toBe(200);
      const openedBody = await opened.json();
      expect(openedBody.url).toBeTruthy();
      const downloaded = await fetch(openedBody.url as string);
      expect(downloaded.ok).toBeTruthy();
      expect(await downloaded.text()).toBe(visibleBytes);

      const hiddenOpen = await member.post("/api/documents/open", {
        data: { documentId: hiddenId },
      });
      expect(hiddenOpen.status()).toBe(404);

      const missingOpen = await member.post("/api/documents/open", {
        data: { documentId: "00000000-0000-4000-8000-000000000000" },
      });
      expect(missingOpen.status()).toBe(404);

      const shortLived = await admin.post("/api/documents/open", {
        data: { documentId: visibleId, expiresIn: 1 },
      });
      expect(shortLived.status()).toBe(200);
      const shortLivedBody = await shortLived.json();
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const expired = await fetch(shortLivedBody.url as string);
      expect(expired.ok).toBeFalsy();

      const crossData = await cross.get("/api/app-data");
      expect(crossData.status()).toBe(200);
      const crossBody = await crossData.json();
      expect((crossBody.motions ?? []).map((item: { id: string }) => item.id)).not.toContain(motionId);
      const crossOpen = await cross.post("/api/documents/open", {
        data: { documentId: visibleId },
      });
      expect(crossOpen.status()).toBe(404);
    } finally {
      await admin.dispose();
      await member.dispose();
      await cross.dispose();
    }
  });
});
