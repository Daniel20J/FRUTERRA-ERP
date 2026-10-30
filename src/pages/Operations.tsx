import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CONFIG, isModuleKey, type Database, type ModuleKey } from '../data/demoData'
import { saveRecord, deleteRecord, advanceOrder, synchronizeDatabase } from '../services/recordService'
import { downloadCSV, loadDatabase, saveDatabase } from '../services/storageService'
import MainLayout from '../components/layout/MainLayout'
import FormDrawer from '../components/ui/FormDrawer'
import Dashboard from './Dashboard'
import Reportes from './Reportes'
import ModulePage from './ModulePage'
import type { DrawerState } from '../types'

export default function Operations({ current }: { current: string }) {
  const [db, setDb] = useState(loadDatabase)
  const [drawer, setDrawer] = useState<DrawerState | null>(null)
  const [message, setMessage] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const location = useLocation()
  const close = useCallback(() => setDrawer(null), [])
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  function notify(text: string) {
    setMessage(text)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(''), 3300)
  }
  function update(next: Database, text: string) {
    setDb(next)
    notify(saveDatabase(next) ? text : 'Cambio aplicado en memoria. El navegador no permite guardar los datos localmente.')
  }
  function exportModule(key: ModuleKey) { downloadCSV('fruterra_' + key + '.csv', [CONFIG[key].cols, ...db[key]]); notify('Archivo CSV exportado') }
  function save(values: string[]) {
    if (!drawer) return
    const key = drawer.module
    update(saveRecord(db, key, drawer.index, values), 'Registro guardado en el prototipo')
    close()
  }
  function remove() {
    if (!drawer || drawer.index === null || !window.confirm('¿Eliminar este registro de demostración?')) return
    update(deleteRecord(db, drawer.module, drawer.index), 'Registro eliminado')
    close()
  }
  function advance() {
    if (!drawer || drawer.index === null) return
    const next = advanceOrder(db, drawer.index)
    update(next, 'Pedido actualizado: ' + next.ventas[drawer.index][5])
    close()
  }
  function synchronize() { update(synchronizeDatabase(db), 'Cola marcada como sincronizada (simulación)') }
  return <><MainLayout current={current}>{current === 'general' ? <Dashboard db={db} openForm={module => setDrawer({ module, index: null, view: 'form' })} /> : current === 'reportes' ? <Reportes db={db} /> : isModuleKey(current) ? <ModulePage key={current} current={current} rows={db[current]} open={(index, view) => setDrawer({ module: current, index, view })} notify={notify} exportCSV={() => exportModule(current)} synchronize={synchronize} /> : null}</MainLayout>
    {drawer && <FormDrawer key={drawer.module + ':' + drawer.index + ':' + drawer.view} state={drawer} row={drawer.index === null ? null : db[drawer.module][drawer.index]} close={close} edit={() => setDrawer({ ...drawer, view: 'form' })} save={save} remove={remove} advance={advance} notify={notify} />}
    {message && <div className="toast" role="status">{message}</div>}
  </>
}
