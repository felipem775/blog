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
  KeyIcon
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

const App: React.FC = () => {
  // State
  const defaultOwner = getEnv('GITHUB_OWNER', 'facebook');
  const defaultRepo = getEnv('GITHUB_REPO', 'react');
  const defaultToken = getEnv('GITHUB_TOKEN', '');

  const [repoConfig, setRepoConfig] = useState<RepoConfig>({ 
    owner: defaultOwner, 
    name: defaultRepo, 
    token: defaultToken 
  });
  
  const [tempOwner, setTempOwner] = useState(defaultOwner);
  const [tempRepo, setTempRepo] = useState(defaultRepo);
  const [tempToken, setTempToken] = useState(defaultToken);
  
  const [view, setView] = useState<ViewState>(ViewState.LIST);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssue | null>(null);
  const [comments, setComments] = useState<GitHubComment[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // Load Issues
  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIssues(repoConfig.owner, repoConfig.name, selectedLabel || undefined, repoConfig.token);
      setIssues(data);
    } catch (err: any) {
      console.error("Failed to load issues:", err);
      setError(err.message || 'Error desconocido');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, [repoConfig, selectedLabel]);

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
      const commentsData = await fetchComments(repoConfig.owner, repoConfig.name, issue.number, repoConfig.token);
      setComments(commentsData);
    } catch (err) {
      console.error(err);
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
    if (tempOwner && tempRepo) {
      setRepoConfig({ owner: tempOwner, name: tempRepo, token: tempToken });
      setSelectedLabel(null); // Reset filter on new repo
      setView(ViewState.LIST);
    }
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
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-auto sm:h-16 py-3 sm:py-0 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-2 cursor-pointer self-start sm:self-auto" onClick={() => handleBack()}>
          <BookOpenIcon className="h-8 w-8 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-900">GitBlog</h1>
        </div>

        <form onSubmit={handleRepoSearch} className="flex flex-col sm:flex-row items-center gap-2 bg-gray-100 rounded-lg p-1.5 border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 w-full sm:w-auto">
          <div className="flex items-center w-full sm:w-auto gap-1">
             <span className="text-gray-400 text-sm pl-1">github.com/</span>
             <input 
               className="bg-transparent text-sm text-gray-800 outline-none w-full sm:w-24 placeholder-gray-400"
               placeholder="owner"
               value={tempOwner}
               onChange={(e) => setTempOwner((e.target as HTMLInputElement).value)}
             />
             <span className="text-gray-400">/</span>
             <input 
               className="bg-transparent text-sm text-gray-800 outline-none w-full sm:w-24 placeholder-gray-400"
               placeholder="repo"
               value={tempRepo}
               onChange={(e) => setTempRepo((e.target as HTMLInputElement).value)}
             />
          </div>
          
          <div className="flex items-center w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-gray-300 pt-1 sm:pt-0 sm:pl-2 mt-1 sm:mt-0">
            <KeyIcon className="h-4 w-4 text-gray-400 mr-1" />
            <input 
              className="bg-transparent text-sm text-gray-800 outline-none w-full sm:w-24 placeholder-gray-400"
              placeholder="Token (opcional)"
              type="password"
              value={tempToken}
              onChange={(e) => setTempToken((e.target as HTMLInputElement).value)}
            />
            <button type="submit" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-2 ml-1">Ir</button>
          </div>
        </form>
      </div>
    </header>
  );

  const renderEmptyState = () => (
    <div className="text-center py-20">
      <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900">No hay posts disponibles</h3>
      <p className="text-gray-500">
        {error 
          ? "No se pudieron cargar los posts debido a un error de configuración o permisos." 
          : selectedLabel 
            ? `No se encontraron posts con la etiqueta "${selectedLabel}".`
            : "Intenta buscar otro repositorio."}
      </p>
      {selectedLabel && (
        <button 
          onClick={clearLabelFilter}
          className="mt-4 text-indigo-600 font-medium hover:underline"
        >
          Ver todos los posts
        </button>
      )}
    </div>
  );

  const renderIssueList = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
         <div>
            <h2 className="text-2xl font-bold text-indigo-900 capitalize">Blog: {repoConfig.name}</h2>
            <p className="text-indigo-700 mt-1 mb-3">Explorando issues de <span className="font-semibold">{repoConfig.owner}</span> como si fueran artículos.</p>
            <a 
              href={`https://github.com/${repoConfig.owner}/${repoConfig.name}/issues.atom`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-200 rounded-full text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors shadow-sm"
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
         <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
           <div className="flex items-center gap-2">
             <TagIcon className="h-5 w-5 text-gray-500" />
             <span className="text-gray-700 font-medium">Filtrando por: <span className="text-indigo-600 font-bold">{selectedLabel}</span></span>
           </div>
           <button 
             onClick={clearLabelFilter}
             className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
           >
             <XMarkIcon className="h-4 w-4" />
             Limpiar filtro
           </button>
         </div>
       )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
             <div key={i} className="h-64 bg-white rounded-xl shadow-sm animate-pulse border border-gray-100"></div>
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
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col group"
            >
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2 text-xs text-gray-500">
                      <img src={issue.user.avatar_url} alt={issue.user.login} className="w-5 h-5 rounded-full" />
                      <span className="font-medium text-gray-700">{issue.user.login}</span>
                      <span>•</span>
                      <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                   </div>
                   {issue.labels.length > 0 && (
                     <div className="flex flex-wrap gap-1 justify-end">
                       {issue.labels.slice(0, 2).map(label => (
                         <button
                           key={label.id}
                           onClick={(e) => handleLabelClick(e, label.name)}
                           className={`text-[10px] px-2 py-0.5 rounded-full font-medium hover:opacity-80 transition-opacity`} 
                           style={{backgroundColor: `#${label.color}30`, color: `#${label.color}`}}
                         >
                            {label.name}
                         </button>
                       ))}
                       {issue.labels.length > 2 && <span className="text-xs text-gray-400">+{issue.labels.length - 2}</span>}
                     </div>
                   )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {issue.title}
                </h3>
                <MarkdownText content={issue.body} truncate class="text-gray-600 text-sm line-clamp-4" />
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center text-gray-500 text-sm">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1.5" />
                  {issue.comments} comentarios
                </div>
                <span className="text-indigo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Leer más &rarr;</span>
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
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <button 
          onClick={handleBack}
          className="mb-6 flex items-center text-gray-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Volver al listado
        </button>

        {/* Main Post */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-8 sm:p-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
              {selectedIssue.title}
            </h1>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
               <div className="flex items-center gap-3">
                  <img src={selectedIssue.user.avatar_url} alt={selectedIssue.user.login} className="w-10 h-10 rounded-full border border-gray-200" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{selectedIssue.user.login}</p>
                    <p className="text-xs text-gray-500">Publicado el {new Date(selectedIssue.created_at).toLocaleDateString()}</p>
                  </div>
               </div>
               <a 
                 href={selectedIssue.html_url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="hidden sm:inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
               >
                 Ver en GitHub
               </a>
            </div>
            
            <MarkdownText content={selectedIssue.body} class="text-lg leading-relaxed text-gray-800" />

            <div className="mt-8 flex flex-wrap gap-2">
              {selectedIssue.labels.map(label => (
                <button 
                  key={label.id}
                  onClick={(e) => handleLabelClick(e, label.name)}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ backgroundColor: `#${label.color}25`, color: `#${label.color}` }}
                >
                  <TagIcon className="w-3 h-3 mr-1" />
                  {label.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              Comentarios <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{selectedIssue.comments}</span>
            </h3>
            
            <a 
              href={selectedIssue.html_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PencilSquareIcon className="h-4 w-4 mr-2" />
              Escribir comentario
            </a>
          </div>

          {loadingComments ? (
             <div className="flex justify-center py-10">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
             </div>
          ) : comments.length === 0 ? (
             <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
               Se el primero en comentar (en GitHub).
             </div>
          ) : (
            <div className="relative pl-4 sm:pl-0">
               {/* Vertical Timeline Line */}
              <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-gray-200" aria-hidden="true"></div>

              <div className="space-y-8">
              {comments.map((comment) => (
                <div key={comment.id} className="relative flex gap-4 sm:gap-6 group">
                  <div className="flex-shrink-0 relative z-10">
                    {comment.user ? (
                        <img 
                          src={comment.user.avatar_url} 
                          alt={comment.user.login} 
                          className="h-8 w-8 sm:h-12 sm:w-12 rounded-full border-2 border-white ring-1 ring-gray-200 bg-white" 
                        />
                    ) : (
                        <UserCircleIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 bg-white rounded-full border-2 border-white ring-1 ring-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{comment.user ? comment.user.login : 'Usuario desconocido'}</span>
                             {comment.user && comment.user.login === selectedIssue.user.login && (
                                 <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                   Autor
                                 </span>
                             )}
                        </div>
                        <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                     </div>
                    <div className="bg-white rounded-2xl rounded-tl-none p-5 shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors relative">
                      <MarkdownText content={comment.body} class="text-gray-700 text-sm" />
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {renderHeader()}
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {view === ViewState.LIST ? renderIssueList() : renderDetail()}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
         <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-gray-500">
            <p>&copy; 2024 GitBlog Viewer</p>
            <p className="flex items-center gap-1">
              Powered by <span className="font-semibold text-gray-700">React</span>
            </p>
         </div>
      </footer>
    </div>
  );
};

export default App;