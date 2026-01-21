# 🤖 AI Communication Manager - Setup Guide

## Overview

The **YTZ Project Tracker** now includes an **AI Communication Manager** powered by **Claude AI** to automatically handle client inquiries via WhatsApp Business, protecting your personal time while maintaining professional client relationships.

## 🎯 Features

- ✅ **WhatsApp Business Integration** - Receive and respond to client messages automatically
- ✅ **Claude AI Auto-Response** - Intelligent, context-aware responses
- ✅ **Boundary Protection** - Automatically handle weekend/after-hours messages
- ✅ **Priority Detection** - Identifies urgent matters requiring human attention
- ✅ **Message Dashboard** - Track all client communications in one place
- ✅ **Customizable Settings** - Configure working hours, response templates, and escalation keywords

---

## 📋 Prerequisites

### 1. Claude AI API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

### 2. WhatsApp Business API (Optional for Production)
For production deployment with real WhatsApp integration:
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use existing
3. Add **WhatsApp** product
4. Get your:
   - Phone Number ID
   - Access Token
   - Verify Token (create your own secure string)

---

## 🚀 Quick Start (Local Testing)

### Step 1: Configure Claude API Key

1. Open the app and navigate to **Communications** in the sidebar
2. Click the **Settings** icon (⚙️)
3. Enter your Claude API key in the **Claude API Key** field
4. Click **Test Connection** to verify
5. Configure your working hours and preferences
6. Click **Save Settings**

### Step 2: Test with Mock Data

The app comes with mock client messages for testing:
- View messages in the Communications dashboard
- See AI responses
- Test status changes (New → Resolved, Escalated, etc.)
- Review communication statistics

---

## 🔧 Production Setup (WhatsApp Business)

### Step 1: Configure Environment Variables

Create a `.env` file in your project root:

```env
# Claude AI
CLAUDE_API_KEY=sk-ant-your-api-key-here

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_VERIFY_TOKEN=your-custom-verify-token
```

### Step 2: Update Wrangler Configuration

Edit `wrangler.json` to add your secrets:

```json
{
  "name": "ytz-project-tracker",
  "compatibility_date": "2024-01-01",
  "vars": {
    "WHATSAPP_VERIFY_TOKEN": "your-custom-verify-token"
  }
}
```

Add secrets via Wrangler CLI:

```bash
# Add Claude API key
npx wrangler secret put CLAUDE_API_KEY

# Add WhatsApp access token
npx wrangler secret put WHATSAPP_ACCESS_TOKEN

# Add WhatsApp phone number ID
npx wrangler secret put WHATSAPP_PHONE_NUMBER_ID
```

### Step 3: Configure WhatsApp Webhook

1. In Meta for Developers, go to your WhatsApp app
2. Navigate to **Configuration**
3. Set webhook URL: `https://your-app-url.workers.dev/whatsapp/webhook`
4. Set verify token: (same as `WHATSAPP_VERIFY_TOKEN` in your env)
5. Subscribe to **messages** webhook field

### Step 4: Deploy to Cloudflare Workers

```bash
# Build the project
npm run build

# Deploy to Cloudflare
npx wrangler deploy
```

---

## 💡 How It Works

### Message Flow

1. **Client sends WhatsApp message** → WhatsApp Business API
2. **Webhook receives message** → Your Cloudflare Worker
3. **Message stored** → Database (D1)
4. **Claude AI analyzes** → Determines priority, urgency, and appropriate response
5. **Auto-response sent** → Back to client via WhatsApp
6. **Dashboard updated** → You can review in the Communications view

### Intelligent Features

#### 🧠 Priority Detection
- **Urgent**: Contains keywords like "urgent", "emergency", "deadline"
- **High**: New business inquiries, large projects
- **Medium**: General consultations, project updates
- **Low**: Thank you messages, acknowledgments

#### ⏰ Time-Based Responses
- **Weekends**: Sends weekend template message
- **After Hours**: Sends after-hours template message
- **Working Hours**: Provides detailed, helpful responses

