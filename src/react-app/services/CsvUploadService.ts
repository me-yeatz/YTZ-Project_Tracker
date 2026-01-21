import { DatabaseService } from './DatabaseServiceFactory';
import { Project, Task, Client } from './simpleDatabaseService';

export interface CsvData {
  headers: string[];
  rows: string[][];
}

export class CsvUploadService {
  private dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }

  async parseCsv(csvText: string): Promise<CsvData> {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const rows: string[][] = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      // Handle fields that may contain commas inside quotes
      const row: string[] = [];
      let field = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(field.trim().replace(/"/g, ''));
          field = '';
        } else {
          field += char;
        }
      }
      
      row.push(field.trim().replace(/"/g, ''));
      rows.push(row);
    }

    return { headers, rows };
  }

  async importProjectsFromCsv(csvText: string): Promise<{ success: number; errors: string[] }> {
    try {
      const { headers, rows } = await this.parseCsv(csvText);
      const results = { success: 0, errors: [] as string[] };

      // Find required headers for projects
      const requiredHeaders = [
        'title', 'clientName', 'location', 'description', 'status',
        'startDate', 'targetCompletionDate', 'totalBudget', 'color'
      ];

      // Check if we have the required headers
      const hasRequiredHeaders = requiredHeaders.every(req =>
        headers.some(header => header.toLowerCase() === req.toLowerCase())
      );

      if (!hasRequiredHeaders) {
        results.errors.push('CSV must contain required columns: title, clientName, location, description, status, startDate, color');
        return results;
      }

      for (let i = 0; i < rows.length; i++) {
        try {
          const row = rows[i];
          const projectData: Partial<Project> = {};

          // Map CSV columns to project properties
          for (let j = 0; j < headers.length; j++) {
            const header = headers[j].toLowerCase();
            const value = row[j] || '';

            switch (header) {
              case 'title':
                projectData.title = value;
                break;
              case 'clientname':
                projectData.clientName = value;
                break;
              case 'location':
                projectData.location = value;
                break;
              case 'description':
                projectData.description = value;
                break;
              case 'status':
                if (['concept', 'design-development', 'submission-prep', 'submitted', 'approved', 'on-hold', 'completed'].includes(value.toLowerCase().replace(/\s+/g, '-'))) {
                  projectData.status = value.toLowerCase().replace(/\s+/g, '-') as any;
                } else {
                  projectData.status = 'concept'; // default
                }
                break;
              case 'startdate':
                projectData.startDate = value || new Date().toISOString();
                break;
              case 'targetcompletiondate':
                if (value) projectData.targetCompletionDate = value;
                break;
              case 'actualcompletiondate':
                if (value) projectData.actualCompletionDate = value;
                break;
              case 'totalbudget':
                if (value) projectData.totalBudget = parseFloat(value) || 0;
                break;
              case 'color':
                projectData.color = value || '#dc2626'; // default red
                break;
            }
          }

          // Validate required fields
          if (!projectData.title || !projectData.clientName || !projectData.location || !projectData.description || !projectData.status || !projectData.startDate) {
            results.errors.push(`Row ${i + 1}: Missing required fields`);
            continue;
          }

          // Create the project
          await this.dbService.createProject({
            title: projectData.title!,
            clientName: projectData.clientName!,
            location: projectData.location!,
            description: projectData.description!,
            status: projectData.status!,
            startDate: projectData.startDate!,
            targetCompletionDate: projectData.targetCompletionDate,
            actualCompletionDate: projectData.actualCompletionDate,
            totalBudget: projectData.totalBudget,
            submissions: [], // Start with empty submissions
            color: projectData.color || '#dc2626'
          });

          results.success++;
        } catch (err) {
          results.errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : 'Error importing row'}`);
        }
      }

      return results;
    } catch (error) {
      return {
        success: 0,
        errors: [`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  async importTasksFromCsv(csvText: string): Promise<{ success: number; errors: string[] }> {
    try {
      const { headers, rows } = await this.parseCsv(csvText);
      const results = { success: 0, errors: [] as string[] };

      // Find required headers for tasks
      const requiredHeaders = ['title', 'description', 'status', 'priority'];

      // Check if we have the required headers
      const hasRequiredHeaders = requiredHeaders.some(req => 
        headers.some(header => header.toLowerCase() === req.toLowerCase())
      );

      if (!hasRequiredHeaders) {
        results.errors.push('CSV must contain at least one of these columns: title, description, status, priority');
        return results;
      }

      for (let i = 0; i < rows.length; i++) {
        try {
          const row = rows[i];
          const taskData: Partial<Task> = {};

          // Map CSV columns to task properties
          for (let j = 0; j < headers.length; j++) {
            const header = headers[j].toLowerCase();
            const value = row[j] || '';

            switch (header) {
              case 'title':
                taskData.title = value;
                break;
              case 'description':
                taskData.description = value;
                break;
              case 'projectid':
                if (value) taskData.projectId = value;
                break;
              case 'assignedto':
                if (value) taskData.assignedTo = value;
                break;
              case 'status':
                if (['todo', 'in-progress', 'review', 'done'].includes(value.toLowerCase().replace(/\s+/g, '-'))) {
                  taskData.status = value.toLowerCase().replace(/\s+/g, '-') as any;
                } else {
                  taskData.status = 'todo'; // default
                }
                break;
              case 'priority':
                if (['low', 'medium', 'high', 'critical'].includes(value.toLowerCase())) {
                  taskData.priority = value.toLowerCase() as any;
                } else {
                  taskData.priority = 'medium'; // default
                }
                break;
              case 'duedate':
                if (value) taskData.dueDate = value;
                break;
            }
          }

          // Validate required fields
          if (!taskData.title || !taskData.description) {
            results.errors.push(`Row ${i + 1}: Missing required fields (title, description)`);
            continue;
          }

          // Create the task
          await this.dbService.createTask(
            taskData.title!,
            taskData.description!,
            taskData.projectId,
            taskData.assignedTo,
            taskData.status,
            taskData.priority,
            taskData.dueDate
          );

          results.success++;
        } catch (err) {
          results.errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : 'Error importing row'}`);
        }
      }

      return results;
    } catch (error) {
      return {
        success: 0,
        errors: [`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  async importClientsFromCsv(csvText: string): Promise<{ success: number; errors: string[] }> {
    try {
      const { headers, rows } = await this.parseCsv(csvText);
      const results = { success: 0, errors: [] as string[] };

      // Find required headers for clients
      const requiredHeaders = ['name'];

      // Check if we have the required headers
      const hasRequiredHeaders = requiredHeaders.some(req => 
        headers.some(header => header.toLowerCase() === req.toLowerCase())
      );

      if (!hasRequiredHeaders) {
        results.errors.push('CSV must contain at least the "name" column');
        return results;
      }

      for (let i = 0; i < rows.length; i++) {
        try {
          const row = rows[i];
          const clientData: Partial<Client> = {};

          // Map CSV columns to client properties
          for (let j = 0; j < headers.length; j++) {
            const header = headers[j].toLowerCase();
            const value = row[j] || '';

            switch (header) {
              case 'name':
                clientData.name = value;
                break;
              case 'email':
                if (value) clientData.email = value;
                break;
              case 'phone':
                if (value) clientData.phone = value;
                break;
              case 'company':
                if (value) clientData.company = value;
                break;
            }
          }

          // Validate required fields
          if (!clientData.name) {
            results.errors.push(`Row ${i + 1}: Missing required field (name)`);
            continue;
          }

          // Create the client
          await this.dbService.createClient(
            clientData.name!,
            clientData.email,
            clientData.phone,
            clientData.company
          );

          results.success++;
        } catch (err) {
          results.errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : 'Error importing row'}`);
        }
      }

      return results;
    } catch (error) {
      return {
        success: 0,
        errors: [`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }
}