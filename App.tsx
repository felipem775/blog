import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, GitHubIssue, GitHubComment, RepoConfig } from './types';
import { fetchIssues, fetchComments } from './services/githubService';
import { MarkdownText } from './components/MarkdownText';
import { 
  ChatBubbleLeftRightIcon, 
  ArrowLeftIcon, 
  BookOpenIcon, 
  UserCircleIcon,
  TagIcon,
  PencilSquareIcon,
  RssIcon,
  XMarkIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// Helper to safely access env vars
const getEnv = (key: string, fallback: string) => {
  try {
    // @ts-ignore
    return process.env[key] || fallback;
  } catch {
    return fallback;
  }
};

// Fallback demo issues to guarantee the blog is 100% testable and readable
// while the user's GitHub repository is in the process of being published
const DEMO_ISSUES: GitHubIssue[] = [
  {
    number: 1,
    title: "Bienvenido a GitBlog: Cómo utilizar GitHub Issues como CMS",
    user: {
      login: "felipem775",
      avatar_url: "https://avatars.githubusercontent.com/u/1591085?v=4",
      html_url: "https://github.com/felipem775"
    },
    state: "open",
    body: `### ¡Hola mundo desde GitBlog! 🎉\n\nEste es un artículo de muestra para que puedas explorar todas las capacidades de la plataforma mientras publicas o configuras tu propio repositorio público en GitHub.\n\n#### ¿Por qué usar GitHub Issues como Blog?\n- **Control de versiones**: Todo el contenido se redacta en Markdown estándar con control de cambios.\n- **Comentarios nativos**: Tus lectores pueden debatir y aportar comentarios directamente con su cuenta de GitHub.\n- **Etiquetas y filtros**: Organiza tus publicaciones con tags de colores.\n- **Sin servidores ni bases de datos**: GitHub actúa como tu backend y CMS gratuito.\n\n\`\`\`javascript\n// Publicar un nuevo artículo es tan simple como crear un Issue en GitHub:\nconst post = {\n  title: 'Mi nueva publicación',\n  body: 'Contenido redactado en Markdown...',\n  labels: ['tutorial', 'programación']\n};\n\`\`\`\n\nPuedes hacer clic en las etiquetas para filtrar artículos o probar a cargar otro repositorio público con el buscador superior.`,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    comments: 2,
    labels: [
      { id: 1, name: "bienvenida", color: "4f46e5" },
      { id: 2, name: "tutorial", color: "0284c7" }
    ],
    html_url: "https://github.com/felipem775"
  },
  {
    number: 2,
    title: "Guía rápida: Publicar tu repositorio en GitHub para GitBlog",
    user: {
      login: "felipem775",
      avatar_url: "https://avatars.githubusercontent.com/u/1591085?v=4",
      html_url: "https://github.com/felipem775"
    },
    state: "open",
    body: `Para que tus propios artículos aparezcan en esta web en lugar de estos posts de demostración, sigue estos sencillos pasos:\n\n1. **Crea el repositorio público en GitHub**:\n   Crea un repositorio llamado \`blog\` (o el nombre que elijas) en tu cuenta de GitHub y asegúrate de marcarlo como **Público**.\n\n2. **Habilita los Issues**:\n   En tu repositorio de GitHub, ve a **Settings** > **General** > **Features** y verifica que la casilla **Issues** esté activada.\n\n3. **Crea tu primer post**:\n   Crea un nuevo Issue con el título de tu artículo, el texto en Markdown y las etiquetas (*labels*) que desees.\n\n¡En cuanto pulses el botón de **Reintentar** o recargues la página, tus artículos reales se mostrarán aquí!`,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    comments: 1,
    labels: [
      { id: 3, name: "guía", color: "16a34a" },
      { id: 4, name: "configuración", color: "ea580c" }
    ],
    html_url: "https://github.com/felipem775"
  }
];

const DEMO_COMMENTS: Record<number, GitHubComment[]> = {
  1: [
    {
      id: 101,
      user: {
        login: "lector_dev",
        avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
        html_url: "https://github.com"
      },
      body: "¡Excelente idea usar GitHub Issues como sistema de comentarios y artículos! El formato Markdown se lee genial.",
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      html_url: "https://github.com"
    },
    {
      id: 102,
      user: {
        login: "felipem775",
        avatar_url: "https://avatars.githubusercontent.com/u/1591085?v=4",
        html_url: "https://github.com/felipem775"
      },
      body: "¡Muchas gracias! Además es 100% público y sin necesidad de tokens privados.",
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      html_url: "https://github.com/felipem775"
    }
  ],
  2: [
    {
      id: 201,
      user: {
        login: "comunidad_github",
        avatar_url: "https://avatars.githubusercontent.com/u/9919?v=4",
        html_url: "https://github.com"
      },
      body: "Muy claro el tutorial. Gracias por documentar el proceso.",
      created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
      html_url: "https://github.com"
    }
  ]
};

const App: React.FC = () => {
  // State
  const defaultOwner = getEnv('GITHUB_OWNER', 'felipem775');
  const defaultRepo = getEnv('GITHUB_REPO', 'blog');
  
  // Check if BLOG_MODE is explicitly set to 'true', default to true now
  const blogMode = getEnv('BLOG_MODE', 'true') === 'true';
  const blogDescTemplate = getEnv('BLOG_DESC', 'El blog de {{owner}}');

  const [repoConfig, setRepoConfig] = useState<RepoConfig>({ 
    owner: defaultOwner, 
    name: defaultRepo
  });
  
  const [tempOwner, setTempOwner] = useState(defaultOwner);
  const [tempRepo, setTempRepo] = useState(defaultRepo);
  const [showSearchForm, setShowSearchForm] = useState(false);
  
  const [view, setView] = useState<ViewState>(ViewState.LIST);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssue | null>(null);
  const [comments, setComments] = useState<GitHubComment[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isUsingDemo, setIsUsingDemo] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // Load Issues
  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIssues(repoConfig.owner, repoConfig.name, selectedLabel || undefined);
      setIsUsingDemo(false);
      
      // If blog mode is active, filter only issues created by the repo owner
      if (blogMode) {
        const ownerLower = repoConfig.owner.toLowerCase();
        const filteredData = data.filter(issue => issue.user.login.toLowerCase() === ownerLower);
        setIssues(filteredData.length > 0 ? filteredData : data);
      } else {
        setIssues(data);
      }
    } catch (err: any) {
      console.warn("Aviso al consultar repositorio GitHub:", err?.message || err);
      // If the repository is not found or not yet public, fallback cleanly to demo issues so the app remains functional
      setIsUsingDemo(true);
      const demoFiltered = selectedLabel 
        ? DEMO_ISSUES.filter(i => i.labels.some(l => l.name === selectedLabel))
        : DEMO_ISSUES;
      setIssues(demoFiltered);
      setError(`El repositorio "${repoConfig.owner}/${repoConfig.name}" aún no está disponible públicamente en GitHub.`);
    } finally {
      setLoading(false);
    }
  }, [repoConfig, selectedLabel, blogMode]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  // Handle viewing an issue
  const handleSelectIssue = async (issue: GitHubIssue) => {
    setSelectedIssue(issue);
    setView(ViewState.DETAIL);
    setComments([]);
    setLoadingComments(true);

    try {
      if (isUsingDemo && DEMO_COMMENTS[issue.number]) {
        setComments(DEMO_COMMENTS[issue.number]);
      } else {
        const commentsData = await fetchComments(repoConfig.owner, repoConfig.name, issue.number);
        setComments(commentsData);
      }
    } catch (err: any) {
      console.warn("Aviso al cargar comentarios:", err?.message || err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleBack = () => {
    setView(ViewState.LIST);
    setSelectedIssue(null);
    setComments([]);
  };

  const handleRepoSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempOwner.trim() && tempRepo.trim()) {
      setRepoConfig({ owner: tempOwner.trim(), name: tempRepo.trim() });
      setSelectedLabel(null); // Reset filter on new repo
      setView(ViewState.LIST);
      setShowSearchForm(false);
    }
  };

  const handleLoadDemoRepo = (owner: string, repo: string) => {
    setTempOwner(owner);
    setTempRepo(repo);
    setRepoConfig({ owner, name: repo });
    setSelectedLabel(null);
    setView(ViewState.LIST);
  };

  const handleLabelClick = (e: React.MouseEvent, labelName: string) => {
    e.stopPropagation();
    setSelectedLabel(labelName);
    setView(ViewState.LIST);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearLabelFilter = () => {
    setSelectedLabel(null);
  };

  // --- Renders ---

  const renderHeader = () => (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleBack()}>
          <BookOpenIcon className="h-7 w-7 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">GitBlog</span>
        </div>

        <div className="flex items-center gap-2">
          {(!blogMode || showSearchForm) ? (
            <form onSubmit={handleRepoSearch} className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1 border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
              <span className="text-gray-400 text-xs pl-2 hidden sm:inline">github.com/</span>
              <input 
                className="bg-transparent text-xs text-gray-800 outline-none w-20 sm:w-24 placeholder-gray-400"
                placeholder="propietario"
                value={tempOwner}
                onChange={(e) => setTempOwner((e.target as HTMLInputElement).value)}
              />
              <span className="text-gray-400 text-xs">/</span>
              <input 
                className="bg-transparent text-xs text-gray-800 outline-none w-20 sm:w-24 placeholder-gray-400"
                placeholder="repositorio"
                value={tempRepo}
                onChange={(e) => setTempRepo((e.target as HTMLInputElement).value)}
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-2.5 py-1 rounded transition-colors whitespace-nowrap">
                Ir
              </button>
              {showSearchForm && (
                <button 
                  type="button" 
                  onClick={() => setShowSearchForm(false)} 
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </form>
          ) : (
            <button 
              onClick={() => setShowSearchForm(true)}
              className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"
              title="Cambiar repositorio"
            >
              <MagnifyingGlassIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Repositorio:</span>
              <span className="font-semibold text-gray-800">{repoConfig.owner}/{repoConfig.name}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );

  const renderDemoNotice = () => {
    if (!isUsingDemo) return null;

    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm text-amber-900 font-medium">
                El repositorio <span className="font-bold">{repoConfig.owner}/{repoConfig.name}</span> aún no es público en GitHub.
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Mostrando artículos de demostración para que puedas explorar la interfaz. En cuanto tu repositorio sea público, pulsa reintentar.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button 
              onClick={() => loadIssues()} 
              className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold rounded-md transition-colors"
            >
              <ArrowPathIcon className="h-3.5 w-3.5" />
              Reintentar
            </button>
            <button 
              onClick={() => handleLoadDemoRepo('github', 'docs')} 
              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md transition-colors"
            >
              Probar github/docs
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
      <BookOpenIcon className="h-14 w-14 text-gray-300 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-gray-900">No hay publicaciones disponibles</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
        {selectedLabel 
          ? `No se encontraron posts con la etiqueta "${selectedLabel}".`
          : `El repositorio "${repoConfig.owner}/${repoConfig.name}" no tiene issues abiertos actualmente.`}
      </p>
      <div className="mt-5 flex items-center justify-center gap-3">
        {selectedLabel ? (
          <button 
            onClick={clearLabelFilter}
            className="text-xs bg-indigo-50 text-indigo-700 font-medium px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
          >
            Ver todos los posts
          </button>
        ) : (
          <button 
            onClick={() => handleLoadDemoRepo('github', 'docs')}
            className="text-xs bg-indigo-600 text-white font-medium px-3.5 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Cargar repositorio de ejemplo (github/docs)
          </button>
        )}
      </div>
    </div>
  );

  const renderIssueList = () => (
    <div className="space-y-6">
       {renderDemoNotice()}

       <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
         <div>
            {blogMode ? (
              <h2 className="text-2xl font-bold text-indigo-900 capitalize mb-2">
                {blogDescTemplate.replace('{{owner}}', repoConfig.owner)}
              </h2>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-indigo-900 capitalize">Blog: {repoConfig.name}</h2>
                <p className="text-indigo-700 mt-1 mb-2">Explorando issues de <span className="font-semibold">{repoConfig.owner}</span> como si fueran artículos.</p>
              </>
            )}
            <a 
              href={`https://github.com/${repoConfig.owner}/${repoConfig.name}/issues.atom`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-200 rounded-md text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors shadow-sm"
            >
               <RssIcon className="h-3.5 w-3.5" />
               Suscribirse (RSS)
            </a>
         </div>
         <div className="mt-4 sm:mt-0 text-indigo-400">
           <BookOpenIcon className="h-12 w-12 opacity-50" />
         </div>
       </div>

       {selectedLabel && (
         <div className="flex items-center justify-between bg-white p-3.5 rounded-lg shadow-sm border border-gray-200">
           <div className="flex items-center gap-2">
             <TagIcon className="h-4 w-4 text-gray-500" />
             <span className="text-xs text-gray-700">Filtrando por: <strong className="text-indigo-600 font-semibold">{selectedLabel}</strong></span>
           </div>
           <button 
             onClick={clearLabelFilter}
             className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
           >
             <XMarkIcon className="h-3.5 w-3.5" />
             Limpiar filtro
           </button>
         </div>
       )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
             <div key={i} className="h-56 bg-white rounded-xl shadow-sm animate-pulse border border-gray-200 p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                </div>
                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
             </div>
          ))}
        </div>
      ) : issues.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {issues.map(issue => (
            <article 
              key={issue.number} 
              onClick={() => handleSelectIssue(issue)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col group"
            >
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-3 gap-2">
                   <div className="flex items-center gap-2 text-xs text-gray-500">
                      <img src={issue.user.avatar_url} alt={issue.user.login} className="w-5 h-5 rounded-full" />
                      <span className="font-medium text-gray-700">{issue.user.login}</span>
                      <span>·</span>
                      <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                   </div>
                   {issue.labels.length > 0 && (
                     <div className="flex flex-wrap gap-1 justify-end">
                       {issue.labels.slice(0, 2).map(label => (
                         <button
                           key={label.id}
                           onClick={(e) => handleLabelClick(e, label.name)}
                           className="text-[10px] px-2 py-0.5 rounded font-medium hover:opacity-80 transition-opacity" 
                           style={{backgroundColor: `#${label.color}25`, color: `#${label.color}`}}
                         >
                            {label.name}
                         </button>
                       ))}
                       {issue.labels.length > 2 && <span className="text-[10px] text-gray-400">+{issue.labels.length - 2}</span>}
                     </div>
                   )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {issue.title}
                </h3>
                <MarkdownText content={issue.body} truncate class="text-gray-600 text-sm line-clamp-3" />
              </div>
              <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center text-gray-500">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1 text-gray-400" />
                  {issue.comments} comentarios
                </div>
                <span className="text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform">Leer artículo &rarr;</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );

  const renderDetail = () => {
    if (!selectedIssue) return null;

    return (
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={handleBack}
          className="mb-6 inline-flex items-center text-xs font-semibold text-gray-600 hover:text-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 mr-1.5" />
          Volver a artículos
        </button>

        {/* Main Post */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 sm:p-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              {selectedIssue.title}
            </h1>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6 text-xs text-gray-500">
               <div className="flex items-center gap-3">
                  <img src={selectedIssue.user.avatar_url} alt={selectedIssue.user.login} className="w-9 h-9 rounded-full border border-gray-200" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{selectedIssue.user.login}</p>
                    <p className="text-gray-400">Publicado el {new Date(selectedIssue.created_at).toLocaleDateString()}</p>
                  </div>
               </div>
               <a 
                 href={selectedIssue.html_url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md transition-colors"
               >
                 Ver en GitHub
               </a>
            </div>
            
            <MarkdownText content={selectedIssue.body} class="text-base leading-relaxed text-gray-800" />

            {selectedIssue.labels.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
                {selectedIssue.labels.map(label => (
                  <button 
                    key={label.id}
                    onClick={(e) => handleLabelClick(e, label.name)}
                    className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `#${label.color}25`, color: `#${label.color}` }}
                  >
                    <TagIcon className="w-3 h-3 mr-1" />
                    {label.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Comentarios
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {comments.length}
              </span>
            </h3>
            
            <a 
              href={selectedIssue.html_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <PencilSquareIcon className="h-3.5 w-3.5 mr-1.5" />
              Escribir en GitHub
            </a>
          </div>

          {loadingComments ? (
             <div className="flex justify-center py-10">
               <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600"></div>
             </div>
          ) : comments.length === 0 ? (
             <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-sm text-gray-500">
               Aún no hay comentarios. Sé el primero en comentar en GitHub.
             </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-2.5">
                       {comment.user ? (
                           <img 
                             src={comment.user.avatar_url} 
                             alt={comment.user.login} 
                             className="h-7 w-7 rounded-full border border-gray-200" 
                           />
                       ) : (
                           <UserCircleIcon className="h-7 w-7 text-gray-300" />
                       )}
                       <span className="font-semibold text-gray-900 text-xs">{comment.user ? comment.user.login : 'Anónimo'}</span>
                       {comment.user && comment.user.login === selectedIssue.user.login && (
                           <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                             Autor
                           </span>
                       )}
                     </div>
                     <span className="text-[11px] text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <MarkdownText content={comment.body} class="text-gray-700 text-sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {renderHeader()}
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {view === ViewState.LIST ? renderIssueList() : renderDetail()}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto py-5">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>GitBlog Viewer · Transforma issues públicos en artículos</p>
            <p className="flex items-center gap-1">
              Repositorio actual: <span className="font-semibold text-gray-700">{repoConfig.owner}/{repoConfig.name}</span>
            </p>
         </div>
      </footer>
    </div>
  );
};

export default App;