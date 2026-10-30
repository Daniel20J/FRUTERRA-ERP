import { createContext } from 'react'

export interface PwaInstallState { installed: boolean; busy: boolean; install: () => void }
export const PwaInstallContext = createContext<PwaInstallState | null>(null)
