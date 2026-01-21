import { Hono } from 'hono';
import { createWhatsAppRoutes } from './whatsappRoutes';

const app = new Hono();

// Health check endpoint
app.get('/api/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Projects API
app.get('/api/projects', (c) => {
    // This would normally fetch from D1 database
    return c.json([
        {
            id: '1',
            title: 'Brand Redesign 2024',
            description: 'Updating the visual identity and guidelines for the main product suite.',
            status: 'active',
            progress: 65,
            dueDate: '2024-03-20',
            color: '#dc2626'
        },
        {
            id: '2',
            title: 'Mobile App Launch',
            description: 'Preparing the iOS and Android applications for the global market release.',
            status: 'active',
            progress: 40,
            dueDate: '2024-04-15',
            color: '#2563eb'
        }
    ]);
});

// Mount WhatsApp webhook routes
app.route('/whatsapp', createWhatsAppRoutes());

export default app;

