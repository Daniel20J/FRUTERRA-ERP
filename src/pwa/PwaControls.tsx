import { useEffect, useRef, useState, type ReactNode } from 'react'
import { PwaInstallContext } from './PwaInstallContext'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}
const standalone = () => window.matchMedia('(display-mode: standalone)').matches || !!(navigator as Navigator & { standalone?: boolean }).standalone

export default function PwaControls({ children }: { children: ReactNode }) {
  const [installed, setInstalled] = useState(() => typeof window !== 'undefined' && standalone())
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null)
  const [help, setHelp] = useState(false)
  const [offline, setOffline] = useState(() => typeof window !== 'undefined' && !navigator.onLine)
  const [ready, setReady] = useState(false)
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null)
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)
  const [platform] = useState<'ios' | 'other'>(() => typeof window !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? 'ios' : 'other')
  const [secure] = useState(() => typeof window === 'undefined' || window.isSecureContext)
  const [supported] = useState(() => typeof window === 'undefined' || 'serviceWorker' in navigator)
  const reloadRequested = useRef(false)
  const helpRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    let registration: ServiceWorkerRegistration | null = null
    let installer: ServiceWorker | null = null
    const display = window.matchMedia('(display-mode: standalone)')
    const onDisplay = () => setInstalled(standalone())
    const beforeInstall = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPromptEvent) }
    const installedEvent = () => { setInstalled(true); setPrompt(null); setHelp(false) }
    const onlineEvent = () => { setOffline(false); void registration?.update().catch(() => {}) }
    const offlineEvent = () => setOffline(true)
    const queryReady = () => navigator.serviceWorker.controller?.postMessage({ type: 'CHECK_OFFLINE_READY' })
    const controllerChanged = () => { if (reloadRequested.current) window.location.reload(); else queryReady() }
    const workerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OFFLINE_READY') { setReady(true); setFailure('') }
      if (event.data?.type === 'OFFLINE_UNAVAILABLE') { setReady(false); setFailure('Faltan archivos para abrir sin conexión. Vuelve a abrir la aplicación con internet.') }
    }
    const stateChanged = () => {
      if (!active || !registration) return
      if (installer?.state === 'installed' && navigator.serviceWorker.controller) setWaiting(registration.waiting)
      if (installer?.state === 'redundant') setFailure('La descarga sin conexión no terminó. Inténtalo de nuevo con internet.')
    }
    const updateFound = () => {
      installer?.removeEventListener('statechange', stateChanged)
      installer = registration?.installing ?? null
      installer?.addEventListener('statechange', stateChanged)
    }
    window.addEventListener('beforeinstallprompt', beforeInstall)
    window.addEventListener('appinstalled', installedEvent)
    window.addEventListener('online', onlineEvent)
    window.addEventListener('offline', offlineEvent)
    display.addEventListener('change', onDisplay)
    if ('serviceWorker' in navigator && window.isSecureContext && import.meta.env.PROD) {
      navigator.serviceWorker.addEventListener('message', workerMessage)
      navigator.serviceWorker.addEventListener('controllerchange', controllerChanged)
      void navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).then(reg => {
        if (!active) return
        registration = reg
        if (reg.waiting) setWaiting(reg.waiting)
        reg.addEventListener('updatefound', updateFound)
        updateFound()
        queryReady()
        void navigator.serviceWorker.ready.then(() => { if (active) queryReady() })
      }).catch(() => { if (active) setFailure('No se pudo preparar el uso sin conexión. Vuelve a abrir con internet.') })
    }
    return () => {
      active = false
      window.removeEventListener('beforeinstallprompt', beforeInstall)
      window.removeEventListener('appinstalled', installedEvent)
      window.removeEventListener('online', onlineEvent)
      window.removeEventListener('offline', offlineEvent)
      display.removeEventListener('change', onDisplay)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', workerMessage)
        navigator.serviceWorker.removeEventListener('controllerchange', controllerChanged)
      }
      registration?.removeEventListener('updatefound', updateFound)
      installer?.removeEventListener('statechange', stateChanged)
    }
  }, [])

  useEffect(() => {
    if (!help) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    helpRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setHelp(false)
      if (event.key !== 'Tab') return
      const buttons = helpRef.current?.querySelectorAll<HTMLElement>('button, a[href]')
      if (!buttons?.length) return
      const first = buttons[0], last = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); previous?.focus() }
  }, [help])

  async function install() {
    if (!prompt) { setHelp(true); return }
    setBusy(true)
    try {
      await prompt.prompt()
      const choice = await prompt.userChoice
      setPrompt(null)
      if (choice.outcome === 'dismissed') setHelp(true)
      // appinstalled / standalone, rather than accepting the prompt, confirms installation.
    } catch { setPrompt(null); setHelp(true) }
    finally { setBusy(false) }
  }
  const applyUpdate = () => {
    if (!waiting || !window.confirm('Se recargará FRUTERRA para aplicar la actualización. Guarda primero los formularios abiertos. Los registros ya guardados se conservan. ¿Actualizar ahora?')) return
    reloadRequested.current = true
    waiting.postMessage({ type: 'SKIP_WAITING' })
  }

  return <PwaInstallContext.Provider value={{ installed, busy, install: () => void install() }}>
    {children}
    <div className="pwa-controls no-print" aria-label="Instalación y conexión">
      {(offline || waiting || failure) && <div className="pwa-status" role="status"><span>{failure || (offline ? ready ? 'Sin conexión · puedes trabajar con los datos locales' : 'Sin conexión · la descarga inicial aún no está lista' : 'Nueva versión disponible')}</span>{waiting && <button onClick={applyUpdate}>Actualizar</button>}</div>}
    </div>
    {help && <div className="pwa-modal-back no-print" onClick={event => { if (event.target === event.currentTarget) setHelp(false) }}><div className="pwa-modal" role="dialog" aria-modal="true" aria-labelledby="pwa-title" ref={helpRef}><div className="drawerheader"><h2 id="pwa-title">Instalar FRUTERRA</h2><button className="close" aria-label="Cerrar instrucciones" onClick={() => setHelp(false)}>×</button></div>
      {!secure ? <p>Para instalarla, abre la dirección publicada de FRUTERRA con HTTPS. Una dirección de red como http://192.168… sirve para verla, pero no permite preparar la PWA.</p> : !supported ? <p>Este navegador no permite preparar el uso sin conexión. Abre el enlace en Safari, Chrome o Edge actualizado.</p> : <>
        {platform === 'ios' ? <ol><li>Abre este enlace en Safari.</li><li>Toca <strong>Compartir</strong> y <strong>Agregar a pantalla de inicio</strong>.</li><li>Si aparece, activa <strong>Abrir como app web</strong> y toca <strong>Agregar</strong>.</li></ol> : <ol><li>Abre el enlace de FRUTERRA en Chrome o Edge.</li><li>En el menú del navegador, elige <strong>Instalar aplicación</strong> o <strong>Agregar a pantalla de inicio</strong>.</li><li>Confirma la instalación. El navegador decide cuándo mostrar esa opción.</li></ol>}
        {!import.meta.env.PROD && <p className="note">La preparación sin conexión se habilita en la versión publicada o en la vista previa del build de producción.</p>}
        <p>Abre la aplicación con internet la primera vez para que se descargue la interfaz. La aplicación se agrega a la pantalla de inicio; no necesitas descargar un APK.</p>
      </>}
      <p className="note">Los registros se guardan en este dispositivo. Instalar la app en otro teléfono no copia los datos de la computadora.</p><div className="drawerfooter"><button className="action" onClick={() => setHelp(false)}>Entendido</button></div>
    </div></div>}
  </PwaInstallContext.Provider>
}
