import { useMemo } from 'react'
import LineItemRow from './LineItemRow'
import { computeBalance, formatMoney } from '../lib/calc'

let tempId = 0
export function blankItem() {
  tempId += 1
  return { id: `temp-${tempId}`, product_name: '', description: '', quantity: 1 }
}

export default function DocumentForm({ doc, setDoc, items, setItems, products, disabled }) {
  const balance = useMemo(() => computeBalance(doc.total, doc.deposit), [doc.total, doc.deposit])

  function updateField(field, value) {
    setDoc({ ...doc, [field]: value })
  }

  function updateItem(index, updated) {
    const next = [...items]
    next[index] = updated
    setItems(next)
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="font-display font-semibold text-ink/80 text-sm tracking-wide uppercase">Cliente</h2>
        <div>
          <label>Nombre del cliente</label>
          <input type="text" value={doc.client_name} disabled={disabled} onChange={(e) => updateField('client_name', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>Teléfono</label>
            <input type="tel" value={doc.client_phone} disabled={disabled} onChange={(e) => updateField('client_phone', e.target.value)} />
          </div>
          <div>
            <label>Correo</label>
            <input type="email" value={doc.client_email} disabled={disabled} onChange={(e) => updateField('client_email', e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display font-semibold text-ink/80 text-sm tracking-wide uppercase">Evento</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>Fecha del evento</label>
            <input type="date" value={doc.event_date || ''} disabled={disabled} onChange={(e) => updateField('event_date', e.target.value)} />
          </div>
          <div>
            <label>Tema</label>
            <input type="text" value={doc.theme} disabled={disabled} onChange={(e) => updateField('theme', e.target.value)} />
          </div>
        </div>
        <div>
          <label>Ubicación</label>
          <input type="text" value={doc.location} disabled={disabled} onChange={(e) => updateField('location', e.target.value)} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-ink/80 text-sm tracking-wide uppercase">Decoraciones</h2>
          {!disabled && (
            <button
              type="button"
              onClick={() => setItems([...items, blankItem()])}
              className="text-magenta text-sm font-medium"
            >
              + Añadir
            </button>
          )}
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <LineItemRow
              key={item.id}
              item={item}
              products={products}
              disabled={disabled}
              onChange={(updated) => updateItem(i, updated)}
              onRemove={() => removeItem(i)}
            />
          ))}
          {items.length === 0 && <p className="text-ink/40 text-sm">Aún no has añadido decoraciones.</p>}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display font-semibold text-ink/80 text-sm tracking-wide uppercase">Financiero</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>Subtotal</label>
            <input type="number" step="0.01" min="0" value={doc.subtotal} disabled={disabled} onChange={(e) => updateField('subtotal', e.target.value)} />
          </div>
          <div>
            <label>Total</label>
            <input type="number" step="0.01" min="0" value={doc.total} disabled={disabled} onChange={(e) => updateField('total', e.target.value)} />
          </div>
        </div>
        <div>
          <label>Depósito</label>
          <input type="number" step="0.01" min="0" value={doc.deposit} disabled={disabled} onChange={(e) => updateField('deposit', e.target.value)} />
        </div>
        <div className="bg-magenta-light rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-magenta">Balance restante</span>
          <span className="font-display font-bold text-magenta">{formatMoney(balance)}</span>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display font-semibold text-ink/80 text-sm tracking-wide uppercase">Notas</h2>
        <textarea
          rows={3}
          value={doc.notes}
          disabled={disabled}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Ej: Se requiere depósito para separar la fecha. No es reembolsable."
        />
      </section>
    </div>
  )
}
