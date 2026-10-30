import type { Database } from '../data/demoData'
import { CONFIG, moduleKeys } from '../data/demoData'
import type { Cell, EntityRecord, ErpState } from '../types/erp'
import { labelValue } from '../data/erpSchema'

export function dashboardData(state: ErpState): Database {
  const db=Object.fromEntries(moduleKeys.map(key=>[key,CONFIG[key].rows.map(row=>[...row])])) as Database
  const name=(key:string,id:Cell)=>state.tables[key].find(r=>r.id===id)
  const money=(row:EntityRecord)=>`${row.moneda_id===2?'USD':row.moneda_id===3?'EUR':'Q'} ${Number(row.total).toFixed(2)}`
  db.ventas=state.tables.pedido.map(r=>[String(r.numero),String(name('cliente',r.cliente_id)?.razon_social??''),state.tables.detalle_pedido.filter(d=>d.pedido_id===r.id).map(d=>name('producto',d.producto_id)?.nombre).join(', '),money(r),String(r.fecha_entrega_prometida),labelValue(String(r.estado))])
  db.lotes=state.tables.lote.map(r=>[String(r.codigo),String(name('producto',r.producto_id)?.nombre??''),String(name('finca',r.finca_id)?.nombre??''),String(state.tables.clasificacion_calidad.find(c=>c.lote_id===r.id&&c.vigente)?.categoria??''),String(r.fecha_cosecha),labelValue(String(r.estado))])
  db.frio=state.tables.alerta_temperatura.filter(r=>r.estado!=='cerrada').map(r=>['ALERTA-'+r.id,String(name('camara_fria',r.camara_id)?.nombre??''),'','','','Alerta'])
  db.exportaciones=state.tables.embarque.map(r=>[String(r.codigo),String(r.pais_destino),String(r.contenedor),String(r.fecha_salida),'',labelValue(String(r.estado))])
  return db
}
export function gtq(state:ErpState,amount:Cell,moneda:Cell,rate?:Cell): number {
  if(moneda===1)return Number(amount)||0
  const exchange=rate||state.tables.tipo_cambio.filter(r=>r.moneda_id===moneda&&String(r.fecha)<=state.clock).sort((a,b)=>String(b.fecha).localeCompare(String(a.fecha)))[0]?.valor
  return (Number(amount)||0)*(Number(exchange)||0)
}
