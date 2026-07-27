import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { formatMoney, formatDate } from '../lib/calc'
import monogram from '../assets/monogram.png'

const COLORS = {
  ink: '#1A1512',
  gold: '#B08A3E',
  magenta: '#9E1858',
  magentaLight: '#F4DCE6',
  goldLight: '#E8D9B8',
  grey: '#8A8178',
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: COLORS.ink,
    fontFamily: 'Helvetica',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  docNumber: {
    fontSize: 9,
    color: COLORS.grey,
    marginTop: 4,
  },
  monogram: { width: 46, height: 50 },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  fieldLabel: {
    width: 110,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
  },
  fieldValue: {
    flex: 1,
    fontSize: 9.5,
    borderBottomWidth: 0.75,
    borderBottomColor: COLORS.gold,
    paddingBottom: 2,
  },
  sectionGap: { marginTop: 14 },
  table: {
    marginTop: 18,
    borderWidth: 0.75,
    borderColor: COLORS.gold,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.magentaLight,
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 0.75,
    borderTopColor: COLORS.gold,
  },
  th: {
    padding: 7,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: COLORS.magenta,
  },
  td: {
    padding: 7,
    fontSize: 9.5,
  },
  colProduct: { width: '26%' },
  colDesc: { width: '54%' },
  colQty: { width: '20%', textAlign: 'right' },
  summaryBox: {
    marginTop: 16,
    alignSelf: 'flex-end',
    width: 220,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  summaryTotal: {
    backgroundColor: COLORS.magentaLight,
  },
  summaryLabel: { fontSize: 9.5 },
  summaryValue: { fontSize: 9.5, fontFamily: 'Helvetica-Bold' },
  footer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  thanks: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.magenta,
    marginBottom: 6,
  },
  contactLine: { fontSize: 9, marginTop: 2 },
  notesTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    marginBottom: 4,
  },
  notesBox: {
    fontSize: 8.5,
    color: COLORS.grey,
    width: 230,
    borderTopWidth: 0.75,
    borderTopColor: COLORS.gold,
    paddingTop: 4,
  },
})

export default function DocumentPDF({ doc, items, business }) {
  const isInvoice = doc.type === 'invoice'
  const title = isInvoice ? 'FACTURA' : 'COTIZACIÓN'

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.docNumber}>No. {doc.doc_number}</Text>
          </View>
          <Image src={monogram} style={styles.monogram} />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Cliente:</Text>
          <Text style={styles.fieldValue}>{doc.client_name}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Tel. de contacto:</Text>
          <Text style={styles.fieldValue}>{doc.client_phone}</Text>
        </View>
        {doc.client_email ? (
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Correo:</Text>
            <Text style={styles.fieldValue}>{doc.client_email}</Text>
          </View>
        ) : null}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Tema / Decoración:</Text>
          <Text style={styles.fieldValue}>{doc.theme}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Fecha de actividad:</Text>
          <Text style={styles.fieldValue}>{formatDate(doc.event_date)}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Dirección:</Text>
          <Text style={styles.fieldValue}>{doc.location}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.colProduct]}>Decoración</Text>
            <Text style={[styles.th, styles.colDesc]}>Descripción</Text>
            <Text style={[styles.th, styles.colQty]}>Cant.</Text>
          </View>
          {items.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <Text style={[styles.td, styles.colProduct]}>{item.product_name}</Text>
              <Text style={[styles.td, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formatMoney(doc.subtotal)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryValue}>{formatMoney(doc.total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Depósito:</Text>
            <Text style={styles.summaryValue}>{formatMoney(doc.deposit)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Balance:</Text>
            <Text style={styles.summaryValue}>{formatMoney(doc.balance)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.thanks}>¡Gracias!</Text>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10 }}>{business.ownerName}</Text>
            <Text style={styles.contactLine}>{business.phone}</Text>
            <Text style={styles.contactLine}>{business.email}</Text>
            <Text style={styles.contactLine}>{business.instagram}</Text>
          </View>
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>NOTAS IMPORTANTES:</Text>
            <Text>{doc.notes}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
