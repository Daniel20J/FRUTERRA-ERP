import { useNavigate } from 'react-router-dom'
import { routeFor, moduleKeys, type Database, type ModuleKey } from '../data/demoData'
import { downloadCSV } from '../services/storageService'
import { Footer, MetricCard } from '../components/ui/Shared'

export default function Reportes({ db }: { db: Database }) {
  const navigate = useNavigate()
  const sections: [string, ModuleKey][] = [['Inventario', 'inventario'], ['Pedidos', 'ventas'], ['Producción', 'produccion'], ['Exportaciones', 'exportaciones'], ['Compras', 'compras'], ['Finanzas', 'finanzas'], ['Reclamos', 'reclamos']]
  return <><div className="hero"><div><span className="eyebrow">DIRECCIÓN / INDICADORES</span><h1>Lectura del negocio.</h1><p>Reportes por módulo, exportación de datos y resumen de actividad. Datos de muestra.</p></div><button className="action" onClick={() => downloadCSV('fruterra_resumen.csv', [['Modulo', 'Registros'], ...moduleKeys.map(key => [key, db[key].length])])}>↓ Descargar resumen</button></div><div className="metrics">{([['PRODUCTOS', 'productos'], ['CLIENTES', 'clientes'], ['PEDIDOS', 'ventas'], ['EMBARQUES', 'exportaciones']] as [string, ModuleKey][]).map(([label, key]) => <MetricCard key={key} label={label} value={db[key].length} caption="Registros de demostración" />)}</div><section className="section"><div className="sectop"><h2>Áreas de análisis</h2><small>DATOS CONSOLIDADOS</small></div><div className="workspace">{sections.map(([label, key], i) => <article className="work-card" key={key} onClick={() => navigate(routeFor(key))}><span className="num">INFORME {String(i + 1).padStart(2, '0')}</span><strong>{label}</strong><p>{db[key].length} registros disponibles · consultar y filtrar ↗</p></article>)}</div></section><div className="note">Los informes se basan exclusivamente en registros locales del prototipo y no representan indicadores reales de la empresa.</div><Footer /></>
}
