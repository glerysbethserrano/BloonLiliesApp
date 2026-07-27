import { pdf } from '@react-pdf/renderer'
import { supabase } from './supabase'
import { business } from './business'
import DocumentPDF from '../pdf/DocumentPDF'

// Builds the PDF, uploads it to the `documents` storage bucket, and returns
// { blob, path }. Call downloadBlob() separately to also save it to the
// phone/computer the person is using.
export async function generateAndStorePdf(doc, items, kind) {
  const element = <DocumentPDF doc={{ ...doc, type: kind }} items={items} business={business} />
  const blob = await pdf(element).toBlob()

  const folder = kind === 'invoice' ? 'invoices' : 'quotes'
  const path = `${folder}/${doc.doc_number}.pdf`

  const { error } = await supabase.storage.from('documents').upload(path, blob, {
    contentType: 'application/pdf',
    upsert: true,
  })
  if (error) throw error

  return { blob, path }
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function getSignedUrl(path) {
  if (!path) return null
  const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, 60 * 10)
  if (error) throw error
  return data.signedUrl
}
