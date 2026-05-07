# Build Public /athletes Directory

Replace the `ComingSoon` placeholder in `src/pages/Athletes.tsx` with a real, filterable athlete directory backed by the `athlete_profiles` table (status = 'active'). Match the visual language already established by `Rankings.tsx` (PageHero, Barlow Condensed headings, square corners, gold accents, dark background).

## Scope

### 1. `src/pages/Athletes.tsx` — full rewrite

- **Data**: TanStack Query `["athletes", "public"]` → `supabase.from("athlete_profiles").select("id,full_name,belt,degree,academy,country,country_flag,photo_url,registration_number").eq("status","active").order("full_name")`. RLS already permits this for the athlete's own row only — but we'll rely on the existing public read pattern; if no rows surface for anonymous users, fall back to a `verify_athletes_public` style and surface that as a follow-up. (Note: current RLS on `athlete_profiles` does NOT have a public SELECT policy — see "Open question" below.)
- **Hero**: `<PageHero kicker="BJJLF" title={t("athletes.title")} desc={t("athletes.subtitle")} />`.
- **Controls bar** (border-bottom, mb-6):
  - Search input — full-width on mobile, `w-[400px]` desktop, `borderRadius: 0`, dark-2 bg, gold focus border. Filters `full_name` client-side, case-insensitive, debounced 200 ms via `useDeferredValue`.
  - Belt `FilterSelect` — White/Blue/Purple/Brown/Black + All. Uses same `normalizeBelt` helper as Rankings.
  - Country `FilterSelect` — derived from `Array.from(new Set(rows.map(r => r.country)))` sorted.
- **Grid**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.
- **Card** (border `white/10`, bg `dark-2`, square corners):
  - Top: photo (`aspect-square object-cover`) or fallback initials block (gold on dark-2, Barlow Condensed 900).
  - Body: full_name (Barlow Condensed 800, white), `<BeltPill>` (extracted from Rankings, includes degree count if degree > 0 as small dots), academy (gray-400, Barlow), `flag + country` line, `registration_number` (xs, gray-500, mono-ish via Barlow Condensed).
  - Footer button: full-width, gold border, "Ver Perfil" / "View Profile" → `Link to="/verify/$registrationNumber"` with `params={{ registrationNumber: r.registration_number }}`. Hidden if `registration_number` is null.
- **Empty state**: bordered block, `t("athletes.empty")`.
- **Loading**: skeleton grid (6 placeholder cards).

### 2. `src/lib/i18n.tsx` — add keys

In both PT and EN sections (after the rankings block):
- `athletes.title` — "Atletas" / "Athletes"
- `athletes.subtitle` — "Diretório oficial de atletas registrados na BJJLF." / "Official directory of BJJLF registered athletes."
- `athletes.search.placeholder` — "Buscar por nome..." / "Search by name..."
- `athletes.filters.belt` — "Faixa" / "Belt"
- `athletes.filters.country` — "País" / "Country"
- `athletes.filters.all` — reuse existing `rankings.filters.all` (no new key)
- `athletes.empty` — "Nenhum atleta encontrado" / "No athletes found"
- `athletes.card.viewProfile` — "Ver Perfil" / "View Profile"

### 3. Shared helper (inline for now)

`BeltPill` and `normalizeBelt` are duplicated from Rankings to keep this PR scoped. A future refactor can move them to `src/components/BeltPill.tsx`.

## Open question / risk

The `athlete_profiles` table has **no `public` SELECT RLS policy** — only authenticated admins and the athlete themselves can read rows. A public anonymous visitor will get an empty array. Two options to unblock the directory:

- **A. Add a migration** with `CREATE POLICY "Public can read active athletes" ON athlete_profiles FOR SELECT TO public USING (status = 'active');` exposing only name, belt, degree, academy, country, photo, registration_number to anon. Simple, but leaks all active athlete columns.
- **B. Create a SECURITY DEFINER function** `list_public_athletes()` returning only the safe columns, and call it via `supabase.rpc(...)`. Safer, more code.

The plan as written assumes **Option A** (simpler, matches the pattern used for `affiliated_academies`, `certified_black_belts`, `rankings`). I will include the migration. Confirm or switch to B before approving.

## Files touched

- `src/pages/Athletes.tsx` (rewrite)
- `src/lib/i18n.tsx` (add ~7 keys × 2 languages)
- `supabase/migrations/<timestamp>_athletes_public_read.sql` (Option A)
