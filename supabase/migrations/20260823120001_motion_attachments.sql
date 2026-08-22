-- Issue #1: additive motion↔document relation for v1 attach/open.
-- Does not replace card/document attachment behaviour. Draft and open motions
-- may receive attachments; terminal motions are rejected by both this policy
-- and the document create route.

alter table public.attachments
  add column if not exists motion_id uuid references public.motions(id) on delete set null;

create index if not exists attachments_motion_id_idx on public.attachments (motion_id);

drop policy if exists "capability creates attributed attachments" on public.attachments;
create policy "capability creates attributed attachments" on public.attachments for insert to authenticated
with check (
  app_private.has_capability(committee_id, 'write_records')
  and uploader_member_id = app_private.current_member_id(committee_id)
  and (
    card_id is null
    or exists (
      select 1 from public.cards card
      where card.id = attachments.card_id
        and card.committee_id = attachments.committee_id
        and app_private.can_access_card(card.id)
    )
  )
  and (
    document_id is null
    or exists (
      select 1 from public.documents document
      where document.id = attachments.document_id
        and document.committee_id = attachments.committee_id
        and app_private.can_access_document(document.id)
    )
  )
  and (
    motion_id is null
    or exists (
      select 1 from public.motions motion
      where motion.id = attachments.motion_id
        and motion.committee_id = attachments.committee_id
        and app_private.is_committee_member(motion.committee_id)
        and motion.status in ('draft', 'open')
    )
  )
);
