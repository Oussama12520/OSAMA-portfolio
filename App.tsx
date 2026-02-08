import React, { useState, useEffect } from 'react';
import { getProjects, forceRefreshFromGitHub, getProjectCategories } from './services/storageService';
import { Project, ProjectCategory } from './types';
import Admin from './components/Admin';
import AIChat from './components/AIChat';
import {
  Code2,
  Terminal,
  Cpu,
  Bot,
  Layout,
  ExternalLink,
  Download,
  Github,
  Mail,
  Lock,
  ChevronRight,
  ShieldCheck,
  Loader2,
  RefreshCw
} from 'lucide-react';

import MouseGlow from './components/MouseGlow';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<ProjectCategory | 'All'>('All');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Initial Load & Auto-Update
  useEffect(() => {
    refreshProjects();

    // Background check for updates (only for visitors)
    if (!isAdmin) {
      const checkForUpdates = async () => {
        try {
          console.log("Checking for updates in background...");
          await forceRefreshFromGitHub();
          // If we got here, it means we found updates and updated the DB
          // So reload the projects from the DB
          const updatedProjects = await getProjects(false);
          setProjects(updatedProjects.sort((a, b) => b.createdAt - a.createdAt));
          console.log("Auto-updated projects from GitHub!");
        } catch (e) {
          // Silent failure - up to date or network error
        }
      };

      // Delay check by 1 second (fast check)
      const timer = setTimeout(checkForUpdates, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAdmin]);

  const refreshProjects = async () => {
    setIsLoading(true);
    try {
      // When in admin mode, work with local data only (don't overwrite with GitHub)
      const data = await getProjects(isAdmin);
      // Sort by newest first
      setProjects(data.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckForUpdates = async () => {
    setIsLoading(true);
    try {
      const data = await forceRefreshFromGitHub();
      setProjects(data.sort((a, b) => b.createdAt - a.createdAt));
      alert("Projects updated successfully!");
    } catch (error) {
      console.error("Failed to check for updates", error);
      alert("No updates available or connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      setIsAdmin(true);
      setShowLogin(false);
      setPassword('');
    } else {
      alert('Invalid password (hint: admin)');
    }
  };

  const filteredProjects = filter === 'All'
    ? projects
    : projects.filter(p => p.category === filter);

  // --- Render Functions ---

  const renderHero = () => (
    <section className="relative pt-24 pb-20 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto text-center relative z-10 flex flex-col items-center">

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-primary text-sm font-mono mb-6 animate-pulse">
          <Terminal size={14} />
          <span>System.Init(User="OSAMA");</span>
        </div>

        {/* Stylized Name Identity - Interactive Letters */}
        <div className="mb-4 relative cursor-default inline-block grouped">
          <h2 className="text-3xl md:text-5xl font-black font-mono text-white flex flex-col items-center tracking-tighter">
            <span className="text-xl md:text-2xl font-sans font-normal text-slate-400 tracking-normal mb-2">Hi I'm</span>
            <div className="flex items-center gap-1 hover:gap-3 transition-all duration-300 cursor-pointer group">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-white to-sky-400 bg-[length:200%_auto] animate-shimmer group-hover:scale-105 transition-transform duration-300">
                &lt;O
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-amber-500 bg-[length:200%_auto] animate-shimmer drop-shadow-[0_0_15px_rgba(234,179,8,0.6)] text-4xl md:text-6xl group-hover:animate-spin-y group-hover:drop-shadow-[0_0_30px_rgba(234,179,8,1)] transition-all duration-300 ease-out z-10 mx-1">
                $
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-white to-sky-400 bg-[length:200%_auto] animate-shimmer group-hover:scale-105 transition-transform duration-300">
                AMA/&gt;
              </span>
            </div>
          </h2>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          Backend Developer <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            & Bot Expert
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          I build high-performance Discord bots, automation tools, and PC software.
          Expert in <span className="text-primary font-bold">C#</span> & <span className="text-secondary font-bold">Python</span>.
          Passionate about clean code and scalable architecture.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#portfolio" className="bg-primary hover:bg-emerald-400 text-darker font-bold py-3 px-8 rounded-lg transition-all flex items-center justify-center gap-2">
            View Portfolio <ChevronRight size={18} />
          </a>
          <a href="#contact" className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-8 rounded-lg border border-slate-700 transition-all">
            Contact Me
          </a>
        </div>
      </div>
    </section>
  );

  const renderStats = () => (
    <section className="border-y border-slate-800 bg-darker/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { icon: Bot, label: "Bots Created", value: "50+" },
          { icon: Code2, label: "Projects Completed", value: "100+" },
          { icon: Cpu, label: "Automation Tools", value: "30+" },
          { icon: ShieldCheck, label: "Happy Clients", value: "45+" }
        ].map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 group">
            <stat.icon size={32} className="text-slate-500 group-hover:text-primary transition-colors duration-300" />
            <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );

  const renderPortfolio = () => (
    <section id="portfolio" className="py-24 px-6 bg-dark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">My Work</h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full mb-8" />

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {['All', ...getProjectCategories()].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat as ProjectCategory | 'All')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === cat
                  ? 'bg-primary text-darker font-bold shadow-lg shadow-emerald-900/20'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <div key={project.id} className="group bg-card rounded-2xl border border-slate-700 overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
                  {/* Image */}
                  <div className="h-48 overflow-hidden relative">
                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-all z-10" />
                    <img
                      src={project.imageUrl || `https://picsum.photos/seed/${project.id}/400/250`}
                      alt={project.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 z-20">
                      <span className="bg-darker/80 backdrop-blur text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{project.title}</h3>
                    </div>

                    <p className="text-slate-400 text-sm mb-4 line-clamp-3 min-h-[60px]">
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 3).map((tech, i) => (
                        <span key={i} className="text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded border border-slate-600">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-xs text-slate-500 py-1">+ {project.technologies.length - 3}</span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-700 flex items-center justify-between">
                      <span className="text-emerald-400 font-bold font-mono text-sm">{project.cost || 'Contact Me'}</span>

                      <div className="flex gap-2">
                        {project.inviteLink && (
                          <a href={project.inviteLink} target="_blank" rel="noreferrer" title="Invite / Download" className="p-2 bg-slate-700 hover:bg-primary hover:text-darker text-slate-200 rounded-lg transition-colors">
                            <Download size={18} />
                          </a>
                        )}
                        {project.demoLink && (
                          <a href={project.demoLink} target="_blank" rel="noreferrer" title="Demo / Website" className="p-2 bg-slate-700 hover:bg-secondary hover:text-white text-slate-200 rounded-lg transition-colors">
                            <ExternalLink size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-slate-800/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Code2 size={40} className="text-slate-600" />
                </div>
                <p className="text-slate-500 text-lg">No projects found in this category.</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );

  const renderContact = () => (
    <section id="contact" className="py-24 px-6 bg-gradient-to-b from-dark to-darker">
      <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-12 border border-slate-700 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <h2 className="text-3xl font-bold text-white mb-6">Ready to Start a Project?</h2>
        <p className="text-slate-400 mb-8 max-w-lg mx-auto">
          Whether you need a custom Discord bot, a complex web scraper, or a full-stack dashboard, I'm here to help turn your ideas into clean, efficient code.
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-6 py-4 rounded-xl border border-slate-700">
            <Mail className="text-primary" />
            <span>contact@osama.dev</span>
          </a>
          <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-6 py-4 rounded-xl border border-slate-700">
            <Github className="text-white" />
            <span>github.com/osama</span>
          </a>
          <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-6 py-4 rounded-xl border border-slate-700">
            <Layout className="text-[#5865F2]" />
            <span>Discord: osama#0001</span>
          </a>
        </div>
      </div>
    </section>
  );

  // --- Main Render ---

  if (isAdmin) {
    return (
      <Admin
        projects={projects}
        onUpdate={refreshProjects}
        onLogout={() => setIsAdmin(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark font-sans selection:bg-primary/30 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="font-mono font-bold text-xl text-white tracking-tighter">
            <span className="text-primary">&lt;</span>
            OSAMA
            <span className="text-primary">/&gt;</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
              <a href="#" className="hover:text-primary transition-colors">Home</a>
              <a href="#portfolio" className="hover:text-primary transition-colors">Portfolio</a>
              <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
            </div>
            <button
              onClick={() => setShowLogin(true)}
              className="text-slate-500 hover:text-white transition-colors"
              title="Admin Login"
            >
              <Lock size={16} />
            </button>
          </div>
        </div>
      </nav>

      <main>
        {renderHero()}
        {renderStats()}
        {renderPortfolio()}
        {renderContact()}
      </main>

      <footer className="py-8 text-center text-slate-600 text-sm border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} Osama. All rights reserved.</p>
        <p className="mt-2 text-xs">Built with React, Tailwind, Dexie DB & Gemini API</p>
      </footer>

      {/* Admin Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm p-8 rounded-2xl border border-slate-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Admin Access</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full bg-darker border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-primary text-darker font-bold py-2 rounded-lg hover:bg-emerald-400">
                  Login
                </button>
                <button type="button" onClick={() => setShowLogin(false)} className="flex-1 bg-slate-700 text-white font-medium py-2 rounded-lg hover:bg-slate-600">
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      <AIChat projects={projects} />
    </div>
  );
};

export default App;