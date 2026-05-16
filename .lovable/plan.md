## iKAMBA Media OS + Site Updates

Three distinct workstreams. I'll confirm before building.

### 1. Dark mode only
- Remove `ThemeToggle` from Navbar (desktop + mobile).
- Force `<html class="dark">` in `index.html` (already present) and strip light-mode toggle logic. Light tokens in `index.css` stay (harmless) but never applied.

### 2. Admin account: ikambaempireltd@gmail.com
- Seed user via migration with password `EMPIRE@IKAMBA2025`, grant `super_admin` role.
- Existing `manage-admins` edge function + `UserManager` UI already lets a super_admin add any other admin — no extra work needed beyond confirming the seed.

### 3. iKAMBA Media OS — internal operations app (MVP, mock data)

New route group `/os/*` (protected, requires login). Sidebar layout, mobile-first, Midnight Blue `#0C2C47` + Warm Gold `#D4A739`, Poppins font. Won't touch marketing site styling.

**Pages**
```
/os                  Dashboard       (10 KPI cards, upcoming shoots, pending invoices)
/os/pipeline         Kanban          (17 stages, drag-drop, project cards)
/os/projects/new     Guided form     (all spec fields, stepper)
/os/projects/:id     Detail          (11 tabs: Overview, Scope, Schedule, Tasks,
                                     Team, Quotation, Costs, Payments, Files,
                                     Notes, Activity Log)
/os/calendar         Month view + "Add to Google Calendar" button stub
/os/finance          Revenue / Expenses / Receivables / Payables / Cashflow tabs
/os/quotations       List + create modal (Draft/Sent/Approved/Rejected)
/os/team             Members list (mock + reads from user_roles)
/os/reports          Charts: revenue by product line, profit/project, overdue, workload
/os/settings         Manage product lines, services, stages, cost categories
```

**Data layer:** all mock data in `src/os/mock/` (projects, costs, payments, quotations, team). Structured so each entity matches the future Supabase schema 1-to-1 — swapping mock → real later is a search/replace on the data hook. `// TODO: replace with supabase query` comments on every hook.

**Role gating (MVP, client-side from `useAuth` roles):**
- super_admin/org_admin → everything
- project_manager → projects, pipeline, calendar, reports
- producer → assigned projects, tasks, schedule
- editor → editing-stage projects only
- finance role (new value `finance`) → finance, quotations, reports

I'll add `finance` to the `app_role` enum so Finance users exist.

**Shared components:** `OSLayout` (sidebar+topbar), `KanbanBoard`, `ProjectCard`, `KPICard`, `StatusBadge`, `PaymentBadge`, `MoneyInput`, `CostModal`, `PaymentModal`, `ScheduleModal`, `TaskChecklist`.

**Not in MVP (stubs only, clearly labelled):**
- Real Google Calendar sync (button generates `.ics` / google calendar URL only)
- File uploads (UI placeholder, no storage bucket yet)
- PDF quotation export (button shows toast)
- Email/invoice sending

### Technical summary
- New folder `src/os/` (pages, components, mock, hooks) — fully isolated from marketing site.
- One migration: add `finance` to `app_role` enum + seed super_admin user.
- Poppins added to `index.css` font import; applied only inside `/os/*` via a wrapper class so marketing typography is untouched.
- Tailwind: add `os-navy` `#0C2C47` and `os-gold` `#D4A739` as semantic tokens scoped to `.os-theme`.

Reply **"go"** and I'll build it in one pass.
