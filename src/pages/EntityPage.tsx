import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SCHEMA, labelValue } from '../data/erpSchema'
import { useErp } from '../context/ErpContext'
import { can, recordLabel, scopedRows } from '../services/erpStore'
import { actionsFor } from '../services/erpEngine'
import { downloadCSV } from '../services/storageService'
import { Footer, StatusBadge } from '../components/ui/Shared'
import EntityDrawer from '../components/ui/EntityDrawer'
import type { BusinessAction, EntityRecord } from '../types/erp'

export default function EntityPage({entity}: {entity:string}) {
  const {state,actor}=useErp(), [params,setParams]=useSearchParams()
  const schema=SCHEMA[entity]
  const [query,setQuery]=useState(''),[status,setStatus]=useState(''),[board,setBoard]=useState(false)
  const [drawer,setDrawer]=useState<{row:EntityRecord|null;view:'form'|'detail'|'action'|'movement';action?:BusinessAction}|null>(()=>params.get('crear')==='1'?{row:null,view:'form'}:null)
  const close=useCallback(()=>setDrawer(null),[])
  if(!schema)return <div className="note">No se encontró esta pantalla.</div>
  if(!can(state,actor,entity,'consultar'))return <div className="note">Tu perfil de demostración no tiene acceso a {schema.title}. Selecciona otra área o cambia de perfil.</div>
  const display=(row:EntityRecord,name:string)=>{
    const field=schema.fields.find(f=>f.name===name),value=row[name]
    if(field?.reference){const related=state.tables[field.reference].find(r=>r[field.referenceField??'id']===value);return related?recordLabel(state,field.reference,related):'—'}
    return typeof value==='boolean'?value?'Sí':'No':value===undefined||value===''?'—':field?.options?labelValue(String(value)):String(value)
  }
  const all=scopedRows(state,entity,actor)
  const matches=all.filter(row=>[...params.entries()].every(([key,value])=>!schema.fields.some(f=>f.name===key)||String(row[key])===value))
  const filtered=matches.filter(row=>(!status||row.estado===status)&&(!query||schema.fields.map(f=>display(row,f.name)).join(' ').toLowerCase().includes(query.toLowerCase())))
  const states=[...new Set(all.map(r=>String(r.estado??'')))].filter(Boolean)
  const exportRows=()=>downloadCSV('fruterra_'+entity+'.csv',[schema.fields.map(f=>f.label),...filtered.map(row=>schema.fields.map(f=>display(row,f.name)))])
  const system=!!schema.readOnly
  return <><div className="hero"><div><span className="eyebrow">GESTIÓN / {schema.group.toUpperCase()}</span><h1>{schema.title}</h1><p>{schema.description??'Consulta y gestión de registros relacionados de FRUTERRA EXPORT.'}</p></div><div className="toolbar"><button className="action ghost" onClick={exportRows}>↓ Exportar CSV</button>{!system&&can(state,actor,entity,'crear')&&<button className="action" onClick={()=>setDrawer({row:null,view:'form'})}>+ Nuevo registro</button>}</div></div><div className="badgebar"><span>{all.length} REGISTROS</span><span>DATOS LOCALES · DEMOSTRACIÓN</span><span>{system?'GENERADO POR OPERACIONES':'EDICIÓN VALIDADA'}</span></div>
    {entity==='pedido'&&<div className="tabbar"><button className={'tab '+(!board?'on':'')} onClick={()=>setBoard(false)}>Listado de pedidos</button><button className={'tab '+(board?'on':'')} onClick={()=>setBoard(true)}>Tablero de preparación</button></div>}
    <div className="tabletools"><input className="search" aria-label="Buscar registros" placeholder="Buscar por código, cliente, producto..." value={query} onChange={e=>setQuery(e.target.value)}/>{states.length>0&&<select className="select" aria-label="Filtrar por estado" value={status} onChange={e=>setStatus(e.target.value)}><option value="">Todos los estados</option>{states.map(s=><option key={s} value={s}>{labelValue(s)}</option>)}</select>}<button className="action ghost" onClick={()=>{setQuery('');setStatus('');setParams({})}}>Limpiar</button></div>
    {params.size>0&&<p className="note">Consulta de registros vinculados. Pulsa «Limpiar» para ver todos.</p>}
    {board?<div className="kanban">{['en_revision','confirmado','en_preparacion','despachado','entregado'].map(s=><div className="lane" key={s}><div className="lanehead"><strong>{labelValue(s)}</strong><span>{filtered.filter(r=>r.estado===s).length}</span></div>{filtered.filter(r=>r.estado===s).map(row=><div key={row.id} className="ticket" onClick={()=>setDrawer({row,view:'detail'})}><small>{String(row.numero)}</small><strong>{display(row,'cliente_id')}</strong><p>{display(row,'moneda_id')} {String(row.total)}</p></div>)}</div>)}</div>:<section className="section" style={{marginTop:0}}><div className="sectop"><h2>Registro de {schema.title.toLowerCase()}</h2><small>{filtered.length} RESULTADOS</small></div><div className="table-scroll"><table className="datatable"><thead><tr>{schema.columns.map(name=><th key={name}>{schema.fields.find(f=>f.name===name)?.label??name}</th>)}<th>GESTIÓN</th></tr></thead><tbody>{filtered.map(row=><tr key={row.id}>{schema.columns.map((name,i)=><td key={name}>{name==='estado'?<StatusBadge value={display(row,name)}/>:i===0?<span className="record">{display(row,name)}</span>:display(row,name)}</td>)}<td className="entity-actions"><button className="rowbutton" onClick={()=>setDrawer({row,view:'detail'})}>Ver ↗</button>{!system&&!['cobro','pago','devolucion','merma','aplicacion_agroquimica','cosecha','anticipo','nota_credito','registro_temperatura','mantenimiento','destajo'].includes(entity)&&can(state,actor,entity,'editar')&&<button className="rowbutton" onClick={()=>setDrawer({row,view:'form'})}>Editar</button>}{entity==='existencia'&&can(state,actor,'movimiento_inventario','aprobar')&&<button className="rowbutton" onClick={()=>setDrawer({row,view:'movement'})}>Movimiento</button>}{can(state,actor,entity,'aprobar')&&actionsFor(entity,row).map(a=><button className="rowbutton" key={a.action} onClick={()=>setDrawer({row,view:'action',action:a.action})}>{a.label}</button>)}</td></tr>)}{!filtered.length&&<tr><td colSpan={schema.columns.length+1}><div className="empty">No se encontraron registros. {system?'Se generarán al ejecutar el proceso relacionado.':'Registra una nueva operación o cambia los filtros.'}</div></td></tr>}</tbody></table></div></section>}
    {system&&<p className="note">Estos registros se generan al ejecutar sus procesos. Consulta sus fichas para ver las referencias y descargar documentos de demostración.</p>}
    {entity==='lote'&&<p className="note">Las cosechas generan lotes en cuarentena. Clasifica su calidad y registra su recepción para habilitar el inventario. La ficha de cada lote permite consultar su trazabilidad.</p>}
    <Footer/>{drawer&&<EntityDrawer key={entity+':'+drawer.row?.id+':'+drawer.view+':'+drawer.action} entity={entity} {...drawer} close={close} prefill={Object.fromEntries(schema.fields.filter(f=>f.reference&&params.has(f.name)).map(f=>[f.name,Number(params.get(f.name))]))}/>}</>
}
