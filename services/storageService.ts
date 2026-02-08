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
  {
    id: '1',
    title: 'Ultimate Moderation Bot',
    description: 'A high-performance Discord bot for server moderation, featuring auto-moderation, logging, and ticket systems.',
    category: 'Discord Bot',
    imageUrl: 'https://picsum.photos/400/250?random=1',
    inviteLink: '#',
    cost: '$20 / month',
    technologies: ['Python', 'Discord.py', 'MongoDB'],
    createdAt: Date.now()
  },
  {
    id: '2',
    title: 'Crypto Trading Panel',
    description: 'Real-time cryptocurrency trading dashboard with automated buy/sell signals and portfolio tracking.',
    category: 'Panel',
    imageUrl: 'https://picsum.photos/400/250?random=2',
    demoLink: '#',
    cost: 'Contact for Quote',
    technologies: ['React', 'Node.js', 'WebSockets'],
    createdAt: Date.now() - 100000
  },
  {
    id: '3',
    title: 'Auto-Scraper Pro',
    description: 'PC Software built with C# to scrape e-commerce data and export to Excel/CSV with proxy support.',
    category: 'PC Software',
    imageUrl: 'https://picsum.photos/400/250?random=3',
    cost: '$150 Lifetime',
    technologies: ['C#', '.NET 6', 'Selenium'],
    createdAt: Date.now() - 200000
  },
  {
    id: '4',
    title: 'Telegram Notify Agent',
    description: 'AI Agent that monitors news feeds and sends summarized alerts to Telegram channels instantly.',
    category: 'AI Agent',
    imageUrl: 'https://picsum.photos/400/250?random=4',
    inviteLink: '#',
    cost: '$10 / month',
    technologies: ['Python', 'Aiogram', 'Gemini API'],
    createdAt: Date.now() - 300000
  }
];

const GITHUB_RAW_URL = (repo: string, branch: string) =>
  `https://raw.githubusercontent.com/${repo}/${branch}/projects.json?t=${Date.now()}`;

export const getProjects = async (): Promise<Project[]> => {
  try {
    const config = getSyncConfig();
    const targetRepo = config.repo || 'Oussama12520/OSAMA-portfolio';

    // 1. Try to fetch from GitHub first (Primary Source of Truth)
    try {
      // Add cache-busting timestamp to URL
      const response = await fetch(GITHUB_RAW_URL(targetRepo, config.branch));

      if (response.ok) {
        const remoteProjects = await response.json();
        if (Array.isArray(remoteProjects)) {
          console.log("Syncing with latest GitHub projects.json...");

          // Only clear and update if data is different (optional optimization)
          // For now, simple clear and bulkAdd is fine for small datasets
          await db.projects.clear();
          await db.projects.bulkAdd(remoteProjects);
          return remoteProjects;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch from GitHub, falling back to local data.", e);
    }

    // 2. Fallback to local IndexedDB (Offline Support)
    const localProjects = await db.projects.toArray();

    // 3. Final fallback: Seed if completely empty
    if (localProjects.length === 0) {
      console.log("No data found anywhere, seeding mock projects...");
      await db.projects.bulkAdd(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }

    return localProjects;
  } catch (error) {
    console.error("Critical error in getProjects:", error);
    return INITIAL_PROJECTS;
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