import { useParams } from 'react-router-dom'
import { useErp } from '../context/ErpContext'
import { scopedRows } from '../services/erpStore'
import { documentRows } from '../services/documentService'
import { downloadCSV } from '../services/storageService'

export default function DocumentPreview() {
  const {entity='',id}=useParams(),{state,actor}=useErp()
  const row=scopedRows(state,entity,actor).find(r=>r.id===Number(id))
  if(!row)return <p className="note">El documento no existe o tu perfil no permite consultarlo.</p>
  const lines=documentRows(state,entity,row)
  return <><div className="hero no-print"><div><span className="eyebrow">DOCUMENTOS / DEMOSTRACIÓN</span><h1>Vista imprimible</h1><p>Usa la impresión del navegador para guardar una copia en PDF.</p></div><div className="toolbar"><button className="action ghost" onClick={()=>downloadCSV(`fruterra_${entity}_${id}_demo.csv`,lines)}>↓ Descargar CSV</button><button className="action" onClick={()=>window.print()}>Imprimir / Guardar PDF</button></div></div><article className="document-sheet"><div className="document-brand">FRUTERRA EXPORT, S. A.</div><p className="note">DEMONSTRACIÓN ACADÉMICA · SIN VALIDEZ FISCAL NI ADUANAL</p><table className="datatable"><tbody>{lines.map((line,index)=><tr key={index}>{line.length?line.map((cell,i)=><td key={i}>{cell}</td>):<td> </td>}</tr>)}</tbody></table></article></>
}
