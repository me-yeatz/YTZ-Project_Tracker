import { Hono } from 'hono';
import { z } from 'zod';

// WhatsApp Business API webhook handler
const whatsappWebhookSchema = z.object({
    object: z.string(),
    entry: z.array(z.object({
        id: z.string(),
        changes: z.array(z.object({
            value: z.object({
                messaging_product: z.string(),
                metadata: z.object({
                    display_phone_number: z.string(),
                    phone_number_id: z.string()
                }),
                messages: z.array(z.object({
                    from: z.string(),
                    id: z.string(),
                    timestamp: z.string(),
                    text: z.object({
                        body: z.string()
                    }).optional(),
                    type: z.string()
                })).optional()
            }),
            field: z.string()
        }))
    }))
});

export function createWhatsAppRoutes() {
    const app = new Hono();

    // Webhook verification (required by WhatsApp)
    app.get('/webhook', (c) => {
        const mode = c.req.query('hub.mode');
        const token = c.req.query('hub.verify_token');
        const challenge = c.req.query('hub.challenge');

        // Verify token should match your configured token
        const VERIFY_TOKEN = 'yeatz_architecture_2026'; // Using default value

        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            if (typeof console !== 'undefined') console.log('WhatsApp webhook verified');
            return c.text(challenge || '');
        }

        return c.json({ error: 'Verification failed' }, 403);
    });

    // Webhook for incoming messages
    app.post('/webhook', async (c) => {
        try {
            const body = await c.req.json();
            if (typeof console !== 'undefined') console.log('Incoming WhatsApp webhook:', JSON.stringify(body, null, 2));

            // Validate webhook payload
            const validated = whatsappWebhookSchema.safeParse(body);
            if (!validated.success) {
                if (typeof console !== 'undefined') console.error('Invalid webhook payload:', validated.error);
                return c.json({ error: 'Invalid payload' }, 400);
            }

            const data = validated.data;

            // Process each entry
            for (const entry of data.entry) {
                for (const change of entry.changes) {
                    if (change.value.messages) {
                        for (const message of change.value.messages) {
                            if (message.type === 'text' && message.text) {
                                await handleIncomingMessage(c, {
                                    from: message.from,
                                    messageId: message.id,
                                    content: message.text.body,
                                    timestamp: message.timestamp,
                                    phoneNumberId: change.value.metadata.phone_number_id
                                });
                            }
                        }
                    }
                }
            }

            return c.json({ status: 'ok' });
        } catch (error) {
            if (typeof console !== 'undefined') console.error('Error processing webhook:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    });

    return app;
}

interface IncomingMessage {
    from: string;
    messageId: string;
    content: string;
    timestamp: string;
    phoneNumberId: string;
}

async function handleIncomingMessage(c: any, message: IncomingMessage) {
    if (typeof console !== 'undefined') console.log('Processing message:', message);

    // Store message in database (D1)
    // This would be implemented with your D1 database
    const clientMessage = {
        id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `msg_${Date.now()}`,
        clientPhone: message.from,
        clientName: 'Unknown', // Would be fetched from contacts/database
        source: 'whatsapp' as const,
        content: message.content,
        timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
        status: 'new' as const,
        priority: 'medium' as const,
        tags: [],
        requiresHumanReview: false
    };

    // TODO: Store in D1 database
    // await c.env.DB.prepare(
    //     'INSERT INTO client_messages (id, client_phone, content, timestamp, status, priority) VALUES (?, ?, ?, ?, ?, ?)'
    // ).bind(
    //     clientMessage.id,
    //     clientMessage.clientPhone,
    //     clientMessage.content,
    //     clientMessage.timestamp,
    //     clientMessage.status,
    //     clientMessage.priority
    // ).run();

    // Get auto-response settings
    const settings = await getAutoResponseSettings(c);

    if (settings.enabled && shouldAutoRespond(settings)) {
        // Process with Claude AI
        const aiResponse = await processWithClaudeAI(c, clientMessage, settings);

        // Send response via WhatsApp
        await sendWhatsAppMessage(c, message.phoneNumberId, message.from, aiResponse);

        // Update message status
        // TODO: Update in D1 database
    }
}

async function getAutoResponseSettings(_c: any) {
    // TODO: Fetch from D1 database
    // For now, return default settings
    return {
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
            generalInquiry: 'Thank you for your interest in YEATZ Architecture Studio. How can we assist you with your architectural needs today?',
            consultationRequest: 'Thank you for your consultation request. We would be happy to discuss your project. Please share some details about your project, and we will schedule a consultation during our working hours.',
            urgentMatter: 'We have flagged your message as urgent and will prioritize a response from our team.'
        },
        escalationKeywords: ['urgent', 'emergency', 'deadline', 'legal', 'safety', 'collapse', 'danger']
    };
}

function shouldAutoRespond(settings: any): boolean {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();

    const [startHour, startMinute] = settings.workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = settings.workingHours.end.split(':').map(Number);

    const isWorkingDay = settings.workingDays.includes(day);
    const isWeekend = day === 0 || day === 6;
    const currentMinutes = hour * 60 + minute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const isWorkingHours = currentMinutes >= startMinutes && currentMinutes < endMinutes;

    if (isWeekend && settings.autoRespondOnWeekends) {
        return true;
    }

    if (!isWorkingDay || !isWorkingHours) {
        return settings.autoRespondOutsideHours;
    }

    return true; // Auto-respond during working hours too
}

async function processWithClaudeAI(c: any, message: any, settings: any): Promise<string> {
    const claudeApiKey = c.env?.CLAUDE_API_KEY;
    if (!claudeApiKey) {
        if (typeof console !== 'undefined') console.error('Claude API key not configured');
        return getFallbackResponse(settings);
    }

    try {
        const systemPrompt = buildSystemPrompt(settings);
        const userPrompt = buildUserPrompt(message);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': claudeApiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 500,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.content[0].text;
    } catch (error) {
        if (typeof console !== 'undefined') console.error('Error calling Claude API:', error);
        return getFallbackResponse(settings);
    }
}

function buildSystemPrompt(_settings: any): string {
    return `You are an AI assistant for YEATZ Architecture Studio. Respond professionally to client inquiries about architecture services, consultations, and projects. Keep responses concise (under 160 characters when possible for SMS compatibility). Be warm, professional, and helpful. Set appropriate boundaries for weekend/after-hours inquiries.`;
}

function buildUserPrompt(_message: any): string {
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const hour = now.getHours();

    return `Client message received ${isWeekend ? 'on weekend' : 'on weekday'} at ${hour}:00.

Message: "_message.content"

Provide a professional, helpful response. If it's outside working hours, acknowledge the message and set expectations for when they'll receive a detailed response.`;
}

function getFallbackResponse(settings: any): string {
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    if (isWeekend) {
        return settings.responseTemplates.weekendMessage;
    }
    return settings.responseTemplates.afterHoursMessage;
}

async function sendWhatsAppMessage(
    c: any,
    phoneNumberId: string,
    to: string,
    message: string
): Promise<void> {
    const accessToken = c.env?.WHATSAPP_ACCESS_TOKEN;
    if (!accessToken) {
        if (typeof console !== 'undefined') console.error('WhatsApp access token not configured');
        return;
    }

    try {
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: to,
                    type: 'text',
                    text: {
                        body: message
                    }
                })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            if (typeof console !== 'undefined') console.error('Failed to send WhatsApp message:', error);
        } else {
            if (typeof console !== 'undefined') console.log('WhatsApp message sent successfully');
        }
    } catch (error) {
        if (typeof console !== 'undefined') console.error('Error sending WhatsApp message:', error);
    }
}
