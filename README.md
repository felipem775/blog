<div align="center">

# 📖 GitBlog Viewer

**Transforma cualquier repositorio público de GitHub en un blog interactivo, moderno y libre de servidores.**

Los *Issues* se convierten en artículos y los comentarios en la sección de debate de cada post.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Características](#-características) • [Cómo Funciona](#-cómo-funciona) • [Inicio Rápido](#-inicio-rápido) • [Variables de Entorno](#-configuración) • [Despliegue](#-despliegue-en-github-pages)

</div>

---

## ✨ Características

- 📝 **Issues como Artículos**: Redacta tus posts usando la interfaz habitual de GitHub Issues con soporte completo para Markdown, bloques de código, tablas y enlaces.
- 💬 **Hilos de Comentarios Nativos**: Los comentarios de cada issue se muestran como un hilo de debate en tiempo real, permitiendo a cualquier usuario de GitHub participar.
- 🏷️ **Filtro por Etiquetas**: Categoriza tus publicaciones utilizando las etiquetas (*labels*) de GitHub con colores dinámicos y navegación instantánea.
- ⚡ **100% Público y Sin Tokens**: Funciona directamente contra la API pública de GitHub. No requiere exponer credenciales privadas ni almacenar tokens en el navegador.
- 🚀 **Caché Inteligente Integrada**: Reduce el consumo de la cuota pública (60 req/hora por IP) almacenando en memoria los artículos y comentarios ya consultados.
- 📡 **Sindicación RSS / Atom**: Enlace directo a la fuente de sindicación nativa de GitHub (`/issues.atom`) para que los lectores sigan tus actualizaciones en lectores RSS.
- 🌐 **Listo para GitHub Pages**: Incluye workflow preconfigurado de GitHub Actions para desplegar automáticamente al hacer push.

---

## 🛠️ Cómo Funciona

```
  ┌─────────────────────────────────────────────────────────────┐
  │                 Repositorio de GitHub                       │
  │   - Issue #1: "Mi primer post" (Cuerpo en Markdown)         │
  │   - Comentarios del Issue (Debate de lectores)              │
  │   - Labels: tutorial, javascript, diseño                    │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
                     GitHub REST API v3 (Pública)
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                       GitBlog Viewer                        │
  │   - Renderizado con React 18 & Tailwind CSS                 │
  │   - Caché en cliente para evitar rate limits                │
  │   - Vistas: Listado de artículos y Detalle de publicación   │
  └─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Inicio Rápido

### Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- Un repositorio público en GitHub donde se crearán los issues

### Instalación

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/gitblog.git
   cd gitblog
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Crea el archivo de configuración:**
   Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

4. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el blog en marcha.

---

## ⚙️ Configuración

Puedes personalizar tu blog editando el archivo `.env`:

| Variable | Tipo | Por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `GITHUB_OWNER` | `string` | `felipem775` | Usuario u organización dueña del repositorio en GitHub. |
| `GITHUB_REPO` | `string` | `blog` | Nombre del repositorio donde están los issues. |
| `BLOG_MODE` | `boolean` | `true` | Si es `true`, solo muestra los issues creados por el dueño del repositorio. Si es `false`, actúa como un explorador interactivo para cualquier repositorio. |
| `BLOG_DESC` | `string` | `El blog de {{owner}}` | Título / encabezado del blog. El tag `{{owner}}` se reemplaza automáticamente. |

### Ejemplo de `.env`:
```env
GITHUB_OWNER=mi-usuario
GITHUB_REPO=articulos
BLOG_MODE=true
BLOG_DESC=Bitácora de Desarrollo de {{owner}}
```

---

## ✍️ Publicando tu Primer Artículo

1. Dirígete a tu repositorio en GitHub y ve a la pestaña **Issues**.
2. Haz clic en **New Issue**:
   - **Título**: Será el título principal del post.
   - **Cuerpo**: Redacta tu artículo en Markdown. Puedes incluir código, imágenes, listas y encabezados.
   - **Labels**: Añade etiquetas como `guía`, `react` o `novedades` para que los lectores puedan filtrar por tema.
3. Haz clic en **Submit new issue**. ¡Tu post aparecerá inmediatamente en el blog!
4. Cualquier persona que comente en el issue verá su comentario reflejado en la sección de discusión del post.

---

## 🚢 Despliegue en GitHub Pages

Este proyecto ya incluye un workflow automatizado de CI/CD en `.github/workflows/deploy.yml`.

1. Sube tu código a un repositorio en GitHub.
2. En GitHub, ve a **Settings** > **Pages**.
3. En **Build and deployment** > **Source**, selecciona **GitHub Actions**.
4. Cada vez que hagas `git push` a la rama `main` o `master`, tu blog se compilará y se publicará automáticamente en:
   ```
   https://<tu-usuario>.github.io/<tu-repo>/
   ```

---

## 📂 Estructura del Proyecto

```text
├── .github/workflows/
│   └── deploy.yml          # Automatización de despliegue a GitHub Pages
├── components/
│   └── MarkdownText.tsx    # Componente para parsear y dar formato a Markdown
├── services/
│   ├── githubService.ts    # Conexión con la API de GitHub y caché de peticiones
│   └── geminiService.ts    # Servicios auxiliares
├── App.tsx                 # Vistas principales (Listado, Detalle, Filtros)
├── types.ts                # Modelos de datos TypeScript (Issues, Comments, Labels)
├── index.html              # Entrada HTML con fuentes y estilos
├── vite.config.ts          # Configuración de empaquetado de Vite
├── .env.example            # Plantilla documentada de variables de entorno
└── package.json            # Scripts y dependencias del proyecto
```

---

## 📜 Licencia

Distribuido bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
