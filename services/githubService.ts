import { GitHubIssue, GitHubComment } from '../types';

const BASE_URL = 'https://api.github.com/repos';

// In-memory cache to preserve the public rate limit (60 req/hour)
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

const getCached = <T>(key: string): T | null => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return item.data as T;
};

const setCached = (key: string, data: any) => {
  cache.set(key, { timestamp: Date.now(), data });
};

export const fetchIssues = async (owner: string, repo: string, label?: string): Promise<GitHubIssue[]> => {
  const cacheKey = `issues:${owner}/${repo}:${label || 'all'}`;
  const cached = getCached<GitHubIssue[]>(cacheKey);
  if (cached) return cached;

  try {
    let url = `${BASE_URL}/${owner}/${repo}/issues?state=open&sort=created&direction=desc&per_page=50`;
    if (label) {
      url += `&labels=${encodeURIComponent(label)}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`El repositorio "${owner}/${repo}" no fue encontrado o no es público en GitHub todavía.`);
      }
      if (response.status === 403) {
        throw new Error("Límite de peticiones de la API pública de GitHub alcanzado para tu IP. Por favor, espera unos minutos.");
      }
      throw new Error(`Error al consultar GitHub (código HTTP ${response.status}).`);
    }

    const rawData: any[] = await response.json();
    // In GitHub API, pull requests are also returned by /issues endpoint. Filter them out to keep only real issues/posts.
    const issuesOnly: GitHubIssue[] = rawData.filter((item) => !item.pull_request);
    
    setCached(cacheKey, issuesOnly);
    return issuesOnly;
  } catch (error) {
    console.warn("Aviso al cargar issues:", error);
    throw error;
  }
};

export const fetchComments = async (owner: string, repo: string, issueNumber: number): Promise<GitHubComment[]> => {
  const cacheKey = `comments:${owner}/${repo}:${issueNumber}`;
  const cached = getCached<GitHubComment[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${BASE_URL}/${owner}/${repo}/issues/${issueNumber}/comments?per_page=100`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Límite de peticiones de la API pública alcanzado para cargar comentarios.");
      }
      throw new Error("Error al cargar los comentarios.");
    }

    const data: GitHubComment[] = await response.json();
    setCached(cacheKey, data);
    return data;
  } catch (error) {
    console.warn("Aviso al cargar comentarios:", error);
    throw error;
  }
};