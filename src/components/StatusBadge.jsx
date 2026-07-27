const STYLES = {
  draft: 'bg-ink/10 text-ink/60',
  sent: 'bg-gold-light text-gold',
  accepted: 'bg-magenta-light text-magenta',
  declined: 'bg-ink/10 text-ink/40 line-through',
  partial: 'bg-pink text-magenta',
  paid: 'bg-magenta text-white',
}

const LABELS = {
  draft: 'Borrador',
  sent: 'Enviada',
  accepted: 'Aceptada',
  declined: 'Rechazada',
  partial: 'Depósito pagado',
  paid: 'Pagada',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${STYLES[status] || STYLES.draft}`}>
      {LABELS[status] || status}
    </span>
  )
}
