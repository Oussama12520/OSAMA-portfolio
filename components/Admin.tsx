import React, { useState } from 'react';
import { Project, ProjectCategory } from '../types';
import { saveProject, deleteProject, getProjectCategories, getSyncConfig, saveSyncConfig } from '../services/storageService';
import { updateFileOnGithub } from '../services/githubService';
import { Plus, Edit, Trash2, X, Save, LogOut, Loader2, RefreshCw, Github, Key, FileJson } from 'lucide-react';

interface AdminProps {
  projects: Project[];
  onUpdate: () => void;
  onLogout: () => void;
}

const Admin: React.FC<AdminProps> = ({ projects, onUpdate, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});

  // Sync States
  const [syncConfig, setSyncConfig] = useState(getSyncConfig());
  const [showSyncConfig, setShowSyncConfig] = useState(false);

  const categories = getProjectCategories();

  const handleEdit = (project: Project) => {
    setCurrentProject({ ...project });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentProject({
      id: Date.now().toString(),
      title: '',
      description: '',
      category: 'Discord Bot',
      technologies: [],
      cost: '',
      createdAt: Date.now(),
      imageUrl: '',
      inviteLink: '',
      demoLink: ''
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        onUpdate();
      } catch (e) {
        console.error("Delete failed", e);
        alert("Failed to delete project.");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentProject.id && currentProject.title) {
      setIsSaving(true);
      try {
        await saveProject(currentProject as Project);
        setIsEditing(false);
        onUpdate();
      } catch (e) {
        console.error("Save failed", e);
        alert("Failed to save project.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSaveSyncConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSyncConfig(syncConfig.token, syncConfig.repo, syncConfig.branch);
    setShowSyncConfig(false);
    alert("Sync configuration saved locally!");
  };

  const handleGithubSync = async () => {
    if (!syncConfig.token || !syncConfig.repo) {
      setShowSyncConfig(true);
      alert("Please set your GitHub Token and Repository first.");
      return;
    }

    if (!window.confirm("This will overwrite 'projects.json' in your GitHub repository. Continue?")) return;

    setIsSyncing(true);
    try {
      // CRITICAL FIX: Fetch fresh projects from LOCAL IndexedDB (not GitHub!)
      const { getProjects } = await import('../services/storageService');
      const freshProjects = await getProjects(true); // true = skipGitHubSync, read from local DB only

      const result = await updateFileOnGithub(
        { ...syncConfig, path: 'projects.json' },
        JSON.stringify(freshProjects, null, 2)
      );

      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Sync error:", error);
      alert("Failed to sync. Check console for details.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTechChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentProject(prev => ({
      ...prev,
      technologies: val.split(',').map(t => t.trim()).filter(t => t.length > 0)
    }));
  };

  return (
    <div className="min-h-screen bg-darker p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Manage your portfolio projects (Database Connected)</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors px-4 py-2 border border-red-900/50 rounded-lg hover:bg-red-900/20"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Project List */}
        {!isEditing ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-primary text-darker font-bold px-6 py-3 rounded-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/20"
              >
                <Plus size={20} /> Add New Project
              </button>

              <button
                onClick={handleGithubSync}
                disabled={isSyncing}
                className="flex items-center gap-2 bg-slate-800 text-white font-bold px-6 py-3 rounded-lg hover:bg-slate-700 transition-all border border-slate-700 disabled:opacity-50"
              >
                {isSyncing ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
                Sync to Live Site
              </button>

              <button
                onClick={() => setShowSyncConfig(!showSyncConfig)}
                className="flex items-center gap-2 bg-slate-800 text-slate-400 font-medium px-4 py-3 rounded-lg hover:bg-slate-700 transition-all border border-slate-700"
              >
                <Github size={20} /> Config
              </button>
            </div>

            {/* Sync Config Panel */}
            {showSyncConfig && (
              <div className="bg-card p-6 rounded-2xl border border-primary/20 shadow-xl animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Github size={18} className="text-primary" /> GitHub Sync Configuration
                  </h3>
                  <button onClick={() => setShowSyncConfig(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleSaveSyncConfig} className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                      <Key size={12} /> Personal Access Token
                    </label>
                    <input
                      type="password"
                      value={syncConfig.token}
                      onChange={e => setSyncConfig(s => ({ ...s, token: e.target.value }))}
                      placeholder="ghp_..."
                      className="w-full bg-darker border border-slate-700 rounded-lg p-2 text-white focus:border-primary focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                      <FileJson size={12} /> Repository (user/repo)
                    </label>
                    <input
                      type="text"
                      value={syncConfig.repo}
                      onChange={e => setSyncConfig(s => ({ ...s, repo: e.target.value }))}
                      placeholder="osama/portfolio"
                      className="w-full bg-darker border border-slate-700 rounded-lg p-2 text-white focus:border-primary focus:outline-none text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Branch</label>
                      <input
                        type="text"
                        value={syncConfig.branch}
                        onChange={e => setSyncConfig(s => ({ ...s, branch: e.target.value }))}
                        className="w-full bg-darker border border-slate-700 rounded-lg p-2 text-white focus:border-primary focus:outline-none text-sm"
                      />
                    </div>
                    <button type="submit" className="bg-primary text-darker font-bold px-4 py-2 rounded-lg hover:bg-emerald-400 text-sm">Save</button>
                  </div>
                </form>
                <p className="text-[10px] text-slate-500 mt-2">
                  * Token is saved only in your browser's local storage for security.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {projects.map(project => (
                <div key={project.id} className="bg-card p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-xl text-white">{project.title}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">{project.category}</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1 max-w-2xl truncate">{project.description}</p>
                    <p className="text-slate-500 text-xs mt-2">Cost: {project.cost || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => handleEdit(project)}
                      className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-center text-slate-500 py-12">No projects found in database. Add one!</div>
              )}
            </div>
          </div>
        ) : (
          /* Edit Form */
          <div className="max-w-2xl mx-auto bg-card p-6 md:p-8 rounded-2xl border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {currentProject.id && currentProject.createdAt && currentProject.createdAt < Date.now() - 1000 ? 'Edit Project' : 'New Project'}
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={currentProject.title || ''}
                  onChange={e => setCurrentProject(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-darker border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  placeholder="Project Name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={currentProject.category}
                    onChange={e => setCurrentProject(p => ({ ...p, category: e.target.value as ProjectCategory }))}
                    className="w-full bg-darker border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Cost / Price</label>
                  <input
                    type="text"
                    value={currentProject.cost || ''}
                    onChange={e => setCurrentProject(p => ({ ...p, cost: e.target.value }))}
                    className="w-full bg-darker border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                    placeholder="e.g. $50, Free, Contact Me"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={currentProject.description || ''}
                  onChange={e => setCurrentProject(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-darker border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  placeholder="Describe functionality, features, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Technologies (comma separated)</label>
                <input
                  type="text"
                  value={currentProject.technologies?.join(', ') || ''}
                  onChange={handleTechChange}
                  className="w-full bg-darker border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  placeholder="Python, C#, MongoDB, React..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Image URL</label>
                <input
                  type="text"
                  value={currentProject.imageUrl || ''}
                  onChange={e => setCurrentProject(p => ({ ...p, imageUrl: e.target.value }))}
                  className="w-full bg-darker border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Invite/Download Link</label>
                  <input
                    type="text"
                    value={currentProject.inviteLink || ''}
                    onChange={e => setCurrentProject(p => ({ ...p, inviteLink: e.target.value }))}
                    className="w-full bg-darker border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                    placeholder="https://discord.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Demo/View Link</label>
                  <input
                    type="text"
                    value={currentProject.demoLink || ''}
                    onChange={e => setCurrentProject(p => ({ ...p, demoLink: e.target.value }))}
                    className="w-full bg-darker border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-primary text-darker font-bold py-3 rounded-lg hover:bg-emerald-400 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSaving ? 'Saving...' : 'Save Project'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="flex-1 bg-slate-700 text-white font-medium py-3 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;