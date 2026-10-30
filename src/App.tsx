import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MODULES, routeFor } from './data/demoData'
import Login from './pages/Login'
import Operations from './pages/Operations'

function ProtectedPage({ current }: { current: string }) {
  const { authenticated } = useAuth()
  return authenticated ? <Operations current={current} /> : <Navigate to="/login" replace />
}

export default function App() {
  return <BrowserRouter><AuthProvider><Routes><Route path="/login" element={<Login />} />{MODULES.map(([key]) => <Route key={key} path={routeFor(key)} element={<ProtectedPage current={key} />} />)}<Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes></AuthProvider></BrowserRouter>
}
