import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { authenticated, login } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')
  if (authenticated) return <Navigate to="/dashboard" replace />
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (login(user, password)) { setPassword(''); navigate('/dashboard', { replace: true }) }
    else setError('Usuario o contraseña incorrectos. Usa las credenciales de prueba indicadas debajo.')
  }
  return <div id="loginScreen" className="login-screen">
    <div className="login-story"><div className="login-wordmark"><span className="login-leaf">F</span><div><strong>FRUTERRA</strong><small>FRESA · MORA · CEREZA</small></div></div><div className="login-story-bottom"><div className="eyebrow">OPERACIÓN AGROEXPORTADORA · GUATEMALA</div><h1>Del Origen<br />al Destino.</h1><p>Control integral de cultivo, empaque, cadena de frío, trazabilidad, ventas y exportación para las frutas principales de la empresa.</p><div className="login-index"><span>01 / CULTIVO</span><span>02 / CADENA DE FRÍO</span><span>03 / EXPORTACIÓN</span></div></div></div>
    <div className="login-access"><div className="login-form-wrap"><div className="login-kicker">ACCESO AL SISTEMA <span>·</span> VERSIÓN DEMOSTRACIÓN</div><h2>Iniciar<br />sesión.</h2><p className="login-sub">Accede al entorno de demostración para gestionar fincas, lotes, inventario, pedidos y embarques.</p><form id="loginForm" onSubmit={submit}><label htmlFor="loginUser">Usuario</label><input id="loginUser" name="username" autoComplete="username" placeholder="Tu usuario" required autoFocus value={user} onChange={e => setUser(e.target.value)} /><label htmlFor="loginPassword">Contraseña</label><div className="password-wrap"><input id="loginPassword" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" placeholder="Tu contraseña" required value={password} onChange={e => setPassword(e.target.value)} /><button type="button" className="show-pass" onClick={() => setVisible(!visible)} aria-label="Mostrar u ocultar contraseña">{visible ? 'Ocultar' : 'Mostrar'}</button></div><p className="login-error" id="loginError" role="alert" aria-live="polite">{error}</p><button className="login-submit" type="submit">Entrar al sistema <span>→</span></button></form><div className="demo-account"><div className="demo-title">CREDENCIALES DE PRUEBA</div><div><b>Usuario</b><code>admin</code></div><div><b>Contraseña</b><code>admin123</code></div><small>Acceso simulado en el navegador. No utiliza servidor ni verifica identidades reales.</small></div></div><div className="login-copyright">FRUTERRA EXPORT, S. A. <span>PROTOTIPO ERP / BERRIES · 2026</span></div></div>
  </div>
}
