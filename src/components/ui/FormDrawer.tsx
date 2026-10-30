import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CONFIG } from '../../data/demoData'
import type { DrawerState } from '../../types'

interface Props { state: DrawerState; row: string[] | null; close: () => void; edit: () => void; save: (values: string[]) => void; remove: () => void; advance: () => void; notify: (message: string) => void }
export default function FormDrawer({ state, row, close, edit, save, remove, advance, notify }: Props) {
  const cfg = CONFIG[state.module]
  const [values, setValues] = useState(() => cfg.fields.map((field, j) => row?.[j + 1] ?? (field === 'Estado' ? 'Pendiente' : '')))
  const drawerRef = useRef<HTMLDivElement>(null)
  const detail = state.view === 'detail'
  const editing = state.index !== null
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    drawerRef.current?.querySelector<HTMLElement>(detail ? '.close' : 'input, select')?.focus()
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
      if (event.key !== 'Tab') return
      const elements = drawerRef.current?.querySelectorAll<HTMLElement>('button, input, select, textarea')
      if (!elements?.length) return
      const first = elements[0], last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; previous?.focus() }
  }, [close, detail])
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); save(values) }
  return <div className="modalback" onClick={event => { if (event.target === event.currentTarget) close() }}><div className="drawer" ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby="drawerTitle"><div className="drawerheader"><div><span className="eyebrow">{detail ? 'FICHA OPERATIVA' : editing ? 'EDITAR REGISTRO' : 'ALTA DE REGISTRO'} / {cfg.title.toUpperCase()}</span><h2 id="drawerTitle">{detail || editing ? row?.[0] : 'Nuevo ' + cfg.noun}</h2></div><button className="close" onClick={close} aria-label="Cerrar formulario">×</button></div>
    {detail && row ? <><div className="docchip">REFERENCIA {row[0]} · DATOS SIMULADOS</div><div className="formgrid">{cfg.cols.map((label, j) => <div className={'field ' + (j === 1 ? 'full' : '')} key={label}><label>{label}</label><div style={{ borderBottom: '1px solid #d8dfd3', padding: '8px 0' }}>{row[j]}</div></div>)}</div><section className="section"><div className="sectop"><h2>Acciones disponibles</h2></div><div className="visual"><div className="quick"><button onClick={edit}>✎ Editar</button><button onClick={() => notify('Comprobante de ' + row[0] + ' preparado para demostración')}>▤ Documento</button>{state.module === 'ventas' && <button onClick={advance}>→ Avanzar estado</button>}{state.module === 'lotes' && <button onClick={() => notify('Historial de origen → clasificación → almacén → despacho (demo)')}>⌁ Ver recorrido</button>}</div></div></section><div className="drawerfooter"><button className="action ghost" onClick={close}>Cerrar</button></div></> : <><p className="note">Formulario demostrativo. Los cambios se conservan en este navegador.</p><form id="recordForm" onSubmit={submit}><div className="formgrid">{cfg.fields.map((field, j) => <div className={'field ' + (j === cfg.fields.length - 1 ? 'full' : '')} key={field}><label htmlFor={'f' + j}>{field}</label>{field === 'Estado' ? <select id={'f' + j} name={'f' + j} value={values[j]} onChange={event => setValues(values.map((value, i) => i === j ? event.target.value : value))}>{[...new Set([row?.[j + 1] || 'Pendiente', 'Activo', 'Disponible', 'Confirmado', 'En revisión', 'Preparación', 'Despachado', 'Entregado', 'Aprobada', 'Verificado', 'Cuarentena', 'Resuelto', 'Alerta', 'Normal', 'Cancelado'])].map(value => <option key={value}>{value}</option>)}</select> : <input id={'f' + j} name={'f' + j} value={values[j]} placeholder={field} required={j === 0} onChange={event => setValues(values.map((value, i) => i === j ? event.target.value : value))} />}</div>)}</div><div className="drawerfooter">{editing && <button type="button" className="action ghost" onClick={remove}>Eliminar</button>}<button type="button" className="action ghost" onClick={close}>Cancelar</button><button type="submit" className="action">{editing ? 'Guardar cambios' : 'Crear registro'}</button></div></form></>}
  </div></div>
}