#### 🚨 Escalation
Messages containing escalation keywords are:
- Flagged for human review
- Marked with "Requires Review" badge
- Sent a priority acknowledgment
- Highlighted in the dashboard

---

## 🎨 Customization

### Response Templates

Customize templates in Settings:

1. **Weekend Message**: Sent on Saturdays/Sundays
2. **After Hours Message**: Sent outside working hours
3. **General Inquiry**: Default response for new inquiries
4. **Consultation Request**: For consultation-specific messages
5. **Urgent Matter**: For escalated messages

### Working Hours

Configure your availability:
- **Working Days**: Select which days you work (Mon-Fri default)
- **Working Hours**: Set start/end times (9 AM - 6 PM default)
- **Auto-respond options**: Toggle weekend and after-hours responses

### Escalation Keywords

Add keywords that trigger human review:
```
urgent, emergency, deadline, legal, safety, collapse, danger, asap, immediately, critical
```

---

## 📊 Dashboard Features

### Statistics
- **Total Messages**: All messages received
- **AI Responded**: Messages handled automatically
- **Needs Review**: Messages requiring your attention
- **Avg Response Time**: How quickly AI responds

### Message Management
- **Filter by Status**: New, AI Responded, Escalated, Resolved, Archived
- **Filter by Priority**: Urgent, High, Medium, Low
- **Search**: Find messages by client name, phone, or content
- **Quick Actions**: Mark as resolved, escalate, or archive

---

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate API keys** regularly
4. **Monitor usage** in Claude and WhatsApp dashboards
5. **Set spending limits** in Anthropic console

---

## 💰 Cost Estimation

### Claude AI (Anthropic)
- **Model**: Claude 3.5 Sonnet
- **Cost**: ~$3 per million input tokens, ~$15 per million output tokens
- **Typical message**: ~500 tokens total
- **Estimated**: $0.01 - $0.02 per message
- **100 messages/day**: ~$1-2/day or $30-60/month

### WhatsApp Business API
- **Conversation-based pricing**
- **First 1,000 conversations/month**: Free
- **After that**: Varies by country (~$0.005-0.05 per conversation)

---

## 🐛 Troubleshooting

### Claude API Connection Failed
- ✅ Check API key is correct
- ✅ Verify you have credits in Anthropic account
- ✅ Check internet connection
- ✅ Review API rate limits

### WhatsApp Webhook Not Receiving Messages
- ✅ Verify webhook URL is correct
- ✅ Check verify token matches
- ✅ Ensure webhook is subscribed to "messages" field
- ✅ Check Cloudflare Worker logs

### Messages Not Auto-Responding
- ✅ Verify "AI Auto-Response" is enabled in settings
- ✅ Check Claude API key is configured
- ✅ Review working hours settings
- ✅ Check message doesn't contain escalation keywords

---

## 📱 Testing Without WhatsApp

You can test the AI responses without WhatsApp:

1. Use the **mock data** provided in the app
2. Manually add test messages in the dashboard
3. Test the Claude AI service directly:

```typescript
import { ClaudeAIService } from './services/claudeService';

const service = new ClaudeAIService('your-api-key');
const response = await service.analyzeAndRespond(testMessage, settings);
console.log(response);
```

---

## 🎯 Next Steps

1. ✅ **Test locally** with mock data
2. ✅ **Configure Claude API** key
3. ✅ **Customize templates** and settings
4. ✅ **Set up WhatsApp Business** (optional)
5. ✅ **Deploy to production**
6. ✅ **Monitor and refine** responses

---

## 📞 Support

For issues or questions:
- Review the [Anthropic API Documentation](https://docs.anthropic.com)
- Check [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- Review [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

---

## 🎉 Benefits

### For You
- 🏖️ **Enjoy weekends** without constant interruptions
- ⏰ **Protect personal time** with automated responses
- 📊 **Stay organized** with centralized message tracking
- 🎯 **Focus on urgent matters** only

### For Clients
- ⚡ **Instant responses** 24/7
- 💬 **Professional communication** always
- 📅 **Clear expectations** about response times
- ✅ **Better service** overall

---

**Made with ❤️ for YEATZ Architecture Studio**
