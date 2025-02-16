import { EventEmitter } from '../eventEmitter';
import OpenAI from 'openai';

export interface SummaryProgress {
  status: string;
  progress: number;
  currentChunk: number;
  totalChunks: number;
}

export interface SummarizerOptions {
  onProgress?: (progress: SummaryProgress) => void;
  maxTokens?: number;
  temperature?: number;
  format?: 'bullets' | 'paragraphs';
  highlightKeyPoints?: boolean;
  preserveStructure?: boolean;
  extractDefinitions?: boolean;
}

// Create event emitter for loading events
export const loadingEvents = new EventEmitter();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Constants
const MAX_CHUNK_SIZE = 4000; // Maximum tokens per chunk for GPT-3.5-turbo
const OVERLAP_SIZE = 200; // Number of tokens to overlap between chunks

interface TextProcessingOptions {
  preserveFormatting: boolean;
  extractTables: boolean;
  domainType?: 'academic' | 'legal' | 'general';
  confidenceScoring: boolean;
}

export async function initializeSummarizer() {
  try {
    loadingEvents.emit('start');
    
    // Verify API key is available
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found');
    }
    
    loadingEvents.emit('progress', 100);
    return true;
  } catch (error) {
    console.error('Failed to initialize summarizer:', error);
    loadingEvents.emit('error', error);
    return false;
  }
}

function splitTextIntoChunks(text: string): string[] {
  // Simple word-based chunking
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;
  let tableData = [];
  let inTable = false;
  
  for (const word of words) {
    // Table detection
    if (word.match(/^\|.*\|$/)) {
      inTable = true;
      tableData.push(word);
      continue;
    } else if (inTable) {
      // End of table
      if (tableData.length > 0) {
        chunks.push(processTable(tableData));
        tableData = [];
        inTable = false;
      }
    }

    // Rough estimate: 1 word ≈ 1.3 tokens
    const estimatedTokens = Math.ceil(word.length * 1.3);
    
    if (currentLength + estimatedTokens > MAX_CHUNK_SIZE - OVERLAP_SIZE) {
      // Add current chunk if not empty
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
        // Keep some overlap for context
        const overlapWords = currentChunk.slice(-Math.floor(OVERLAP_SIZE / 1.3));
        currentChunk = [...overlapWords];
        currentLength = overlapWords.reduce((sum, word) => sum + Math.ceil(word.length * 1.3), 0);
      }
    }
    
    currentChunk.push(word);
    currentLength += estimatedTokens;
  }
  
  // Add the last chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }
  
  return chunks;
}

function processTable(tableData: string[]): string {
  // Convert ASCII/markdown tables to structured format
  return tableData
    .map(row => row.split('|').filter(cell => cell.trim()).join(' | '))
    .join('\n');
}

function preprocessText(text: string): string {
  return text
    .replace(/([.!?])\s+/g, '$1\n') // Sentence boundaries
    .replace(/\n{3,}/g, '\n\n') // Normalize paragraph breaks
    .replace(/\[(\d+)\]/g, '(citation: $1)') // Preserve citations
    .trim();
}

function calculateConfidenceScore(summary: string, original: string): number {
  // Implement confidence scoring based on:
  // - Key phrase preservation
  // - Semantic similarity
  // - Citation preservation
  // Returns a score between 0 and 1
  return 0.85; // Placeholder
}

export async function summarizeText(
  text: string, 
  options: SummarizerOptions = {}
): Promise<string> {
  const { 
    onProgress, 
    maxTokens = 1000, 
    temperature = 0.5,
    domainType = 'general',
    confidenceScoring = false
  } = options;
  
  try {
    if (!text.trim()) {
      return '';
    }

    // Preprocess text
    const processedText = preprocessText(text);

    // Split text into chunks if needed
    const chunks = splitTextIntoChunks(processedText);
    const summaries: string[] = [];
    const confidenceScores: number[] = [];

    for (let i = 0; i < chunks.length; i++) {
      if (onProgress) {
        onProgress({
          status: 'Generating summary...',
          progress: (i / chunks.length) * 100,
          currentChunk: i + 1,
          totalChunks: chunks.length
        });
      }

      const prompt = chunks.length > 1 
        ? `Please summarize this part of the text (Part ${i + 1}/${chunks.length}). Focus on key points and maintain continuity with other parts. ${
            options.format === 'bullets' 
              ? 'Format the output as a clean bullet-point list with each point starting with a single dash (-). Do not use empty lines between points. Preserve any citations in parentheses.' 
              : 'Format the output as paragraphs.'
          } Use markdown formatting for emphasis: **bold** for important terms, *italic* for definitions, and \`code\` for technical terms.\n\n${chunks[i]}`
        : `Please provide a comprehensive ${options.format === 'bullets' ? 'bullet-point' : 'paragraph-style'} summary of the following text, focusing on the main points and key details. ${
            options.format === 'bullets' ? 'Format the summary as bullet points.' : 'Format the summary as paragraphs.'
          } ${
            options.format === 'bullets'
              ? 'Use a single dash (-) for each point and do not include empty lines between points.'
              : ''
          } ${options.highlightKeyPoints ? 'Use markdown formatting to highlight key points and important concepts.' : ''}\n\n${chunks[i]}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a precise and concise summarizer specializing in ${domainType} content. Create clear, accurate summaries while preserving key information and context. Use markdown formatting:
              - **bold** for important terms and concepts
              - *italic* for definitions, explanations, and key insights
              - \`code\` for technical terms
              - __underline__ for emphasis
              - ~~strikethrough~~ for corrections or updates
              - Preserve citations in (citation: X) format
              - Maintain hierarchical structure
              - Preserve mathematical formulas
              ${options.format === 'bullets' 
                ? 'Format output as clear, concise bullet points. Each point must start with a single dash (-). Do not include empty lines between points. Do not use nested bullets.' 
                : 'Format output as well-structured paragraphs'}
              Ensure proper formatting, maintain readability, and emphasize key concepts.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        presence_penalty: 0.2,
        frequency_penalty: 0.5
      });

      const summary = response.choices[0]?.message?.content || '';
      summaries.push(summary);
      
      if (confidenceScoring) {
        const score = calculateConfidenceScore(summary, chunks[i]);
        confidenceScores.push(score);
      }
    }

    // If we had multiple chunks, create a final summary
    let finalSummary = summaries.join('\n\n');
    if (chunks.length > 1) {
      if (onProgress) {
        onProgress({
          status: 'Creating final summary...',
          progress: 95,
          currentChunk: chunks.length,
          totalChunks: chunks.length
        });
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a precise and concise summarizer. Create a unified summary from multiple parts while maintaining coherence and flow.'
          },
          {
            role: 'user',
            content: `Please create a coherent final summary from these individual summaries:\n\n${finalSummary}`
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        presence_penalty: 0.2,
        frequency_penalty: 0.5
      });

      finalSummary = response.choices[0]?.message?.content || finalSummary;
      
      if (confidenceScoring) {
        const overallScore = confidenceScores.reduce((a, b) => a + b) / confidenceScores.length;
        finalSummary = `[Confidence Score: ${Math.round(overallScore * 100)}%]\n\n${finalSummary}`;
      }
    }

    if (onProgress) {
      onProgress({
        status: 'Summary complete',
        progress: 100,
        currentChunk: chunks.length,
        totalChunks: chunks.length
      });
    }

    return finalSummary;
  } catch (error) {
    console.error('Summarization failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate summary');
  }
}