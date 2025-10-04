import { jsPDF } from 'jspdf'
import { formatDateLabel } from './entryUtils'
import { appCopy } from '../../../shared/constants/appCopy'

const sanitize = (value) => {
  if (value === null || value === undefined) return ''
  return String(value).replace(/"/g, '""')
}

export const exportEntriesToCsv = (entries) => {
  const header = ['Date', 'Type', 'Author', 'Target', 'Note', 'Response']
  const rows = entries.map((entry) => [
    formatDateLabel(entry.createdAt),
    entry.meta?.label ?? entry.meta?.type ?? '',
    entry.author,
    entry.target ?? '',
    entry.text,
    entry.response ?? '',
  ])
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${sanitize(cell)}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${appCopy.jarSlug}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportEntriesToPdf = (entries) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const marginX = 48
  let cursorY = 72

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(`${appCopy.childPossessiveName} Growth Jar — Weekly Keepsake`, marginX, cursorY)

  cursorY += 24
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text(
    'Daily celebrations, gratitude, and learning moments captured in one family jar.',
    marginX,
    cursorY,
  )

  cursorY += 30
  entries.forEach((entry, index) => {
    if (cursorY > 760) {
      doc.addPage()
      cursorY = 72
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(`${formatDateLabel(entry.createdAt)} • ${entry.meta?.label ?? ''}`, marginX, cursorY)
    cursorY += 18

    doc.setFont('helvetica', 'normal')
    const authorLine = entry.target ? `${entry.author} → ${entry.target}` : entry.author
    doc.text(authorLine, marginX, cursorY)
    cursorY += 16

    doc.setFont('helvetica', 'italic')
    const noteLines = doc.splitTextToSize(`“${entry.text}”`, 480)
    doc.text(noteLines, marginX, cursorY)
    cursorY += noteLines.length * 16 + 4

    if (entry.context?.desired) {
      doc.setFont('helvetica', 'normal')
      const hopeLines = doc.splitTextToSize(`Family hope: ${entry.context.desired}`, 480)
      doc.text(hopeLines, marginX, cursorY)
      cursorY += hopeLines.length * 14 + 4
    }

    if (entry.response) {
      doc.setFont('helvetica', 'bold')
      const responseLines = doc.splitTextToSize(entry.response, 480)
      doc.text(responseLines, marginX, cursorY)
      cursorY += responseLines.length * 16 + 4
    }

    cursorY += index === entries.length - 1 ? 0 : 12
  })

  doc.save(`${appCopy.jarSlug}.pdf`)
}
