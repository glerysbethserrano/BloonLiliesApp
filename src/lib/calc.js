export function toMoney(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return 0
  return Math.round(n * 100) / 100
}

export function formatMoney(value) {
  const n = toMoney(value)
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function computeBalance(total, deposit) {
  return toMoney(toMoney(total) - toMoney(deposit))
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-PR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function nextDocNumber(prefix, existingNumbers) {
  const nums = existingNumbers
    .filter((n) => n && n.startsWith(prefix))
    .map((n) => parseInt(n.replace(prefix, ''), 10))
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `${prefix}${String(max + 1).padStart(4, '0')}`
}
