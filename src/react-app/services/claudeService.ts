import { ClientMessage, AutoResponseSettings } from '../types';

interface ClaudeResponse {
    response: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    requiresHumanReview: boolean;
    suggestedTags: string[];
}

export class ClaudeAIService {
    private apiKey: string;
    private apiUrl = 'https://api.anthropic.com/v1/messages';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async analyzeAndRespond(
        message: ClientMessage,
        settings: AutoResponseSettings,
        context?: { projectHistory?: string; clientHistory?: string }
    ): Promise<ClaudeResponse> {
        const systemPrompt = this.buildSystemPrompt(settings);
        const userPrompt = this.buildUserPrompt(message, context);

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 1024,
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
            const aiResponse = data.content[0].text;

            // Parse the structured response
            return this.parseClaudeResponse(aiResponse, message);
        } catch (error) {
            console.error('Error calling Claude API:', error);
            // Fallback to template response
            return this.getFallbackResponse(message, settings);
        }
    }

    private buildSystemPrompt(settings: AutoResponseSettings): string {
        return `You are an AI assistant for YEATZ Architecture Studio, helping manage client communications professionally and efficiently.

**Your Role:**
- Respond to architecture consultation inquiries professionally
- Assess urgency and priority of messages
- Protect the architect's personal time (especially weekends and after hours)
- Provide helpful information while setting appropriate boundaries
- Identify when human intervention is truly necessary

**Guidelines:**
1. Be professional, warm, and helpful
2. Acknowledge the client's inquiry
3. Provide relevant information about services, process, or next steps
4. Set clear expectations about response times during off-hours
5. Offer to schedule consultations during working hours
6. Flag urgent matters (safety issues, legal deadlines, emergencies) for immediate human review
7. Use Malaysian English and architecture industry terminology appropriately

**Working Hours:**
- Days: ${settings.workingDays.map(d => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]).join(', ')}
- Hours: ${settings.workingHours.start} - ${settings.workingHours.end}

**Response Format:**
Provide your response in this JSON structure:
{
    "response": "Your professional message to the client",
    "priority": "low|medium|high|urgent",
    "requiresHumanReview": true|false,
    "suggestedTags": ["tag1", "tag2"],
    "reasoning": "Brief explanation of your assessment"
}`;
    }

    private buildUserPrompt(
        message: ClientMessage,
        context?: { projectHistory?: string; clientHistory?: string }
    ): string {
        const currentTime = new Date(message.timestamp);
        const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6;
        const hour = currentTime.getHours();

        let prompt = `**New Client Message:**
Source: ${message.source}
Client: ${message.clientName}
${message.clientPhone ? `Phone: ${message.clientPhone}` : ''}
${message.clientEmail ? `Email: ${message.clientEmail}` : ''}
Time: ${message.timestamp}
Is Weekend: ${isWeekend}
Hour: ${hour}

**Message Content:**
"${message.content}"
`;

        if (context?.clientHistory) {
            prompt += `\n**Client History:**\n${context.clientHistory}\n`;
        }

        if (context?.projectHistory) {
            prompt += `\n**Related Project:**\n${context.projectHistory}\n`;
        }

        prompt += `\n**Task:**
Analyze this message and provide an appropriate response. Consider:
1. Is this truly urgent or can it wait until working hours?
2. What information can you provide now?
3. Does this require human review?
4. What's the appropriate tone given the time and context?`;

        return prompt;
    }

    private parseClaudeResponse(aiResponse: string, message: ClientMessage): ClaudeResponse {
        try {
            // Try to parse JSON response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    response: parsed.response || aiResponse,
                    priority: parsed.priority || message.priority || 'medium',
                    requiresHumanReview: parsed.requiresHumanReview || false,
                    suggestedTags: parsed.suggestedTags || ['general-inquiry']
                };
            }
        } catch (error) {
            console.error('Error parsing Claude response:', error);
        }

        // Fallback: use the entire response as text
        return {
            response: aiResponse,
            priority: message.priority || 'medium',
            requiresHumanReview: false,
            suggestedTags: ['general-inquiry']
        };
    }

    private getFallbackResponse(
        message: ClientMessage,
        settings: AutoResponseSettings
    ): ClaudeResponse {
        const now = new Date();
        const isWeekend = now.getDay() === 0 || now.getDay() === 6;
        const hour = now.getHours();
        const [startHour] = settings.workingHours.start.split(':').map(Number);
        const [endHour] = settings.workingHours.end.split(':').map(Number);
        const isAfterHours = hour < startHour || hour >= endHour;

        let response = '';
        if (isWeekend && settings.autoRespondOnWeekends) {
            response = settings.responseTemplates.weekendMessage;
        } else if (isAfterHours && settings.autoRespondOutsideHours) {
            response = settings.responseTemplates.afterHoursMessage;
        } else {
            response = settings.responseTemplates.generalInquiry;
        }

        // Check for escalation keywords
        const requiresEscalation = settings.escalationKeywords.some(keyword =>
            message.content.toLowerCase().includes(keyword.toLowerCase())
        );

        return {
            response,
            priority: requiresEscalation ? 'high' : 'medium',
            requiresHumanReview: requiresEscalation,
            suggestedTags: ['auto-response']
        };
    }

    async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 10,
                    messages: [
                        {
                            role: 'user',
                            content: 'Hello'
                        }
                    ]
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Claude API connection test failed:', error);
            return false;
        }
    }
}
