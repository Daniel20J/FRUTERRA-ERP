import { MER_ENTITIES } from './merSchema'
import type { EntityDefinition, FieldDefinition } from '../types/erp'

const field = (name: string, label: string, type: FieldDefinition['type'] = 'text', reference?: string): FieldDefinition => ({ name, label, type, required: true, ...(reference ? { reference, referenceField: 'id' } : {}) })
const extra = (key: string, title: string, group: string, fields: FieldDefinition[]): EntityDefinition => ({ key, title, group, fields: [{ ...field('id', 'ID', 'number'), generated: true }, ...fields], columns: fields.slice(0, 5).map(f => f.name) })
export const ENTITIES: EntityDefinition[] = [...MER_ENTITIES, 
  extra('equipo', 'Maquinaria y equipo', 'produccion', [field('nombre','Equipo'), field('finca_id','Finca','number','finca'),field('horas_uso','Horas de uso','number'),field('proximo_mantenimiento','Próximo mantenimiento','date'),field('estado','Estado')]),
  extra('mantenimiento', 'Mantenimiento y combustible', 'produccion', [field('equipo_id','Equipo','number','equipo'),field('fecha','Fecha','date'),field('horas','Horas registradas','number'),field('combustible_litros','Combustible (litros)','number'),field('costo','Costo GTQ','number'),field('observaciones','Trabajo realizado','textarea')]),
  extra('costo_produccion', 'Costos de producción', 'produccion', [field('lote_terreno_id','Parcela','number','lote_terreno'),field('fecha','Fecha','date'),field('concepto','Concepto'),field('tipo','Insumos / mano de obra / maquinaria'),field('monto','Monto GTQ','number')]),
  extra('destajo', 'Planilla por destajo', 'produccion', [field('cosecha_id','Cosecha','number','cosecha'),field('trabajador','Trabajador o cuadrilla'),field('cajas','Cajas','number'),field('tarifa_caja','Tarifa por caja GTQ','number'),{...field('total','Total GTQ','number'),generated:true}]),
  extra('incidencia_campo', 'Incidencias y clima', 'produccion', [field('lote_terreno_id','Parcela','number','lote_terreno'),field('fecha','Fecha','date'),field('tipo','Plaga / enfermedad / clima'),field('descripcion','Descripción','textarea'),{...field('evidencia_url','Referencia de evidencia'),required:false},field('estado','Estado')]),
  extra('visita', 'Visitas y seguimiento', 'clientes', [field('cliente_id','Cliente','number','cliente'),field('vendedor_id','Vendedor','number','usuario'),field('fecha','Fecha','date'),field('ruta','Ruta'),field('comentario','Seguimiento','textarea'),field('estado','Estado')]),
  extra('meta_venta', 'Metas y comisiones', 'ventas', [field('vendedor_id','Vendedor','number','usuario'),field('desde','Desde','date'),field('hasta','Hasta','date'),field('meta','Meta GTQ','number'),field('comision_porcentaje','Comisión %','number')]),
  extra('solicitud_portal', 'Solicitudes del cliente', 'portalcliente', [field('cliente_id','Cliente','number','cliente'),field('pedido_id','Pedido','number','pedido'),field('fecha','Fecha','date'),field('tipo','Solicitud'),field('descripcion','Descripción','textarea'),field('estado','Estado')]),
]
export const SCHEMA = Object.fromEntries(ENTITIES.map(entity => [entity.key, entity]))
export const PRIMARY_ENTITY: Record<string, string> = { produccion:'labor_agricola', lotes:'lote',inventario:'existencia',frio:'registro_temperatura',ventas:'pedido',cotizaciones:'cotizacion_venta',clientes:'cliente',proveedores:'proveedor',productos:'producto',compras:'orden_compra',exportaciones:'embarque',finanzas:'factura',reclamos:'reclamo',seguridad:'usuario',sincronizacion:'cola_sincronizacion',portalcliente:'solicitud_portal' }
const columns: Record<string, string[]> = {
  cliente:['codigo','razon_social','tipo','pais','limite_credito','estado'],proveedor:['codigo','razon_social','contacto','condiciones_pago_dias','estado'],producto:['codigo','nombre','tipo','unidad_medida_id','precio_referencia','stock_minimo','estado'],
  pedido:['numero','cliente_id','fecha_entrega_prometida','moneda_id','total','estado'],lote:['codigo','producto_id','finca_id','fecha_cosecha','fecha_vencimiento','peso_kg','estado'],existencia:['producto_id','lote_id','almacen_id','camara_id','cantidad','cantidad_reservada'],
  orden_compra:['numero','proveedor_id','fecha_entrega','moneda_id','total','estado'],registro_temperatura:['camara_id','lote_id','temperatura','humedad','fecha_hora','origen'],embarque:['codigo','cliente_id','pais_destino','contenedor','fecha_salida','estado'],
  factura:['serie','numero','cliente_id','moneda_id','total','estado'],cotizacion_venta:['numero','cliente_id','vigente_hasta','moneda_id','total','estado'],reclamo:['numero','cliente_id','pedido_id','lote_id','tipo','estado'],
  usuario:['username','nombre_completo','correo','rol_id','estado'],cola_sincronizacion:['dispositivo_id','entidad','operacion','creado_en','estado'],bitacora_auditoria:['fecha_hora','usuario_id','modulo','accion','entidad','entidad_id'],
}
const generated = new Set(['subtotal','impuestos','impuesto','iva','total','saldo','cantidad_recibida','valor_anterior','valor_nuevo','sincronizado_en','detalle_conflicto','intentos_fallidos','bloqueado_hasta','ultimo_acceso','mfa_habilitado','uuid_fel','movimiento_id','nota_credito_id'])
for (const entity of ENTITIES) {
  entity.columns = columns[entity.key] ?? entity.columns
  for (const field of entity.fields) {
    if (generated.has(field.name) && !['cotizacion_compra','promocion','nota_credito'].includes(entity.key)) field.generated = true
    if (field.name === 'estado' && ['pedido','cotizacion_venta','solicitud_compra','orden_compra','embarque','reclamo'].includes(entity.key)) field.generated = true
    if (field.name === 'fecha_hora' || field.name === 'fecha_emision') field.defaultValue = '2026-10-29T09:00'
    if (['usuario_id','registrado_por'].includes(field.name)) field.generated = true
    if (entity.key==='detalle_pedido'&&['precio_unitario','descuento'].includes(field.name)) field.generated=true
    if (entity.key==='aplicacion_agroquimica'&&['dias_carencia','fecha_fin_carencia'].includes(field.name)) field.generated=true
    if (['pedido','orden_compra'].includes(entity.key)&&['impuesto','impuestos'].includes(field.name)) field.generated=false
  }
  if(entity.key==='existencia')entity.readOnly=true
}
export const labelValue = (value: string) => value.replaceAll('_',' ').replace(/^./, c => c.toUpperCase())
