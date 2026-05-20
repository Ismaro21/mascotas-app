'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

type Mascota = {
  id: string
  nombre: string
  especie: string
  raza: string
  edad: string
  sexo: string
  color: string
  bloque: string
  apartamento: string
  propietario: string
  telefono: string
  carnet_vacunas: string
  observaciones: string
  foto_url: string | null
  created_at: string
}

const BLOQUES = ['A', 'B', 'C', 'D']
const ESPECIES = ['Perro', 'Gato', 'Otro']
const SEXOS = ['Macho', 'Hembra']

export default function Home() {
  // Auth
  const [usuario, setUsuario] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Datos
  const [mascotas, setMascotas] = useState<Mascota[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [fichaAbierta, setFichaAbierta] = useState<Mascota | null>(null)
  const [editando, setEditando] = useState<Mascota | null>(null)
  const [filtroBloque, setFiltroBloque] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [form, setForm] = useState({
    nombre: '', especie: 'Perro', raza: '', edad: '', sexo: 'Macho',
    color: '', bloque: 'A', apartamento: '', propietario: '',
    telefono: '', carnet_vacunas: '', observaciones: ''
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null)
      setCheckingAuth(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { fetchMascotas() }, [])

  async function fetchMascotas() {
    setLoading(true)
    const { data, error } = await supabase
      .from('mascotas')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setMascotas(data)
    setLoading(false)
  }

  async function login() {
    setLoginError('')
    setLoginLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword
    })
    setLoginLoading(false)
    if (error) {
      setLoginError('Correo o contraseña incorrectos')
    } else {
      setShowLogin(false)
      setLoginEmail('')
      setLoginPassword('')
    }
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  function abrirNueva() {
    setEditando(null)
    setForm({ nombre: '', especie: 'Perro', raza: '', edad: '', sexo: 'Macho', color: '', bloque: 'A', apartamento: '', propietario: '', telefono: '', carnet_vacunas: '', observaciones: '' })
    setFotoFile(null)
    setFotoPreview(null)
    setShowModal(true)
  }

  function abrirEditar(m: Mascota) {
    setFichaAbierta(null)
    setEditando(m)
    setForm({
      nombre: m.nombre, especie: m.especie, raza: m.raza, edad: m.edad,
      sexo: m.sexo, color: m.color, bloque: m.bloque, apartamento: m.apartamento,
      propietario: m.propietario, telefono: m.telefono, carnet_vacunas: m.carnet_vacunas,
      observaciones: m.observaciones
    })
    setFotoFile(null)
    setFotoPreview(m.foto_url)
    setShowModal(true)
  }

  function manejarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setFotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function guardar() {
    if (!form.nombre || !form.propietario || !form.apartamento) {
      alert('Por favor completa los campos obligatorios: Nombre, Propietario y Apartamento')
      return
    }
    setGuardando(true)
    let foto_url = editando?.foto_url || null

    if (fotoFile) {
      const ext = fotoFile.name.split('.').pop()
      const filename = `${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('fotos-mascotas')
        .upload(filename, fotoFile, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('fotos-mascotas').getPublicUrl(filename)
        foto_url = urlData.publicUrl
      }
    }

    const datos = { ...form, foto_url }

    if (editando) {
      await supabase.from('mascotas').update(datos).eq('id', editando.id)
    } else {
      await supabase.from('mascotas').insert([datos])
    }

    setGuardando(false)
    setShowModal(false)
    fetchMascotas()
  }

  async function eliminar(id: string) {
    await supabase.from('mascotas').delete().eq('id', id)
    setConfirmDelete(null)
    setFichaAbierta(null)
    fetchMascotas()
  }

  // Normaliza el bloque para comparar sin importar si dice "A" o "Bloque A"
  function normalizarBloque(b: string) {
    return b.replace(/^bloque\s*/i, '').trim().toUpperCase()
  }

  const mascotasFiltradas = mascotas.filter(m => {
    const bloqueOk = filtroBloque === 'Todos' || normalizarBloque(m.bloque) === filtroBloque
    const busquedaOk = busqueda === '' ||
      m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.propietario.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.raza.toLowerCase().includes(busqueda.toLowerCase())
    return bloqueOk && busquedaOk
  })

  const iconoEspecie = (e: string) => e === 'Perro' ? '🐶' : e === 'Gato' ? '🐱' : '🐾'
  const esAdmin = !!usuario

  if (checkingAuth) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="app-icon">🏠</div>
            <div>
              <h1 className="app-title">Registro de Mascotas</h1>
              <p className="app-subtitle">Conjunto Residencial · {mascotas.length} mascotas registradas</p>
            </div>
          </div>
          <div className="header-right">
            {esAdmin ? (
              <>
                <div className="admin-badge">
                  <span className="admin-dot"></span>
                  Admin
                </div>
                <button className="btn-primary" onClick={abrirNueva}>
                  <span>+</span> Nueva
                </button>
                <button className="btn-logout" onClick={logout} title="Cerrar sesión">⎋</button>
              </>
            ) : (
              <button className="btn-admin-login" onClick={() => setShowLogin(true)}>
                🔐 Administrar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, dueño o raza..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="bloque-filters">
          {['Todos', ...BLOQUES].map(b => (
            <button
              key={b}
              className={`filter-chip ${filtroBloque === b ? 'active' : ''}`}
              onClick={() => setFiltroBloque(b)}
            >
              {b === 'Todos' ? 'Todos' : `Bloque ${b}`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats — ARREGLADO: normaliza el bloque antes de contar */}
      <div className="stats-row">
        {BLOQUES.map(b => {
          const count = mascotas.filter(m => normalizarBloque(m.bloque) === b).length
          return (
            <div key={b} className="stat-card">
              <span className="stat-label">Bloque {b}</span>
              <span className="stat-number">{count}</span>
            </div>
          )
        })}
      </div>

      {/* Grid */}
      <main className="mascotas-grid">
        {loading ? (
          <div className="empty-state">
            <div className="spinner"></div>
            <p>Cargando mascotas...</p>
          </div>
        ) : mascotasFiltradas.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🐾</span>
            <p>No hay mascotas registradas</p>
            {esAdmin && (
              <button className="btn-primary" onClick={abrirNueva}>Registrar primera mascota</button>
            )}
          </div>
        ) : (
          mascotasFiltradas.map(m => (
            <div key={m.id} className="mascota-card" onClick={() => setFichaAbierta(m)}>
              <div className="card-photo">
                {m.foto_url ? (
                  <img src={m.foto_url} alt={m.nombre} className="mascota-foto" />
                ) : (
                  <div className="foto-placeholder">{iconoEspecie(m.especie)}</div>
                )}
                <span className="especie-badge">{iconoEspecie(m.especie)} {m.especie}</span>
              </div>
              <div className="card-body">
                <h3 className="mascota-nombre">{m.nombre}</h3>
                <p className="mascota-raza">{m.raza || 'Sin raza especificada'}</p>
                <div className="mascota-info">
                  <span className="info-tag">🏢 {m.bloque} · Apto {m.apartamento}</span>
                  <span className="info-tag">👤 {m.propietario}</span>
                  {m.edad && <span className="info-tag">🎂 {m.edad}</span>}
                  {m.sexo && <span className="info-tag">{m.sexo === 'Macho' ? '♂' : '♀'} {m.sexo}</span>}
                </div>
              </div>
              {esAdmin && (
                <div className="card-actions" onClick={e => e.stopPropagation()}>
                  <button className="btn-edit" onClick={() => abrirEditar(m)}>✏️ Editar</button>
                  <button className="btn-delete" onClick={() => setConfirmDelete(m.id)}>🗑️</button>
                </div>
              )}
            </div>
          ))
        )}
      </main>

      {/* ── FICHA DE MASCOTA ── */}
      {fichaAbierta && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setFichaAbierta(null)}>
          <div className="modal modal-ficha">
            <button className="modal-close ficha-close" onClick={() => setFichaAbierta(null)}>✕</button>

            {/* Foto grande */}
            <div className="ficha-foto-wrap">
              {fichaAbierta.foto_url ? (
                <img src={fichaAbierta.foto_url} alt={fichaAbierta.nombre} className="ficha-foto" />
              ) : (
                <div className="ficha-foto-placeholder">{iconoEspecie(fichaAbierta.especie)}</div>
              )}
              <div className="ficha-foto-overlay">
                <h2 className="ficha-nombre">{fichaAbierta.nombre}</h2>
                <span className="ficha-especie-badge">{iconoEspecie(fichaAbierta.especie)} {fichaAbierta.especie}</span>
              </div>
            </div>

            {/* Datos */}
            <div className="ficha-body">
              <div className="ficha-grid">
                <div className="ficha-item">
                  <span className="ficha-label">Raza</span>
                  <span className="ficha-value">{fichaAbierta.raza || '—'}</span>
                </div>
                <div className="ficha-item">
                  <span className="ficha-label">Edad</span>
                  <span className="ficha-value">{fichaAbierta.edad || '—'}</span>
                </div>
                <div className="ficha-item">
                  <span className="ficha-label">Sexo</span>
                  <span className="ficha-value">{fichaAbierta.sexo || '—'}</span>
                </div>
                <div className="ficha-item">
                  <span className="ficha-label">Color</span>
                  <span className="ficha-value">{fichaAbierta.color || '—'}</span>
                </div>
                <div className="ficha-item">
                  <span className="ficha-label">Bloque</span>
                  <span className="ficha-value">{fichaAbierta.bloque}</span>
                </div>
                <div className="ficha-item">
                  <span className="ficha-label">Apartamento</span>
                  <span className="ficha-value">{fichaAbierta.apartamento}</span>
                </div>
                <div className="ficha-item ficha-full">
                  <span className="ficha-label">Propietario</span>
                  <span className="ficha-value">{fichaAbierta.propietario}</span>
                </div>
                <div className="ficha-item ficha-full">
                  <span className="ficha-label">Teléfono</span>
                  <span className="ficha-value">{fichaAbierta.telefono || '—'}</span>
                </div>
                <div className="ficha-item ficha-full">
                  <span className="ficha-label">Carnet de vacunas No.</span>
                  <span className="ficha-value">{fichaAbierta.carnet_vacunas || '—'}</span>
                </div>
                {fichaAbierta.observaciones && (
                  <div className="ficha-item ficha-full">
                    <span className="ficha-label">Observaciones</span>
                    <span className="ficha-value">{fichaAbierta.observaciones}</span>
                  </div>
                )}
              </div>

              {esAdmin && (
                <div className="ficha-actions">
                  <button className="btn-edit" style={{flex:1}} onClick={() => abrirEditar(fichaAbierta)}>✏️ Editar</button>
                  <button className="btn-delete" onClick={() => { setFichaAbierta(null); setConfirmDelete(fichaAbierta.id) }}>🗑️</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal LOGIN ── */}
      {showLogin && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowLogin(false)}>
          <div className="modal modal-small">
            <div className="modal-header">
              <h2>🔐 Acceso administrador</h2>
              <button className="modal-close" onClick={() => setShowLogin(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group full">
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="admin@ejemplo.com"
                    onKeyDown={e => e.key === 'Enter' && login()}
                  />
                </div>
                <div className="form-group full">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    onKeyDown={e => e.key === 'Enter' && login()}
                  />
                </div>
                {loginError && <p className="login-error">{loginError}</p>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowLogin(false)}>Cancelar</button>
              <button className="btn-primary" onClick={login} disabled={loginLoading}>
                {loginLoading ? 'Entrando...' : 'Ingresar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal FORMULARIO ── */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editando ? 'Editar Mascota' : 'Nueva Mascota'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="foto-upload-section">
                <div className="foto-upload-preview" onClick={() => document.getElementById('foto-input')?.click()}>
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="preview" className="foto-preview-img" />
                  ) : (
                    <div className="foto-upload-placeholder">
                      <span>📷</span>
                      <p>Toca para agregar foto</p>
                    </div>
                  )}
                </div>
                <input id="foto-input" type="file" accept="image/*" onChange={manejarFoto} style={{ display: 'none' }} />
              </div>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Nombre de la mascota *</label>
                  <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Max, Luna..." />
                </div>
                <div className="form-group">
                  <label>Especie</label>
                  <select value={form.especie} onChange={e => setForm({ ...form, especie: e.target.value })}>
                    {ESPECIES.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sexo</label>
                  <select value={form.sexo} onChange={e => setForm({ ...form, sexo: e.target.value })}>
                    {SEXOS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Raza</label>
                  <input value={form.raza} onChange={e => setForm({ ...form, raza: e.target.value })} placeholder="Ej: Golden Retriever" />
                </div>
                <div className="form-group">
                  <label>Edad</label>
                  <input value={form.edad} onChange={e => setForm({ ...form, edad: e.target.value })} placeholder="Ej: 2 años" />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="Ej: Café y blanco" />
                </div>
                <div className="form-group">
                  <label>No. Carnet Vacunas</label>
                  <input value={form.carnet_vacunas} onChange={e => setForm({ ...form, carnet_vacunas: e.target.value })} placeholder="No. del carnet" />
                </div>
                <div className="form-group">
                  <label>Bloque</label>
                  <select value={form.bloque} onChange={e => setForm({ ...form, bloque: e.target.value })}>
                    {BLOQUES.map(b => <option key={b} value={b}>Bloque {b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Apartamento *</label>
                  <input value={form.apartamento} onChange={e => setForm({ ...form, apartamento: e.target.value })} placeholder="Ej: 101" />
                </div>
                <div className="form-group full">
                  <label>Nombre del propietario *</label>
                  <input value={form.propietario} onChange={e => setForm({ ...form, propietario: e.target.value })} placeholder="Nombres y apellidos" />
                </div>
                <div className="form-group full">
                  <label>Teléfono</label>
                  <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="Ej: 300 123 4567" />
                </div>
                <div className="form-group full">
                  <label>Observaciones</label>
                  <textarea value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} placeholder="Alergias, comportamiento especial, etc." rows={3} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardar} disabled={guardando}>
                {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Registrar mascota'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete ── */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal modal-small">
            <div className="modal-header">
              <h2>¿Eliminar mascota?</h2>
            </div>
            <div className="modal-body">
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '8px 0' }}>
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => eliminar(confirmDelete)}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
