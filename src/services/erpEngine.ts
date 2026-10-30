import { ENTITIES, SCHEMA } from '../data/erpSchema'
import { can, getRecord, recordLabel } from './erpStore'
import type { Actor, BusinessAction, Cell, EntityRecord, ErpState } from '../types/erp'

const n = (value: Cell | undefined) => Number(value)||0
const round = (value: number) => Math.round((value+Number.EPSILON)*100)/100
const stamp = (state: ErpState) => state.clock+'T'+new Date().toISOString().slice(11,19)
const rows = (state: ErpState, key: string) => state.tables[key]
function add(state: ErpState, key: string, values: Record<string,Cell>): EntityRecord {
  const id=Math.max(state.counters[key]||0,...rows(state,key).map(r=>r.id))+1
  state.counters[key]=id
  const defaults=Object.fromEntries(SCHEMA[key].fields.map(f=>[f.name,f.defaultValue??(f.name==='id'?id:f.type==='checkbox'?false:f.type==='number'?0:f.type==='date'?state.clock:f.type==='datetime-local'?stamp(state):f.options?.[0]??'')]))
  const row={...defaults,...values,id} as EntityRecord
  rows(state,key).push(row)
  return row
}
function requirePermission(state: ErpState, actor: Actor, key: string, operation: string) {
  if (!can(state,actor,key,operation)) throw Error('Tu perfil de demostración no permite esta operación.')
}
function trace(state: ErpState, actor: Actor, lote: number, type: string, key: string, id: number, description: string) {
  if (lote) add(state,'evento_trazabilidad',{lote_id:lote,tipo_evento:type,entidad_origen:key,entidad_origen_id:id,usuario_id:actor.id,fecha_hora:stamp(state),descripcion:description})
}
function finish(before: ErpState, next: ErpState, actor: Actor, key: string, id: number, action: string): ErpState {
  add(next,'bitacora_auditoria',{usuario_id:actor.id,fecha_hora:stamp(next),modulo:SCHEMA[key].group,accion:action,entidad:key,entidad_id:id,valor_anterior:JSON.stringify(before.tables[key].find(r=>r.id===id)??{}),valor_nuevo:JSON.stringify(next.tables[key].find(r=>r.id===id)??{})})
  if (key!=='cola_sincronizacion' && key!=='dispositivo_registrado') add(next,'cola_sincronizacion',{dispositivo_id:1,usuario_id:actor.id,entidad:key,operacion:action==='crear'?'crear':action==='eliminar'?'eliminar':'actualizar',uuid_cliente:`local-${key}-${id}-${next.counters.bitacora_auditoria}`,payload:JSON.stringify({accion:action,id}),creado_en:stamp(next),estado:'pendiente'})
  return next
}

export function validateRecord(state: ErpState, key: string, row: EntityRecord) {
  for (const field of SCHEMA[key].fields) {
    const value=row[field.name]
    if (field.generated) continue
    if (field.required && (value===undefined || value==='' || (field.reference&&n(value)===0))) throw Error('Completa el campo «'+field.label+'».')
    if (value===''||value===undefined||value===0&&!field.required) continue
    if (field.type==='number' && (!Number.isFinite(Number(value)) || (n(value)<0&&!['temperatura','temp_min','temp_max'].includes(field.name)))) throw Error(field.label+': ingresa un número válido sin valores negativos.')
    if (field.type==='date' && (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))||!Number.isFinite(Date.parse(String(value)))||new Date(String(value)).toISOString().slice(0,10)!==String(value))) throw Error(field.label+': fecha inválida.')
    if(field.type==='datetime-local'&&!Number.isFinite(Date.parse(String(value))))throw Error(field.label+': fecha y hora inválidas.')
    if (field.type==='email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) throw Error('Correo electrónico inválido.')
    if (field.options && !field.options.includes(String(value))) throw Error('Opción inválida en '+field.label)
    if (field.reference && !rows(state,field.reference).some(record=>record[field.referenceField??'id']===value)) throw Error('Selecciona una referencia válida para '+field.label)
    if (field.unique && rows(state,key).some(record=>record.id!==row.id&&record[field.name]===value)) throw Error(field.label+' ya existe.')
  }
  for (const group of SCHEMA[key].uniqueGroups??[]) if (rows(state,key).some(record=>record.id!==row.id&&group.every(name=>record[name]===row[name]))) throw Error('Ya existe esta combinación de '+group.join(', '))
  for (const name of ['cantidad','peso_kg','cantidad_kg','monto','dosis','precio','precio_unitario','tarifa_caja']) if (Object.hasOwn(row,name) && n(row[name])<=0) throw Error('El valor de '+name.replaceAll('_',' ')+' debe ser mayor que cero.')
  for (const name of ['porcentaje_color','porcentaje_defectos','comision_porcentaje']) if (n(row[name])>100) throw Error('El porcentaje no puede superar 100 %.')
  if (key==='promocion' && (String(row.fecha_fin)<String(row.fecha_inicio)||n(row.valor)<=0||(row.tipo==='porcentaje'&&n(row.valor)>100))) throw Error('Revisa vigencia y valor de la promoción.')
  if (key==='rango_temperatura_producto' && n(row.temp_min)>n(row.temp_max)) throw Error('La temperatura mínima no puede superar la máxima.')
  if (key==='lista_precio' && row.vigente_hasta && String(row.vigente_hasta)<String(row.vigente_desde)) throw Error('La vigencia final debe ser posterior a la inicial.')
  if (key==='tipo_cambio' && n(row.valor)<=0) throw Error('El tipo de cambio debe ser positivo.')
  if (key==='existencia' && n(row.cantidad_reservada)>n(row.cantidad)) throw Error('La reserva no puede superar las existencias.')
  if (key==='lote' && row.fecha_vencimiento && String(row.fecha_vencimiento)<String(row.fecha_cosecha)) throw Error('El vencimiento debe ser posterior a la cosecha.')
  if(key==='lote') {
    const plot=getRecord(state,'lote_terreno',n(row.lote_terreno_id)),harvest=getRecord(state,'cosecha',n(row.cosecha_id))
    if(plot.producto_id!==row.producto_id||plot.finca_id!==row.finca_id||harvest.lote_terreno_id!==plot.id)throw Error('El producto, la finca, la parcela y la cosecha deben corresponder al mismo origen.')
  }
  if(key==='registro_temperatura'&&n(row.lote_id)&&!rows(state,'existencia').some(s=>s.lote_id===row.lote_id&&s.camara_id===row.camara_id))throw Error('El lote no está registrado en la cámara seleccionada.')
  if(['producto_terminado','insumo'].includes(key)&&getRecord(state,'producto',n(row.producto_id)).tipo!==(key==='insumo'?'insumo':'producto_terminado'))throw Error('El producto no corresponde a esta especialización del catálogo.')
  if (key==='detalle_orden_compra' && !['borrador','emitida'].includes(String(getRecord(state,'orden_compra',n(row.orden_id)).estado))) throw Error('La orden ya tiene recepciones; no se puede cambiar su detalle.')
  if (key==='detalle_pedido' && !['registrado','en_revision'].includes(String(getRecord(state,'pedido',n(row.pedido_id)).estado))) throw Error('Solo se puede modificar el detalle de pedidos sin confirmar.')
  if (key==='detalle_cotizacion_venta' && !['borrador','enviada','aprobada'].includes(String(getRecord(state,'cotizacion_venta',n(row.cotizacion_id)).estado))) throw Error('La cotización ya no admite cambios.')
  if (key==='reclamo') {
    const order=getRecord(state,'pedido',n(row.pedido_id))
    if (order.cliente_id!==row.cliente_id) throw Error('El pedido no pertenece al cliente seleccionado.')
    if (!rows(state,'detalle_pedido').some(d=>d.pedido_id===order.id&&d.producto_id===getRecord(state,'lote',n(row.lote_id)).producto_id)) throw Error('El lote no corresponde a un producto del pedido.')
  }
}

