import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import StatusBadge from '../components/StatusBadge'
import { formatMoney, formatDate } from '../lib/calc'

export default function History({ onOpen }) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    let query = supabase.from('documents').select('*').order('created_at', { ascending: false })
    if (typeFilter !== 'all') query = query.eq('type', typeFilter)
    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    const { data } = await query
    setDocs(data || [])
    setLoading(false)
  }

  async function deleteDoc(id, e) {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar este documento permanentemente? Esta acción no se puede deshacer.')) return
    await supabase.from('documents').delete().eq('id', id)
    load()
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter])

  const filtered = docs.filter((d) =>
    d.client_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-4">Historial</h2>

      <input
        type="text"
        placeholder="Buscar por cliente…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
      />

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {[
          ['all', 'Todos'],
          ['quote', 'Cotizaciones'],
          ['invoice', 'Facturas'],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTypeFilter(val)}
            className={`shrink-0 text-sm px-3 py-1.5 rounded-full border ${
              typeFilter === val ? 'bg-ink text-white border-ink' : 'border-ink/15 text-ink/60'
            }`}
          >
            {label}
          </button>
        ))}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="!w-auto !py-1.5 !text-sm">
          <option value="all">Cualquier estado</option>
          <option value="draft">Borrador</option>
          <option value="sent">Enviada</option>
          <option value="accepted">Aceptada</option>
          <option value="declined">Rechazada</option>
          <option value="partial">Depósito pagado</option>
          <option value="paid">Pagada</option>
        </select>
      </div>

      {loading && <p className="text-ink/40 text-sm">Cargando…</p>}
      {!loading && filtered.length === 0 && (
        <p className="text-ink/40 text-sm">No hay documentos que coincidan.</p>
      )}

      <div className="space-y-2">
        {filtered.map((d) => (
          <div key={d.id} className="relative bg-white border border-ink/10 rounded-xl p-4">
  <button
    onClick={() => onOpen(d.id)}
    className="w-full text-left flex items-center justify-between pr-6"
    >
      <div>
        <p className="font-medium">{d.client_name}</p>
        <p className="text-xs text-ink/40">
          {d.doc_number} · {d.type === 'invoice' ? 'Factura' : 'Cotización'}
          {d.event_date ? ` · ${formatDate(d.event_date)}` : ''}
        </p>
      </div>
      <div className="text-right">
        <p className="font-display font-semibold">{formatMoney(d.total)}</p>
        <StatusBadge status={d.status} />
      </div>
    </button>
    <button
      onClick={(e) => deleteDoc(d.id, e)}
      className="absolute top-3 right-3 text-ink/25 text-lg"
      aria-label="Eliminar"
    >
      ×
    </button>
  </div>
        ))}
      </div>
    </div>
  )
}
