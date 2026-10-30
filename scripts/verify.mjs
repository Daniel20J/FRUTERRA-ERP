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
console.log(`Verified ${checks} groups, including CRUD across 16 modules and rendering 18 screens plus 48 drawers. Browser interaction and visual comparison remain pending.`)
