import { SCHEMA, labelValue } from '../data/erpSchema'
import { getRecord, recordLabel } from './erpStore'
import type { EntityRecord, ErpState } from '../types/erp'

export function documentRows(state:ErpState,entity:string,row:EntityRecord):string[][] {
  const output:string[][]=[['FRUTERRA EXPORT, S. A.'],['DOCUMENTO DE DEMOSTRACIÓN · SIN VALIDEZ FISCAL NI ADUANAL'],[SCHEMA[entity].title,recordLabel(state,entity,row)],['Fecha operativa',state.clock]]
  const fieldValue=(name:string)=>{
    const field=SCHEMA[entity].fields.find(f=>f.name===name),value=row[name]
    if(field?.reference){const related=state.tables[field.reference].find(r=>r[field.referenceField??'id']===value);return related?recordLabel(state,field.reference,related):'—'}
    return typeof value==='boolean'?value?'Sí':'No':String(value??'—')
  }
  for(const field of SCHEMA[entity].fields)if(!['valor_anterior','valor_nuevo','payload'].includes(field.name))output.push([field.label,fieldValue(field.name)])
  if(['pedido','cotizacion_venta','factura','orden_compra'].includes(entity)) {
    const detailKey={pedido:'detalle_pedido',cotizacion_venta:'detalle_cotizacion_venta',factura:'detalle_factura',orden_compra:'detalle_orden_compra'}[entity]!
    const fk={pedido:'pedido_id',cotizacion_venta:'cotizacion_id',factura:'factura_id',orden_compra:'orden_id'}[entity]!
    let lines=state.tables[detailKey].filter(d=>d[fk]===row.id)
    if(entity==='factura'&&!lines.length)lines=state.tables.detalle_pedido.filter(d=>d.pedido_id===row.pedido_id)
    output.push([],['Producto','Cantidad','Precio unitario','Subtotal'])
    lines.forEach(line=>output.push([recordLabel(state,'producto',getRecord(state,'producto',Number(line.producto_id))),String(line.cantidad),Number(line.precio_unitario).toFixed(2),(Number(line.subtotal)||Number(line.cantidad)*Number(line.precio_unitario)).toFixed(2)]))
    output.push(['Total',Number(row.total).toFixed(2),fieldValue('moneda_id')])
  }
  if(['embarque','despacho','documento_exportacion'].includes(entity)) {
    const shipment=entity==='documento_exportacion'?getRecord(state,'embarque',Number(row.embarque_id)):row
    const orders=entity==='despacho'?state.tables.pedido.filter(p=>p.id===row.pedido_id):state.tables.pedido.filter(p=>p.embarque_id===shipment.id)
    const dispatches=state.tables.despacho.filter(d=>orders.some(p=>p.id===d.pedido_id)),details=state.tables.detalle_despacho.filter(d=>dispatches.some(dispatch=>dispatch.id===d.despacho_id))
    if(entity==='documento_exportacion')output.push(['Tipo de documento',labelValue(String(row.tipo))],['Embarque',String(shipment.codigo)],['País',String(shipment.pais_destino)],['Contenedor',String(shipment.contenedor)])
    output.push([],['PACKING LIST / PRODUCTO DESPACHADO'],['Pedido','Lote','Producto','Origen','Cajas','Peso kg'])
    details.forEach(detail=>{const lot=getRecord(state,'lote',Number(detail.lote_id)),dispatch=getRecord(state,'despacho',Number(detail.despacho_id)),order=getRecord(state,'pedido',Number(dispatch.pedido_id));output.push([String(order.numero),String(lot.codigo),recordLabel(state,'producto',getRecord(state,'producto',Number(lot.producto_id))),recordLabel(state,'finca',getRecord(state,'finca',Number(lot.finca_id))),String(detail.cajas),String(detail.cantidad_kg)])})
    if(!details.length)output.push(['Sin despachos registrados; no hay cantidades de carga confirmadas.'])
  }
  if(entity==='cosecha') {
    const plot=getRecord(state,'lote_terreno',Number(row.lote_terreno_id))
    output.push([],['BOLETA DE ENVÍO A BODEGA'],['Finca',recordLabel(state,'finca',getRecord(state,'finca',Number(plot.finca_id)))],['Parcela',String(plot.codigo)],['Producto',recordLabel(state,'producto',getRecord(state,'producto',Number(plot.producto_id)))])
    state.tables.lote.filter(l=>l.cosecha_id===row.id).forEach(l=>output.push(['Lote',String(l.codigo)],['Etiqueta','FRUTERRA:'+l.codigo]))
  }
  if(entity==='lote') {
    output.push([],['HISTORIAL DE TRAZABILIDAD'],['Fecha','Evento','Descripción'])
    state.tables.evento_trazabilidad.filter(e=>e.lote_id===row.id).sort((a,b)=>String(a.fecha_hora).localeCompare(String(b.fecha_hora))).forEach(e=>output.push([String(e.fecha_hora),labelValue(String(e.tipo_evento)),String(e.descripcion)]))
    output.push([],['EVIDENCIA DE CADENA DE FRÍO'],['Fecha','Cámara','Temperatura °C','Humedad %'])
    state.tables.registro_temperatura.filter(t=>t.lote_id===row.id).forEach(t=>output.push([String(t.fecha_hora),recordLabel(state,'camara_fria',getRecord(state,'camara_fria',Number(t.camara_id))),String(t.temperatura),String(t.humedad)]))
  }
  return output
}
