// MongoDB service for the YTZ Project Tracker
// This service handles all database operations with MongoDB

export interface DatabaseRecord {
  _id?: string; // MongoDB's default ID field
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation extends DatabaseRecord {
  title: string;
  projectId?: string; // Link to a project if needed
  tags: string[];
}

export interface Message extends DatabaseRecord {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ProjectNote extends DatabaseRecord {
  projectId: string;
  title: string;
  content: string;
  tags: string[];
}

export interface Task extends DatabaseRecord {
  title: string;
  description: string;
  projectId?: string;
  assignedTo?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
}

export interface Client extends DatabaseRecord {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  projects: string[]; // Array of project IDs
}

export interface Document extends DatabaseRecord {
  projectId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadUrl: string;
  uploadedBy: string;
}

export interface Project extends DatabaseRecord {
  title: string;
  clientName: string;
  location: string;
  description: string;
  status: 'concept' | 'design-development' | 'submission-prep' | 'submitted' | 'approved' | 'on-hold' | 'completed';
  startDate: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  totalBudget?: number;
  submissions: Submission[];
  color: string;
}

export interface Submission extends DatabaseRecord {
  type: 'planning-permission' | 'building-permit' | 'structural-approval' | 'fire-safety' | 'environmental-impact' | 'other';
  authority: string;
  submittedDate?: string;
  expectedApprovalDate?: string;
  approvalDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'resubmission-required';
  consultantFee: number;
  notes?: string;
}

export class MongoDbService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`MongoDB API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Conversations methods
  async getAllConversations(): Promise<Conversation[]> {
    try {
      const response = await this.makeRequest('/api/conversations');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    try {
      const response = await this.makeRequest(`/api/conversations/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  }

  async createConversation(title: string, projectId?: string, tags: string[] = []): Promise<Conversation> {
    const now = new Date().toISOString();
    const newConversation: Omit<Conversation, '_id'> = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      projectId,
      tags,
      createdAt: now,
      updatedAt: now
    };

