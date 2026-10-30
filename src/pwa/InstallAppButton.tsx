import { useContext } from 'react'
import { PwaInstallContext } from './PwaInstallContext'

export default function InstallAppButton() {
  const state = useContext(PwaInstallContext)
  if (!state || state.installed) return null
  return <button className="pwa-install" disabled={state.busy} onClick={state.install}>↓ {state.busy ? 'Abriendo instalación…' : 'Instalar aplicación'}</button>
}
