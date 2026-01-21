import { SimpleDatabaseService } from './simpleDatabaseService';

// Define interfaces that both services will implement
export interface DatabaseService {
  // Conversations methods
  getAllConversations(): any[];
  getConversationById(id: string): any | undefined;
  createConversation(title: string, projectId?: string, tags?: string[]): any;
  updateConversation(conv: any): any;
  deleteConversation(id: string): boolean;

  // Messages methods
  getMessagesByConversationId(conversationId: string): any[];
  createMessage(conversationId: string, role: 'user' | 'assistant', content: string): any;
  updateMessage(msg: any): any;
  deleteMessage(id: string): boolean;

  // Project Notes methods
  getAllProjectNotes(): any[];
  getProjectNotesByProjectId(projectId: string): any[];
  createProjectNote(projectId: string, title: string, content: string, tags?: string[]): any;
  updateProjectNote(note: any): any;
  deleteProjectNote(id: string): boolean;

  // Tasks methods
  getAllTasks(): any[];
  getTasksByProjectId(projectId: string): any[];
  createTask(
    title: string,
    description: string,
    projectId?: string,
    assignedTo?: string,
    status?: any,
    priority?: any,
    dueDate?: string
  ): any;
  updateTask(task: any): any;
  deleteTask(id: string): boolean;

  // Clients methods
  getAllClients(): any[];
  getClientById(id: string): any | undefined;
  createClient(name: string, email?: string, phone?: string, company?: string): any;
  updateClient(client: any): any;
  deleteClient(id: string): boolean;

  // Documents methods
  getAllDocuments(): any[];
  getDocumentsByProjectId(projectId: string): any[];
  createDocument(
    projectId: string,
    fileName: string,
    fileType: string,
    fileSize: number,
    downloadUrl: string,
    uploadedBy: string
  ): any;
  updateDocument(doc: any): any;
  deleteDocument(id: string): boolean;

  // Projects methods
  getAllProjects(): any[];
  getProjectById(id: string): any | undefined;
  createProject(projectData: Omit<any, '_id' | 'id' | 'createdAt' | 'updatedAt'>): any;
  updateProject(project: any): any;
  deleteProject(id: string): boolean;
}

// Factory function to create the appropriate database service
export function createDatabaseService(): DatabaseService {
  // For now, only return the simple database service
  // MongoDB service requires async implementation which is not compatible with the current interface
  return new SimpleDatabaseService();
}