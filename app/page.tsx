'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

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
  const [mascotas, setMascotas] = useState<Mascota[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
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

  function abrirNueva() {
    setEditando(null)
    setForm({ nombre: '', especie: 'Perro', raza: '', edad: '', sexo: 'Macho', color: '', bloque: 'A', apartamento: '', propietario: '', telefono: '', carnet_vacunas: '', observaciones: '' })
    setFotoFile(null)
    setFotoPreview(null)
    setShowModal(true)
  }

  function abrirEditar(m: Mascota) {
    setEditando(m)
    setForm({ nombre: m.nombre, especie: m.especie, raza: m.raza, edad: m.edad, sexo: m.sexo, color: m.color, bloque: m.bloque, apartamento: m.apartamento, propietario: m.propietario, telefono: m.telefono, carnet_vacunas: m.carnet_vacunas, observaciones: m.observaciones })
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
    fetchMascotas()
  }

  const mascotasFiltradas = mascotas.filter(m => {
    const bloqueOk = filtroBloque === 'Todos' || m.bloque === filtroBloque
    const busquedaOk = busqueda === '' ||
      m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.propietario.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.raza.toLowerCase().includes(busqueda.toLowerCase())
    return bloqueOk && busquedaOk
  })

  const iconoEspecie = (e: string) => e === 'Perro' ? '🐶' : e === 'Gato' ? '🐱' : '🐾'

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
          <button className="btn-primary" onClick={abrirNueva}>
            <span>+</span> Nueva Mascota
          </button>
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

      {/* Stats */}
      <div className="stats-row">
        {BLOQUES.map(b => {
          const count = mascotas.filter(m => m.bloque === b).length
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
            <button className="btn-primary" onClick={abrirNueva}>Registrar primera mascota</button>
          </div>
        ) : (
          mascotasFiltradas.map(m => (
            <div key={m.id} className="mascota-card">
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
                  <span className="info-tag">🏢 Bloque {m.bloque} · Apto {m.apartamento}</span>
                  <span className="info-tag">👤 {m.propietario}</span>
                  {m.edad && <span className="info-tag">🎂 {m.edad}</span>}
                  {m.sexo && <span className="info-tag">{m.sexo === 'Macho' ? '♂' : '♀'} {m.sexo}</span>}
                </div>
              </div>
              <div className="card-actions">
                <button className="btn-edit" onClick={() => abrirEditar(m)}>✏️ Editar</button>
                <button className="btn-delete" onClick={() => setConfirmDelete(m.id)}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Modal Formulario */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editando ? 'Editar Mascota' : 'Nueva Mascota'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">

              {/* Foto */}
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
                    {BLOQUES.map(b => <option key={b}>Bloque {b}</option>)}
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

      {/* Confirm Delete */}
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
