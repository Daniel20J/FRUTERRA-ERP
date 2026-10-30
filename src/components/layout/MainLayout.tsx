import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { CONFIG, MODULES, isModuleKey, routeFor } from '../../data/demoData'
import { useAuth } from '../../context/AuthContext'
import type { ReactNode } from 'react'

export default function MainLayout({ current, children, allowedGroups }: { current: string; children: ReactNode; allowedGroups?: string[] }) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  return <div id="app"><aside id="side"><div className="brand"><div className="brand-mark"><span>F</span></div><div><strong>FRUTERRA</strong><small>EXPORT / ERP</small></div></div>
    {MODULES.map(([key, icon, label], i) => (!allowedGroups || allowedGroups.includes(key)) && <Fragment key={key}>{[0, 7, 11].includes(i) && <div className="navlabel">{i === 0 ? 'OPERACIÓN' : i === 7 ? 'RELACIONES' : 'ADMINISTRACIÓN'}</div>}<button className={'navitem ' + (current === key ? 'active' : '')} onClick={() => navigate(routeFor(key))} title={label} aria-current={current === key ? 'page' : undefined}><span className="navicon">{icon}</span><span className="navtext">{label}</span></button></Fragment>)}
    <div className="aside-bottom"><strong>Petén · Guatemala</strong>Entorno académico<br />Prototipo interactivo · datos simulados</div>
  </aside><main><header className="topbar"><span className="crumb">FRUTERRA / <span id="breadcrumb">{(isModuleKey(current) ? CONFIG[current].title : 'CENTRO DE OPERACIONES').toUpperCase()}</span></span><div className="top-right"><span className="chip">● DEMOSTRACIÓN</span><span className="avatar" id="sessionAvatar">AD</span><button className="logout-btn" onClick={() => { logout(); navigate('/login', { replace: true }) }} title="Salir del sistema">Cerrar sesión ↗</button></div></header><div id="content" className="page">{children}</div></main></div>
}
