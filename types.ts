export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  user: GitHubUser;
  state: string;
  body: string;
  created_at: string;
  updated_at: string;
  comments: number; // count
  labels: GitHubLabel[];
  html_url: string;
}

export interface GitHubComment {
  id: number;
  user: GitHubUser;
  body: string;
  created_at: string;
  html_url: string;
}

export enum ViewState {
  LIST = 'LIST',
  DETAIL = 'DETAIL'
}

export interface RepoConfig {
  owner: string;
  name: string;
}