export type ProjectStatus =
    | 'concept'
    | 'design-development'
    | 'submission-prep'
    | 'submitted'
    | 'approved'
    | 'on-hold'
    | 'completed';

export type SubmissionType =
    | 'planning-permission'
    | 'building-permit'
    | 'structural-approval'
    | 'fire-safety'
    | 'environmental-impact'
    | 'other';

export interface Submission {
    id: string;
    type: SubmissionType;
    authority: string;
    submittedDate?: string;
    expectedApprovalDate?: string;
    approvalDate?: string;
    status: 'pending' | 'approved' | 'rejected' | 'resubmission-required';
    consultantFee: number;
    notes?: string;
}

export interface Project {
    id: string;
    title: string;
    clientName: string;
    location: string;
    description: string;
    status: ProjectStatus;
    startDate: string;
    targetCompletionDate?: string;
    actualCompletionDate?: string;
    totalBudget?: number;
    submissions: Submission[];
    color: string;
}

export interface FinancialSummary {
    totalProjects: number;
    activeProjects: number;
    totalConsultantFees: number;
    pendingSubmissions: number;
    approvedSubmissions: number;
}

// AI Communication Manager Types
export type MessageSource = 'whatsapp' | 'email' | 'phone' | 'web-form';
export type MessageStatus = 'new' | 'ai-responded' | 'escalated' | 'resolved' | 'archived';
export type MessagePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ClientMessage {
    id: string;
    clientName: string;
    clientPhone?: string;
    clientEmail?: string;
    source: MessageSource;
    content: string;
    timestamp: string;
    status: MessageStatus;
    priority: MessagePriority;
    aiResponse?: string;
    aiRespondedAt?: string;
    projectId?: string; // Link to existing project if applicable
    tags: string[];
    requiresHumanReview: boolean;
}

export interface AutoResponseSettings {
    enabled: boolean;
    workingHours: {
        start: string; // e.g., "09:00"
        end: string;   // e.g., "18:00"
    };
    workingDays: number[]; // 0-6, where 0 is Sunday
    autoRespondOutsideHours: boolean;
    autoRespondOnWeekends: boolean;
    responseTemplates: {
        weekendMessage: string;
        afterHoursMessage: string;
        generalInquiry: string;
        consultationRequest: string;
        urgentMatter: string;
    };
    escalationKeywords: string[]; // Keywords that trigger human review
    claudeApiKey?: string;
}

export interface CommunicationStats {
    totalMessages: number;
    newMessages: number;
    aiResponded: number;
    escalated: number;
    resolved: number;
    averageResponseTime: number; // in minutes
    weekendMessagesBlocked: number;
}