export function quoteLine(state: ErpState, row: EntityRecord): EntityRecord {
  const order=getRecord(state,'pedido',n(row.pedido_id))
  const client=getRecord(state,'cliente',n(order.cliente_id))
  const priceList=rows(state,'lista_precio').find(p=>p.id===client.lista_precio_id&&p.moneda_id===order.moneda_id&&p.estado==='activo'&&String(p.vigente_desde)<=state.clock&&(!p.vigente_hasta||String(p.vigente_hasta)>=state.clock))??rows(state,'lista_precio').find(p=>p.tipo_cliente===client.tipo&&p.moneda_id===order.moneda_id&&p.estado==='activo'&&String(p.vigente_desde)<=state.clock&&(!p.vigente_hasta||String(p.vigente_hasta)>=state.clock))
  const price=priceList&&rows(state,'detalle_lista_precio').find(p=>p.lista_precio_id===priceList.id&&p.producto_id===row.producto_id)
  if (!price) throw Error('No hay un precio vigente en la moneda del pedido. Configura una lista y sus productos.')
  const quantity=n(row.cantidad), amount=round(quantity*n(price.precio))
  let discount=0
  if (n(row.promocion_id)) {
    const promo=getRecord(state,'promocion',n(row.promocion_id))
    if (promo.estado!=='activo'||String(promo.fecha_inicio)>state.clock||String(promo.fecha_fin)<state.clock) throw Error('La promoción está fuera de vigencia o inactiva.')
    if ((n(promo.producto_id)&&promo.producto_id!==row.producto_id)||(n(promo.cliente_id)&&promo.cliente_id!==order.cliente_id)||(promo.segmento&&promo.segmento!==client.tipo)) throw Error('La promoción no corresponde a este producto o cliente.')
    if (promo.tipo==='monto_fijo'&&priceList?.moneda_id!==order.moneda_id) throw Error('La promoción requiere la misma moneda.')
    discount=round(promo.tipo==='porcentaje'?amount*n(promo.valor)/100:n(promo.valor))
  }
  return {...row,precio_unitario:n(price.precio),descuento:Math.min(amount,discount),subtotal:Math.max(0,round(amount-discount))}
}
function recalculate(state: ErpState, key: string, row: EntityRecord) {
  if (key==='detalle_pedido') {
    const order=getRecord(state,'pedido',n(row.pedido_id)), detail=rows(state,key).filter(d=>d.pedido_id===order.id)
    order.subtotal=round(detail.reduce((sum,d)=>sum+n(d.cantidad)*n(d.precio_unitario),0));order.descuento=round(detail.reduce((sum,d)=>sum+n(d.descuento),0));order.total=round(n(order.subtotal)-n(order.descuento)+n(order.impuesto))
  }
  if (key==='detalle_orden_compra') { const order=getRecord(state,'orden_compra',n(row.orden_id));order.subtotal=round(rows(state,key).filter(d=>d.orden_id===order.id).reduce((sum,d)=>sum+n(d.cantidad)*n(d.precio_unitario),0));order.total=round(n(order.subtotal)-n(order.descuentos)+n(order.impuestos)) }
  if (key==='detalle_cotizacion_venta') { const quote=getRecord(state,'cotizacion_venta',n(row.cotizacion_id));quote.total=round(rows(state,key).filter(d=>d.cotizacion_id===quote.id).reduce((sum,d)=>sum+n(d.cantidad)*n(d.precio_unitario),0)) }
  if(key==='pedido')recalculate(state,'detalle_pedido',{...row,pedido_id:row.id})
  if(key==='orden_compra')recalculate(state,'detalle_orden_compra',{...row,orden_id:row.id})
}
function movement(state: ErpState, actor: Actor, type: string, stock: EntityRecord, qty: number, key: string, id: number, destination=0, reason='Operación de demostración') {
  const row=add(state,'movimiento_inventario',{tipo:type,producto_id:stock.producto_id,lote_id:n(stock.lote_id),almacen_origen_id:type==='entrada'?0:stock.almacen_id,almacen_destino_id:destination||(type==='entrada'?stock.almacen_id:0),cantidad:qty,usuario_id:actor.id,fecha_hora:stamp(state),documento_tipo:key,documento_id:id,motivo:reason,autorizado_por:actor.id})
  trace(state,actor,n(stock.lote_id),type==='entrada'?'recepcion':type==='transferencia'?'traslado':'despacho',key,id,`${type}: ${qty} · ${reason}`)
  return row
}

