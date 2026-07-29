import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { toMoney, computeBalance } from '../lib/calc'
import { generateAndStorePdf, downloadBlob, getSignedUrl } from '../lib/pdfActions'
import DocumentForm from '../components/DocumentForm'
import StatusBadge from '../components/StatusBadge'

export default function DocumentView({ docId, onBack }) {
  const [doc, setDoc] = useState(null)
  const [items, setItems] = useState([])
  const [products, setProducts] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const { data: d } = await supabase.from('documents').select('*').eq('id', docId).single()
    const { data: li } = await supabase.from('line_items').select('*').eq('document_id', docId).order('sort_order')
    const { data: p } = await supabase.from('products').select('*').order('name')
    setDoc(d)
    setItems(li || [])
    setProducts(p || [])
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId])

  if (!doc) return <p className="text-ink/40 text-sm">Cargando…</p>

  const disabled = doc.locked

  async function saveEdits() {
    setBusy(true)
    setError('')
    try {
      const total = toMoney(doc.total)
      const subtotal = toMoney(doc.subtotal || total)
      const deposit = toMoney(doc.deposit)
      const balance = computeBalance(total, deposit)

      await supabase
        .from('documents')
        .update({
          client_name: doc.client_name,
          client_phone: doc.client_phone,
          client_email: doc.client_email,
          event_date: doc.event_date || null,
          location: doc.location,
          theme: doc.theme,
          subtotal,
          total,
          deposit,
          balance,
          notes: doc.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', doc.id)

      await supabase.from('line_items').delete().eq('document_id', doc.id)
      if (items.length) {
        await supabase.from('line_items').insert(
          items.map((it, i) => ({
            document_id: doc.id,
            product_name: it.product_name,
            description: it.description,
            quantity: Number(it.quantity) || 0,
            sort_order: i,
          }))
        )
      }

      // Regenerate the quote PDF so it reflects these edits — otherwise
      // "Descargar cotización" would keep serving the original, stale file.
      if (doc.type === 'quote') {
        const { data: freshDoc } = await supabase.from('documents').select('*').eq('id', doc.id).single()
        const { data: freshItems } = await supabase.from('line_items').select('*').eq('document_id', doc.id).order('sort_order')
        const { path } = await generateAndStorePdf(freshDoc, freshItems, 'quote')
        await supabase.from('documents').update({ quote_pdf_path: path }).eq('id', doc.id)
      }

      await load()
    } catch (e) {
      console.error(e)
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  const INVOICE_NOTE =
    '¡Gracias por confiar en nosotros! Todo fue hecho con mucho cariño y detalle para su disfrute. No olvides taguearnos en sus fotos. 🎈'

  async function convertToInvoiceDraft() {
    setBusy(true)
    await supabase
      .from('documents')
      .update({ type: 'invoice', notes: INVOICE_NOTE })
      .eq('id', doc.id)
    await load()
    setBusy(false)
  }

  async function generateInvoiceAndLock() {
    setBusy(true)
    setError('')
    try {
      await saveEdits()
      const { data: fresh } = await supabase.from('documents').select('*').eq('id', doc.id).single()
      const { data: li } = await supabase.from('line_items').select('*').eq('document_id', doc.id).order('sort_order')
      const { blob, path } = await generateAndStorePdf(fresh, li, 'invoice')
      await supabase
        .from('documents')
        .update({ invoice_pdf_path: path, locked: true, status: fresh.status === 'draft' ? 'sent' : fresh.status })
        .eq('id', doc.id)
      const safeName = fresh.client_name.trim().replace(/[^a-zA-Z0-9]+/g, '-')
      downloadBlob(blob, `${doc.doc_number}-${safeName}.pdf`)
      await load()
    } catch (e) {
      console.error(e)
      setError('No se pudo generar la factura. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  async function unlockToEdit() {
    if (!window.confirm('¿Desbloquear esta factura para editarla? Deberás generarla de nuevo para volver a bloquearla.')) return
    setBusy(true)
    await supabase.from('documents').update({ locked: false }).eq('id', doc.id)
    await load()
    setBusy(false)
  }

  async function downloadExisting(kind) {
    const path = kind === 'invoice' ? doc.invoice_pdf_path : doc.quote_pdf_path
    if (!path) return
    const url = await getSignedUrl(path)
    window.open(url, '_blank')
  }

  async function changeStatus(status) {
    await supabase.from('documents').update({ status }).eq('id', doc.id)
    load()
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm text-ink/50 mb-3">← Volver al historial</button>

      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-2xl font-bold">{doc.doc_number}</h2>
        <StatusBadge status={doc.status} />
      </div>
      <p className="text-sm text-ink/40 mb-5">
        {doc.type === 'invoice' ? 'Factura' : 'Cotización'} {doc.locked ? '· Bloqueada' : '· Editable'}
      </p>

      <div className="mb-5">
        <label>Estado</label>
        <select value={doc.status} onChange={(e) => changeStatus(e.target.value)}>
          <option value="draft">Borrador</option>
          <option value="sent">Enviada</option>
          <option value="accepted">Aceptada</option>
          <option value="declined">Rechazada</option>
          <option value="partial">Depósito pagado</option>
          <option value="paid">Pagada</option>
        </select>
      </div>

      <DocumentForm doc={doc} setDoc={setDoc} items={items} setItems={setItems} products={products} disabled={disabled} />

      {error && <p className="text-magenta text-sm mt-4">{error}</p>}

      <div className="space-y-2 mt-6">
        {!disabled && (
          <button onClick={saveEdits} disabled={busy} className="w-full bg-ink text-white font-medium rounded-xl py-3.5 disabled:opacity-50">
            Guardar cambios
          </button>
        )}

        {doc.type === 'quote' && doc.quote_pdf_path && (
          <button onClick={() => downloadExisting('quote')} className="w-full border border-ink/15 text-ink font-medium rounded-xl py-3.5">
            Descargar cotización (PDF)
          </button>
        )}
        {doc.invoice_pdf_path && (
          <button onClick={() => downloadExisting('invoice')} className="w-full border border-ink/15 text-ink font-medium rounded-xl py-3.5">
            Descargar factura (PDF)
          </button>
        )}

        {doc.type === 'quote' && !disabled && (
          <button onClick={convertToInvoiceDraft} disabled={busy} className="w-full bg-gold text-white font-medium rounded-xl py-3.5 disabled:opacity-50">
            Convertir a factura
          </button>
        )}

        {doc.type === 'invoice' && !disabled && (
          <button onClick={generateInvoiceAndLock} disabled={busy} className="w-full bg-magenta text-white font-medium rounded-xl py-3.5 disabled:opacity-50">
            {busy ? 'Generando…' : 'Generar factura y bloquear'}
          </button>
        )}

        {doc.locked && (
          <button onClick={unlockToEdit} disabled={busy} className="w-full text-magenta text-sm underline underline-offset-2 py-2">
            Desbloquear para editar
          </button>
        )}
      </div>
    </div>
  )
}
