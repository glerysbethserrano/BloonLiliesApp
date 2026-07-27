import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { nextDocNumber, toMoney, computeBalance } from '../lib/calc'
import { generateAndStorePdf, downloadBlob } from '../lib/pdfActions'
import DocumentForm, { blankItem } from '../components/DocumentForm'

const emptyDoc = () => ({
  client_name: '',
  client_phone: '',
  client_email: '',
  event_date: '',
  location: '',
  theme: '',
  subtotal: '',
  total: '',
  deposit: '',
  notes: 'Se requiere depósito para separar la fecha. El mismo no es reembolsable. Se debe saldar el balance el día antes de la actividad.',
})

export default function NewDocument({ onCreated }) {
  const [doc, setDoc] = useState(emptyDoc())
  const [items, setItems] = useState([blankItem()])
  const [products, setProducts] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('products').select('*').order('name').then(({ data }) => setProducts(data || []))
  }, [])

  function reset() {
    setDoc(emptyDoc())
    setItems([blankItem()])
  }

  async function handleGenerate() {
    setError('')
    if (!doc.client_name.trim()) {
      setError('Falta el nombre del cliente.')
      return
    }
    setSaving(true)
    try {
      const { data: existing } = await supabase.from('documents').select('doc_number').eq('type', 'quote')
      const doc_number = nextDocNumber('COT-', (existing || []).map((d) => d.doc_number))

      const total = toMoney(doc.total || doc.subtotal || 0)
      const subtotal = toMoney(doc.subtotal || total)
      const deposit = toMoney(doc.deposit || 0)

      const { data: inserted, error: insertError } = await supabase
        .from('documents')
        .insert({
          doc_number,
          type: 'quote',
          status: 'draft',
          locked: false,
          client_name: doc.client_name,
          client_phone: doc.client_phone,
          client_email: doc.client_email,
          event_date: doc.event_date || null,
          location: doc.location,
          theme: doc.theme,
          subtotal,
          total,
          deposit,
          balance: computeBalance(total, deposit),
          notes: doc.notes,
        })
        .select()
        .single()
      if (insertError) throw insertError

      if (items.length) {
        const rows = items.map((it, i) => ({
          document_id: inserted.id,
          product_name: it.product_name,
          description: it.description,
          quantity: Number(it.quantity) || 0,
          sort_order: i,
        }))
        const { error: itemsError } = await supabase.from('line_items').insert(rows)
        if (itemsError) throw itemsError
      }

      const { blob, path } = await generateAndStorePdf(inserted, items, 'quote')
      await supabase.from('documents').update({ quote_pdf_path: path }).eq('id', inserted.id)
      const safeName = doc.client_name.trim().replace(/[^a-zA-Z0-9]+/g, '-')
      downloadBlob(blob, `${doc_number}-${safeName}.pdf`)

      reset()
      onCreated && onCreated(inserted.id)
    } catch (e) {
      console.error(e)
      setError('Algo salió mal generando la cotización. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-5">Nueva cotización</h2>
      <DocumentForm doc={doc} setDoc={setDoc} items={items} setItems={setItems} products={products} disabled={saving} />
      {error && <p className="text-magenta text-sm mt-4">{error}</p>}
      <button
        onClick={handleGenerate}
        disabled={saving}
        className="w-full bg-magenta text-white font-medium rounded-xl py-4 mt-6 active:scale-[0.98] transition disabled:opacity-50"
      >
        {saving ? 'Generando…' : 'Generar Cotización'}
      </button>
    </div>
  )
}
