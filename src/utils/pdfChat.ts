import OpenAI from 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    pageReferences?: number[];
    confidence?: number;
    timestamp?: number;
  };
}

export interface PDFChatOptions {
  onProgress?: (progress: { status: string; progress: number }) => void;
  settings?: {
    responseLength: 'concise' | 'balanced' | 'detailed';
    tone: 'technical' | 'simple';
    format: 'structured' | 'conversational';
    includePageRefs: boolean;
  };
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class PDFChatManager {
  private documentContent: string;
  private pageMap: Map<number, string>;
  private conversationHistory: ChatMessage[] = [];
  private keywordCache: Map<string, number[]> = new Map();

  constructor(documentContent: string, pageMap: Map<number, string>) {
    this.documentContent = documentContent;
    this.pageMap = pageMap;
    this.buildKeywordCache();
  }

  private buildKeywordCache() {
    // Extract and index important keywords from the document
    const words = this.documentContent.toLowerCase().split(/\W+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    
    words.forEach((word, index) => {
      if (!stopWords.has(word) && word.length > 3) {
        if (!this.keywordCache.has(word)) {
          this.keywordCache.set(word, []);
        }
        this.keywordCache.get(word)?.push(index);
      }
    });
  }

  private findRelevantPages(query: string): number[] {
    const queryWords = query.toLowerCase().split(/\W+/);
    const pageScores = new Map<number, number>();

    queryWords.forEach(word => {
      if (this.keywordCache.has(word)) {
        const occurrences = this.keywordCache.get(word)!;
        occurrences.forEach(index => {
          // Find which page this word occurrence belongs to
          let totalLength = 0;
          for (const [pageNum, content] of this.pageMap.entries()) {
            totalLength += content.length;
            if (totalLength > index) {
              pageScores.set(pageNum, (pageScores.get(pageNum) || 0) + 1);
              break;
            }
          }
        });
      }
    });

    // Sort pages by relevance score
    return Array.from(pageScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([pageNum]) => pageNum);
  }

  public async sendMessage(
    message: string,
    options: PDFChatOptions = {}
  ): Promise<ChatMessage> {
    try {
      const relevantPages = this.findRelevantPages(message);
      
      // Create system prompt based on settings
      const systemPrompt = `You are a helpful AI assistant specializing in analyzing documents.
You excel at providing clear, accurate, and contextually relevant responses.

${options.settings?.tone === 'technical' ? 'Use technical and precise language.' : 'Use clear and simple language.'}
${options.settings?.format === 'structured' ? 'Structure your responses with clear sections and bullet points.' : 'Maintain a conversational tone.'}
${options.settings?.includePageRefs ? 'Include page references in [Page X] format when citing specific information.' : ''}

Guidelines for your responses:
1. Use markdown formatting for emphasis (**bold** for important terms, *italic* for definitions)
2. Break down complex information into digestible parts
3. Provide examples when helpful
4. Acknowledge uncertainty when appropriate
5. Maintain coherence with previous conversation context

Use this document context to inform your responses:
${this.documentContent.slice(0, 2000)}`;

      // Prepare messages array with conversation history
      const messages = [
        { role: 'system', content: systemPrompt },
        ...this.conversationHistory.slice(-5), // Keep last 5 messages for context
        { role: 'user', content: message }
      ];

      if (options.onProgress) {
        options.onProgress({ status: 'Generating response...', progress: 50 });
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages.map(({ role, content }) => ({ role, content })),
        temperature: options.settings?.tone === 'technical' ? 0.3 : 0.6,
        max_tokens: options.settings?.responseLength === 'concise' ? 150 :
                   options.settings?.responseLength === 'detailed' ? 500 : 300,
        presence_penalty: 0.6, // Encourage more diverse responses
        frequency_penalty: 0.3, // Reduce repetition
      });

      const response = completion.choices[0]?.message?.content || 'Failed to generate response';

      const newMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        metadata: {
          pageReferences: relevantPages,
          timestamp: Date.now()
        }
      };

      // Update conversation history
      this.conversationHistory.push(
        { role: 'user', content: message },
        newMessage
      );

      if (options.onProgress) {
        options.onProgress({ status: 'Complete', progress: 100 });
      }

      return newMessage;
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error 
        ? `Failed to process message: ${error.message}`
        : 'An unexpected error occurred while processing your message';
      throw new Error(errorMessage);
    }
  }

  public getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  public clearHistory(): void {
    this.conversationHistory = [];
  }
}