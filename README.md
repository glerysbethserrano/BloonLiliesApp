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
