import { parseJSON } from 'partial-json';

/**
 * Extract JSON blocks from streaming text
 * Looks for content between ```json and ``` markers
 */
export function extractJSONBlocks(text: string): Array<{ raw: string; parsed: any; isComplete: boolean }> {
  const blocks: Array<{ raw: string; parsed: any; isComplete: boolean }> = [];
  
  // Pattern to match ```json ... ``` blocks
  const jsonBlockRegex = /```json\s*([\s\S]*?)(?:```|$)/g;
  let match;
  
  while ((match = jsonBlockRegex.exec(text)) !== null) {
    const rawJSON = match[1]?.trim() || '';
    const isComplete = text.substring(match.index).includes('```', match[0].indexOf(rawJSON) + rawJSON.length);
    
    if (rawJSON) {
      try {
        // Try to parse with partial-json (handles incomplete JSON)
        const parsed = parseJSON(rawJSON);
        blocks.push({ raw: rawJSON, parsed, isComplete });
      } catch (error) {
        // If even partial-json fails, include the raw text
        console.warn('Failed to parse JSON block:', error);
        blocks.push({ raw: rawJSON, parsed: null, isComplete });
      }
    }
  }
  
  return blocks;
}

/**
 * Extract the last (most recent) JSON block from text
 */
export function extractLatestJSON(text: string): { parsed: any; isComplete: boolean } | null {
  const blocks = extractJSONBlocks(text);
  if (blocks.length === 0) return null;
  
  const latest = blocks[blocks.length - 1];
  return latest ? { parsed: latest.parsed, isComplete: latest.isComplete } : null;
}

/**
 * Stream parser class for handling Server-Sent Events
 */
export class StreamParser {
  private buffer = '';
  private fullText = '';
  
  /**
   * Parse a chunk of SSE data
   */
  parseChunk(chunk: string): Array<{
    type: string;
    data: any;
  }> {
    this.buffer += chunk;
    const events: Array<{ type: string; data: any }> = [];
    
    // Split by double newline (SSE message separator)
    const messages = this.buffer.split('\n\n');
    
    // Keep the last incomplete message in buffer
    this.buffer = messages.pop() || '';
    
    for (const message of messages) {
      if (!message.trim()) continue;
      
      // Parse SSE format: "data: {...}"
      const lines = message.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            // Track full text for JSON extraction
            if (data.type === 'text' && data.text) {
              this.fullText += data.text;
              
              // Try to extract JSON from accumulated text
              const jsonData = extractLatestJSON(this.fullText);
              if (jsonData) {
                events.push({
                  type: 'json',
                  data: {
                    ...data,
                    json: jsonData.parsed,
                    jsonComplete: jsonData.isComplete,
                  },
                });
              } else {
                events.push({ type: data.type, data });
              }
            } else {
              events.push({ type: data.type, data });
            }
          } catch (error) {
            console.warn('Failed to parse SSE data:', error);
          }
        }
      }
    }
    
    return events;
  }
  
  /**
   * Get the accumulated full text
   */
  getFullText(): string {
    return this.fullText;
  }
  
  /**
   * Get all JSON blocks from the full text
   */
  getAllJSON(): Array<{ raw: string; parsed: any; isComplete: boolean }> {
    return extractJSONBlocks(this.fullText);
  }
  
  /**
   * Reset the parser state
   */
  reset(): void {
    this.buffer = '';
    this.fullText = '';
  }
}

/**
 * Utility to merge partial JSON with previous state
 * Useful for progressive updates in UI
 */
export function mergePartialJSON(previous: any, current: any): any {
  if (!current) return previous;
  if (!previous) return current;
  
  // If both are objects, merge recursively
  if (typeof previous === 'object' && typeof current === 'object' && !Array.isArray(previous) && !Array.isArray(current)) {
    return { ...previous, ...current };
  }
  
  // Otherwise, current overwrites previous
  return current;
}

/**
 * Validate JSON against expected structure
 * Returns true if JSON has all required keys
 */
export function validateJSONStructure(data: any, requiredKeys: string[]): boolean {
  if (!data || typeof data !== 'object') return false;
  
  return requiredKeys.every(key => key in data);
}

/**
 * Extract specific field from JSON with fallback
 */
export function extractField<T>(data: any, path: string, fallback: T): T {
  const keys = path.split('.');
  let current = data;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return fallback;
    }
  }
  
  return current as T;
}
