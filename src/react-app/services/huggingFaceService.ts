interface HuggingFaceResponse {
  response: string;
  tokensUsed?: number;
}

export class HuggingFaceAIService {
  private apiKey: string;
  private apiUrl = 'https://api-inference.huggingface.co/models';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(
    message: string,
    model: string = 'microsoft/DialoGPT-large',
    context?: string[]
  ): Promise<HuggingFaceResponse> {
    try {
      // Prepare the conversation history
      let prompt = '';
      if (context && context.length > 0) {
        prompt = context.join('\n') + '\n';
      }
      prompt += `User: ${message}\nAssistant:`;

      const response = await fetch(`${this.apiUrl}/${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract the generated text
      const generatedText = Array.isArray(data) && data[0]?.generated_text 
        ? data[0].generated_text 
        : typeof data === 'string' ? data : 'Sorry, I could not generate a response.';
      
      // Extract only the assistant's response part
      const assistantResponse = generatedText.split('Assistant:')[1]?.trim() || generatedText.trim();
      
      return {
        response: assistantResponse
      };
    } catch (error) {
      console.error('Error calling Hugging Face API:', error);
      return {
        response: 'Sorry, I\'m having trouble connecting to the AI service right now. Please try again later.'
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api-inference.huggingface.co/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Hugging Face API connection test failed:', error);
      return false;
    }
  }
}