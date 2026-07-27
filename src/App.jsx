import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Layout from './components/Layout'
import NewDocument from './pages/NewDocument'
import History from './pages/History'
import DocumentView from './pages/DocumentView'
import Settings from './pages/Settings'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [view, setView] = useState('new')
  const [activeDocId, setActiveDocId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-ink/30 text-sm">Cargando…</div>
  }
  if (!session) {
    return <Login />
  }

  function openDoc(id) {
    setActiveDocId(id)
    setView('document')
  }

  function goToView(v) {
    setActiveDocId(null)
    setView(v)
  }

  return (
    <Layout view={view === 'document' ? 'history' : view} setView={goToView}>
      {view === 'new' && <NewDocument onCreated={openDoc} />}
      {view === 'history' && <History onOpen={openDoc} />}
      {view === 'document' && activeDocId && (
        <DocumentView docId={activeDocId} onBack={() => goToView('history')} />
      )}
      {view === 'settings' && <Settings />}
    </Layout>
  )
}
