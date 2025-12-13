import { GitHubIssue, GitHubComment } from '../types';

const BASE_URL = 'https://api.github.com/repos';

const getHeaders = (token?: string) => {
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const fetchIssues = async (owner: string, repo: string, label?: string, token?: string): Promise<GitHubIssue[]> => {
  try {
    let url = `${BASE_URL}/${owner}/${repo}/issues?state=open&sort=created&direction=desc`;
    if (label) {
      url += `&labels=${encodeURIComponent(label)}`;
    }
    
    const response = await fetch(url, {
      headers: getHeaders(token)
    });

    if (!response.ok) {
      if (response.status === 404) throw new Error("Repositorio no encontrado o privado (requiere token).");
      if (response.status === 403) throw new Error("Límite de API excedido o sin permisos.");
      if (response.status === 401) throw new Error("Token inválido.");
      throw new Error("Error al cargar los posts.");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchComments = async (owner: string, repo: string, issueNumber: number, token?: string): Promise<GitHubComment[]> => {
  try {
    const response = await fetch(`${BASE_URL}/${owner}/${repo}/issues/${issueNumber}/comments`, {
      headers: getHeaders(token)
    });

    if (!response.ok) {
      throw new Error("Error al cargar los comentarios.");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};