export function saveEntity(before: ErpState, actor: Actor, key: string, id: number | null, values: Record<string,Cell>): ErpState {
  if (!SCHEMA[key]||SCHEMA[key].readOnly) throw Error('Este registro lo genera un proceso; utiliza sus acciones operativas.')
  requirePermission(before,actor,key,id===null?'crear':'editar')
  const next=structuredClone(before), existing=id===null?null:getRecord(next,key,id)
  if (existing && ['cobro','pago','devolucion','merma','aplicacion_agroquimica','cosecha','anticipo','nota_credito','registro_temperatura','mantenimiento','destajo'].includes(key)) throw Error('Este registro ya produjo movimientos. Consulta su ficha; no se permite editarlo para conservar los saldos y la trazabilidad.')
  const editable=Object.fromEntries(SCHEMA[key].fields.filter(f=>!f.generated&&Object.hasOwn(values,f.name)).map(f=>[f.name,values[f.name]]))
  let row=existing?Object.assign(existing,editable):add(next,key,editable)
  if(existing&&['pedido','orden_compra','cotizacion_venta'].includes(key)&&!['registrado','en_revision','borrador','enviada','aprobada'].includes(String(existing.estado)))throw Error('El documento ya está en proceso. No se permite editar su cabecera.')
  if(SCHEMA[key].fields.some(f=>f.name==='usuario_id'))row.usuario_id=actor.id
  if(SCHEMA[key].fields.some(f=>f.name==='registrado_por'))row.registrado_por=actor.id
  if (actor.role==='Cliente') { if (key!=='solicitud_portal') throw Error('El portal permite crear solicitudes propias.'); row.cliente_id=actor.clientId??1; if (getRecord(next,'pedido',n(row.pedido_id)).cliente_id!==row.cliente_id) throw Error('El pedido no pertenece a tu cuenta.') }
  if (key==='detalle_pedido') { row=quoteLine(next,row); Object.assign(getRecord(next,key,row.id),row) }
  if (key==='pedido') { const client=getRecord(next,'cliente',n(row.cliente_id));row.es_exportacion=client.tipo==='internacional';if(!n(row.moneda_id)) row.moneda_id=client.moneda_id;const rate=rows(next,'tipo_cambio').filter(r=>r.moneda_id===row.moneda_id&&String(r.fecha)<=next.clock).sort((a,b)=>String(b.fecha).localeCompare(String(a.fecha)))[0];row.tipo_cambio=row.moneda_id===1?1:n(rate?.valor);if(!n(row.tipo_cambio))throw Error('Registra un tipo de cambio para la moneda del pedido.') }
  validateRecord(next,key,row)
  if (key==='destajo') { const harvest=getRecord(next,'cosecha',n(row.cosecha_id)),other=rows(next,'destajo').filter(d=>d.cosecha_id===harvest.id&&d.id!==row.id).reduce((sum,d)=>sum+n(d.cajas),0); if(n(row.cajas)+other>n(harvest.cajas))throw Error('Las cajas de la planilla no pueden superar las registradas en la cosecha.');row.total=round(n(row.cajas)*n(row.tarifa_caja));const plot=getRecord(next,'lote_terreno',n(harvest.lote_terreno_id));add(next,'costo_produccion',{lote_terreno_id:plot.id,fecha:next.clock,concepto:'Destajo #'+row.id,tipo:'mano de obra',monto:row.total}) }
  if(key==='mantenimiento')getRecord(next,'equipo',n(row.equipo_id)).horas_uso=round(n(getRecord(next,'equipo',n(row.equipo_id)).horas_uso)+n(row.horas))
  if (key==='aplicacion_agroquimica') {
    const input=rows(next,'insumo').find(r=>r.producto_id===row.insumo_id),labor=getRecord(next,'labor_agricola',n(row.labor_id))
    if (!input?.autorizado||!input.es_agroquimico)throw Error('Solo se pueden aplicar agroquímicos autorizados.')
    if(labor.tipo!=='aplicacion_agroquimica')throw Error('La labor seleccionada no corresponde a una aplicación agroquímica.')
    row.dias_carencia=input.dias_carencia
    const date=new Date(String(labor.fecha)+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+n(input.dias_carencia));row.fecha_fin_carencia=date.toISOString().slice(0,10)
  }
  if (key==='cosecha') {
    const blocked=rows(next,'aplicacion_agroquimica').find(a=>getRecord(next,'labor_agricola',n(a.labor_id)).lote_terreno_id===row.lote_terreno_id&&String(a.fecha_fin_carencia)>String(row.fecha))
    if(blocked)throw Error('No se puede cosechar: período de carencia vigente hasta '+blocked.fecha_fin_carencia+'.')
    const plot=getRecord(next,'lote_terreno',n(row.lote_terreno_id)), product=getRecord(next,'producto',n(plot.producto_id))
    const expiry=new Date(String(row.fecha)+'T12:00Z');expiry.setUTCDate(expiry.getUTCDate()+(n(product.vida_util_dias)||7))
    const lot=add(next,'lote',{codigo:`LOT-${product.codigo}-${row.id}`,producto_id:plot.producto_id,finca_id:plot.finca_id,lote_terreno_id:plot.id,cosecha_id:row.id,fecha_cosecha:row.fecha,fecha_vencimiento:expiry.toISOString().slice(0,10),peso_kg:row.peso_kg,estado:'cuarentena'})
    add(next,'etiqueta_lote',{lote_id:lot.id,codigo_qr:'FRUTERRA:'+lot.codigo,tipo:'lote',impresa:false})
    trace(next,actor,lot.id,'cosecha','cosecha',row.id,'Cosecha registrada. Pendiente de clasificación y recepción en almacén.')
    rows(next,'plan_cosecha').filter(p=>p.lote_terreno_id===plot.id&&String(p.semana_inicio)<=String(row.fecha)&&String(row.fecha)<=datePlus(String(p.semana_inicio),6)).forEach(plan=>{plan.volumen_real_kg=rows(next,'cosecha').filter(h=>h.lote_terreno_id===plot.id&&String(h.fecha)>=String(plan.semana_inicio)&&String(h.fecha)<=datePlus(String(plan.semana_inicio),6)).reduce((sum,h)=>sum+n(h.peso_kg),0)})
  }
  if (key==='clasificacion_calidad') {
    if(!row.justificacion_reclasificacion&&rows(next,key).some(r=>r.lote_id===row.lote_id&&r.id!==row.id&&r.vigente))throw Error('Una reclasificación requiere justificación.')
    rows(next,key).filter(r=>r.lote_id===row.lote_id&&r.id!==row.id).forEach(r=>{r.vigente=false})
    row.vigente=true
    trace(next,actor,n(row.lote_id),'clasificacion',key,row.id,'Calidad: '+row.categoria)
  }
  if (key==='registro_temperatura') {
    if(row.origen!=='manual')throw Error('No hay sensores conectados. Las lecturas de este prototipo se registran manualmente.')
    const stocks=rows(next,'existencia').filter(s=>s.camara_id===row.camara_id&&(!n(row.lote_id)||s.lote_id===row.lote_id))
    for(const stock of stocks) {
      const range=rows(next,'rango_temperatura_producto').find(r=>r.producto_id===stock.producto_id)
      if(!range)continue
      if(n(row.temperatura)<n(range.temp_min)||n(row.temperatura)>n(range.temp_max)) {
        let alert=rows(next,'alerta_temperatura').find(a=>a.camara_id===row.camara_id&&a.estado==='abierta')
        if(!alert)alert=add(next,'alerta_temperatura',{registro_id:row.id,camara_id:row.camara_id,fecha_inicio:row.fecha_hora,minutos_fuera_rango:0,lote_retenido:false,estado:'abierta'})
        alert.minutos_fuera_rango=Math.max(0,Math.floor((Date.parse(String(row.fecha_hora))-Date.parse(String(alert.fecha_inicio)))/60000))
        if(n(alert.minutos_fuera_rango)>n(range.minutos_para_cuarentena)){alert.lote_retenido=true;for(const affected of stocks)if(n(affected.lote_id))getRecord(next,'lote',n(affected.lote_id)).estado='cuarentena'}
      }
      trace(next,actor,n(stock.lote_id),'temperatura',key,row.id,String(row.temperatura)+' °C')
    }
  }
  if (key==='cobro'||key==='pago') {
    const account=getRecord(next,key==='cobro'?'cuenta_por_cobrar':'cuenta_por_pagar',n(row[key==='cobro'?'cuenta_cobrar_id':'cuenta_pagar_id']))
    if(n(row.monto)>n(account.saldo))throw Error('El importe supera el saldo pendiente.')
    account.saldo=round(n(account.saldo)-n(row.monto));account.estado=n(account.saldo)===0?'pagada':'parcial'
  }
  if(key==='nota_credito') {
    const invoice=getRecord(next,'factura',n(row.factura_id)),previous=rows(next,'nota_credito').filter(c=>c.factura_id===invoice.id&&c.id!==row.id).reduce((sum,c)=>sum+n(c.monto),0)
    if(invoice.estado!=='emitida'||n(row.monto)>n(invoice.total)-previous)throw Error('La nota supera el importe facturado pendiente de acreditar.')
    row.uuid_fel='DEMO-NC-'+row.id
    const account=rows(next,'cuenta_por_cobrar').find(c=>c.factura_id===invoice.id)
    if(account){account.saldo=Math.max(0,round(n(account.saldo)-n(row.monto)));account.estado=n(account.saldo)?'parcial':'pagada'}
  }
  if (key==='seguimiento_reclamo') {
    const claim=getRecord(next,'reclamo',n(row.reclamo_id))
    if(['cerrado','rechazado'].includes(String(claim.estado)))throw Error('El reclamo ya está cerrado.')
    if(row.estado_resultante)claim.estado=row.estado_resultante
    if(['resuelto','cerrado'].includes(String(claim.estado))){claim.solucion=row.comentario;claim.fecha_cierre=stamp(next)}
  }
  if (key==='merma') {
    const lot=getRecord(next,'lote',n(row.lote_id)),stock=rows(next,'existencia').find(s=>s.lote_id===lot.id&&s.almacen_id===row.almacen_id)
    if(!stock||n(stock.cantidad)-n(stock.cantidad_reservada)<n(row.cantidad_kg))throw Error('No hay existencia libre suficiente para la merma.')
    if((n(row.cantidad_kg)>50||n(row.cantidad_kg)>n(lot.peso_kg)*.05)&&!['Administrador','Gerente','Supervisor'].includes(actor.role))throw Error('Merma superior a 50 kg o 5 %: requiere Gerencia o Supervisor.')
    row.aprobado_por=actor.id;stock.cantidad=round(n(stock.cantidad)-n(row.cantidad_kg));row.movimiento_id=movement(next,actor,'merma',stock,n(row.cantidad_kg),key,row.id,0,String(row.motivo)).id
  }
  if (key==='devolucion') {
    const order=getRecord(next,'pedido',n(row.pedido_id)),lot=getRecord(next,'lote',n(row.lote_id))
    const shipped=rows(next,'detalle_despacho').filter(d=>d.lote_id===lot.id&&getRecord(next,'despacho',n(d.despacho_id)).pedido_id===order.id).reduce((sum,d)=>sum+n(d.cantidad_kg),0)
    const returned=rows(next,'devolucion').filter(d=>d.id!==row.id&&d.lote_id===lot.id&&d.pedido_id===order.id).reduce((sum,d)=>sum+n(d.cantidad_kg),0)
    if(n(row.cantidad_kg)>shipped-returned)throw Error('La devolución supera la cantidad despachada de este lote.')
    if(n(row.reclamo_id)&&getRecord(next,'reclamo',n(row.reclamo_id)).pedido_id!==order.id)throw Error('El reclamo no pertenece al pedido.')
    if(row.destino==='reintegro_inventario') {
      if(lot.estado==='cuarentena'||lot.estado==='vencido'||String(lot.fecha_vencimiento)<next.clock)throw Error('No se puede reintegrar un lote vencido o en cuarentena.')
      const stock=rows(next,'existencia').find(s=>s.lote_id===lot.id)
      if(!stock)throw Error('No se encuentra la ubicación del lote.')
      stock.cantidad=round(n(stock.cantidad)+n(row.cantidad_kg));row.movimiento_id=movement(next,actor,'entrada',stock,n(row.cantidad_kg),key,row.id,0,'Devolución').id
    }
    const invoice=rows(next,'factura').find(f=>f.pedido_id===order.id&&f.estado==='emitida')
    if(invoice) {
      const detail=rows(next,'detalle_pedido').find(d=>d.pedido_id===order.id&&d.producto_id===lot.producto_id)
      const amount=Math.min(n(invoice.total),round(n(row.cantidad_kg)*(detail?n(detail.subtotal)/n(detail.cantidad):0)))
      const credit=add(next,'nota_credito',{factura_id:invoice.id,fecha:stamp(next),motivo:'Devolución '+row.id,monto:amount,uuid_fel:'DEMO-NC-'+row.id});row.nota_credito_id=credit.id
      const account=rows(next,'cuenta_por_cobrar').find(c=>c.factura_id===invoice.id);if(account){account.saldo=Math.max(0,round(n(account.saldo)-amount));account.estado=n(account.saldo)===0?'pagada':'parcial'}
    }
    trace(next,actor,lot.id,'devolucion',key,row.id,String(row.destino)+' · '+row.cantidad_kg+' kg')
  }
  recalculate(next,key,row)
  if(n(row.total)<0)throw Error('Los descuentos no pueden superar el subtotal del documento.')
  return finish(before,next,actor,key,row.id,id===null?'crear':'editar')
}

