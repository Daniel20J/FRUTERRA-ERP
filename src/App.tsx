import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ErpProvider } from './context/ErpContext'
import { MODULES, routeFor } from './data/demoData'
import Login from './pages/Login'
import Workbench from './pages/Workbench'
import PwaControls from './pwa/PwaControls'

function ProtectedPage({ current }: { current: string }) {
  const { authenticated } = useAuth()
  return authenticated ? <Workbench current={current} /> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErpProvider>
          <PwaControls>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {MODULES.map(([key]) => (
              <Route 
                key={key} 
                path={routeFor(key)} 
                element={<ProtectedPage current={key} />} 
              />
            ))}

            <Route path="/gestion/:entity" element={<ProtectedPage current="gestion" />} />
            <Route path="/trazabilidad" element={<ProtectedPage current="trazabilidad" />} />
            <Route path="/archivo-anterior" element={<ProtectedPage current="archivo" />} />
            <Route path="/documentos/:entity/:id" element={<ProtectedPage current="documentos" />} />
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </PwaControls>
        </ErpProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
