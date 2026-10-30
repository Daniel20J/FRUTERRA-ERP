import { ENTITIES, SCHEMA } from '../data/erpSchema'
import { seedErp } from '../data/erpSeed'
import { loadDatabase } from './storageService'
import type { ErpState, EntityRecord, Actor } from '../types/erp'
import { moduleKeys } from '../data/demoData'

export const ERP_KEY = 'fruterra-erp-relacional-v2'
export function createErp(): ErpState { return seedErp(loadDatabase()) }
export function loadErp(): ErpState {
  const seed = createErp()
  try {
    const value: unknown = JSON.parse(localStorage.getItem(ERP_KEY) ?? 'null')
    if (!value || typeof value !== 'object' || !('tables' in value) || !('version' in value) || value.version !== 2 || typeof value.tables !== 'object' || !value.tables) return seed
    const tables = value.tables as Record<string, unknown>
    for (const entity of ENTITIES) {
      const rows = tables[entity.key]
      // Reject the snapshot as a whole if any table is malformed: partial recovery could break foreign keys.
      if (!Array.isArray(rows)) return seed
      const ids = new Set<number>()
      for (const row of rows as unknown[]) {
        if (!row || typeof row !== 'object' || !('id' in row) || typeof row.id !== 'number' || !Number.isSafeInteger(row.id) || ids.has(row.id) || row.id <= 0) return seed
        if (!Object.values(row).every(v => ['string','number','boolean'].includes(typeof v) && (typeof v !== 'number' || Number.isFinite(v)))) return seed
        const record=row as EntityRecord
        for (const field of entity.fields) {
          const cell=record[field.name]
          if (field.required && !Object.hasOwn(record,field.name)) return seed
          if(cell!==undefined&&cell!=='') {
            if(field.type==='number'&&typeof cell!=='number')return seed
            if(field.type==='checkbox'&&typeof cell!=='boolean')return seed
            if(field.reference&&cell!==0&&!Array.isArray(tables[field.reference]))return seed
          }
        }
        ids.add(row.id)
      }
    }
    const state = value as ErpState
    if (!/^\d{4}-\d{2}-\d{2}$/.test(state.clock)||!Number.isFinite(Date.parse(state.clock))||new Date(state.clock).toISOString().slice(0,10)!==state.clock) return seed
    for(const entity of ENTITIES)for(const row of state.tables[entity.key])for(const field of entity.fields)if(field.reference&&row[field.name]&&!state.tables[field.reference].some(parent=>parent[field.referenceField??'id']===row[field.name]))return seed
    state.counters = Object.fromEntries(ENTITIES.map(e=>[e.key,Math.max(Number(state.counters?.[e.key])||0,...(tables[e.key] as EntityRecord[]).map(r=>r.id))]))
    if(Object.values(state.counters).some(counter=>!Number.isSafeInteger(counter)||counter<0))return seed
    if(state.migrationArchive&&!moduleKeys.every(key=>Array.isArray(state.migrationArchive?.[key])&&state.migrationArchive[key].every(row=>Array.isArray(row)&&row.every(cell=>typeof cell==='string'))))delete state.migrationArchive
    return state
  } catch { return seed }
}
export function persistErp(state: ErpState): boolean { try { localStorage.setItem(ERP_KEY,JSON.stringify(state)); return true } catch { return false } }
export function getRecord(state: ErpState, key: string, id: number): EntityRecord {
  const row = state.tables[key]?.find(record=>record.id===id)
  if (!row) throw new Error('No se encontró el registro relacionado en '+(SCHEMA[key]?.title??key))
  return row
}
export function recordLabel(state: ErpState, key: string, row: EntityRecord): string {
  if(key==='cuenta_por_cobrar'||key==='cuenta_por_pagar') {
    const document=key==='cuenta_por_cobrar'?state.tables.factura.find(f=>f.id===row.factura_id)?.numero:row.numero_factura
    const company=key==='cuenta_por_cobrar'?state.tables.cliente.find(c=>c.id===row.cliente_id)?.razon_social:state.tables.proveedor.find(p=>p.id===row.proveedor_id)?.razon_social
    return `${document??'#'+row.id} · ${company??''} · saldo ${row.saldo}`
  }
  if(['detalle_pedido','detalle_orden_compra','detalle_cotizacion_venta'].includes(key)) {
    const parentKey=key==='detalle_pedido'?'pedido':key==='detalle_orden_compra'?'orden_compra':'cotizacion_venta',fk=key==='detalle_pedido'?'pedido_id':key==='detalle_orden_compra'?'orden_id':'cotizacion_id'
    return `${state.tables[parentKey].find(p=>p.id===row[fk])?.numero??'#'+row.id} · ${state.tables.producto.find(p=>p.id===row.producto_id)?.nombre??''} · ${row.cantidad}`
  }
  const preferred = ['codigo','numero','razon_social','nombre','nombre_completo','username','identificador','descripcion']
  const field = preferred.find(name=>row[name])
  if (key==='producto_terminado'||key==='insumo') return recordLabel(state,'producto',state.tables.producto.find(p=>p.id===row.producto_id)??row)
  return field ? String(row[field]) : `${SCHEMA[key]?.title??key} #${row.id}`
}
export function can(state: ErpState, actor: Actor, entity: string, operation: string): boolean {
  if (actor.role==='Administrador') return true
  const role = state.tables.rol.find(r=>r.nombre===actor.role && r.estado==='activo')
  if (!role) return false
  const permission = state.tables.permiso.find(r=>r.modulo===entity && r.operacion===operation)
  return !!permission && state.tables.rol_permiso.some(r=>r.rol_id===role.id&&r.permiso_id===permission.id)
}
export function scopedRows(state: ErpState, entity: string, actor: Actor): EntityRecord[] {
  if (!can(state,actor,entity,'consultar')) return []
  if (actor.role!=='Cliente') return state.tables[entity]??[]
  const client=actor.clientId??1
  return (state.tables[entity]??[]).filter(row=>row.cliente_id===client || (entity==='detalle_pedido'&&state.tables.pedido.some(p=>p.id===row.pedido_id&&p.cliente_id===client)) || (entity==='detalle_factura'&&state.tables.factura.some(f=>f.id===row.factura_id&&f.cliente_id===client)))
}
