// Enhanced database service similar to Airtable
// This will use localStorage for now, but can be extended to connect to a real database

export interface DatabaseRecord {
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

// Define the Project interface here to avoid circular dependencies
export interface Project {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  type: 'planning-permission' | 'building-permit' | 'structural-approval' | 'fire-safety' | 'environmental-impact' | 'other';
  authority: string;
  submittedDate?: string;
  expectedApprovalDate?: string;
  approvalDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'resubmission-required';
  consultantFee: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

import { DatabaseService } from './DatabaseServiceFactory';

export class SimpleDatabaseService implements DatabaseService {
  private readonly storageKey = 'simple_db';

  constructor() {
    // Initialize with empty data if not present
    if (!localStorage.getItem(this.storageKey)) {
      this.saveData({
        conversations: [],
        messages: [],
        projectNotes: [],
        tasks: [],
        clients: [],
        documents: [],
        projects: []
      });
    }
  }

  private getData() {
    const dataStr = localStorage.getItem(this.storageKey);
    return dataStr ? JSON.parse(dataStr) : {
      conversations: [],
      messages: [],
      projectNotes: [],
      tasks: [],
      clients: [],
      documents: []
    };
  }

  private saveData(data: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // Conversations methods
  getAllConversations(): Conversation[] {
    const data = this.getData();
    return data.conversations || [];
  }

  getConversationById(id: string): Conversation | undefined {
    const data = this.getData();
    return data.conversations.find((conv: Conversation) => conv.id === id);
  }

  createConversation(title: string, projectId?: string, tags: string[] = []): Conversation {
    const data = this.getData();
    const newConversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      projectId,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.conversations.push(newConversation);
    this.saveData(data);

    return newConversation;
  }

  updateConversation(conv: Conversation): Conversation {
    const data = this.getData();
    const index = data.conversations.findIndex((c: Conversation) => c.id === conv.id);
    if (index !== -1) {
      conv.updatedAt = new Date().toISOString();
      data.conversations[index] = conv;
      this.saveData(data);
    }
    return conv;
  }

  deleteConversation(id: string): boolean {
    const data = this.getData();
    const initialLength = data.conversations.length;
    data.conversations = data.conversations.filter((conv: Conversation) => conv.id !== id);

    // Also delete associated messages
    data.messages = data.messages.filter((msg: Message) => msg.conversationId !== id);

    if (data.conversations.length < initialLength) {
      this.saveData(data);
      return true;
    }
    return false;
  }

  // Messages methods
  getMessagesByConversationId(conversationId: string): Message[] {
    const data = this.getData();
    return data.messages.filter((msg: Message) => msg.conversationId === conversationId);
  }

  createMessage(conversationId: string, role: 'user' | 'assistant', content: string): Message {
    const data = this.getData();
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      role,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.messages.push(newMessage);

    // Update conversation's updated time
    const conversation = data.conversations.find((c: Conversation) => c.id === conversationId);
    if (conversation) {
      conversation.updatedAt = new Date().toISOString();
    }

    this.saveData(data);

    return newMessage;
  }

  updateMessage(msg: Message): Message {
    const data = this.getData();
    const index = data.messages.findIndex((m: Message) => m.id === msg.id);
    if (index !== -1) {
      msg.updatedAt = new Date().toISOString();
      data.messages[index] = msg;

      // Update conversation's updated time
      const conversation = data.conversations.find((c: Conversation) => c.id === msg.conversationId);
      if (conversation) {
        conversation.updatedAt = new Date().toISOString();
      }

      this.saveData(data);
    }
    return msg;
  }

  deleteMessage(id: string): boolean {
    const data = this.getData();
    const initialLength = data.messages.length;
    data.messages = data.messages.filter((msg: Message) => msg.id !== id);

    if (data.messages.length < initialLength) {
      this.saveData(data);
      return true;
    }
    return false;
  }

  // Project Notes methods
  getAllProjectNotes(): ProjectNote[] {
    const data = this.getData();
    return data.projectNotes || [];
  }

  getProjectNotesByProjectId(projectId: string): ProjectNote[] {
    const data = this.getData();
    return data.projectNotes.filter((note: ProjectNote) => note.projectId === projectId);
  }

  createProjectNote(projectId: string, title: string, content: string, tags: string[] = []): ProjectNote {
    const data = this.getData();
    const newNote: ProjectNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      title,
      content,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.projectNotes.push(newNote);
    this.saveData(data);

    return newNote;
  }

  updateProjectNote(note: ProjectNote): ProjectNote {
    const data = this.getData();
    const index = data.projectNotes.findIndex((n: ProjectNote) => n.id === note.id);
    if (index !== -1) {
      note.updatedAt = new Date().toISOString();
      data.projectNotes[index] = note;
      this.saveData(data);
    }
    return note;
  }

  deleteProjectNote(id: string): boolean {
    const data = this.getData();
    const initialLength = data.projectNotes.length;
    data.projectNotes = data.projectNotes.filter((note: ProjectNote) => note.id !== id);

    if (data.projectNotes.length < initialLength) {
      this.saveData(data);
      return true;
    }
    return false;
  }

  // Tasks methods
  getAllTasks(): Task[] {
    const data = this.getData();
    return data.tasks || [];
  }

  getTasksByProjectId(projectId: string): Task[] {
    const data = this.getData();
    return data.tasks.filter((task: Task) => task.projectId === projectId);
  }

  createTask(
    title: string,
    description: string,
    projectId?: string,
    assignedTo?: string,
    status: Task['status'] = 'todo',
    priority: Task['priority'] = 'medium',
    dueDate?: string
  ): Task {
    const data = this.getData();
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      projectId,
      assignedTo,
      status,
      priority,
      dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.tasks.push(newTask);
    this.saveData(data);

    return newTask;
  }

  updateTask(task: Task): Task {
    const data = this.getData();
    const index = data.tasks.findIndex((t: Task) => t.id === task.id);
    if (index !== -1) {
      task.updatedAt = new Date().toISOString();
      data.tasks[index] = task;
      this.saveData(data);
    }
    return task;
  }

  deleteTask(id: string): boolean {
    const data = this.getData();
    const initialLength = data.tasks.length;
    data.tasks = data.tasks.filter((task: Task) => task.id !== id);

    if (data.tasks.length < initialLength) {
      this.saveData(data);
      return true;
    }
    return false;
  }

  // Clients methods
  getAllClients(): Client[] {
    const data = this.getData();
    return data.clients || [];
  }

  getClientById(id: string): Client | undefined {
    const data = this.getData();
    return data.clients.find((client: Client) => client.id === id);
  }

  createClient(name: string, email?: string, phone?: string, company?: string): Client {
    const data = this.getData();
    const newClient: Client = {
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      phone,
      company,
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.clients.push(newClient);
    this.saveData(data);

    return newClient;
  }

  updateClient(client: Client): Client {
    const data = this.getData();
    const index = data.clients.findIndex((c: Client) => c.id === client.id);
    if (index !== -1) {
      client.updatedAt = new Date().toISOString();
      data.clients[index] = client;
      this.saveData(data);
    }
    return client;
  }

  deleteClient(id: string): boolean {
    const data = this.getData();
    const initialLength = data.clients.length;
    data.clients = data.clients.filter((client: Client) => client.id !== id);

    if (data.clients.length < initialLength) {
      this.saveData(data);
      return true;
    }
    return false;
  }

  // Documents methods
  getAllDocuments(): Document[] {
    const data = this.getData();
    return data.documents || [];
  }

  getDocumentsByProjectId(projectId: string): Document[] {
    const data = this.getData();
    return data.documents.filter((doc: Document) => doc.projectId === projectId);
  }

  createDocument(
    projectId: string,
    fileName: string,
    fileType: string,
    fileSize: number,
    downloadUrl: string,
    uploadedBy: string
  ): Document {
    const data = this.getData();
    const newDocument: Document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      fileName,
      fileType,
      fileSize,
      downloadUrl,
      uploadedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.documents.push(newDocument);
    this.saveData(data);

    return newDocument;
  }

  updateDocument(doc: Document): Document {
    const data = this.getData();
    const index = data.documents.findIndex((d: Document) => d.id === doc.id);
    if (index !== -1) {
      doc.updatedAt = new Date().toISOString();
      data.documents[index] = doc;
      this.saveData(data);
    }
    return doc;
  }

  deleteDocument(id: string): boolean {
    const data = this.getData();
    const initialLength = data.documents.length;
    data.documents = data.documents.filter((doc: Document) => doc.id !== id);

    if (data.documents.length < initialLength) {
      this.saveData(data);
      return true;
    }
    return false;
  }

  // Projects methods
  getAllProjects(): Project[] {
    const data = this.getData();
    return data.projects || [];
  }

  getProjectById(id: string): Project | undefined {
    const data = this.getData();
    return data.projects.find((proj: Project) => proj.id === id);
  }

  createProject(projectData: Omit<Project, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Project {
    const data = this.getData();
    const newProject: Project = {
      ...projectData,
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.projects.push(newProject);
    this.saveData(data);

    return newProject;
  }

  updateProject(project: Project): Project {
    const data = this.getData();
    const index = data.projects.findIndex((p: Project) => p.id === project.id);
    if (index !== -1) {
      project.updatedAt = new Date().toISOString();
      data.projects[index] = project;
      this.saveData(data);
    }
    return project;
  }

  deleteProject(id: string): boolean {
    const data = this.getData();
    const initialLength = data.projects.length;
    data.projects = data.projects.filter((proj: Project) => proj.id !== id);

    if (data.projects.length < initialLength) {
      this.saveData(data);
      return true;
    }
    return false;
  }

  // Utility methods
  clearAllData(): void {
    localStorage.removeItem(this.storageKey);
  }
}