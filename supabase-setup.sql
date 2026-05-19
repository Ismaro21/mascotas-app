-- ============================================================
-- PASO 1: Ejecuta este SQL en Supabase
-- Ve a: supabase.com → tu proyecto → SQL Editor → New Query
-- Pega todo esto y haz clic en "Run"
-- ============================================================

-- Crear la tabla de mascotas
CREATE TABLE IF NOT EXISTS mascotas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  especie TEXT DEFAULT 'Perro',
  raza TEXT DEFAULT '',
  edad TEXT DEFAULT '',
  sexo TEXT DEFAULT 'Macho',
  color TEXT DEFAULT '',
  bloque TEXT DEFAULT 'A',
  apartamento TEXT NOT NULL,
  propietario TEXT NOT NULL,
  telefono TEXT DEFAULT '',
  carnet_vacunas TEXT DEFAULT '',
  observaciones TEXT DEFAULT '',
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permitir acceso público (lectura y escritura sin login)
ALTER TABLE mascotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso público total" ON mascotas
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- PASO 2: Crear el bucket de fotos
-- Ve a: Storage → New bucket
-- Nombre: fotos-mascotas
-- Marca "Public bucket" como ACTIVADO
-- ============================================================

-- Luego ejecuta esto para permitir subir fotos:
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-mascotas', 'fotos-mascotas', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Subir fotos públicas" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'fotos-mascotas');

CREATE POLICY "Ver fotos públicas" ON storage.objects
  FOR SELECT USING (bucket_id = 'fotos-mascotas');

CREATE POLICY "Eliminar fotos públicas" ON storage.objects
  FOR DELETE USING (bucket_id = 'fotos-mascotas');
