import { supabase } from '../lib/supabase'

const TABS = [
  { key: 'new', label: 'Crear', icon: '＋' },
  { key: 'history', label: 'Historial', icon: '☰' },
  { key: 'settings', label: 'Ajustes', icon: '⚙' },
]

export default function Layout({ view, setView, children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-ink/10 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-display font-bold text-lg tracking-tight leading-none">BLOON LILIES</h1>
          <p className="text-[11px] text-ink/40 tracking-wide">Cotizaciones &amp; Facturas</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-xs text-ink/40 underline underline-offset-2"
        >
          Salir
        </button>
      </header>

      <main className="flex-1 px-5 py-5 pb-24 max-w-xl w-full mx-auto">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink/10 flex justify-around py-2 z-10">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-xl transition ${
              view === tab.key ? 'text-magenta' : 'text-ink/40'
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="text-[11px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
