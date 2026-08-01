# Admin-managed organisations

Today the five organisations (Agrofeed Global, Tesserant Capital, Al Huda CIBE, Sharia Supervisory Board, External Legal Counsel) are hardcoded as lists in the sign-up page, the User Roles page, and the Tasks page. Adding a stakeholder means a code change. This makes the organisation list real data that admins manage from the app.

## What admins get

- A new "Organisations" card on the User Roles page listing every organisation.
- Add an organisation: name, plus an optional toggle "can access Milestones & Tasks" (what the partner orgs get today).
- Rename or delete an organisation. Deleting is blocked with an inline message when members are still assigned to it, so nobody loses access silently.
- Every organisation dropdown in the app (sign-up, member assignment, folder access, task creation) is fed by this list, so a new organisation is instantly selectable everywhere.

## What stays the same

- Agrofeed Global keeps full access and all folders; it can't be deleted or have its access toggle removed.
- Folder access, roles, and all existing permissions keep working exactly as now.
- Existing five organisations are pre-loaded, so nothing changes visually on first load.

## Technical notes

- New table `public.organisations`: `id`, `name` (unique, case-insensitive), `slug`, `partner_access boolean default false`, `is_protected boolean` (true for Agrofeed Global), timestamps + `set_updated_at` trigger. Grants: `SELECT, INSERT, UPDATE, DELETE` to `authenticated`, `ALL` to `service_role`. RLS: read for all authenticated users; write only via `has_role(auth.uid(), 'admin')`; delete additionally blocked for `is_protected` rows. Seeded with the current five orgs, `partner_access = true` for Tesserant Capital and Al Huda CIBE.
- Sign-up needs the list before login, so add a narrow `GRANT SELECT ... TO anon` plus an anon SELECT policy exposing name/partner flag only.
- New `src/hooks/use-organisations.ts`: `useOrganisations()` query and `useCreateOrganisation` / `useUpdateOrganisation` / `useDeleteOrganisation` mutations (delete pre-checks `profiles` for members and surfaces the count inline).
- Replace hardcoded `ORGS` in `src/routes/login.tsx`, `src/routes/_app/users.tsx`, `src/routes/_app/tasks.tsx` with the hook.
- Replace the hardcoded `PARTNER_ORGS` arrays in `src/components/layout/Sidebar.tsx` and `src/routes/_app.tsx` with a lookup against `partner_access` from the hook, keeping the current behaviour for existing orgs.
- Add the "Organisations" management card to `src/routes/_app/users.tsx` (admin-only, same inline-message pattern as the roles/folder cards).
