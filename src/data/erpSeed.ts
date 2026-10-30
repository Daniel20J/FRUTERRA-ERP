import { ENTITIES, SCHEMA } from './erpSchema'
import type { Cell, EntityRecord, ErpState } from '../types/erp'
import { CONFIG, moduleKeys, type Database } from './demoData'

export const DEMO_DATE = '2026-10-29'
export function seedErp(previous: Database): ErpState {
  // The original free-text tables cannot reliably identify foreign keys for new historical
  // records. Keep them intact in an accessible archive and map the known demo identifiers.
  const legacy=Object.fromEntries(moduleKeys.map(key=>[key,CONFIG[key].rows.map(base=>previous[key].find(row=>row[0]===base[0])??base)])) as Database
  const state: ErpState = { version:2, clock:DEMO_DATE, migrationArchive:structuredClone(previous), counters:Object.fromEntries(ENTITIES.map(entity=>[entity.key,0])), tables:Object.fromEntries(ENTITIES.map(entity => [entity.key, []])) }
  const put = (key: string, values: Record<string, Cell>): EntityRecord => {
    const defaults = Object.fromEntries(SCHEMA[key].fields.map(field => [field.name, field.defaultValue ?? (field.type === 'checkbox' ? false : field.type === 'number' ? 0 : field.type === 'date' ? DEMO_DATE : field.type === 'datetime-local' ? DEMO_DATE+'T09:00' : field.options?.[0] ?? '')]))
    const row = { ...defaults, id:state.tables[key].length+1, ...values } as EntityRecord
    state.tables[key].push(row)
    state.counters[key] = Math.max(state.counters[key] || 0, row.id)
    return row
  }
  const money = (s: string) => Number(s.replace(/[^\d.]/g,'')) || 0
  const status = (s: string) => s.toLowerCase().replaceAll(' ','_')
  const roles = ['Administrador','Gerente','Vendedor','Compras','Almacén','Producción','Exportaciones','Contador','Supervisor','Cliente']
  roles.forEach(nombre=>put('rol',{nombre,descripcion:'Perfil de demostración '+nombre,estado:'activo'}))
  legacy.seguridad.forEach((r,i)=>put('usuario',{username:r[0],nombre_completo:r[1],correo:r[0]+'@fruterra.example',rol_id:i===0?1:i===1?3:5,estado:'activo'}))
  put('usuario',{username:'produccion01',nombre_completo:'Mario Pérez',correo:'campo@fruterra.example',rol_id:6,estado:'activo'})
  put('usuario',{username:'supervisor01',nombre_completo:'Rosa García',correo:'calidad@fruterra.example',rol_id:9,estado:'activo'})
  roles.forEach((role,index)=>{if(!state.tables.usuario.some(u=>u.rol_id===index+1))put('usuario',{username:'demo_rol_'+(index+1),nombre_completo:'Perfil '+role,correo:'rol'+(index+1)+'@fruterra.example',rol_id:index+1,cliente_id:role==='Cliente'?1:0,estado:'activo'})})
  ;[['GTQ','Quetzal','Q'],['USD','Dólar estadounidense','$'],['EUR','Euro','€']].forEach(([codigo,nombre,simbolo])=>put('moneda',{codigo,nombre,simbolo}))
  put('tipo_cambio',{moneda_id:2,fecha:DEMO_DATE,valor:7.7,fuente:'Valor ilustrativo; no cotización oficial'})
  put('tipo_cambio',{moneda_id:3,fecha:DEMO_DATE,valor:8.3,fuente:'Valor ilustrativo; no cotización oficial'})
  ;[['FOB','Libre a bordo'],['CIF','Costo, seguro y flete'],['EXW','En fábrica']].forEach(([codigo,descripcion])=>put('incoterm',{codigo,descripcion}))
  ;[['Fruta fresca','producto_terminado'],['Empaque','insumo'],['Insumo agrícola','insumo']].forEach(([nombre,tipo])=>put('categoria_producto',{nombre,tipo}))
  ;[['kg','Kilogramo'],['unidad','Unidad'],['saco','Saco'],['litro','Litro']].forEach(([codigo,nombre])=>put('unidad_medida',{codigo,nombre}))
  legacy.proveedores.forEach(r=>put('proveedor',{codigo:r[0],razon_social:r[1],nit:r[2],pais:'Guatemala',direccion:'Petén, Guatemala',contacto:'Atención a clientes',condiciones_pago_dias:r[4].includes('30')?30:0,moneda_id:1,estado:status(r[5])}))
  legacy.clientes.forEach(r=>put('cliente',{codigo:r[0],razon_social:r[1],nit:r[2],pais:r[3],tipo:r[3]==='Guatemala'?'nacional':'internacional',ciudad:r[3]==='Guatemala'?'Guatemala':'Miami',direccion:'Dirección de entrega de demostración',moneda_id:r[4].includes('USD')?2:1,limite_credito:money(r[4]),condiciones_pago_dias:30,vendedor_id:2,lista_precio_id:1,estado:status(r[5])}))
  ;['Restaurante La Cosecha','Mercado Los Altos','Frutas Global'].forEach((razon_social,i)=>put('cliente',{codigo:'CLI-00'+(i+4),razon_social,tipo:i===2?'internacional':'nacional',pais:i===2?'México':'Guatemala',moneda_id:i===2?2:1,limite_credito:20000,condiciones_pago_dias:15,estado:'activo',vendedor_id:2,lista_precio_id:1}))
  legacy.productos.forEach((r,i)=>put('producto',{codigo:r[0],nombre:r[1],descripcion:r[1],tipo:i<2?'producto_terminado':'insumo',categoria_id:i<2?1:i===2?2:3,unidad_medida_id:i<2?1:i===2?2:3,precio_referencia:money(r[4]),stock_minimo:i<2?100:20,vida_util_dias:i<2?7:365,estado:'activo'}))
  put('producto',{codigo:'FR-003',nombre:'Cereza Extra',descripcion:'Cereza fresca',tipo:'producto_terminado',categoria_id:1,unidad_medida_id:1,precio_referencia:32,stock_minimo:100,vida_util_dias:14,estado:'activo'})
  put('producto',{codigo:'IN-010',nombre:'Control biológico autorizado',tipo:'insumo',categoria_id:3,unidad_medida_id:4,precio_referencia:120,stock_minimo:5,estado:'activo'})
  ;[[1,'Fresa','San Andreas',22],[2,'Mora','Tupi',6],[5,'Cereza','Bing',8]].forEach(([producto_id,fruta,variedad,peso_promedio_g])=>put('producto_terminado',{producto_id,fruta,variedad,peso_promedio_g,requiere_cadena_frio:true}))
  ;[3,4,6].forEach(producto_id=>{put('insumo',{producto_id,es_agroquimico:producto_id===6,autorizado:true,dias_carencia:producto_id===6?3:0,proveedor_id:producto_id===3?1:2});put('proveedor_producto',{producto_id,proveedor_id:producto_id===3?1:2,precio_acordado:producto_id===3?7.5:175})})
  put('lista_precio',{nombre:'Nacional 2026',tipo_cliente:'nacional',moneda_id:1,vigente_desde:'2026-01-01',vigente_hasta:'2026-12-31',estado:'activo'})
  put('lista_precio',{nombre:'Exportación 2026',tipo_cliente:'internacional',moneda_id:2,vigente_desde:'2026-01-01',vigente_hasta:'2026-12-31',estado:'activo'})
  ;[1,2,5].forEach(producto_id=>{put('detalle_lista_precio',{lista_precio_id:1,producto_id,precio:producto_id===1?28:producto_id===2?24:32});put('detalle_lista_precio',{lista_precio_id:2,producto_id,precio:4})})
  put('promocion',{nombre:'Fresa de temporada',tipo:'porcentaje',valor:10,producto_id:1,segmento:'nacional',fecha_inicio:'2026-10-28',fecha_fin:'2026-11-02',condiciones:'Aplicable a fruta disponible',autorizada_por:1,estado:'activo'})
  ;['Finca El Pinar','Finca La Ceiba','Finca Las Flores'].forEach((nombre,i)=>{put('finca',{nombre,ubicacion:'Petén, Guatemala',area_ha:12+i*3,responsable_id:4,estado:'activo'});put('lote_terreno',{finca_id:i+1,codigo:'PAR-00'+(i+1),producto_id:[1,2,5][i],variedad:['San Andreas','Tupi','Bing'][i],area_ha:4,fecha_plantacion:'2025-03-01',estado:'activo'});put('certificacion',{finca_id:i+1,nombre:'GlobalG.A.P.',ente_certificador:'Certificador de demostración',numero:'CERT-00'+(i+1),fecha_emision:'2026-01-01',fecha_vencimiento:i===2?'2026-11-10':'2027-01-01',estado:i===2?'por_vencer':'vigente'});put('plan_cosecha',{lote_terreno_id:i+1,producto_id:[1,2,5][i],semana_inicio:'2026-10-26',volumen_estimado_kg:1200,volumen_real_kg:i===0?1000:i===1?500:120})})
  legacy.produccion.forEach((r,i)=>put('labor_agricola',{lote_terreno_id:i===1?2:1,tipo:i===1?'aplicacion_agroquimica':i===2?'otra':'riego',fecha:r[3],responsable_id:i===1?5:4,descripcion:r[2]}))
  put('aplicacion_agroquimica',{labor_id:2,insumo_id:6,dosis:1.5,unidad_dosis:'L/ha',dias_carencia:3,fecha_fin_carencia:'2026-10-31'})
  ;['Bodega principal','Centro de empaque','Distribución capital','Bodega El Pinar','Bodega La Ceiba'].forEach((nombre,i)=>put('almacen',{nombre,tipo:['bodega_principal','centro_empaque','punto_distribucion','finca','finca'][i],ubicacion:i===2?'Guatemala':'Petén',finca_id:i>2?i-2:0,estado:'activo'}))
  ;[1,2,3].forEach(i=>put('camara_fria',{almacen_id:1,nombre:'Cámara 0'+i,capacidad_kg:2000,sensor_id:'DEMO-SENSOR-'+i,estado:'activo'}))
  ;[1,2,5].forEach(producto_id=>put('rango_temperatura_producto',{producto_id,temp_min:producto_id===5?-1:0,temp_max:producto_id===5?1:2,humedad_min:90,humedad_max:95,minutos_para_cuarentena:30}))
  legacy.lotes.forEach((r,i)=>{
    const finca=i===3?1:i+1, producto_id=[1,2,5,1][i]
    put('cosecha',{lote_terreno_id:finca,fecha:r[4],hora_inicio:'05:00',cuadrilla:'Cuadrilla '+finca,cajas:i===0?200:100,peso_kg:[1000,500,120,300][i],responsable_id:4})
    put('lote',{codigo:r[0],producto_id,finca_id:finca,lote_terreno_id:finca,cosecha_id:i+1,fecha_cosecha:r[4],fecha_vencimiento:i===2?'2026-11-07':i===3?'2026-11-05':'2026-11-02',peso_kg:[1000,500,120,300][i],estado:status(r[5])})
    put('clasificacion_calidad',{lote_id:i+1,categoria:r[3].toLowerCase(),peso_promedio_g:22,porcentaje_color:95,porcentaje_defectos:1,vigente:true,responsable_id:5,fecha:r[4]+'T07:00'})
    put('existencia',{producto_id,lote_id:i+1,almacen_id:1,camara_id:i===3?1:i+1,cantidad:[1000,500,120,300][i],cantidad_reservada:[140,80,0,0][i],fecha_vencimiento:i===2?'2026-11-07':i===3?'2026-11-05':'2026-11-02'})
    put('evento_trazabilidad',{lote_id:i+1,tipo_evento:'cosecha',entidad_origen:'cosecha',entidad_origen_id:i+1,fecha_hora:r[4]+'T06:00',usuario_id:4,descripcion:'Cosecha y recepción inicial de demostración'})
    put('etiqueta_lote',{lote_id:i+1,codigo_qr:'FRUTERRA:'+r[0],tipo:'lote',impresa:false})
  })
  put('existencia',{producto_id:3,lote_insumo:'EMP-2026',almacen_id:2,cantidad:500,cantidad_reservada:0,fecha_vencimiento:'2027-10-01'})
  put('existencia',{producto_id:4,lote_insumo:'ABO-2026',almacen_id:4,cantidad:30,cantidad_reservada:0,fecha_vencimiento:'2027-05-01'})
  legacy.frio.forEach((r,i)=>put('registro_temperatura',{camara_id:i+1,lote_id:i+1,temperatura:parseFloat(r[3]),humedad:93,origen:'manual',usuario_id:3,fecha_hora:DEMO_DATE+'T'+r[4]}))
  put('alerta_temperatura',{registro_id:3,camara_id:3,fecha_inicio:DEMO_DATE+'T06:46',minutos_fuera_rango:40,lote_retenido:true,estado:'abierta',accion_tomada:'Lote en cuarentena; revisar equipo'})
  legacy.ventas.forEach((r,i)=>{
    put('pedido',{numero:r[0],cliente_id:[1,3,2][i],vendedor_id:2,es_exportacion:i===2,fecha_pedido:DEMO_DATE+'T08:00',fecha_entrega_prometida:r[4],moneda_id:i===2?2:1,tipo_cambio:i===2?7.7:1,subtotal:money(r[3]),total:money(r[3]),estado:i===0?'en_preparacion':i===1?'confirmado':'en_revision',embarque_id:i===2?1:0})
    put('detalle_pedido',{pedido_id:i+1,producto_id:[1,2,5][i],cantidad:[140,80,115][i],precio_unitario:money(r[3])/[140,80,115][i],descuento:0,subtotal:money(r[3])})
    put('historial_estado_pedido',{pedido_id:i+1,estado_anterior:'registrado',estado_nuevo:i===0?'en_preparacion':i===1?'confirmado':'en_revision',usuario_id:2,fecha_hora:DEMO_DATE+'T08:00',comentario:'Estado inicial migrado'})
  })
  ;[1,2].forEach(i=>put('reserva',{detalle_pedido_id:i,existencia_id:i,lote_id:i,cantidad:i===1?140:80,estado:'activa'}))
  legacy.cotizaciones.forEach((r,i)=>{put('cotizacion_venta',{numero:r[0],cliente_id:i+4,vendedor_id:2,fecha:DEMO_DATE,vigente_hasta:r[4],moneda_id:1,total:money(r[3]),estado:i===0?'enviada':'aprobada'});put('detalle_cotizacion_venta',{cotizacion_id:i+1,producto_id:i+1,cantidad:100,precio_unitario:money(r[3])/100})})
  legacy.compras.forEach((r,i)=>{put('solicitud_compra',{numero:'SOL-00'+(i+1),solicitante_id:3,departamento:i===0?'Empaque':'Producción',fecha:DEMO_DATE,prioridad:'media',justificacion:'Reposición de insumos',estado:i===0?'pendiente':'aprobada',aprobador_id:i===0?0:1});put('detalle_solicitud',{solicitud_id:i+1,producto_id:i+3,cantidad:i===0?500:34});put('cotizacion_compra',{solicitud_id:i+1,proveedor_id:i+1,fecha:DEMO_DATE,moneda_id:1,total:money(r[3]),seleccionada:i===1});put('orden_compra',{numero:r[0],proveedor_id:i+1,solicitud_id:i+1,cotizacion_id:i+1,fecha:DEMO_DATE,fecha_entrega:r[4],lugar_entrega:'Bodega principal',moneda_id:1,subtotal:money(r[3]),total:money(r[3]),estado:i===0?'borrador':'emitida',aprobador_id:i===0?0:1});put('detalle_orden_compra',{orden_id:i+1,producto_id:i+3,cantidad:i===0?500:34,precio_unitario:i===0?7.5:175,cantidad_recibida:0})})
  legacy.exportaciones.forEach((r,i)=>{put('embarque',{codigo:r[0],cliente_id:i===0?2:6,pais_destino:i===0?'Estados Unidos':'México',puerto_destino:i===0?'Miami':'Veracruz',incoterm_id:1,medio_transporte:'Marítimo',naviera:'Operador de demostración',contenedor:r[2],fecha_salida:r[3],fecha_limite_documentos:i===0?'2026-11-03':'2026-11-07',responsable_id:1,estado:i===0?'en_preparacion':'planificado'});['packing_list','factura_comercial','certificado_fitosanitario','certificado_origen','otro'].forEach((tipo,j)=>put('documento_exportacion',{embarque_id:i+1,tipo,numero:'DOC-'+(i+1)+'-'+j,responsable_id:1,completo:j<(i===0?4:3),generado_automaticamente:false,archivo_url:'Referencia documental de demostración'}))})
  legacy.finanzas.slice(0,2).forEach((r,i)=>{put('factura',{serie:'DEMO',numero:r[0],cliente_id:i===0?1:3,pedido_id:i+1,fecha_emision:DEMO_DATE+'T08:00',moneda_id:1,tipo_cambio:1,subtotal:money(r[3]),total:money(r[3]),iva:0,uuid_fel:'DEMO-SIN-VALIDEZ-'+(i+1),estado:'emitida'});put('cuenta_por_cobrar',{factura_id:i+1,cliente_id:i===0?1:3,monto_original:money(r[3]),saldo:money(r[3]),fecha_vencimiento:r[4],estado:i===0?'pendiente':'vencida'})})
  put('cuenta_por_pagar',{proveedor_id:1,numero_factura:'CXP-194',monto_original:3750,saldo:3750,moneda_id:1,fecha_vencimiento:'2026-11-15',estado:'pendiente'})
  legacy.reclamos.forEach((r,i)=>put('reclamo',{numero:r[0],cliente_id:i===0?1:3,pedido_id:i+1,lote_id:i+1,fecha:r[4]+'T10:00',tipo:i===0?'calidad':'cantidad',descripcion:r[3],responsable_id:5,estado:i===0?'en_proceso':'resuelto',solucion:i===0?'':'Ajuste de cantidad acordado',legacy_referencia:r[2]}))
  put('seguimiento_reclamo',{reclamo_id:1,fecha:DEMO_DATE+'T08:00',usuario_id:5,comentario:'Revisión de evidencia y empaque',estado_resultante:'en_proceso'})
  ;['Móvil · Campo 03','Tablet · Bodega 01'].forEach((identificador,i)=>put('dispositivo_registrado',{usuario_id:i===0?4:3,identificador,tipo:i===0?'telefono':'tablet',ultimo_sync:DEMO_DATE+'T07:10',estado:'activo'}))
  put('cola_sincronizacion',{dispositivo_id:1,usuario_id:4,entidad:'labor_agricola',operacion:'crear',uuid_cliente:'demo-evento-018',payload:'{"descripcion":"Riego capturado en campo"}',creado_en:DEMO_DATE+'T06:00',estado:'pendiente'})
  put('equipo',{nombre:'Tractor Campo 01',finca_id:1,horas_uso:130,proximo_mantenimiento:'2026-11-03',estado:'activo'})
  put('mantenimiento',{equipo_id:1,fecha:DEMO_DATE,horas:2,combustible_litros:8,costo:250,observaciones:'Cambio de aceite y revisión'})
  put('costo_produccion',{lote_terreno_id:1,fecha:DEMO_DATE,concepto:'Jornada de cosecha',tipo:'mano de obra',monto:800})
  put('destajo',{cosecha_id:1,trabajador:'Cuadrilla 1',cajas:200,tarifa_caja:4,total:800})
  put('incidencia_campo',{lote_terreno_id:2,fecha:DEMO_DATE,tipo:'clima',descripcion:'Lluvia intensa; revisar drenajes',estado:'abierta'})
  put('visita',{cliente_id:1,vendedor_id:2,fecha:'2026-10-30',ruta:'Petén centro',comentario:'Confirmar entrega semanal',estado:'pendiente'})
  put('meta_venta',{vendedor_id:2,desde:'2026-10-01',hasta:'2026-10-31',meta:50000,comision_porcentaje:2})
  legacy.portalcliente.forEach((r,i)=>put('solicitud_portal',{cliente_id:i===0?1:3,pedido_id:i+1,fecha:r[4],tipo:r[2],descripcion:'Documento relacionado: '+r[3],estado:r[5].toLowerCase()}))
  const rights: Record<string,string[]> = { Administrador:Object.keys(state.tables), Gerente:ENTITIES.filter(e=>e.group!=='seguridad').map(e=>e.key), Vendedor:ENTITIES.filter(e=>['ventas','clientes','cotizaciones','inventario','lotes','reclamos'].includes(e.group)).map(e=>e.key), Compras:ENTITIES.filter(e=>['compras','proveedores','productos','inventario'].includes(e.group)).map(e=>e.key), Almacén:ENTITIES.filter(e=>['inventario','lotes','frio','ventas'].includes(e.group)).map(e=>e.key), Producción:ENTITIES.filter(e=>['produccion','lotes','productos'].includes(e.group)).map(e=>e.key), Exportaciones:ENTITIES.filter(e=>['exportaciones','ventas','lotes','frio'].includes(e.group)).map(e=>e.key), Contador:ENTITIES.filter(e=>['finanzas','clientes','proveedores','productos'].includes(e.group)).map(e=>e.key), Supervisor:ENTITIES.filter(e=>['produccion','inventario','frio','lotes','reclamos'].includes(e.group)).map(e=>e.key), Cliente:['pedido','detalle_pedido','factura','detalle_factura','cuenta_por_cobrar','solicitud_portal','reclamo'] }
  for (const entity of ENTITIES) for (const operacion of ['consultar','crear','editar','aprobar','anular']) {
    const permission=put('permiso',{modulo:entity.key,operacion,descripcion:entity.title+' / '+operacion})
    roles.forEach((role,index)=>{
      if (!rights[role]?.includes(entity.key)) return
      if (role==='Cliente' && operacion!=='consultar' && !(entity.key==='solicitud_portal'&&operacion==='crear')) return
      if (role==='Gerente' && ['crear','editar','anular'].includes(operacion)) return
      if (role==='Vendedor' && ['inventario','lotes'].includes(entity.group) && operacion!=='consultar') return
      if (entity.readOnly && ['crear','editar','anular'].includes(operacion)) return
      put('rol_permiso',{rol_id:index+1,permiso_id:permission.id})
    })
  }
  return state
}
