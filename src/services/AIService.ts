import { SecurityService } from './SecurityService';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export interface AIServiceConfig {
    apiKey: string;
    model?: string;
    baseUrl?: string;
}

const DEFAULT_MODEL = 'google/gemini-2.0-flash-exp:free';
const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';

export const AIService = {
    /**
     * Send a chat message and get a streaming response
     */
    async chat(
        messages: ChatMessage[],
        config: AIServiceConfig,
        onChunk: (chunk: string) => void
    ): Promise<string> {
        const { apiKey, model = DEFAULT_MODEL, baseUrl = DEFAULT_BASE_URL } = config;

        if (!apiKey) {
            throw new Error('API key is required. Go to Settings to add your OpenRouter key.');
        }

        // Sanitize messages to remove any accidentally pasted keys
        const sanitizedMessages = messages.map(m => ({
            role: m.role,
            content: SecurityService.sanitizeInput(m.content)
        }));

        try {
            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://multicortex.app',
                    'X-Title': 'MultiCortex'
                },
                body: JSON.stringify({
                    model,
                    messages: sanitizedMessages,
                    stream: true,
                    max_tokens: 2048
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`API Error: ${response.status} - ${error}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response stream available');

            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

                for (const line of lines) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content || '';
                        if (content) {
                            fullResponse += content;
                            onChunk(content);
                        }
                    } catch {
                        // Skip malformed JSON chunks
                    }
                }
            }

            return fullResponse;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Chat failed: ${message}`);
        }
    },

    /**
     * Generate a system prompt from context
     */
    buildSystemPrompt(projectContents: string[]): string {
        return `You are MultiCortex AI - a tactical second brain assistant. You help users analyze their captured data, find insights, and refine ideas.

CONTEXT FROM USER'S CAPTURED DATA:
${projectContents.length > 0 ? projectContents.join('\n---\n') : '(No data captured yet)'}

INSTRUCTIONS:
- Be concise and actionable
- Reference specific content from their data when relevant
- Suggest connections between ideas
- Help crystallize vague thoughts into clear insights
- Use tactical, professional language`;
    }
};
