# Bloon Lilies — Cotizaciones & Facturas

A simple mobile-friendly app to replace the Canva template: fill a form, hit
**Generate**, get a branded PDF, and see every past quote/invoice in one place.

Everything is already built and tested (it compiles with `npm run build`).
What's left is 100% account setup — no coding — and should take well under
a week. Most of it is 15 minutes of clicking through Supabase and Netlify.

---

## How it works

- **Cotización (quote):** created from the form, starts as an editable draft.
- **Convert to invoice:** once a client agrees, open the quote and tap
  "Convertir a factura." It's now a draft invoice — still editable, so you
  can add anything that changed.
- **Generar factura y bloquear:** locks it and creates the final invoice PDF.
  The original quote PDF is never overwritten — both stay downloadable
  forever from the document's page.
- **Historial:** every quote/invoice ever made, filterable by type, status,
  or client name.
- **Ajustes:** the list of decoration presets (arco orgánico, columna, etc.)
  that show up as dropdown options on the form — editable any time.

---

## Step 1 — Create a free Supabase project (~5 min)

Supabase is the database + login system. Free tier is plenty for this.

1. Go to [supabase.com](https://supabase.com) → sign up → **New project**.
2. Name it `bloon-lilies`, set a database password (save it somewhere), pick
   a region close to Virginia/Puerto Rico (e.g. `us-east-1`).
3. Wait ~2 minutes for it to spin up.

## Step 2 — Run the database schema (~2 min)

1. In the Supabase dashboard, open **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this project, paste the whole file in,
   and click **Run**.
3. This creates all the tables, security rules, the PDF storage bucket, and
   a starter list of decoration presets you can edit later.

## Step 3 — Create your mom's login (~2 min)

1. In Supabase, go to **Authentication → Users → Add user**.
2. Enter her email and a password. Turn off "auto confirm" only if you
   want her to verify by email first — for simplicity, leave auto-confirm on.
3. That's the email/password she'll use to log into the app on her phone.

> This app is single-user by design (just her). If you ever want to add a
> second login (e.g. for yourself), just add another user the same way.

## Step 4 — Connect the code to your project (~2 min)

1. In Supabase, go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. In this project folder, copy `.env.example` to a new file named `.env`,
   and paste the two values in:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

## Step 5 — Try it locally (optional, ~5 min)

If you have Node.js installed:
```bash
npm install
npm run dev
```
Open the printed `localhost` link, log in with the account from Step 3, and
create a test quote.

## Step 6 — Deploy to Netlify (~5 min)

1. Push this folder to a GitHub repo (or drag-and-drop deploy if you prefer —
   Netlify supports both).
2. In Netlify: **Add new site → Import from Git** → pick the repo.
3. Build command: `npm run build`. Publish directory: `dist`.
4. Under **Site settings → Environment variables**, add the same two
   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` values from Step 4.
5. Deploy. Netlify gives you a URL — that's the website. Add it to her
   phone's home screen (Share → Add to Home Screen) so it opens like an app.

---

## Customizing before you hand it off

- **Colors/fonts:** `tailwind.config.js` (app UI) and
  `src/pdf/DocumentPDF.jsx` (the PDF) both use a `COLORS`/theme object at the
  top — I used a black/gold/magenta palette pulled from the new logo. Adjust
  the hex values there if you want them closer to your exact brand kit.
- **Contact info on the PDF:** `src/lib/business.js` — name, phone, email,
  Instagram handle.
- **Logo:** `src/assets/monogram.png` and `logo-full.png`, already extracted
  and trimmed from the file you sent. Swap them for a higher-res export from
  your design file any time for crisper PDFs.
- **Decoration presets:** don't touch the code — just use the **Ajustes**
  page in the app itself once it's live.

## What "locked" actually means

Locking is enforced at two levels: the form fields become disabled once
`locked = true`, and the invoice PDF already generated is untouched in
storage either way. If your mom truly needs to fix a mistake on a locked
invoice, there's a "Desbloquear para editar" link — it requires confirming
first, and she has to hit "Generar factura y bloquear" again afterward to
re-lock it and produce a corrected PDF.

## Suggested week plan

| Day | Task |
|---|---|
| 1 | Steps 1–4 above (Supabase + env vars) |
| 2 | Step 6 (Netlify deploy), confirm login works on her phone |
| 3 | Fill in real decoration presets in Ajustes, adjust colors/contact info |
| 4–5 | Create a few real quotes together so she gets comfortable with the flow |
| 6 | Walk her through convert-to-invoice + history filtering |
| 7 | Buffer / polish |