function datePlus(date: string, days: number) {const value=new Date(date+'T12:00Z');value.setUTCDate(value.getUTCDate()+days);return value.toISOString().slice(0,10)}

export function deleteEntity(before: ErpState, actor: Actor, key: string, id: number): ErpState {
  requirePermission(before,actor,key,'anular')
  if(SCHEMA[key].readOnly||['cobro','pago','merma','devolucion','cosecha','aplicacion_agroquimica','registro_temperatura','anticipo','nota_credito','destajo','mantenimiento'].includes(key))throw Error('No se pueden eliminar operaciones contabilizadas o con trazabilidad.')
  const original=getRecord(before,key,id)
  if(['pedido','cotizacion_venta','orden_compra','embarque','reclamo'].includes(key)&&!['registrado','borrador','planificado','abierto'].includes(String(original.estado)))throw Error('El registro está en proceso. Usa su acción de cancelación o cierre.')
  for(const entity of ENTITIES)for(const field of entity.fields)if(field.reference===key&&before.tables[entity.key].some(r=>r[field.name]===original[field.referenceField??'id']))throw Error('No se puede eliminar: existen registros relacionados en '+entity.title+'.')
  const next=structuredClone(before);next.tables[key]=next.tables[key].filter(r=>r.id!==id);recalculate(next,key,original)
  return finish(before,next,actor,key,id,'eliminar')
}

