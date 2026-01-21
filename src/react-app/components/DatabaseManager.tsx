import React, { useState, useEffect } from 'react';
import {
  Table,
  FolderKanban,
  User,
  FileText,
  Plus,
  Edit3,
  Trash2,
  Search,
  ChevronDown,
  ChevronRight,
  Download
} from 'lucide-react';
import { Task, Client, Document, ProjectNote } from '../services/simpleDatabaseService';
import { createDatabaseService, DatabaseService } from '../services/DatabaseServiceFactory';
import CsvUploadComponent from './CsvUploadComponent';

interface DatabaseManagerProps {
  projectId?: string;
}

const DatabaseManager: React.FC<DatabaseManagerProps> = ({ projectId }) => {
  const [dbService] = useState<DatabaseService>(() => createDatabaseService());
  const [activeTab, setActiveTab] = useState<'tasks' | 'clients' | 'documents' | 'notes' | 'csv'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Form states
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  
  // Task form state
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium'
  });
  
  // Client form state
  const [newClient, setNewClient] = useState<Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'projects'>>({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  
  // Document form state
  const [newDocument, setNewDocument] = useState<Omit<Document, 'id' | 'createdAt' | 'updatedAt'>>({
    projectId: projectId || '',
    fileName: '',
    fileType: '',
    fileSize: 0,
    downloadUrl: '',
    uploadedBy: 'Current User'
  });
  
  // Note form state
  const [newNote, setNewNote] = useState<Omit<ProjectNote, 'id' | 'createdAt' | 'updatedAt'>>({
    projectId: projectId || '',
    title: '',
    content: '',
    tags: []
  });

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case 'tasks':
        setTasks(dbService.getAllTasks());
        break;
      case 'clients':
        setClients(dbService.getAllClients());
        break;
      case 'documents':
        setDocuments(dbService.getAllDocuments());
        break;
      case 'notes':
        setNotes(dbService.getProjectNotesByProjectId(projectId || ''));
        break;
      case 'csv':
        // No data loading needed for CSV tab
        break;
    }
  }, [activeTab, projectId, dbService]);

  const toggleRowExpand = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    
    const task = dbService.createTask(
      newTask.title,
      newTask.description,
      projectId,
      undefined,
      newTask.status,
      newTask.priority
    );
    
    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', status: 'todo', priority: 'medium' });
    setShowTaskForm(false);
  };

  const handleCreateClient = () => {
    if (!newClient.name.trim()) return;
    
    const client = dbService.createClient(
      newClient.name,
      newClient.email,
      newClient.phone,
      newClient.company
    );
    
    setClients([...clients, client]);
    setNewClient({ name: '', email: '', phone: '', company: '' });
    setShowClientForm(false);
  };

  const handleCreateDocument = () => {
    if (!newDocument.fileName.trim()) return;
    
    const document = dbService.createDocument(
      newDocument.projectId,
      newDocument.fileName,
      newDocument.fileType,
      newDocument.fileSize,
      newDocument.downloadUrl,
      newDocument.uploadedBy
    );
    
    setDocuments([...documents, document]);
    setNewDocument({
      projectId: projectId || '',
      fileName: '',
      fileType: '',
      fileSize: 0,
      downloadUrl: '',
      uploadedBy: 'Current User'
    });
    setShowDocumentForm(false);
  };

  const handleCreateNote = () => {
    if (!newNote.title.trim()) return;
    
    const note = dbService.createProjectNote(
      newNote.projectId,
      newNote.title,
      newNote.content,
      newNote.tags
    );
    
    setNotes([...notes, note]);
    setNewNote({
      projectId: projectId || '',
      title: '',
      content: '',
      tags: []
    });
    setShowNoteForm(false);
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'bg-gray-500';
      case 'in-progress': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'done': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0c] text-white rounded-xl overflow-hidden">
      {/* Tab Navigation - Mobile-friendly */}
      <div className="border-b border-white/10 bg-white/5 overflow-x-auto">
        <div className="flex min-w-max">
          <button
            className={`flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'text-red-400 border-b-2 border-red-400'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('tasks')}
          >
            <Table size={18} />
            <span className="hidden sm:inline">Tasks</span>
            <span className="sm:hidden">T</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'clients'
                ? 'text-red-400 border-b-2 border-red-400'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('clients')}
          >
            <User size={18} />
            <span className="hidden sm:inline">Clients</span>
            <span className="sm:hidden">C</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'documents'
                ? 'text-red-400 border-b-2 border-red-400'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={18} />
            <span className="hidden sm:inline">Documents</span>
            <span className="sm:hidden">D</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'notes'
                ? 'text-red-400 border-b-2 border-red-400'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('notes')}
          >
            <FolderKanban size={18} />
            <span className="hidden sm:inline">Notes</span>
            <span className="sm:hidden">N</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'csv'
                ? 'text-red-400 border-b-2 border-red-400'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('csv')}
          >
            <Download size={18} />
            <span className="hidden sm:inline">CSV Import</span>
            <span className="sm:hidden">I</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all w-80"
            />
          </div>
          
          <button
            onClick={() => {
              if (activeTab === 'tasks') setShowTaskForm(true);
              else if (activeTab === 'clients') setShowClientForm(true);
              else if (activeTab === 'documents') setShowDocumentForm(true);
              else if (activeTab === 'notes') setShowNoteForm(true);
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
          </button>
        </div>

        {/* Forms */}
        {showTaskForm && (
          <div className="glass p-6 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Status</label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({...newTask, status: e.target.value as Task['status']})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Project ID</label>
                <input
                  type="text"
                  value={projectId || newTask.projectId}
                  onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Project ID"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Task description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateTask}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Create Task
              </button>
              <button
                onClick={() => setShowTaskForm(false)}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showClientForm && (
          <div className="glass p-6 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-4">Create New Client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Client name"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Company</label>
                <input
                  type="text"
                  value={newClient.company}
                  onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateClient}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Create Client
              </button>
              <button
                onClick={() => setShowClientForm(false)}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showDocumentForm && (
          <div className="glass p-6 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">File Name *</label>
                <input
                  type="text"
                  value={newDocument.fileName}
                  onChange={(e) => setNewDocument({...newDocument, fileName: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Document name"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">File Type</label>
                <input
                  type="text"
                  value={newDocument.fileType}
                  onChange={(e) => setNewDocument({...newDocument, fileType: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="PDF, DOC, etc."
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">File Size (bytes)</label>
                <input
                  type="number"
                  value={newDocument.fileSize}
                  onChange={(e) => setNewDocument({...newDocument, fileSize: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="File size in bytes"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Download URL</label>
                <input
                  type="text"
                  value={newDocument.downloadUrl}
                  onChange={(e) => setNewDocument({...newDocument, downloadUrl: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Download URL"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Project ID</label>
                <input
                  type="text"
                  value={projectId || newDocument.projectId}
                  onChange={(e) => setNewDocument({...newDocument, projectId: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Project ID"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateDocument}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Upload Document
              </button>
              <button
                onClick={() => setShowDocumentForm(false)}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showNoteForm && (
          <div className="glass p-6 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-4">Create Note</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title *</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Note title"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Note content"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newNote.tags.join(', ')}
                  onChange={(e) => setNewNote({...newNote, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Project ID</label>
                <input
                  type="text"
                  value={projectId || newNote.projectId}
                  onChange={(e) => setNewNote({...newNote, projectId: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Project ID"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateNote}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Create Note
              </button>
              <button
                onClick={() => setShowNoteForm(false)}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Data Tables */}
        {activeTab === 'tasks' && (
          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Task</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tasks.map(task => (
                  <React.Fragment key={task.id}>
                    <tr 
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => toggleRowExpand(task.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {expandedRows.has(task.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-slate-400 line-clamp-1">{task.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)} bg-opacity-20`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Edit3 size={16} className="text-slate-400" />
                          </button>
                          <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(task.id) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-white/5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400">Description</p>
                              <p className="text-white">{task.description}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Project ID</p>
                              <p className="text-white">{task.projectId || 'None'}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Assigned To</p>
                              <p className="text-white">{task.assignedTo || 'Unassigned'}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Due Date</p>
                              <p className="text-white">{task.dueDate || 'No due date'}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Client</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Projects</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clients.map(client => (
                  <tr key={client.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-orange-400 flex items-center justify-center">
                          <User size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-slate-400">ID: {client.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {client.email && <p className="text-white">{client.email}</p>}
                        {client.phone && <p className="text-slate-400">{client.phone}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{client.company || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{client.projects.length} projects</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <Edit3 size={16} className="text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Document</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Size</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Uploaded By</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-sm text-slate-400">Project: {doc.projectId.substring(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500 bg-opacity-20 text-blue-400">
                        {doc.fileType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{(doc.fileSize / 1024).toFixed(2)} KB</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{doc.uploadedBy}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <Edit3 size={16} className="text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Note</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Project</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Tags</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {notes.map(note => (
                  <tr key={note.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{note.title}</p>
                        <p className="text-sm text-slate-400 line-clamp-2">{note.content}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{note.projectId.substring(0, 8)}...</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 rounded text-xs bg-purple-500 bg-opacity-20 text-purple-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <Edit3 size={16} className="text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {((activeTab === 'tasks' && tasks.length === 0) ||
          (activeTab === 'clients' && clients.length === 0) ||
          (activeTab === 'documents' && documents.length === 0) ||
          (activeTab === 'notes' && notes.length === 0)) && (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500">
            <Table size={48} className="mb-4 opacity-50" />
            <p>No {activeTab} found</p>
            <p className="text-sm mt-2">Click "Add" to create your first {activeTab.slice(0, -1)}</p>
          </div>
        )}

        {activeTab === 'csv' && (
          <div className="p-4">
            <CsvUploadComponent dbService={dbService} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseManager;