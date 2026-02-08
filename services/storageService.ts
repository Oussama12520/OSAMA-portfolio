import Dexie, { type Table } from 'dexie';
import { Project, ProjectCategory } from '../types';

// Define the Database Schema
class PortfolioDatabase extends Dexie {
  projects!: Table<Project>;

  constructor() {
    super('OsamaPortfolioDB');
    // Fix: Cast this to any to avoid "Property 'version' does not exist" error
    (this as any).version(1).stores({
      projects: 'id, category' // Primary key 'id', and index 'category'
    });
  }
}

export const db = new PortfolioDatabase();

// Initial Mock Data
const INITIAL_PROJECTS: Project[] = [
  // ... initial projects remain the same ...
];

const GITHUB_RAW_URL = (repo: string, branch: string) =>
  `https://raw.githubusercontent.com/${repo}/${branch}/projects.json`;

export const getProjects = async (): Promise<Project[]> => {
  try {
    const count = await db.projects.count();

    // If local DB is empty, try to fetch from GitHub first
    if (count === 0) {
      console.log("Database empty, checking for remote data...");
      const config = getSyncConfig();

      if (config.repo && config.token) {
        try {
          const response = await fetch(GITHUB_RAW_URL(config.repo, config.branch));
          if (response.ok) {
            const remoteProjects = await response.json();
            if (Array.isArray(remoteProjects) && remoteProjects.length > 0) {
              console.log("Seeding from GitHub projects.json...");
              await db.projects.bulkAdd(remoteProjects);
              return remoteProjects;
            }
          }
        } catch (e) {
          console.warn("Failed to fetch from remote, falling back to mock data", e);
        }
      }

      // Final fallback to mock data
      console.log("Seeding initial mock data...");
      await db.projects.bulkAdd(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }

    return await db.projects.toArray();
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
};

export const getSyncConfig = () => {
  return {
    token: localStorage.getItem('gh_token') || '',
    repo: localStorage.getItem('gh_repo') || '',
    branch: localStorage.getItem('gh_branch') || 'main'
  };
};

export const saveSyncConfig = (token: string, repo: string, branch: string) => {
  localStorage.setItem('gh_token', token);
  localStorage.setItem('gh_repo', repo);
  localStorage.setItem('gh_branch', branch);
};

export const saveProject = async (project: Project): Promise<void> => {
  // Dexie's put method handles both insert (if key doesn't exist) and update (if key exists)
  await db.projects.put(project);
};

export const deleteProject = async (id: string): Promise<void> => {
  await db.projects.delete(id);
};

export const getProjectCategories = (): ProjectCategory[] => [
  'Discord Bot',
  'Telegram Bot',
  'Web Service',
  'Panel',
  'PC Software',
  'AI Agent',
  'Other'
];