function changeOrderState(state: ErpState, actor: Actor, order: EntityRecord, status: string) {
  add(state,'historial_estado_pedido',{pedido_id:order.id,estado_anterior:order.estado,estado_nuevo:status,usuario_id:actor.id,fecha_hora:stamp(state),comentario:'Transición de demostración'})
  order.estado=status
}

export function actionsFor(key: string, row: EntityRecord): { action: BusinessAction; label: string }[] {
  if(key==='solicitud_compra'&&row.estado==='pendiente')return [{action:'aprobar',label:'Aprobar solicitud'}]
  if(key==='cotizacion_compra'&&!row.seleccionada)return [{action:'ordenar',label:'Seleccionar y crear orden'}]
  if(key==='orden_compra')return row.estado==='borrador'?[{action:'aprobar',label:'Emitir orden'}]:['emitida','parcial'].includes(String(row.estado))?[{action:'recibir',label:'Registrar recepción'}]:[]
  if(key==='cotizacion_venta')return row.estado==='aprobada'?[{action:'convertir',label:'Convertir a pedido'}]:['borrador','enviada'].includes(String(row.estado))?[{action:'aprobar',label:'Aprobar cotización'}]:[]
  if(key==='pedido') {
    const actions: { action: BusinessAction; label: string }[]=[]
    if(['registrado','en_revision'].includes(String(row.estado)))actions.push({action:'confirmar',label:'Confirmar y reservar FEFO'})
    if(row.estado==='confirmado')actions.push({action:'preparar',label:'Iniciar preparación'})
    if(row.estado==='en_preparacion')actions.push({action:'despachar',label:'Despachar reservas'})
    if(row.estado==='despachado'||row.estado==='en_transito')actions.push({action:'entregar',label:'Confirmar entrega'})
    if(['despachado','en_transito','entregado'].includes(String(row.estado)))actions.push({action:'facturar',label:'Emitir factura demo'})
    if(['registrado','en_revision','confirmado','en_preparacion'].includes(String(row.estado)))actions.push({action:'cancelar',label:'Cancelar y liberar reservas'})
    return actions
  }
  if(key==='embarque')return ['planificado','en_preparacion'].includes(String(row.estado))?[{action:'documentos',label:'Preparar expediente demo'},{action:'despachar',label:'Autorizar salida'}]:row.estado==='despachado'?[{action:'entregar',label:'Confirmar entrega'}]:row.estado==='entregado'?[{action:'cerrar',label:'Cerrar expediente'}]:[]
  if(key==='lote'&&row.estado==='cuarentena')return [{action:'recibir',label:'Recibir cosecha clasificada'},{action:'liberar',label:'Liberar cuarentena'}]
  if(key==='alerta_temperatura'&&row.estado!=='cerrada')return [{action:'resolver',label:'Atender y cerrar incidente'}]
  if(key==='cola_sincronizacion'&&row.estado==='pendiente')return [{action:'sincronizar',label:'Simular envío'}]
  if(key==='cola_sincronizacion'&&['conflicto','error'].includes(String(row.estado)))return [{action:'resolver',label:'Resolver: conservar versión local'}]
  if(key==='reclamo'&&!['cerrado','rechazado'].includes(String(row.estado)))return [{action:'cerrar',label:'Resolver y cerrar reclamo'}]
  if(key==='anticipo'&&!row.aplicado)return [{action:'aplicar',label:'Aplicar a cuenta del pedido'}]
  return []
}

