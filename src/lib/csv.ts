export function parseCSVLine(text: string, delimiter: string = ';'): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"' && text[i + 1] === '"') {
      current += '"'
      i++
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

export function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== '')
  if (lines.length < 2) return []

  const delimiter = lines[0].includes(';') ? ';' : ','
  const headers = parseCSVLine(lines[0], delimiter).map((h) => h.trim())

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line, delimiter)
    const obj: Record<string, string> = {}
    headers.forEach((header, index) => {
      obj[header] = values[index] || ''
    })
    return obj
  })
}

export function parseCurrency(val: string): number | undefined {
  if (!val) return undefined
  let cleaned = val.replace(/[R$\s]/g, '')
  if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.')
  }
  const num = parseFloat(cleaned)
  return isNaN(num) ? undefined : num
}
