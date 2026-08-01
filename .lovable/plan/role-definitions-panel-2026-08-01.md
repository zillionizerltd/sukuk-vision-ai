# Role Definitions Panel

Add an in-app reference panel that explains what each platform role can do and which modules it can access, so admins can make informed decisions when assigning roles and users can understand their own permissions.

## What to build

1. **Reusable `RoleDefinitionsPanel` component**
   - Location: `src/components/admin/RoleDefinitionsPanel.tsx`
   - Displays every role (`admin`, `advisor`, `auditor`, `investor`, `member`) in a card/grid layout.
   - For each role shows:
     - Role name + tone-coded Pill (`admin` = gold, `advisor` = info, others = neutral)
     - One-line summary of its purpose
     - Bullet list of permissions (read/write, modules accessible, admin-only actions)
     - Module access tags (e.g. Dashboard, Documents, Milestones, Tasks, Compliance, Risks, AI Advisor, Reports, Settings, Audit Trail)

2. **Integrate on the User Roles page (`/users`)**
   - Add the panel below the Members table and above the Organisations card.
   - Heading: "Role definitions" with a `ShieldCheck` or `Info` icon.
   - Keep it visible only to admins (the page is already admin-only).

3. **Enhance the Profile page (`/profile`)**
   - In the Roles section, show a short description of each role the current user holds.
   - Link or expand to the full definitions panel so users can understand their own access.

## Content to display

```text
admin     → Full platform control. Manage users, organisations, folder access, roles; bypass all route guards; write access everywhere.
advisor   → Write access across modules. Can create/edit tasks, milestones, compliance, risks, financials, reports, structures, documents.
          → Agrofeed Global users receive this role automatically.
auditor   → Read-only viewer with access to the Audit Trail and all records. Cannot create or edit data.
investor  → Read-only viewer with access to documents, milestones, tasks, financials, reports and AI Advisor. Cannot edit or comment.
member    → Default read-only access. Can view documents (subject to folder permissions), milestones and tasks, and add comments.
```

Module access matrix:
- admin: all modules + user/org management + folder access management
- advisor: all collaboration and data modules (no user/org admin)
- auditor: read all + Audit Trail
- investor: read documents, milestones, tasks, financials, reports, AI Advisor
- member: read documents (folder-scoped), milestones, tasks; can comment

## Technical notes

- No database changes required.
- Use existing `Card`, `Pill`, and Lucide icons from the project design system.
- Keep all text in the component; no new env vars or server functions.
- Ensure the panel is responsive (stack on mobile, grid on desktop).
