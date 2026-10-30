import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
import ts from 'typescript'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const root = process.cwd()
const output = path.join(root, 'node_modules/.cache/fruterra-verification')
mkdirSync(output, { recursive: true })
writeFileSync(path.join(output, 'package.json'), '{"type":"module"}')
function compile(directory) {
  for (const item of readdirSync(path.join(root, 'src', directory), { withFileTypes: true })) {
    const relative = path.join(directory, item.name)
    if (item.isDirectory()) { compile(relative); continue }
    if (!/\.tsx?$/.test(item.name)) continue
    const source = readFileSync(path.join(root, 'src', relative), 'utf8')
    const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText
      .replace(/from ['"](\.\.?\/[^'"]+)['"]/g, (_, module) => {
        const target = path.resolve(root, 'src', path.dirname(relative), module)
        const suffix = /\.tsx?$/.test(module) ? '' : (() => { try { return readdirSync(target) ? '/index' : '' } catch { return '' } })()
        return `from '${module.replace(/\.tsx?$/, '')}${suffix}.js'`
      })
    const destination = path.join(output, relative.replace(/\.tsx?$/, '.js'))
    mkdirSync(path.dirname(destination), { recursive: true })
    writeFileSync(destination, compiled)
  }
}
compile('')
const load = async name => import(pathToFileURL(path.join(output, name + '.js')).href)
const memoryStorage = () => {
  const data = new Map()
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key), clear: () => data.clear() }
}
globalThis.localStorage = memoryStorage()
globalThis.sessionStorage = memoryStorage()
const { CONFIG, MODULES, moduleKeys, routeFor } = await load('data/demoData')
const storage = await load('services/storageService')
const records = await load('services/recordService')
let checks = 0
function check(label, run) { run(); checks++; console.log('PASS ' + label) }
const initial = storage.loadDatabase()
check('18 unique routes and 16 complete data modules', () => {
  assert.equal(MODULES.length, 18)
  assert.equal(new Set(MODULES.map(([key]) => routeFor(key))).size, 18)
  assert.equal(moduleKeys.length, 16)
  for (const key of moduleKeys) {
    assert.equal(CONFIG[key].fields.length + 1, CONFIG[key].cols.length)
    for (const row of initial[key]) assert.equal(row.length, CONFIG[key].cols.length)
  }
})
const referenceFile = path.resolve(root, '../../referencia/index.html')
if (existsSync(referenceFile)) check('Original CSS, photograph and all demo records are preserved', () => {
  const original = readFileSync(referenceFile, 'utf8')
  const css = original.match(/<style>([\s\S]*?)<\/style>/)[1].replace("url('cultivo_login_berries.png')", "url('/images/cultivo_login_berries.png')")
  assert.equal(readFileSync(path.join(root, 'src/styles/original.css'), 'utf8'), css)
  assert.deepEqual(readFileSync(path.join(root, 'public/images/cultivo_login_berries.png')), readFileSync(path.resolve(root, '../../referencia/cultivo_login_berries.png')))
  const originalConfig = original.match(/const CONFIG=(\{[\s\S]*?\n\});/)[1]
  const reference = awaitConfig(originalConfig)
  assert.deepEqual(CONFIG, reference)
})
function awaitConfig(source) { return Function('"use strict"; return (' + source + ')')() }
check('Corrupt and incomplete storage recovers; valid empty modules remain empty', () => {
  localStorage.setItem(storage.STORAGE_KEY, '{broken')
  assert.deepEqual(storage.loadDatabase(), initial)
  localStorage.setItem(storage.STORAGE_KEY, JSON.stringify({ ventas: [], clientes: [[123]], frio: null }))
  const recovered = storage.loadDatabase()
  assert.deepEqual(recovered.ventas, [])
  assert.deepEqual(recovered.clientes, initial.clientes)
  assert.deepEqual(recovered.frio, initial.frio)
  for (const value of [null, 42, 'bad', []]) {
    localStorage.setItem(storage.STORAGE_KEY, JSON.stringify(value))
    assert.deepEqual(storage.loadDatabase(), initial)
  }
})
localStorage.clear()
check('Create, edit, persist, reload and delete in all 16 modules', () => {
  for (const key of moduleKeys) {
    const values = CONFIG[key].fields.map((field, index) => index === 4 ? 'Activo' : 'Prueba ' + field)
    const created = records.saveRecord(initial, key, null, values)
    assert.equal(created[key].length, initial[key].length + 1)
    assert.deepEqual(initial[key], CONFIG[key].rows)
    assert.equal(storage.saveDatabase(created), true)
    const reloaded = storage.loadDatabase()
    assert.deepEqual(reloaded, created)
    const id = reloaded[key][0][0]
    const second = records.saveRecord(reloaded, key, null, values)
    assert.notEqual(second[key][0][0], id)
    values[0] = 'Editado'
    const edited = records.saveRecord(reloaded, key, 0, values)
    assert.equal(edited[key][0][0], id)
    assert.equal(edited[key][0][1], 'Editado')
    assert.deepEqual(records.deleteRecord(edited, key, 0), initial)
  }
})
check('Sales transitions stop at delivered; synchronization is simulated and immutable', () => {
  let db = initial
  for (const status of ['Confirmado', 'Preparación', 'Despachado', 'Entregado', 'Entregado']) {
    db = records.advanceOrder(db, 2)
    assert.equal(db.ventas[2][5], status)
  }
  const synced = records.synchronizeDatabase(initial)
  assert.ok(synced.sincronizacion.every(row => row[3] === '0 eventos' && row[5] === 'Sincronizado'))
  assert.equal(initial.sincronizacion[0][3], '4 eventos')
})
check('Session storage and blocked local storage are handled', () => {
  assert.equal(storage.hasSession(), false)
  sessionStorage.setItem(storage.SESSION_KEY, 'admin')
  assert.equal(storage.hasSession(), true)
  sessionStorage.removeItem(storage.SESSION_KEY)
  assert.equal(storage.hasSession(), false)
  const old = globalThis.localStorage
  globalThis.localStorage = { getItem() { throw Error('Blocked') }, setItem() { throw Error('Blocked') } }
  assert.deepEqual(storage.loadDatabase(), initial)
  assert.equal(storage.saveDatabase(initial), false)
  globalThis.localStorage = old
})
const { default: ModulePage } = await load('pages/ModulePage')
const { default: FormDrawer } = await load('components/ui/FormDrawer')
const { default: Dashboard } = await load('pages/Dashboard')
const { default: Reportes } = await load('pages/Reportes')
const { default: MainLayout } = await load('components/layout/MainLayout')
const { default: Login } = await load('pages/Login')
const { AuthProvider } = await load('context/AuthContext')
const noop = () => {}
const render = element => renderToString(React.createElement(MemoryRouter, null, React.createElement(AuthProvider, null, element)))
check('All module tables and their create/edit/detail drawers render without errors', () => {
  for (const current of moduleKeys) {
    const html = render(React.createElement(ModulePage, { current, rows: initial[current], open: noop, notify: noop, exportCSV: noop, synchronize: noop }))
    assert.ok(html.includes(CONFIG[current].title))
    assert.ok(html.includes(initial[current][0][0]))
    for (const [view, index] of [['form', null], ['form', 0], ['detail', 0]]) {
      const drawer = render(React.createElement(FormDrawer, { state: { module: current, index, view }, row: index === null ? null : initial[current][0], close: noop, edit: noop, save: noop, remove: noop, advance: noop, notify: noop }))
      assert.ok(drawer.includes('role="dialog"'))
      assert.ok(drawer.includes(index === null ? 'Crear registro' : initial[current][0][0]))
    }
    const empty = render(React.createElement(ModulePage, { current, rows: [], open: noop, notify: noop, exportCSV: noop, synchronize: noop }))
    assert.ok(empty.includes('No se encontraron registros'))
  }
})
check('Login, dashboard, reports and sidebar render original content', () => {
  assert.ok(render(React.createElement(Login)).includes('FRESA · MORA · CEREZA'))
  assert.ok(render(React.createElement(Dashboard, { db: initial, openForm: noop })).includes('Resumen de operaciones'))
  assert.ok(render(React.createElement(Reportes, { db: initial })).includes('Lectura del negocio.'))
  const layout = render(React.createElement(MainLayout, { current: 'general' }, 'contenido'))
  for (const [, , label] of MODULES) assert.ok(layout.includes(label))
})
const {seedErp}=await load('data/erpSeed')
const {ENTITIES,SCHEMA}=await load('data/erpSchema')
const engine=await load('services/erpEngine')
const store=await load('services/erpStore')
const seed=()=>seedErp(initial)
const admin={id:1,role:'Administrador',clientId:1}
check('MER coverage: 68 entities plus 8 stakeholder screens; references resolve',()=>{
  assert.equal(ENTITIES.length,76)
  const state=seed()
  for(const entity of ENTITIES)for(const row of state.tables[entity.key])for(const field of entity.fields){
    assert.notEqual(row[field.name],undefined,entity.key+'.'+field.name)
    if(field.reference&&row[field.name])assert.ok(state.tables[field.reference].some(parent=>parent[field.referenceField??'id']===row[field.name]),`${entity.key}.${field.name}: ${row[field.name]}`)
  }
})
check('Relational snapshot reloads and malformed snapshots recover atomically',()=>{
  localStorage.clear()
  const state=seed()
  assert.equal(store.persistErp(state),true)
  assert.deepEqual(store.loadErp(),state)
  localStorage.setItem(store.ERP_KEY,'{broken')
  assert.equal(store.loadErp().tables.producto.length,5+1)
  const broken=structuredClone(state);broken.tables.pedido[0].id='bad'
  localStorage.setItem(store.ERP_KEY,JSON.stringify(broken))
  assert.equal(typeof store.loadErp().tables.pedido[0].id,'number')
  localStorage.clear()
})
check('Partial purchase receipt updates stock, payable balance and ledger once',()=>{
  let state=seed()
  const before=JSON.stringify(state)
  assert.throws(()=>engine.runAction(state,admin,'orden_compra',2,'recibir',{line_2:35}),/exceder/)
  assert.equal(JSON.stringify(state),before)
  state=engine.runAction(state,admin,'orden_compra',2,'recibir',{almacen_id:1,line_2:10})
  assert.equal(state.tables.orden_compra[1].estado,'parcial')
  assert.equal(state.tables.detalle_orden_compra[1].cantidad_recibida,10)
  const account=state.tables.cuenta_por_pagar.at(-1)
  assert.equal(account.saldo,1750)
  state=engine.saveEntity(state,admin,'pago',null,{cuenta_pagar_id:account.id,fecha:state.clock,monto:250,metodo:'Transferencia demo',referencia:'PRUEBA'})
  assert.equal(state.tables.cuenta_por_pagar.at(-1).saldo,1500)
  assert.equal(state.tables.cuenta_por_pagar.at(-1).estado,'parcial')
  state=engine.runAction(state,admin,'orden_compra',2,'recibir',{almacen_id:1,line_2:24})
  assert.equal(state.tables.orden_compra[1].estado,'recibida')
  assert.throws(()=>engine.runAction(state,admin,'orden_compra',2,'recibir'),/disponible/)
})
check('Segregation of duties and required purchase products are enforced',()=>{
  const state=seed()
  assert.throws(()=>engine.runAction(state,{id:3,role:'Compras'},'solicitud_compra',1,'aprobar'),/distinto/)
  const approved=engine.runAction(state,admin,'solicitud_compra',1,'aprobar')
  assert.equal(approved.tables.solicitud_compra[0].estado,'aprobada')
  assert.throws(()=>engine.runAction(approved,admin,'cotizacion_compra',1,'ordenar'),/Ya existe/)
  const quoted=engine.saveEntity(approved,admin,'cotizacion_compra',null,{solicitud_id:1,proveedor_id:1,fecha:state.clock,moneda_id:1,total:3000,seleccionada:false})
  const ordered=engine.runAction(quoted,admin,'cotizacion_compra',quoted.tables.cotizacion_compra.at(-1).id,'ordenar')
  assert.equal(ordered.tables.orden_compra.at(-1).total,3000)
})
check('Quotation conversion is linked, preserves detail and prevents duplicates/expiry',()=>{
  const state=engine.runAction(seed(),admin,'cotizacion_venta',2,'convertir')
  assert.equal(state.tables.cotizacion_venta[1].estado,'convertida')
  const order=state.tables.pedido.at(-1)
  assert.equal(order.cotizacion_id,2)
  assert.ok(state.tables.detalle_pedido.some(d=>d.pedido_id===order.id&&d.producto_id===2))
  assert.throws(()=>engine.runAction(state,admin,'cotizacion_venta',2,'convertir'),/disponible/)
  const expired=seed();expired.clock='2026-12-01'
  assert.throws(()=>engine.runAction(expired,admin,'cotizacion_venta',2,'convertir'),/venció/)
})
function newOrder(state,quantity=900,promo=0){
  state=engine.saveEntity(state,admin,'pedido',null,{numero:'PED-PRUEBA',cliente_id:1,vendedor_id:2,fecha_entrega_prometida:'2026-11-02',moneda_id:1,es_exportacion:false})
  const id=state.tables.pedido.at(-1).id
  state=engine.saveEntity(state,admin,'detalle_pedido',null,{pedido_id:id,producto_id:1,cantidad:quantity,promocion_id:promo})
  return {state,id}
}
check('FEFO reservations are atomic, quarantine/expired lots excluded, cancellation releases',()=>{
  const fresh=newOrder(seed()),{id}=fresh
  let state=engine.runAction(fresh.state,admin,'pedido',id,'confirmar')
  const detail=state.tables.detalle_pedido.at(-1)
  const reservations=state.tables.reserva.filter(r=>r.detalle_pedido_id===detail.id)
  assert.deepEqual(reservations.map(r=>[r.lote_id,r.cantidad]),[[1,860],[4,40]])
  assert.equal(state.tables.existencia[0].cantidad_reservada,1000)
  state=engine.runAction(state,admin,'pedido',id,'cancelar')
  assert.equal(state.tables.existencia[0].cantidad_reservada,140)
  assert.ok(state.tables.reserva.filter(r=>r.detalle_pedido_id===detail.id).every(r=>r.estado==='liberada'))
  const insufficient=newOrder(seed(),5000),before=JSON.stringify(insufficient.state)
  assert.throws(()=>engine.runAction(insufficient.state,admin,'pedido',insufficient.id,'confirmar'),/insuficiente/)
  assert.equal(JSON.stringify(insufficient.state),before)
  const stale=newOrder(seed(),100);stale.state.clock='2027-01-01'
  assert.throws(()=>engine.runAction(stale.state,admin,'pedido',stale.id,'confirmar'),/insuficiente/)
})
check('Price lists, promotion validity and client credit checks affect confirmation',()=>{
  const order=newOrder(seed(),10,1)
  assert.equal(order.state.tables.detalle_pedido.at(-1).precio_unitario,28)
  assert.equal(order.state.tables.detalle_pedido.at(-1).subtotal,252)
  const expired=seed();expired.clock='2026-11-04'
  assert.throws(()=>newOrder(expired,10,1),/vigencia/)
  const blocked=seed();blocked.tables.cliente[0].limite_credito=1
  const draft=newOrder(blocked,10)
  assert.throws(()=>engine.runAction(draft.state,{id:2,role:'Vendedor'},'pedido',draft.id,'confirmar'),/crédito/)
})
let completedOrder
check('Dispatch consumes reservations, invoice creates receivable, collection reduces balance',()=>{
  const draft=newOrder(seed(),100)
  let state=engine.runAction(draft.state,admin,'pedido',draft.id,'confirmar')
  state=engine.runAction(state,admin,'pedido',draft.id,'preparar')
  state=engine.runAction(state,admin,'pedido',draft.id,'despachar')
  assert.equal(state.tables.existencia[0].cantidad,900)
  assert.equal(state.tables.existencia[0].cantidad_reservada,140)
  assert.ok(state.tables.detalle_despacho.some(d=>d.lote_id===1))
  assert.ok(state.tables.evento_trazabilidad.some(e=>e.lote_id===1&&e.tipo_evento==='despacho'))
  state=engine.runAction(state,admin,'pedido',draft.id,'facturar')
  const invoice=state.tables.factura.at(-1),account=state.tables.cuenta_por_cobrar.at(-1)
  assert.equal(invoice.pedido_id,draft.id)
  assert.equal(account.saldo,2800)
  assert.throws(()=>engine.runAction(state,admin,'pedido',draft.id,'facturar'),/ya tiene/)
  assert.throws(()=>engine.saveEntity(state,admin,'cobro',null,{cuenta_cobrar_id:account.id,fecha:state.clock,monto:3000,metodo:'Efectivo',referencia:'X'}),/supera/)
  state=engine.saveEntity(state,admin,'cobro',null,{cuenta_cobrar_id:account.id,fecha:state.clock,monto:1000,metodo:'Transferencia demo',referencia:'COB-1'})
  assert.equal(state.tables.cuenta_por_cobrar.at(-1).saldo,1800)
  state=engine.runAction(state,admin,'pedido',draft.id,'entregar')
  assert.equal(state.tables.pedido.at(-1).estado,'entregado')
  localStorage.clear()
  assert.equal(store.persistErp(state),true)
  assert.equal(JSON.stringify(store.loadErp().tables),JSON.stringify(state.tables))
  localStorage.clear()
  completedOrder={state,id:draft.id}
})
check('Returns respect shipped quantity, restore stock and generate linked credit',()=>{
  const {state,id}=completedOrder
  const returned=engine.saveEntity(state,admin,'devolucion',null,{pedido_id:id,lote_id:1,cantidad_kg:10,destino:'reintegro_inventario',fecha:state.clock+'T10:00'})
  assert.equal(returned.tables.existencia[0].cantidad,910)
  assert.equal(returned.tables.cuenta_por_cobrar.at(-1).saldo,1520)
  assert.equal(returned.tables.nota_credito.at(-1).monto,280)
  assert.throws(()=>engine.saveEntity(returned,admin,'devolucion',null,{pedido_id:id,lote_id:1,cantidad_kg:91,destino:'reintegro_inventario',fecha:state.clock+'T10:00'}),/supera/)
})
check('Agricultural withdrawal period blocks harvest; a valid harvest generates a lot and label',()=>{
  const state=seed()
  assert.throws(()=>engine.saveEntity(state,admin,'cosecha',null,{lote_terreno_id:2,fecha:'2026-10-29',hora_inicio:'05:00',cuadrilla:'Prueba',cajas:10,peso_kg:50,responsable_id:4}),/carencia/)
  const harvested=engine.saveEntity(state,admin,'cosecha',null,{lote_terreno_id:1,fecha:'2026-10-29',hora_inicio:'05:00',cuadrilla:'Prueba',cajas:10,peso_kg:50,responsable_id:4})
  const lot=harvested.tables.lote.at(-1)
  assert.equal(lot.estado,'cuarentena')
  assert.ok(harvested.tables.etiqueta_lote.some(e=>e.lote_id===lot.id))
  assert.throws(()=>engine.runAction(harvested,admin,'lote',lot.id,'recibir'),/clasificación/)
  let classified=engine.saveEntity(harvested,admin,'clasificacion_calidad',null,{lote_id:lot.id,categoria:'extra',peso_promedio_g:20,porcentaje_color:98,porcentaje_defectos:1,vigente:true,responsable_id:5})
  classified=engine.runAction(classified,admin,'lote',lot.id,'recibir',{almacen_id:1,camara_id:1})
  assert.equal(classified.tables.lote.at(-1).estado,'disponible')
  assert.equal(classified.tables.existencia.at(-1).cantidad,50)
})
check('Temperature violations create alerts and quarantine after 30 minutes',()=>{
  let state=seed()
  state=engine.saveEntity(state,admin,'registro_temperatura',null,{camara_id:1,lote_id:1,temperatura:8,humedad:91,origen:'manual',fecha_hora:'2026-10-29T10:00'})
  assert.equal(state.tables.alerta_temperatura.at(-1).estado,'abierta')
  state=engine.saveEntity(state,admin,'registro_temperatura',null,{camara_id:1,lote_id:1,temperatura:8,humedad:91,origen:'manual',fecha_hora:'2026-10-29T10:31'})
  assert.equal(state.tables.lote[0].estado,'cuarentena')
  assert.equal(state.tables.alerta_temperatura.at(-1).lote_retenido,true)
  assert.throws(()=>engine.runAction(state,admin,'lote',1,'liberar',{comentario:'Revisado'}),/incidentes/)
  state=engine.runAction(state,admin,'alerta_temperatura',state.tables.alerta_temperatura.at(-1).id,'resolver',{comentario:'Reparación y lectura normal verificadas'})
  assert.throws(()=>engine.runAction(state,admin,'lote',1,'liberar',{comentario:'Revisado'}),/lectura/)
  state=engine.saveEntity(state,admin,'registro_temperatura',null,{camara_id:1,lote_id:1,temperatura:1,humedad:91,origen:'manual',fecha_hora:'2026-10-29T10:40'})
  state=engine.runAction(state,admin,'lote',1,'liberar',{comentario:'Aprobado por calidad'})
  assert.equal(state.tables.lote[0].estado,'disponible')
})
check('Transfers and adjustments preserve reservations and reject insufficient stock',()=>{
  const state=seed()
  assert.throws(()=>engine.inventoryOperation(state,admin,1,'salida',900,0,'Prueba'),/suficiente/)
  const transferred=engine.inventoryOperation(state,admin,1,'transferencia',100,3,'Ruta capital')
  assert.equal(transferred.tables.existencia[0].cantidad,900)
  assert.equal(transferred.tables.existencia.at(-1).cantidad,100)
  assert.equal(transferred.tables.existencia.at(-1).almacen_id,3)
  assert.throws(()=>engine.inventoryOperation(state,{id:3,role:'Almacén'},1,'ajuste',950,0,'Conteo'),/autorización/)
  assert.throws(()=>engine.inventoryOperation(state,admin,1,'ajuste',100,0,'Conteo'),/reservado/)
})
check('Role permissions, client isolation, FK deletion, audit and synchronization conflicts',()=>{
  const state=seed(),customer={id:1,role:'Cliente',clientId:1}
  assert.equal(store.can(state,{id:2,role:'Vendedor'},'costo_produccion','consultar'),false)
  assert.ok(store.scopedRows(state,'pedido',customer).every(p=>p.cliente_id===1))
  assert.throws(()=>engine.saveEntity(state,customer,'solicitud_portal',null,{cliente_id:1,pedido_id:2,fecha:state.clock,tipo:'Consulta',descripcion:'Prueba',estado:'abierta'}),/pertenece/)
  assert.throws(()=>engine.deleteEntity(state,admin,'cliente',1),/relacionados/)
  let sync=engine.runAction(state,admin,'cola_sincronizacion',1,'sincronizar',{conflicto:true})
  assert.equal(sync.tables.cola_sincronizacion[0].estado,'conflicto')
  sync=engine.runAction(sync,admin,'cola_sincronizacion',1,'resolver')
  sync=engine.runAction(sync,admin,'cola_sincronizacion',1,'sincronizar')
  assert.equal(sync.tables.cola_sincronizacion[0].estado,'sincronizado')
  assert.equal(sync.tables.bitacora_auditoria.length,3)
})
const {ErpProvider}=await load('context/ErpContext')
const {documentRows}=await load('services/documentService')
check('Export shipment requires documents and dispatch; its document uses actual lot quantities',()=>{
  let state=seed()
  assert.throws(()=>engine.runAction(state,admin,'embarque',1,'despachar'),/pedido/)
  state=engine.runAction(state,admin,'embarque',1,'documentos')
  state=engine.runAction(state,admin,'alerta_temperatura',1,'resolver',{comentario:'Cámara reparada'})
  state=engine.saveEntity(state,admin,'registro_temperatura',null,{camara_id:3,lote_id:3,temperatura:0,humedad:92,origen:'manual',fecha_hora:'2026-10-29T09:30'})
  state=engine.runAction(state,admin,'lote',3,'liberar',{comentario:'Calidad verificada'})
  state=engine.runAction(state,admin,'pedido',3,'confirmar')
  state=engine.runAction(state,admin,'pedido',3,'preparar')
  state=engine.runAction(state,admin,'pedido',3,'despachar')
  state=engine.runAction(state,admin,'embarque',1,'despachar')
  assert.equal(state.tables.embarque[0].estado,'despachado')
  const doc=documentRows(state,'embarque',state.tables.embarque[0])
  assert.ok(doc.some(line=>line.includes('LOT-CR-008')&&line.includes('115')))
  assert.ok(doc.flat().some(text=>text.includes('SIN VALIDEZ')))
})
check('Earlier records remain archived even when free-text data has no relational identifiers',()=>{
  const prior=structuredClone(initial)
  prior.ventas.push(['VEN-9999','Cliente previo','Producto previo','Q 100','2026-11-02','Pendiente'])
  prior.productos=[]
  const migrated=seedErp(prior)
  assert.deepEqual(migrated.migrationArchive,prior)
  assert.equal(migrated.tables.pedido.length,3)
  assert.equal(migrated.tables.producto.length,6)
})
const {default:EntityPage}=await load('pages/EntityPage')
const {default:EntityDrawer}=await load('components/ui/EntityDrawer')
const {default:ManagementReports}=await load('pages/ManagementReports')
const {default:Traceability}=await load('pages/Traceability')
const renderErp=element=>render(React.createElement(ErpProvider,null,element))
check('All 76 related screens and their new/detail forms render',()=>{
  localStorage.clear()
  const state=seed()
  for(const entity of ENTITIES){
    assert.ok(renderErp(React.createElement(EntityPage,{entity:entity.key})).includes(entity.title))
    assert.ok(renderErp(React.createElement(EntityDrawer,{entity:entity.key,row:null,view:'form',close:noop})).includes('Guardar registro'))
    const row=state.tables[entity.key][0]
    if(row)assert.ok(renderErp(React.createElement(EntityDrawer,{entity:entity.key,row,view:'detail',close:noop})).includes('FICHA OPERATIVA'))
  }
  assert.ok(renderErp(React.createElement(ManagementReports)).includes('Ventas por producto'))
  assert.ok(renderErp(React.createElement(Traceability)).includes('Trazabilidad completa'))
  assert.equal(SCHEMA.existencia.readOnly,true)
})
console.log(`Verified ${checks} groups: original migration, 76 relational screens, business transactions and rendering. Interactive browser and visual checks remain pending.`)
