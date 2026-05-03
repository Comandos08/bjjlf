## Plan — Standalone /diploma-request page

### 1. Dependencies & connections
- Install `@paypal/react-paypal-js` via bun.
- Link the existing **BJJLF - Diplomas** Google Sheets connector to the project so `LOVABLE_API_KEY` + `GOOGLE_SHEETS_API_KEY` are available server-side.
- Confirm with user: the **Google Sheet ID** + **tab/sheet name** to append rows to (need this before wiring server function).

### 2. New files
```
src/routes/diploma-request.tsx            # TanStack route, head meta, no nav link
src/pages/DiplomaRequest.tsx              # Page UI (form, language bar, price, PayPal, success)
src/lib/diploma-i18n.ts                   # 5-language dictionary (PT/EN/ES/IT/DE) + belt names
src/lib/diploma-pricing.ts                # belt → price group, currency table
src/server/diploma.functions.ts           # createServerFn: append row to Google Sheet via gateway
src/server/diploma.server.ts              # gateway helper (fetch wrapper for sheets values:append)
```
No existing files modified — route is not added to navbar/footer (TanStack auto-registers via routeTree.gen.ts only).

### 3. Page UI (BJJLF design system)
- Black `#0F0F0F` bg, red `#C41E3A` accents, gold `#B8960C` highlights, **zero border-radius** everywhere.
- Header: centered Logo (dragon + BJJLF), translated H1 in Barlow Condensed 900, fixed subtitle "Mestre Sergio Malibu · Faixa Coral 8° DAN".
- Language bar: 5 flag-buttons (PT/EN/ES/IT/DE), default EN, active = gold bg + black text. Updates state via React context (no reload).
- Price table: 4 rows (Preta / Marrom-Roxa / Azul-Verde / Até Laranja) × 3 currencies. Active currency column highlighted.
- Currency toggle (BRL/EUR/USD) above PayPal section; selecting a belt + currency renders a live "selected belt swatch + name + price" card.

### 4. Form (zero-radius, dark inputs `#111`, gold labels, red `*`)
Sections in order:
1. Contact — Email, WhatsApp, Affiliate Code
2. Personal — First Name, Last Name, DOB, ID Doc Number, Sex (radio M/F), Father, Mother (optional)
3. Jiu-Jitsu — Martial Art (locked = BJJ), Belt (full IBJJF list incl. Black 1°–7°, Coral 8°/9°, Red 9°), Currency

Validation with **zod**: required fields, email format, WhatsApp regex (+digits). On submit attempt with errors → red border on invalid fields, scroll to first. PayPal buttons disabled until form is valid (live recomputed).

### 5. Belt list & pricing groups
```
Preta group:        Black 1°–7°, Coral 8°, Coral 9°, Red 9°    → 300 / 55 / 60
Marrom/Roxa:        Brown, Purple                              → 250 / 45 / 50
Azul/Verde:         Blue, Green                                → 200 / 35 / 40
Até Laranja:        White, Grey, Yellow, Orange                → 150 / 25 / 30
```

### 6. PayPal integration
- `<PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID, currency, intent: "capture" }}>` re-keyed on currency change so SDK reloads with right currency.
- `<PayPalButtons createOrder>`: amount = computed price, description `BJJLF Diploma Certificate — {beltName}`.
- `onApprove`: call server fn `submitDiplomaRequest({ formData, paypalOrderId, amount, currency })`. On success → switch to success screen.

### 7. Server function → Google Sheets
`submitDiplomaRequest` (createServerFn POST):
- Validates payload with zod.
- POSTs to `https://connector-gateway.lovable.dev/google_sheets/v4/spreadsheets/{SHEET_ID}/values/{TAB}!A:S:append?valueInputOption=USER_ENTERED` with headers `Authorization: Bearer ${LOVABLE_API_KEY}` + `X-Connection-Api-Key: ${GOOGLE_SHEETS_API_KEY}`.
- Row columns (in order): Timestamp, First Name, Last Name, Email, WhatsApp, Affiliate Code, DOB, Sex, Document Number, Father, Mother, Belt, Martial Art, Language, Currency, Price, Payment Status="PAID", Diploma Created="NO", Diploma Sent="NO".

### 8. Success screen
Replaces form on success: gold check icon, translated title + body confirming registration, payment received, team will process and send diploma by email.

### 9. i18n
Lightweight typed dictionary `diploma-i18n.ts` with 5 locales × all keys (page title, section titles, every field label, every belt name, currency labels, privacy note, success). Local React context — does not touch the existing `src/lib/i18n.tsx`.

### 10. Routing & SEO
`createFileRoute("/diploma-request")` with `head()` providing title/description per default EN. Not added to Navbar/Footer. `robots: noindex` to keep it unlisted.

### Open question (need before implementation)
What is the **Google Sheet ID** (the long string in the sheet URL) and the **tab name** where rows should be appended? I'll wire those into the server function once you share them.
