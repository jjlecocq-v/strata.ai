import { NextRequest, NextResponse } from "next/server";
import { PublicRequestError, fixtureWriteDisabledResponse, operationFailureResponse, runtimeFailureResponse } from "@/lib/runtime-configuration";
import { getCurrentMember } from "@/lib/strata-app-data";
import { getSupabaseServerClient, readBearerAccessToken } from "@/lib/supabase/server";

const DOCUMENT_BUCKET = "strata-documents";
const MIN_EXPIRES_IN = 1;
const MAX_EXPIRES_IN = 120;
const DEFAULT_EXPIRES_IN = 60;

function requiredText(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new PublicRequestError("REQUEST_FIELD_REQUIRED", `${label} is required`);
  }

  return value.trim();
}

function expiresInSeconds(value: unknown) {
  if (value == null || value === "") {
    return DEFAULT_EXPIRES_IN;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new PublicRequestError("REQUEST_FIELD_REQUIRED", "expiresIn must be a number of seconds");
  }

  return Math.min(MAX_EXPIRES_IN, Math.max(MIN_EXPIRES_IN, Math.trunc(parsed)));
}

export async function POST(request: NextRequest) {
  const accessToken = readBearerAccessToken(request.headers.get("authorization"));
  let supabase;

  try {
    supabase = await getSupabaseServerClient(accessToken);
  } catch (error) {
    return runtimeFailureResponse(error);
  }

  if (!supabase) {
    return fixtureWriteDisabledResponse();
  }

  let member;

  try {
    member = await getCurrentMember(supabase, accessToken);
  } catch (error) {
    return runtimeFailureResponse(error);
  }

  if (!member) {
    return NextResponse.json({ error: "Sign in as an active committee member to open documents", code: "ACTIVE_MEMBER_REQUIRED" }, { status: 401 });
  }

  try {
    const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const documentId = requiredText(payload.documentId, "Document");
    const expiresIn = expiresInSeconds(payload.expiresIn);

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("id,title,storage_path,committee_id")
      .eq("id", documentId)
      .eq("committee_id", member.committee_id)
      .maybeSingle();

    if (documentError) {
      throw documentError;
    }

    if (!document) {
      throw new PublicRequestError("DOCUMENT_NOT_FOUND", "Document was not found in your committee", 404);
    }

    const { data: attachment, error: attachmentError } = await supabase
      .from("attachments")
      .select("id,file_name,file_path,file_type,motion_id")
      .eq("document_id", documentId)
      .eq("committee_id", member.committee_id)
      .maybeSingle();

    if (attachmentError) {
      throw attachmentError;
    }

    const objectPath = attachment?.file_path
      ?? document.storage_path?.replace(`${DOCUMENT_BUCKET}/`, "");

    if (!objectPath) {
      throw new PublicRequestError("DOCUMENT_NOT_FOUND", "Document was not found in your committee", 404);
    }

    const { data: signed, error: signedError } = await supabase.storage
      .from(DOCUMENT_BUCKET)
      .createSignedUrl(objectPath, expiresIn);

    if (signedError || !signed?.signedUrl) {
      throw signedError ?? new Error("Signed URL was not created");
    }

    return NextResponse.json(
      {
        mode: "supabase",
        id: document.id,
        fileName: attachment?.file_name ?? document.title,
        fileType: attachment?.file_type ?? null,
        motionId: attachment?.motion_id ?? null,
        expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
        url: signed.signedUrl,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return operationFailureResponse(error, {
      code: "DOCUMENT_OPEN_FAILED",
      message: "The document could not be opened.",
    });
  }
}
