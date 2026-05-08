## Unify Academy Registration & Permit Flow

A significant 7-step refactor merging `/register/academy` into an authenticated `/academy/permit` flow, with admin permits as the single academy control center.

### Step 1 — Database
- Migration on `academy_permits`: add `academy_logo_url`, `country_code`, `instagram`, `additional_professors jsonb`, `notes` (already has `academy_name`, `city`, `state`, `phone`, `website`).
- Add nullable `athlete_id uuid` column linking to `athlete_profiles.id`.
- Create `affiliated_academies_view` (status='active') with `GRANT SELECT TO anon, authenticated`.
- Update `useAcademies` in `src/lib/queries.ts` to read from the new view.

### Step 2 — `/academy/permit` page (full rewrite)
- Auth-guarded; redirect unauthenticated → `/athlete/login?redirect=/academy/permit`.
- Require active athlete profile; otherwise show error with link to `/register/athlete`.
- 4-step wizard reusing `Stepper`, `BeltSelector`, `ImageUploader`:
  1. Professor Responsável (read-only, from athlete profile + auth email)
  2. Dados da Academia (name, logo, city, state, country dropdown, phone, website, instagram)
  3. Outros Professores (dynamic list, optional)
  4. Revisão + termo + Submit → insert into `academy_permits` with `status='pending'`, `athlete_id`, all fields
- Success state with PT/EN message.

### Step 3 — `/register/academy` redirect
- Replace `register.academy.tsx` component with a redirect screen → `/academy/permit` (or login w/ redirect param).

### Step 4 — `/academies` public page
- Already reads via `useAcademies`; just inherits the view swap. Confirm card shape compatible (map fields).

### Step 5 — Admin permits
- `admin.permits.tsx`: extended table (Academia, Professor, Cidade/País, Logo thumbnail, Status, Solicitado, Aprovado, Expira).
- Actions: Aprovar (status=active, approved_at=now, expires_at=now+1yr, triggers existing permit_number gen), Rejeitar (status='rejected'), Revogar (status='revoked'), Ver detalhes (modal with full payload incl. additional_professors).
- Approval confirmation dialog with i18n copy.
- Validation trigger `validate_permit_status` currently only allows `pending_payment, active, expired, suspended, cancelled` — must extend to allow `pending`, `rejected`, `revoked`.
- Remove `Academias` from admin sidebar (`src/routes/admin.tsx`); keep `admin.academies.tsx` route file but unlink (or convert to read-only — easiest: just remove the nav item).

### Step 6 — Footer / Navbar
- Footer: `Afiliar Academia` → `/academy/permit`.
- Navbar: same swap in Academias dropdown.

### Step 7 — i18n
- Add PT/EN keys for all new copy (wizard steps, errors, success, admin actions, dialogs, redirect notice).

### Out of scope (untouched)
- `/members`, athlete auth, `/academies` UI, `certified_black_belts`, `/black-belts`, other admin sections, `affiliated_academies` table.

### Notes / risks
- Status enum extension requires updating the `validate_permit_status` trigger function in the same migration.
- `academy_permits.amount_cents` defaults to 30000 — kept; no payment flow added (request is free until approved). Existing `generate_academy_permit_number` trigger only fires on `status='active'`, so approval will issue the permit number automatically — good.
- View consumers: confirm `/academies` page card maps `name`, `city`, `country_code`, `logo_url`, `website`, `instagram`. May need light field-mapping in `useAcademies`.
