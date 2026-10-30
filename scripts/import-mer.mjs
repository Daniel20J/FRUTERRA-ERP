import { readFileSync, writeFileSync } from 'node:fs'
const source = readFileSync('../../Mer ERP.txt', 'utf8')
const enums = Object.fromEntries([...source.matchAll(/Enum (\w+)\s*\{([^}]+)\}/g)].map(([, key, body]) => [key, body.trim().split(/\s+/)]))
const groups = {
  seguridad: 'rol permiso rol_permiso usuario bitacora_auditoria',
  clientes: 'cliente', proveedores: 'proveedor proveedor_producto',
  productos: 'moneda tipo_cambio incoterm categoria_producto unidad_medida producto producto_terminado insumo',
  cotizaciones: 'lista_precio detalle_lista_precio promocion cotizacion_venta detalle_cotizacion_venta',
  produccion: 'finca lote_terreno certificacion labor_agricola aplicacion_agroquimica plan_cosecha cosecha',
  lotes: 'lote clasificacion_calidad evento_trazabilidad etiqueta_lote',
  compras: 'solicitud_compra detalle_solicitud cotizacion_compra orden_compra detalle_orden_compra recepcion_compra detalle_recepcion',
  inventario: 'almacen existencia movimiento_inventario merma',
  frio: 'camara_fria rango_temperatura_producto registro_temperatura alerta_temperatura',
  ventas: 'pedido detalle_pedido historial_estado_pedido reserva despacho detalle_despacho',
  exportaciones: 'embarque documento_exportacion',
  finanzas: 'factura detalle_factura cuenta_por_cobrar cobro anticipo cuenta_por_pagar pago nota_credito',
  reclamos: 'reclamo seguimiento_reclamo devolucion',
  sincronizacion: 'dispositivo_registrado cola_sincronizacion',
}
const title = value => value.replaceAll('_', ' ').replace(/^./, c => c.toUpperCase())
const labels = { finca:'Fincas', lote_terreno:'Parcelas y variedades', certificacion:'Certificaciones', labor_agricola:'Labores agrícolas', aplicacion_agroquimica:'Aplicaciones y carencias', plan_cosecha:'Planificación de cosecha', cosecha:'Cosechas y boletas', lote:'Lotes de fruta', clasificacion_calidad:'Clasificación de calidad', evento_trazabilidad:'Historial de trazabilidad', etiqueta_lote:'Etiquetas de lote', solicitud_compra:'Solicitudes de compra', detalle_solicitud:'Productos solicitados', cotizacion_compra:'Comparación de cotizaciones', orden_compra:'Órdenes de compra', detalle_orden_compra:'Productos de la orden', recepcion_compra:'Recepciones', detalle_recepcion:'Detalle recibido', almacen:'Almacenes', existencia:'Existencias por ubicación', movimiento_inventario:'Movimientos de inventario', merma:'Mermas', camara_fria:'Cámaras de refrigeración', rango_temperatura_producto:'Rangos por producto', registro_temperatura:'Lecturas de temperatura', alerta_temperatura:'Alertas e incidentes', cliente:'Clientes', proveedor:'Proveedores', producto:'Productos e insumos', producto_terminado:'Frutas y variedades', insumo:'Insumos agrícolas', promocion:'Promociones', lista_precio:'Listas de precios', detalle_lista_precio:'Precios por producto', cotizacion_venta:'Cotizaciones comerciales', detalle_cotizacion_venta:'Productos cotizados', pedido:'Pedidos', detalle_pedido:'Productos del pedido', historial_estado_pedido:'Historial de pedidos', reserva:'Reservas FEFO', despacho:'Despachos y entregas', detalle_despacho:'Lotes despachados', embarque:'Embarques', documento_exportacion:'Expedientes y documentos', factura:'Facturas de venta', detalle_factura:'Detalle facturado', cuenta_por_cobrar:'Cuentas por cobrar', cuenta_por_pagar:'Cuentas por pagar', cobro:'Cobros', pago:'Pagos', anticipo:'Anticipos', nota_credito:'Notas de crédito', reclamo:'Reclamos', seguimiento_reclamo:'Seguimiento de reclamos', devolucion:'Devoluciones', rol:'Roles', permiso:'Permisos', rol_permiso:'Permisos por rol', usuario:'Usuarios y perfiles', bitacora_auditoria:'Bitácora de auditoría', dispositivo_registrado:'Dispositivos', cola_sincronizacion:'Cola y conflictos', tipo_cambio:'Tipos de cambio', moneda:'Monedas', incoterm:'Incoterms', categoria_producto:'Categorías', unidad_medida:'Unidades de medida', proveedor_producto:'Productos por proveedor' }
const fieldLabels = { id:'ID', cliente_id:'Cliente', producto_id:'Producto', proveedor_id:'Proveedor', lote_id:'Lote', almacen_id:'Almacén', finca_id:'Finca', responsable_id:'Responsable', usuario_id:'Usuario', vendedor_id:'Vendedor', moneda_id:'Moneda', pedido_id:'Pedido', lote_terreno_id:'Parcela', camara_id:'Cámara', orden_id:'Orden de compra', factura_id:'Factura', razon_social:'Razón social', fecha_vencimiento:'Vencimiento', fecha_hora:'Fecha y hora', uuid_cliente:'Referencia de dispositivo', nombre_completo:'Nombre completo', cantidad_reservada:'Cantidad reservada', temp_min:'Temperatura mínima °C', temp_max:'Temperatura máxima °C', temperatura:'Temperatura °C', area_ha:'Área (ha)', peso_kg:'Peso (kg)', fecha_fin_carencia:'Fin de carencia', correo:'Correo electrónico', tipo_cambio:'Tipo de cambio', condiciones_pago_dias:'Crédito (días)', precio_unitario:'Precio unitario', fecha_entrega_prometida:'Entrega prometida', fecha_limite_documentos:'Límite de documentos' }
const readonly = new Set('bitacora_auditoria evento_trazabilidad historial_estado_pedido movimiento_inventario reserva despacho detalle_despacho recepcion_compra detalle_recepcion factura detalle_factura cuenta_por_cobrar cuenta_por_pagar'.split(' '))
const entities = []
for (const [, key, body] of source.matchAll(/Table (\w+)\s*\{([\s\S]*?)\n\}/g)) {
  const fields = []
  for (const line of body.split('\n')) {
    const match = line.trim().match(/^(\w+)\s+(\w+)(?:\([^)]*\))?(?:\s+\[(.*)\])?$/)
    if (!match) continue
    const [, name, datatype, attrs = ''] = match
    if (name === 'password_hash') continue
    const reference = attrs.match(/ref:\s*[>-]\s*(\w+)\.(\w+)/)
    const value = attrs.match(/default:\s*'([^']+)'/)?.[1] ?? attrs.match(/default:\s*(true|false|\d+)/)?.[1]
    const field = { name, label: fieldLabels[name] ?? title(name.replace(/_id$/, '')), type: datatype === 'boolean' ? 'checkbox' : ['integer','bigint','smallint','decimal'].includes(datatype) ? 'number' : datatype === 'timestamp' ? 'datetime-local' : ['date','time'].includes(datatype) ? datatype : datatype === 'jsonb' || ['descripcion','observaciones','solucion','comentario','justificacion','condiciones'].includes(name) ? 'textarea' : name === 'correo' ? 'email' : 'text', required: attrs.includes('not null') || attrs.includes('pk'), unique: attrs.includes('unique') || (attrs.includes('pk') && name!=='id'), ...(enums[datatype] ? {options:enums[datatype]} : {}), ...(reference ? {reference:reference[1],referenceField:reference[2]} : {}), ...(value !== undefined ? {defaultValue:datatype==='boolean'?value==='true':/^[0-9.]+$/.test(value)?Number(value):value} : {}), ...(name==='id'||['creado_en','generada_en','actualizado_en','uuid_cliente'].includes(name)?{generated:true}:{}) }
    fields.push(field)
  }
  const group = Object.entries(groups).find(([, values]) => values.split(' ').includes(key))?.[0] ?? 'seguridad'
  const uniques = [...body.matchAll(/\(\s*([^()]+)\)\s*\[(?:unique|pk)\]/g)].map(m => m[1].split(',').map(v=>v.trim()))
  entities.push({key,title:labels[key]??title(key),group,fields,columns:fields.filter(f=>!f.generated).slice(0,5).map(f=>f.name),...(readonly.has(key)?{readOnly:true}:{}),...(uniques.length?{uniqueGroups:uniques}:{})})
}
writeFileSync('src/data/merSchema.ts', "import type { EntityDefinition } from '../types/erp'\n// Catálogos y relaciones transcritos del MER del proyecto.\nexport const MER_ENTITIES: EntityDefinition[] = " + JSON.stringify(entities,null,2) + '\n')
console.log(`Imported ${entities.length} entities from MER`)