export function runAction(before: ErpState, actor: Actor, key: string, id: number, action: BusinessAction, args: Record<string,Cell> = {}): ErpState {
  requirePermission(before,actor,key,'aprobar')
  const next=structuredClone(before), row=getRecord(next,key,id)
  if(!actionsFor(key,row).some(a=>a.action===action))throw Error('Esta acción no está disponible para el estado actual.')
  if(key==='solicitud_compra'&&action==='aprobar') {
    if(row.solicitante_id===actor.id)throw Error('El aprobador debe ser distinto del solicitante.')
    if(!rows(next,'detalle_solicitud').some(d=>d.solicitud_id===id))throw Error('Agrega los productos solicitados antes de aprobar.')
    row.estado='aprobada';row.aprobador_id=actor.id
  }
  if(key==='cotizacion_compra'&&action==='ordenar') {
    const request=getRecord(next,'solicitud_compra',n(row.solicitud_id))
    if(request.estado!=='aprobada')throw Error('La solicitud de compra debe estar aprobada.')
    if(rows(next,'orden_compra').some(o=>o.cotizacion_id===id))throw Error('Ya existe una orden para esta cotización.')
    const details=rows(next,'detalle_solicitud').filter(d=>d.solicitud_id===request.id)
    if(!details.length)throw Error('La solicitud no tiene productos.')
    const estimate=details.reduce((sum,d)=>sum+n(d.cantidad)*n(getRecord(next,'producto',n(d.producto_id)).precio_referencia),0)
    rows(next,key).filter(q=>q.solicitud_id===request.id).forEach(q=>{q.seleccionada=q.id===id})
    const order=add(next,'orden_compra',{numero:'OC-DEMO-'+(next.counters.orden_compra+1),proveedor_id:row.proveedor_id,solicitud_id:request.id,cotizacion_id:id,fecha:next.clock,fecha_entrega:datePlus(next.clock,3),lugar_entrega:'Bodega principal',moneda_id:row.moneda_id,subtotal:row.total,total:row.total,estado:'borrador'})
    details.forEach(d=>add(next,'detalle_orden_compra',{orden_id:order.id,producto_id:d.producto_id,cantidad:d.cantidad,precio_unitario:estimate? n(row.total)*n(getRecord(next,'producto',n(d.producto_id)).precio_referencia)/estimate:n(row.total)/details.reduce((sum,x)=>sum+n(x.cantidad),0),cantidad_recibida:0}))
  }
  if(key==='orden_compra'&&action==='aprobar') {
    const request=n(row.solicitud_id)?getRecord(next,'solicitud_compra',n(row.solicitud_id)):null
    if(request&&request.estado!=='aprobada')throw Error('La solicitud vinculada debe estar aprobada.')
    if(request?.solicitante_id===actor.id)throw Error('El solicitante no puede aprobar su propia compra.')
    if(!rows(next,'detalle_orden_compra').some(d=>d.orden_id===id))throw Error('La orden debe contener productos.')
    row.estado='emitida';row.aprobador_id=actor.id
  }
  if(key==='orden_compra'&&action==='recibir') {
    const warehouse=getRecord(next,'almacen',n(args.almacen_id)||1)
    if(warehouse.estado!=='activo')throw Error('El almacén no está activo.')
    const details=rows(next,'detalle_orden_compra').filter(d=>d.orden_id===id), receive=add(next,'recepcion_compra',{orden_id:id,almacen_id:warehouse.id,fecha:stamp(next),responsable_id:actor.id,observaciones:String(args.observaciones||'Recepción de demostración')})
    let total=0,count=0
    for(const line of details) {
      const pending=round(n(line.cantidad)-n(line.cantidad_recibida)), qty=Object.hasOwn(args,'line_'+line.id)?n(args['line_'+line.id]):pending
      if(qty<0||qty>pending)throw Error('La recepción no puede exceder la cantidad pendiente.')
      if(!qty)continue
      count++;line.cantidad_recibida=round(n(line.cantidad_recibida)+qty)
      add(next,'detalle_recepcion',{recepcion_id:receive.id,detalle_orden_id:line.id,cantidad_recibida:qty,lote_insumo:'REC-'+receive.id,fecha_vencimiento:datePlus(next.clock,365)})
      let stock=rows(next,'existencia').find(s=>s.producto_id===line.producto_id&&s.almacen_id===warehouse.id&&s.lote_insumo==='REC-'+receive.id)
      if(!stock)stock=add(next,'existencia',{producto_id:line.producto_id,almacen_id:warehouse.id,lote_insumo:'REC-'+receive.id,fecha_vencimiento:datePlus(next.clock,365),cantidad:0,cantidad_reservada:0})
      stock.cantidad=round(n(stock.cantidad)+qty);movement(next,actor,'entrada',stock,qty,'recepcion_compra',receive.id)
      total=round(total+qty*n(line.precio_unitario))
    }
    if(!count)throw Error('Ingresa al menos una cantidad a recibir.')
    row.estado=details.every(d=>n(d.cantidad_recibida)>=n(d.cantidad))?'recibida':'parcial'
    add(next,'cuenta_por_pagar',{proveedor_id:row.proveedor_id,recepcion_id:receive.id,numero_factura:'DEMO-REC-'+receive.id,monto_original:total,saldo:total,moneda_id:row.moneda_id,fecha_vencimiento:datePlus(next.clock,n(getRecord(next,'proveedor',n(row.proveedor_id)).condiciones_pago_dias)),estado:'pendiente'})
  }
  if(key==='cotizacion_venta') {
    if(String(row.vigente_hasta)<next.clock)throw Error('La cotización ya venció.')
    const details=rows(next,'detalle_cotizacion_venta').filter(d=>d.cotizacion_id===id)
    if(!details.length)throw Error('La cotización debe tener productos.')
    if(action==='aprobar')row.estado='aprobada'
    if(action==='convertir') {
      if(rows(next,'pedido').some(p=>p.cotizacion_id===id))throw Error('Esta cotización ya se convirtió.')
      const client=getRecord(next,'cliente',n(row.cliente_id)),rate=rows(next,'tipo_cambio').find(r=>r.moneda_id===row.moneda_id&&String(r.fecha)<=next.clock)
      if(row.moneda_id!==1&&!rate)throw Error('Falta el tipo de cambio de la cotización.')
      const order=add(next,'pedido',{numero:'PED-DEMO-'+(next.counters.pedido+1),cliente_id:row.cliente_id,vendedor_id:row.vendedor_id,cotizacion_id:id,fecha_pedido:stamp(next),fecha_entrega_prometida:datePlus(next.clock,3),moneda_id:row.moneda_id,tipo_cambio:row.moneda_id===1?1:n(rate?.valor),es_exportacion:client.tipo==='internacional',subtotal:row.total,total:row.total,estado:'registrado'})
      details.forEach(d=>add(next,'detalle_pedido',{pedido_id:order.id,producto_id:d.producto_id,cantidad:d.cantidad,precio_unitario:d.precio_unitario,subtotal:round(n(d.cantidad)*n(d.precio_unitario)),descuento:0}))
      row.estado='convertida'
      changeOrderState(next,actor,order,'en_revision')
    }
  }
  if(key==='pedido') {
    const details=rows(next,'detalle_pedido').filter(d=>d.pedido_id===id), detailIds=new Set(details.map(d=>d.id)), reservations=rows(next,'reserva').filter(r=>detailIds.has(n(r.detalle_pedido_id))&&r.estado==='activa')
    if(action==='confirmar') {
      const client=getRecord(next,'cliente',n(row.cliente_id))
      if(client.estado!=='activo')throw Error('El cliente está inactivo.')
      if(!details.length)throw Error('Agrega productos al pedido antes de confirmar.')
      const due=rows(next,'cuenta_por_cobrar').filter(c=>c.cliente_id===client.id&&n(c.saldo)>0)
      const debt=due.reduce((sum,c)=>{const invoice=getRecord(next,'factura',n(c.factura_id));return sum+n(c.saldo)*n(invoice.tipo_cambio||1)},0)
      if((due.some(c=>String(c.fecha_vencimiento)<next.clock)||debt+n(row.total)*n(row.tipo_cambio)>n(client.limite_credito)*(client.moneda_id===1?1:n(row.tipo_cambio)))&&!['Administrador','Gerente'].includes(actor.role))throw Error('Cliente con deuda vencida o límite de crédito excedido: requiere Gerencia.')
      if(reservations.length)throw Error('El pedido ya tiene reservas activas.')
      for(const line of details) {
        let needed=n(line.cantidad)
        const available=rows(next,'existencia').filter(stock=>{
          if(stock.producto_id!==line.producto_id||!n(stock.lote_id))return false
          const lot=getRecord(next,'lote',n(stock.lote_id))
          return ['disponible','reservado'].includes(String(lot.estado))&&(!lot.fecha_vencimiento||String(lot.fecha_vencimiento)>=next.clock)&&n(stock.cantidad)>n(stock.cantidad_reservada)
        }).sort((a,b)=>String(a.fecha_vencimiento||'9999').localeCompare(String(b.fecha_vencimiento||'9999'))||a.id-b.id)
        for(const stock of available) {
          const quantity=round(Math.min(needed,n(stock.cantidad)-n(stock.cantidad_reservada)))
          if(quantity<=0)continue
          add(next,'reserva',{detalle_pedido_id:line.id,existencia_id:stock.id,lote_id:stock.lote_id,cantidad:quantity,estado:'activa',creada_en:stamp(next)})
          stock.cantidad_reservada=round(n(stock.cantidad_reservada)+quantity);needed=round(needed-quantity)
          trace(next,actor,n(stock.lote_id),'reserva','pedido',id,'Reserva FEFO: '+quantity)
          if(!needed)break
        }
        if(needed>0)throw Error('Inventario insuficiente para '+recordLabel(next,'producto',getRecord(next,'producto',n(line.producto_id)))+'. No se reservaron cantidades parciales.')
      }
      row.aprobado_por=actor.id;changeOrderState(next,actor,row,'confirmado')
    }
    if(action==='preparar')changeOrderState(next,actor,row,'en_preparacion')
    if(action==='cancelar') {reservations.forEach(r=>{const stock=getRecord(next,'existencia',n(r.existencia_id));stock.cantidad_reservada=round(n(stock.cantidad_reservada)-n(r.cantidad));r.estado='liberada'});changeOrderState(next,actor,row,'cancelado')}
    if(action==='despachar') {
      if(!reservations.length)throw Error('No hay reservas para despachar.')
      for(const line of details)if(Math.abs(reservations.filter(r=>r.detalle_pedido_id===line.id).reduce((sum,r)=>sum+n(r.cantidad),0)-n(line.cantidad))>.001)throw Error('Las reservas no cubren el pedido completo.')
      const dispatch=add(next,'despacho',{numero:'DES-DEMO-'+(next.counters.despacho+1),pedido_id:id,almacen_id:getRecord(next,'existencia',n(reservations[0].existencia_id)).almacen_id,responsable_id:actor.id,fecha:stamp(next),estado:'despachado'})
      for(const reservation of reservations) {
        const stock=getRecord(next,'existencia',n(reservation.existencia_id)),lot=getRecord(next,'lote',n(reservation.lote_id))
        if(!['disponible','reservado'].includes(String(lot.estado))||(lot.fecha_vencimiento&&String(lot.fecha_vencimiento)<next.clock))throw Error('Hay un lote vencido o en cuarentena; cancela y vuelve a reservar.')
        if(n(stock.cantidad)<n(reservation.cantidad)||n(stock.cantidad_reservada)<n(reservation.cantidad))throw Error('Las existencias cambiaron; revisa las reservas.')
        stock.cantidad=round(n(stock.cantidad)-n(reservation.cantidad));stock.cantidad_reservada=round(n(stock.cantidad_reservada)-n(reservation.cantidad));reservation.estado='consumida'
        add(next,'detalle_despacho',{despacho_id:dispatch.id,detalle_pedido_id:reservation.detalle_pedido_id,lote_id:lot.id,cantidad_kg:reservation.cantidad,cajas:Math.ceil(n(reservation.cantidad)/5)})
        movement(next,actor,'salida',stock,n(reservation.cantidad),'despacho',dispatch.id)
      }
      changeOrderState(next,actor,row,'despachado')
    }
    if(action==='entregar') {changeOrderState(next,actor,row,'entregado');rows(next,'despacho').filter(d=>d.pedido_id===id).forEach(d=>{d.estado='entregado';rows(next,'detalle_despacho').filter(line=>line.despacho_id===d.id).forEach(line=>trace(next,actor,n(line.lote_id),'entrega','pedido',id,'Entrega confirmada al cliente'))})}
    if(action==='facturar') {
      if(rows(next,'factura').some(f=>f.pedido_id===id&&f.estado==='emitida'))throw Error('El pedido ya tiene una factura emitida.')
      const invoice=add(next,'factura',{serie:'DEMO',numero:'FAC-DEMO-'+(next.counters.factura+1),pedido_id:id,cliente_id:row.cliente_id,fecha_emision:stamp(next),moneda_id:row.moneda_id,tipo_cambio:row.tipo_cambio,subtotal:row.subtotal,iva:row.impuesto,total:row.total,estado:'emitida',uuid_fel:'DEMO-SIN-VALIDEZ-'+(next.counters.factura+1)})
      details.forEach(d=>add(next,'detalle_factura',{factura_id:invoice.id,producto_id:d.producto_id,cantidad:d.cantidad,precio_unitario:d.precio_unitario,subtotal:d.subtotal}))
      add(next,'cuenta_por_cobrar',{factura_id:invoice.id,cliente_id:row.cliente_id,monto_original:row.total,saldo:row.total,fecha_vencimiento:datePlus(next.clock,n(getRecord(next,'cliente',n(row.cliente_id)).condiciones_pago_dias)),estado:'pendiente'})
    }
  }
  if(key==='lote'&&action==='recibir') {
    if(row.fecha_vencimiento&&String(row.fecha_vencimiento)<next.clock)throw Error('No se puede recibir un lote vencido como disponible.')
    if(rows(next,'existencia').some(s=>s.lote_id===id))throw Error('Este lote ya tiene existencias. Una cuarentena requiere revisión y liberación autorizada; no se recibe de nuevo.')
    const quality=rows(next,'clasificacion_calidad').find(q=>q.lote_id===id&&q.vigente)
    if(!quality||quality.categoria==='descarte')throw Error('Registra una clasificación vigente apta antes de recibir.')
    const warehouse=getRecord(next,'almacen',n(args.almacen_id)||1),camera=n(args.camara_id)?getRecord(next,'camara_fria',n(args.camara_id)):null
    if(camera&&camera.almacen_id!==warehouse.id)throw Error('La cámara no pertenece al almacén.')
    row.estado='disponible'
    const stock=add(next,'existencia',{producto_id:row.producto_id,lote_id:id,fecha_vencimiento:row.fecha_vencimiento,almacen_id:warehouse.id,camara_id:camera?.id??0,cantidad:row.peso_kg,cantidad_reservada:0})
    movement(next,actor,'entrada',stock,n(row.peso_kg),'lote',id)
  }
  if(key==='lote'&&action==='liberar') {
    if(!['Administrador','Gerente','Supervisor'].includes(actor.role))throw Error('La liberación requiere Supervisor o Gerencia.')
    if(!args.comentario)throw Error('Registra la justificación de liberación.')
    if(row.fecha_vencimiento&&String(row.fecha_vencimiento)<next.clock)throw Error('El lote está vencido y no puede liberarse.')
    const stocks=rows(next,'existencia').filter(s=>s.lote_id===id)
    if(!stocks.length)throw Error('Recibe la cosecha en almacén antes de liberar.')
    if(rows(next,'alerta_temperatura').some(a=>a.estado!=='cerrada'&&stocks.some(s=>s.camara_id===a.camara_id)))throw Error('Primero atiende los incidentes de temperatura de la cámara.')
    for(const stock of stocks.filter(s=>n(s.camara_id))) {
      const latest=rows(next,'registro_temperatura').filter(t=>t.camara_id===stock.camara_id).sort((a,b)=>String(b.fecha_hora).localeCompare(String(a.fecha_hora)))[0],range=rows(next,'rango_temperatura_producto').find(r=>r.producto_id===row.producto_id)
      if(range&&(!latest||n(latest.temperatura)<n(range.temp_min)||n(latest.temperatura)>n(range.temp_max)))throw Error('Registra una lectura dentro de rango antes de liberar el lote.')
    }
    if(!rows(next,'clasificacion_calidad').some(c=>c.lote_id===id&&c.vigente&&c.categoria!=='descarte'))throw Error('Se requiere clasificación de calidad apta.')
    row.estado='disponible';trace(next,actor,id,'clasificacion','lote',id,'Liberación autorizada: '+args.comentario)
  }
  if(key==='embarque') {
    if(action==='documentos') {
      for(const type of ['packing_list','factura_comercial','certificado_fitosanitario','certificado_origen','otro']) {
        const document=rows(next,'documento_exportacion').find(d=>d.embarque_id===id&&d.tipo===type)
        if(document){document.completo=true;document.generado_automaticamente=true}
        else add(next,'documento_exportacion',{embarque_id:id,tipo:type,numero:'DEMO-DOC-'+id+'-'+type,responsable_id:actor.id,completo:true,generado_automaticamente:true,archivo_url:'Documento simulado sin validez oficial'})
      }
      row.estado='en_preparacion'
    }
    if(action==='despachar') {
      const documents=rows(next,'documento_exportacion').filter(d=>d.embarque_id===id)
      if(!['packing_list','factura_comercial','certificado_fitosanitario','certificado_origen'].every(type=>documents.some(d=>d.tipo===type&&d.completo)))throw Error('Faltan documentos obligatorios del expediente.')
      const orders=rows(next,'pedido').filter(p=>p.embarque_id===id)
      if(!orders.length||orders.some(p=>!['despachado','entregado'].includes(String(p.estado))))throw Error('Vincula al menos un pedido y despacha sus productos antes de autorizar la salida.')
      row.estado='despachado'
    }
    if(action==='entregar')row.estado='entregado'
    if(action==='cerrar')row.estado='cerrado'
  }
  if(key==='alerta_temperatura'&&action==='resolver'){if(!args.comentario)throw Error('Registra la medida correctiva.');row.estado='cerrada';row.fecha_fin=stamp(next);row.atendida_por=actor.id;row.accion_tomada=args.comentario}
  if(key==='reclamo'&&action==='cerrar'){if(!args.comentario)throw Error('Describe la solución aplicada.');row.solucion=args.comentario;row.estado='cerrado';row.fecha_cierre=stamp(next);add(next,'seguimiento_reclamo',{reclamo_id:id,usuario_id:actor.id,fecha:stamp(next),comentario:args.comentario,estado_resultante:'cerrado'})}
  if(key==='anticipo'&&action==='aplicar') {
    const invoice=rows(next,'factura').find(f=>f.pedido_id===row.pedido_id&&f.cliente_id===row.cliente_id&&f.moneda_id===row.moneda_id&&f.estado==='emitida'),account=invoice&&rows(next,'cuenta_por_cobrar').find(c=>c.factura_id===invoice.id)
    if(!account||n(row.monto)>n(account.saldo))throw Error('No hay una cuenta del pedido en la misma moneda con saldo suficiente.')
    account.saldo=round(n(account.saldo)-n(row.monto));account.estado=n(account.saldo)?'parcial':'pagada';row.aplicado=true
    add(next,'cobro',{cuenta_cobrar_id:account.id,fecha:next.clock,monto:row.monto,metodo:'Anticipo',referencia:'ANT-'+id,usuario_id:actor.id})
  }
  if(key==='cola_sincronizacion') {
    if(action==='resolver'){row.estado='pendiente';row.detalle_conflicto='Conservar versión local (demostración)'}
    if(action==='sincronizar') {
      if(args.conflicto){row.estado='conflicto';row.detalle_conflicto='Conflicto simulado: hay otra versión del registro.'}
      else {row.estado='sincronizado';row.sincronizado_en=stamp(next);row.detalle_conflicto='Sin envío a servidor; simulación local'}
    }
  }
  return finish(before,next,actor,key,id,action)
}

