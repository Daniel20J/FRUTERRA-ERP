import { useState } from 'react'
import { useErp } from '../context/ErpContext'
import { CONFIG, moduleKeys, type ModuleKey } from '../data/demoData'
import { downloadCSV } from '../services/storageService'

export default function LegacyArchive() {
  const {state,actor}=useErp(),[selected,setSelected]=useState<ModuleKey>('ventas')
  if(actor.role!=='Administrador')return <p className="note">El archivo anterior está disponible para el administrador de demostración.</p>
  const rows=state.migrationArchive?.[selected]??[],cfg=CONFIG[selected]
  return <><div className="hero"><div><span className="eyebrow">CONSERVACIÓN / VERSIÓN ANTERIOR</span><h1>Registros anteriores</h1><p>Copia íntegra de las tablas de texto al iniciar la ampliación.</p></div><button className="action ghost" onClick={()=>downloadCSV('fruterra_archivo_'+selected+'.csv',[cfg.cols,...rows])}>↓ Exportar archivo CSV</button></div><p className="note">Los registros históricos sin identificadores relacionales se conservan aquí. No generan movimientos ni saldos nuevos automáticamente. Los identificadores de demostración conocidos se usan para preparar el nuevo entorno de procesos. El almacenamiento de la versión anterior permanece intacto.</p><div className="tabletools"><select className="search" aria-label="Módulo del archivo anterior" value={selected} onChange={e=>setSelected(e.target.value as ModuleKey)}>{moduleKeys.map(key=><option key={key} value={key}>{CONFIG[key].title}</option>)}</select></div><section className="section"><div className="sectop"><h2>{cfg.title}</h2><small>{rows.length} REGISTROS ANTERIORES</small></div><div className="table-scroll"><table className="datatable"><thead><tr>{cfg.cols.map(label=><th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map((row,index)=><tr key={index}>{row.map((cell,i)=><td key={i}>{cell}</td>)}</tr>)}{!rows.length&&<tr><td colSpan={cfg.cols.length}><div className="empty">No había registros en este módulo.</div></td></tr>}</tbody></table></div></section></>
}
