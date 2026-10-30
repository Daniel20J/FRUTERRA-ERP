import { moduleKeys, type Database, type ModuleKey } from '../data/demoData'

export function saveRecord(db: Database, key: ModuleKey, index: number | null, values: string[]): Database {
  const rows = db[key].map(row => [...row])
  if (index === null) {
    const counter = Math.max(1200, ...moduleKeys.flatMap(module => db[module].map(row => Number(row[0].match(/-(\d+)$/)?.[1]) || 0))) + 1
    rows.unshift([key.slice(0, 3).toUpperCase() + '-' + counter, ...values])
  } else rows[index] = [rows[index][0], ...values]
  return { ...db, [key]: rows }
}

export function deleteRecord(db: Database, key: ModuleKey, index: number): Database {
  return { ...db, [key]: db[key].filter((_, position) => position !== index) }
}

export function advanceOrder(db: Database, index: number): Database {
  const statuses = ['En revisión', 'Confirmado', 'Preparación', 'Despachado', 'Entregado']
  const rows = db.ventas.map(row => [...row])
  const row = rows[index]
  row[5] = statuses[Math.min(statuses.length - 1, statuses.indexOf(row[5]) + 1)]
  return { ...db, ventas: rows }
}

export function synchronizeDatabase(db: Database): Database {
  return { ...db, sincronizacion: db.sincronizacion.map(row => row.map((value, index) => index === 3 ? '0 eventos' : index === 5 ? 'Sincronizado' : value)) }
}
