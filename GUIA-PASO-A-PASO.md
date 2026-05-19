# 📋 GUÍA PASO A PASO — App Registro de Mascotas

> Sigue estos pasos EN ORDEN. Tómate tu tiempo, no hay prisa.
> Cada paso tiene capturas de pantalla descritas para que sepas exactamente dónde hacer clic.

---

## 🗂️ ARCHIVOS QUE TIENES

```
mascotas-app/
├── app/
│   ├── page.tsx          ← La aplicación completa
│   ├── layout.tsx        ← Configuración base
│   └── globals.css       ← Estilos tipo Apple/SwiftUI
├── package.json          ← Lista de librerías
├── next.config.js        ← Configuración de Next.js
├── tsconfig.json         ← Configuración TypeScript
├── .env.local.example    ← Plantilla de variables secretas
└── supabase-setup.sql    ← Código para crear la base de datos
```

---

## PASO 1 — Instalar herramientas en tu computador

### 1.1 Instalar Node.js
1. Ve a **https://nodejs.org**
2. Descarga la versión **LTS** (la verde que dice "Recommended")
3. Instala con todas las opciones por defecto (solo haz clic en "Next" en todo)
4. Para verificar: abre la terminal/cmd y escribe `node --version` — debe mostrar algo como `v20.x.x`

### 1.2 Instalar Git
1. Ve a **https://git-scm.com/downloads**
2. Descarga e instala con opciones por defecto
3. Para verificar: en terminal escribe `git --version`

---

## PASO 2 — Crear cuenta en Supabase (base de datos GRATIS)

1. Ve a **https://supabase.com**
2. Haz clic en **"Start your project"**
3. Regístrate con tu cuenta de GitHub o con email
4. Haz clic en **"New Project"**
5. Llena los datos:
   - **Name:** mascotas-conjunto (o cualquier nombre)
   - **Database Password:** inventa una contraseña y GUÁRDALA
   - **Region:** elige **South America (São Paulo)** — es el más cercano a Colombia
6. Haz clic en **"Create new project"**
7. Espera 1-2 minutos mientras se crea (verás una barra de progreso)

---

## PASO 3 — Crear la tabla en Supabase

1. En tu proyecto de Supabase, en el menú izquierdo busca **"SQL Editor"** (ícono de terminal)
2. Haz clic en **"New query"**
3. Abre el archivo `supabase-setup.sql` (está en los archivos que descargaste)
4. Copia TODO el contenido y pégalo en el editor de Supabase
5. Haz clic en el botón **"Run"** (o presiona Ctrl+Enter)
6. Debes ver el mensaje: `Success. No rows returned`

✅ ¡La tabla ya está creada!

---

## PASO 4 — Crear el bucket de fotos en Supabase

1. En el menú izquierdo de Supabase, haz clic en **"Storage"** (ícono de carpeta)
2. Haz clic en **"New bucket"**
3. En el nombre escribe exactamente: `fotos-mascotas`
4. **MUY IMPORTANTE:** activa el switch que dice **"Public bucket"**
5. Haz clic en **"Save"**

✅ ¡El almacenamiento de fotos está listo!

---

## PASO 5 — Obtener las "llaves" de Supabase

1. En el menú izquierdo, haz clic en el ícono de engranaje ⚙️ → **"Settings"**
2. Luego haz clic en **"API"**
3. Verás dos cosas importantes — CÓPIALAS y guárdalas en un bloc de notas:
   - **Project URL** — se ve así: `https://abcdefghij.supabase.co`
   - **anon public** (en la sección "Project API keys") — es un texto muy largo que empieza con `eyJ...`

---

## PASO 6 — Preparar los archivos de la app

1. Crea una carpeta nueva en tu computador, llámala `mascotas-app`
2. Copia todos los archivos descargados dentro de esa carpeta
3. Dentro de la carpeta `mascotas-app`, crea un archivo llamado `.env.local` (con el punto al inicio)
4. Abre ese archivo con el Bloc de Notas y escribe esto, reemplazando con TUS datos:

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-URL-DE-SUPABASE.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...TU-CLAVE-ANON...
```

> ⚠️ Reemplaza los valores con los que copiaste en el Paso 5.
> No dejes espacios ni comillas.

---

## PASO 7 — Probar la app en tu computador

1. Abre la terminal/cmd
2. Navega a la carpeta del proyecto:
   ```
   cd ruta/a/mascotas-app
   ```
   (Por ejemplo: `cd C:\Users\TuNombre\Desktop\mascotas-app`)
3. Instala las librerías (solo la primera vez):
   ```
   npm install
   ```
4. Inicia la app:
   ```
   npm run dev
   ```
5. Abre tu navegador y ve a: **http://localhost:3000**

¡Deberías ver la app funcionando! Prueba agregar una mascota.

---

## PASO 8 — Subir a Vercel (para que todos puedan acceder)

### 8.1 Crear cuenta en GitHub
1. Ve a **https://github.com** y crea una cuenta gratuita

### 8.2 Crear cuenta en Vercel
1. Ve a **https://vercel.com**
2. Haz clic en **"Sign Up"** → **"Continue with GitHub"**
3. Autoriza el acceso

### 8.3 Subir el código a GitHub
1. Abre la terminal en la carpeta `mascotas-app`
2. Ejecuta estos comandos uno por uno:
   ```
   git init
   git add .
   git commit -m "Primera versión"
   ```
3. Ve a **https://github.com/new**
4. En "Repository name" escribe: `mascotas-app`
5. Deja en **"Private"** (para que sea privado)
6. Haz clic en **"Create repository"**
7. GitHub te mostrará unos comandos, copia y ejecuta los que dicen:
   ```
   git remote add origin https://github.com/TU-USUARIO/mascotas-app.git
   git push -u origin main
   ```

### 8.4 Conectar con Vercel
1. En Vercel, haz clic en **"Add New Project"**
2. Busca y selecciona tu repositorio `mascotas-app`
3. Haz clic en **"Import"**
4. **¡PASO CRÍTICO!** Antes de hacer deploy, busca la sección **"Environment Variables"**
5. Agrega estas dos variables (exactamente igual que en tu `.env.local`):
   - Nombre: `NEXT_PUBLIC_SUPABASE_URL` → Valor: tu URL de Supabase
   - Nombre: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Valor: tu clave anon
6. Haz clic en **"Deploy"**
7. Espera 1-2 minutos...

✅ ¡Vercel te dará una URL como `https://mascotas-app.vercel.app`!

---

## 🛠️ Si algo falla

**"Error: supabaseUrl is required"**
→ Las variables de entorno no están configuradas. Revisa el Paso 8.4

**No se guardan los datos**
→ Verifica que ejecutaste el SQL del Paso 3 correctamente

**Las fotos no se muestran**
→ Verifica que el bucket `fotos-mascotas` esté marcado como público (Paso 4)

**"npm: command not found"**
→ Node.js no se instaló correctamente. Repite el Paso 1.1

---

## 🎉 ¡Listo!

Tu app tiene:
- ✅ Registro de mascotas con foto
- ✅ Filtros por Bloque A, B, C, D
- ✅ Agregar, editar y eliminar mascotas
- ✅ Buscador por nombre, dueño o raza
- ✅ Estadísticas por bloque
- ✅ Diseño tipo Apple/SwiftUI
- ✅ Funciona en celular y computador
