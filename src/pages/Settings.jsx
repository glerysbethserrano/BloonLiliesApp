import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  async function load() {
    const { data } = await supabase.from('products').select('*').order('name')
    setProducts(data || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function addProduct(e) {
    e.preventDefault()
    if (!name.trim()) return
    await supabase.from('products').insert({ name: name.trim(), default_description: desc.trim() })
    setName('')
    setDesc('')
    load()
  }

  async function removeProduct(id) {
    if (!window.confirm('¿Eliminar esta decoración de la lista? Las cotizaciones ya creadas no se afectan.')) return
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-1">Decoraciones</h2>
      <p className="text-sm text-ink/40 mb-5">
        Esta es la lista que aparece al crear una cotización o factura. Añade, edita o elimina según lo que ofreces.
      </p>

      <form onSubmit={addProduct} className="bg-white border border-ink/10 rounded-xl p-4 space-y-3 mb-5">
        <div>
          <label>Nombre de la decoración</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Arco orgánico" />
        </div>
        <div>
          <label>Descripción por defecto (opcional)</label>
          <textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Se rellena automáticamente, pero se puede editar en cada documento" />
        </div>
        <button type="submit" className="w-full bg-magenta text-white font-medium rounded-xl py-3">
          Añadir decoración
        </button>
      </form>

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="bg-white border border-ink/10 rounded-xl p-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{p.name}</p>
              {p.default_description && <p className="text-xs text-ink/40 mt-0.5">{p.default_description}</p>}
            </div>
            <button onClick={() => removeProduct(p.id)} className="text-ink/30 text-xl">×</button>
          </div>
        ))}
      </div>
    </div>
  )
}
