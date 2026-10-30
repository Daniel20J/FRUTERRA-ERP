import { CONFIG, moduleKeys, type Database } from '../data/demoData'

export const STORAGE_KEY = 'fruterra-react-demo-v1'
export const SESSION_KEY = 'fruterra-react-demo-session'

export function loadDatabase(): Database {
  let saved: Partial<Record<string, unknown>> = {}
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) saved = parsed
  } catch { /* Restore original records when saved JSON is corrupt. */ }
  return Object.fromEntries(moduleKeys.map(key => {
    const rows = saved[key]
    const valid = Array.isArray(rows) && rows.every((row: unknown) =>
      Array.isArray(row) && row.length === CONFIG[key].cols.length && row.every(cell => typeof cell === 'string'))
    return [key, valid ? rows : CONFIG[key].rows.map(row => [...row])]
  })) as Database
}

export function saveDatabase(db: Database): boolean {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); return true }
  catch { return false }
}

export function hasSession(): boolean {
  try { return sessionStorage.getItem(SESSION_KEY) === 'admin' } catch { return false }
}

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows.map(row => row.map(value => '"' + String(value).replaceAll('"', '""') + '"').join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
