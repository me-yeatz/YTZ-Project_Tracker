import { ClientMessage, CommunicationStats, AutoResponseSettings } from '../types';

export const MOCK_MESSAGES: ClientMessage[] = [
    {
        id: '1',
        clientName: 'Ahmad bin Hassan',
        clientPhone: '+60123456789',
        source: 'whatsapp',
        content: 'Hi, I need consultation for my house renovation project in Kuala Lumpur. Can we schedule a meeting this weekend?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        status: 'ai-responded',
        priority: 'medium',
        aiResponse: 'Thank you for contacting YEATZ Architecture Studio! We would be happy to discuss your house renovation project. Our team is available for consultations during working hours (Monday-Friday, 9 AM - 6 PM). Would you prefer a meeting early next week? Please let me know your preferred date and time.',
        aiRespondedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
        tags: ['consultation', 'residential', 'renovation'],
        requiresHumanReview: false
    },
    {
        id: '2',
        clientName: 'Sarah Lim',
        clientPhone: '+60198765432',
        clientEmail: 'sarah.lim@email.com',
        source: 'whatsapp',
        content: 'URGENT: The structural engineer needs the revised plans by Monday for the building permit submission. Can you send them today?',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        status: 'escalated',
        priority: 'urgent',
        aiResponse: 'I have flagged your message as urgent regarding the building permit submission deadline. Our team will prioritize this and respond to you shortly. Thank you for bringing this to our attention.',
        aiRespondedAt: new Date(Date.now() - 29 * 60 * 1000).toISOString(),
        tags: ['urgent', 'deadline', 'building-permit', 'structural'],
        requiresHumanReview: true
    },
    {
        id: '3',
        clientName: 'Tan Wei Ming',
        clientPhone: '+60167891234',
        source: 'whatsapp',
        content: 'Good morning! Just wanted to check on the progress of our commercial project design. Any updates?',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        status: 'ai-responded',
        priority: 'low',
        aiResponse: 'Good morning! Thank you for checking in on your commercial project. Our team is making good progress on the design development. We will provide you with a detailed update during our next scheduled meeting. If you need immediate information, please feel free to call during our working hours.',
        aiRespondedAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString(),
        tags: ['project-update', 'commercial'],
        requiresHumanReview: false
    },
    {
        id: '4',
        clientName: 'Nurul Aisyah',
        clientPhone: '+60134567890',
        source: 'whatsapp',
        content: 'Hi, I saw your portfolio online. How much do you charge for a small residential design project?',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        status: 'new',
        priority: 'medium',
        tags: ['new-inquiry', 'pricing', 'residential'],
        requiresHumanReview: false
    },
    {
        id: '5',
        clientName: 'David Chen',
        clientPhone: '+60187654321',
        clientEmail: 'david.chen@company.com',
        source: 'email',
        content: 'We are interested in hiring your firm for a large-scale commercial development. Please send us your company profile and recent project portfolio.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        status: 'new',
        priority: 'high',
        tags: ['new-client', 'commercial', 'large-project'],
        requiresHumanReview: true
    },
    {
        id: '6',
        clientName: 'Farah Abdullah',
        clientPhone: '+60123334444',
        source: 'whatsapp',
        content: 'Thank you for the consultation yesterday! Looking forward to working with you on our dream home.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        status: 'resolved',
        priority: 'low',
        aiResponse: 'Thank you so much for your kind words! We are equally excited to work with you on your dream home project. Our team will be in touch soon with the next steps. Have a wonderful day!',
        aiRespondedAt: new Date(Date.now() - 12 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
        tags: ['follow-up', 'residential', 'positive-feedback'],
        requiresHumanReview: false
    }
];

export const MOCK_COMMUNICATION_STATS: CommunicationStats = {
    totalMessages: 24,
    newMessages: 2,
    aiResponded: 18,
    escalated: 1,
    resolved: 3,
    averageResponseTime: 5, // minutes
    weekendMessagesBlocked: 8
};

export const DEFAULT_AUTO_RESPONSE_SETTINGS: AutoResponseSettings = {
    enabled: true,
    workingHours: {
        start: '09:00',
        end: '18:00'
    },
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    autoRespondOutsideHours: true,
    autoRespondOnWeekends: true,
    responseTemplates: {
        weekendMessage: 'Thank you for contacting YEATZ Architecture Studio. We have received your message during the weekend. Our team will review your inquiry and respond during our working hours (Monday-Friday, 9 AM - 6 PM). For urgent architectural matters, please specify "URGENT" in your message.',
        afterHoursMessage: 'Thank you for contacting YEATZ Architecture Studio. We have received your message outside our working hours. Our team will respond during our working hours (Monday-Friday, 9 AM - 6 PM). For urgent architectural matters, please specify "URGENT" in your message.',
        generalInquiry: 'Thank you for your interest in YEATZ Architecture Studio. We specialize in residential and commercial architecture projects. How can we assist you with your architectural needs today?',
        consultationRequest: 'Thank you for your consultation request. We would be happy to discuss your project in detail. Please share some information about your project scope, location, and timeline, and we will schedule a consultation during our working hours.',
        urgentMatter: 'We have received your urgent message and flagged it for immediate attention from our team. We will respond to you as soon as possible.'
    },
    escalationKeywords: [
        'urgent',
        'emergency',
        'deadline',
        'legal',
        'safety',
        'collapse',
        'danger',
        'asap',
        'immediately',
        'critical'
    ],
    claudeApiKey: '' // User needs to add their own API key
};
