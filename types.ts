export type ProjectCategory = 
  | 'Discord Bot' 
  | 'Telegram Bot' 
  | 'Web Service' 
  | 'Panel' 
  | 'PC Software' 
  | 'AI Agent'
  | 'Other';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  imageUrl?: string;
  inviteLink?: string;
  demoLink?: string;
  cost?: string; // e.g., "$50", "Contact for Quote", "Free"
  technologies: string[]; // e.g., ["C#", "Python", "React"]
  createdAt: number;
}

export interface User {
  username: string;
  role: 'admin' | 'guest';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