    try {
      const response = await this.makeRequest('/api/conversations', {
        method: 'POST',
        body: JSON.stringify(newConversation),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Return a local object in case of error
      return { ...newConversation, _id: newConversation.id };
    }
  }

  async updateConversation(conv: Conversation): Promise<Conversation> {
    const updatedConv = {
      ...conv,
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await this.makeRequest(`/api/conversations/${conv.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedConv),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating conversation:', error);
      return updatedConv;
    }
  }

  async deleteConversation(id: string): Promise<boolean> {
    try {
      await this.makeRequest(`/api/conversations/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  // Messages methods
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    try {
      const response = await this.makeRequest(`/api/messages?conversationId=${conversationId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  async createMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
    const now = new Date().toISOString();
    const newMessage: Omit<Message, '_id'> = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      role,
      content,
      createdAt: now,
      updatedAt: now
    };

    try {
      const response = await this.makeRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify(newMessage),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating message:', error);
      // Return a local object in case of error
      return { ...newMessage, _id: newMessage.id };
    }
  }

  async updateMessage(msg: Message): Promise<Message> {
    const updatedMsg = {
      ...msg,
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await this.makeRequest(`/api/messages/${msg.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedMsg),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating message:', error);
      return updatedMsg;
    }
  }

  async deleteMessage(id: string): Promise<boolean> {
    try {
      await this.makeRequest(`/api/messages/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  // Project Notes methods
  async getAllProjectNotes(): Promise<ProjectNote[]> {
    try {
      const response = await this.makeRequest('/api/project-notes');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching project notes:', error);
      return [];
    }
  }

  async getProjectNotesByProjectId(projectId: string): Promise<ProjectNote[]> {
    try {
      const response = await this.makeRequest(`/api/project-notes?projectId=${projectId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching project notes:', error);
      return [];
    }
  }

  async createProjectNote(projectId: string, title: string, content: string, tags: string[] = []): Promise<ProjectNote> {
    const now = new Date().toISOString();
    const newNote: Omit<ProjectNote, '_id'> = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      title,
      content,
      tags,
      createdAt: now,
      updatedAt: now
    };

    try {
      const response = await this.makeRequest('/api/project-notes', {
        method: 'POST',
        body: JSON.stringify(newNote),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating project note:', error);
      // Return a local object in case of error
      return { ...newNote, _id: newNote.id };
    }
  }

  async updateProjectNote(note: ProjectNote): Promise<ProjectNote> {
    const updatedNote = {
      ...note,
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await this.makeRequest(`/api/project-notes/${note.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedNote),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating project note:', error);
      return updatedNote;
    }
  }

  async deleteProjectNote(id: string): Promise<boolean> {
    try {
      await this.makeRequest(`/api/project-notes/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting project note:', error);
      return false;
    }
  }

  // Tasks methods
  async getAllTasks(): Promise<Task[]> {
    try {
      const response = await this.makeRequest('/api/tasks');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  async getTasksByProjectId(projectId: string): Promise<Task[]> {
    try {
      const response = await this.makeRequest(`/api/tasks?projectId=${projectId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  async createTask(
    title: string,
    description: string,
    projectId?: string,
    assignedTo?: string,
    status: Task['status'] = 'todo',
    priority: Task['priority'] = 'medium',
    dueDate?: string
  ): Promise<Task> {
    const now = new Date().toISOString();
    const newTask: Omit<Task, '_id'> = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      projectId,
      assignedTo,
      status,
      priority,
      dueDate,
      createdAt: now,
      updatedAt: now
    };

    try {
      const response = await this.makeRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(newTask),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      // Return a local object in case of error
      return { ...newTask, _id: newTask.id };
    }
  }

  async updateTask(task: Task): Promise<Task> {
    const updatedTask = {
      ...task,
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await this.makeRequest(`/api/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedTask),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      return updatedTask;
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      await this.makeRequest(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // Clients methods
  async getAllClients(): Promise<Client[]> {
    try {
      const response = await this.makeRequest('/api/clients');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }

  async getClientById(id: string): Promise<Client | null> {
    try {
      const response = await this.makeRequest(`/api/clients/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching client:', error);
      return null;
    }
  }

  async createClient(name: string, email?: string, phone?: string, company?: string): Promise<Client> {
    const now = new Date().toISOString();
    const newClient: Omit<Client, '_id'> = {
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      phone,
      company,
      projects: [],
      createdAt: now,
      updatedAt: now
    };

    try {
      const response = await this.makeRequest('/api/clients', {
        method: 'POST',
        body: JSON.stringify(newClient),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating client:', error);
      // Return a local object in case of error
      return { ...newClient, _id: newClient.id };
    }
  }

  async updateClient(client: Client): Promise<Client> {
    const updatedClient = {
      ...client,
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await this.makeRequest(`/api/clients/${client.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedClient),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating client:', error);
      return updatedClient;
    }
  }

  async deleteClient(id: string): Promise<boolean> {
    try {
      await this.makeRequest(`/api/clients/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      return false;
    }
  }

  // Documents methods
  async getAllDocuments(): Promise<Document[]> {
    try {
      const response = await this.makeRequest('/api/documents');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }

  async getDocumentsByProjectId(projectId: string): Promise<Document[]> {
    try {
      const response = await this.makeRequest(`/api/documents?projectId=${projectId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }

  async createDocument(
    projectId: string,
    fileName: string,
    fileType: string,
    fileSize: number,
    downloadUrl: string,
    uploadedBy: string
  ): Promise<Document> {
    const now = new Date().toISOString();
    const newDocument: Omit<Document, '_id'> = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      fileName,
      fileType,
      fileSize,
      downloadUrl,
      uploadedBy,
      createdAt: now,
      updatedAt: now
    };

    try {
      const response = await this.makeRequest('/api/documents', {
        method: 'POST',
        body: JSON.stringify(newDocument),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating document:', error);
      // Return a local object in case of error
      return { ...newDocument, _id: newDocument.id };
    }
  }

  async updateDocument(doc: Document): Promise<Document> {
    const updatedDoc = {
      ...doc,
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await this.makeRequest(`/api/documents/${doc.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedDoc),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating document:', error);
      return updatedDoc;
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    try {
      await this.makeRequest(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  // Projects methods
  async getAllProjects(): Promise<Project[]> {
    try {
      const response = await this.makeRequest('/api/projects');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  async getProjectById(id: string): Promise<Project | null> {
    try {
      const response = await this.makeRequest(`/api/projects/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  async createProject(projectData: Omit<Project, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const now = new Date().toISOString();
    const newProject: Omit<Project, '_id'> = {
      ...projectData,
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };

    try {
      const response = await this.makeRequest('/api/projects', {
        method: 'POST',
        body: JSON.stringify(newProject),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      // Return a local object in case of error
      return { ...newProject, _id: newProject.id };
    }
  }

  async updateProject(project: Project): Promise<Project> {
    const updatedProject = {
      ...project,
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await this.makeRequest(`/api/projects/${project.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedProject),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      return updatedProject;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      await this.makeRequest(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }
}