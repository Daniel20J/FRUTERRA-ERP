import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { loadErp, persistErp } from '../services/erpStore'
import type { Actor, ErpState } from '../types/erp'

interface ErpContextValue { state: ErpState; actor: Actor; setActor: (actor: Actor) => void; message: string; mutate: (operation: (state: ErpState) => ErpState) => string | null; notify: (message: string) => void }
const ErpContext = createContext<ErpContextValue | null>(null)
export function ErpProvider({ children }: { children: ReactNode }) {
  const [state,setState]=useState(loadErp)
  const [actor,setActor]=useState<Actor>({id:1,role:'Administrador',clientId:1})
  const [message,notify]=useState('')
  useEffect(()=>{if(!message)return;const timer=setTimeout(()=>notify(''),4500);return()=>clearTimeout(timer)},[message])
  function mutate(operation: (state: ErpState)=>ErpState) {
    try {
      const next=operation(state)
      setState(next)
      notify(persistErp(next)?'Operación guardada. Los documentos y procesos externos son simulados.':'Operación aplicada en memoria. El navegador no permite guardar localmente; exporta un respaldo antes de cerrar.')
      return null
    } catch(error) { const text=error instanceof Error?error.message:'No se pudo completar la operación';notify(text);return text }
  }
  return <ErpContext.Provider value={{state,actor,setActor,message,mutate,notify}}>{children}</ErpContext.Provider>
}
// eslint-disable-next-line react-refresh/only-export-components
export function useErp() {const value=useContext(ErpContext);if(!value)throw Error('ErpProvider requerido');return value}
