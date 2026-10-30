import { useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ENTITIES, PRIMARY_ENTITY, SCHEMA } from '../data/erpSchema'
import { useErp } from '../context/ErpContext'
import { can } from '../services/erpStore'
import { dashboardData } from '../services/erpSelectors'
import MainLayout from '../components/layout/MainLayout'
import EntityPage from './EntityPage'
import Traceability from './Traceability'
import Dashboard from './Dashboard'
import ManagementReports from './ManagementReports'
import DocumentPreview from './DocumentPreview'
import LegacyArchive from './LegacyArchive'

export default function Workbench({current}: {current:string}) {
  const {entity:routeEntity}=useParams(),navigate=useNavigate(),location=useLocation()
  const {state,actor,setActor,message,mutate}=useErp()
  const entity=routeEntity??PRIMARY_ENTITY[current]
  const group=['gestion','documentos'].includes(current)?SCHEMA[entity]?.group??'general':current==='trazabilidad'?'lotes':current
  const tabs=ENTITIES.filter(e=>e.group===group&&can(state,actor,e.key,'consultar'))
  const allowed=actor.role==='Cliente'?['portalcliente','ventas','finanzas','reclamos']:['general','reportes',...new Set(ENTITIES.filter(e=>can(state,actor,e.key,'consultar')).map(e=>e.group))]
  useEffect(()=>{window.scrollTo(0,0)},[location.pathname])
  const backup=()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'})),anchor=document.createElement('a');anchor.href=url;anchor.download='fruterra_respaldo_'+state.clock+'.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
  }
  return <><MainLayout current={group} allowedGroups={allowed}><div className="erp-toolbar"><label>Perfil de demostración <select aria-label="Perfil de demostración" className="select" value={actor.role} onChange={e=>{const role=state.tables.rol.find(r=>r.nombre===e.target.value),user=state.tables.usuario.find(u=>u.rol_id===role?.id);setActor({id:user?.id??1,role:e.target.value,clientId:1});if(e.target.value==='Cliente')navigate('/portal-clientes')}}>{state.tables.rol.filter(r=>r.estado==='activo').map(role=><option key={role.id}>{String(role.nombre)}</option>)}</select></label><label>Fecha operativa <input type="date" className="select" aria-label="Fecha operativa" disabled={!['Administrador','Gerente'].includes(actor.role)} value={state.clock} onChange={e=>{if(e.target.value)mutate(s=>({...s,clock:e.target.value}))}}/></label>{actor.role==='Administrador'&&<button className="action ghost" onClick={()=>navigate('/archivo-anterior')}>Registros anteriores</button>}{actor.role==='Administrador'&&<button className="action ghost" onClick={backup}>↓ Respaldo local</button>}</div><p className="demo-caption">Demostración local · El perfil simula permisos en esta interfaz; no sustituye autenticación ni autorización en un servidor.</p>
    {tabs.length>0&&<nav className="tabbar entity-tabs" aria-label="Opciones del módulo">{tabs.map(tab=><button key={tab.key} className={'tab '+(entity===tab.key&&current!=='trazabilidad'?'on':'')} onClick={()=>navigate('/gestion/'+tab.key)}>{tab.title}</button>)}{group==='lotes'&&can(state,actor,'lote','consultar')&&<button className={'tab '+(current==='trazabilidad'?'on':'')} onClick={()=>navigate('/trazabilidad')}>Consulta de trazabilidad</button>}</nav>}
    {current==='archivo'?<LegacyArchive/>:current==='documentos'?<DocumentPreview/>:group==='general'&&actor.role!=='Cliente'?<Dashboard db={dashboardData(state)} openForm={()=>navigate('/gestion/pedido?crear=1')}/>:current==='reportes'?<ManagementReports/>:current==='trazabilidad'?<Traceability/>:entity&&SCHEMA[entity]?<EntityPage key={entity+':'+actor.role} entity={entity}/>:<p className="note">Selecciona un módulo disponible en el menú.</p>}
    </MainLayout>{message&&<div className="toast" role="status">{message}</div>}</>
}