export function inventoryOperation(before: ErpState, actor: Actor, id: number, type: string, qty: number, destination: number, reason: string): ErpState {
  requirePermission(before,actor,'movimiento_inventario','aprobar')
  if(!Number.isFinite(qty)||(type==='ajuste'?qty<0:qty<=0)||!reason.trim())throw Error('Ingresa cantidad válida y motivo del movimiento.')
  if(!['entrada','salida','transferencia','ajuste'].includes(type))throw Error('Tipo de movimiento inválido.')
  const next=structuredClone(before),stock=getRecord(next,'existencia',id)
  if(type==='ajuste'&&!['Administrador','Gerente','Supervisor'].includes(actor.role))throw Error('Los ajustes requieren autorización de Supervisor o Gerencia.')
  if(['salida','transferencia'].includes(type)&&qty>n(stock.cantidad)-n(stock.cantidad_reservada))throw Error('No hay existencia libre suficiente.')
  if(type==='ajuste'&&qty<n(stock.cantidad_reservada))throw Error('El nuevo conteo no puede ser menor a lo reservado.')
  if(type==='transferencia') {
    if(destination===stock.almacen_id)throw Error('El almacén destino debe ser diferente del origen.')
    if(getRecord(next,'almacen',destination).estado!=='activo')throw Error('El almacén destino está inactivo.')
    let target=rows(next,'existencia').find(s=>s.producto_id===stock.producto_id&&s.lote_id===stock.lote_id&&s.lote_insumo===stock.lote_insumo&&s.almacen_id===destination&&n(s.camara_id)===0)
    if(!target)target=add(next,'existencia',{producto_id:stock.producto_id,lote_id:n(stock.lote_id),lote_insumo:stock.lote_insumo,fecha_vencimiento:stock.fecha_vencimiento,almacen_id:destination,cantidad:0,cantidad_reservada:0})
    target.cantidad=round(n(target.cantidad)+qty)
  }
  const difference=type==='ajuste'?Math.abs(n(stock.cantidad)-qty):qty
  if(difference===0)throw Error('El conteo coincide con la existencia; no hay ajuste que registrar.')
  movement(next,actor,type,stock,difference,'existencia',id,destination,reason)
  stock.cantidad=round(type==='ajuste'?qty:n(stock.cantidad)+(['entrada'].includes(type)?qty:-qty))
  return finish(before,next,actor,'existencia',id,type)
}
