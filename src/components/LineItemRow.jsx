import { useState } from 'react'

export default function LineItemRow({ item, products, onChange, onRemove, disabled }) {
  const [useCustom, setUseCustom] = useState(
  !!item.product_name && !products.some((p) => p.name === item.product_name)
)

  function handleProductSelect(value) {
    if (value === '__custom__') {
      setUseCustom(true)
      onChange({ ...item, product_name: '' })
      return
    }
    setUseCustom(false)
    const preset = products.find((p) => p.name === value)
    onChange({
      ...item,
      product_name: value,
      description: preset?.default_description || item.description,
    })
  }

  return (
    <div className="bg-white border border-ink/10 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <label>Decoración</label>
          {useCustom ? (
            <input
              type="text"
              placeholder="Nombre de la decoración"
              value={item.product_name}
              disabled={disabled}
              onChange={(e) => onChange({ ...item, product_name: e.target.value })}
            />
          ) : (
            <select value={item.product_name} disabled={disabled} onChange={(e) => handleProductSelect(e.target.value)}>
              <option value="">Selecciona…</option>
              {products.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
              <option value="__custom__">Otro (escribir)…</option>
            </select>
          )}
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={onRemove}
            className="text-ink/30 text-xl px-1 mt-6"
            aria-label="Eliminar"
          >
            ×
          </button>
        )}
      </div>

      <div>
        <label>Descripción</label>
        <textarea
          rows={2}
          value={item.description}
          disabled={disabled}
          onChange={(e) => onChange({ ...item, description: e.target.value })}
        />
      </div>

      <div className="w-28">
        <label>Cantidad</label>
        <input
          type="number"
          min="0"
          step="1"
          value={item.quantity}
          disabled={disabled}
          onChange={(e) => onChange({ ...item, quantity: e.target.value })}
        />
      </div>
    </div>
  )
}
