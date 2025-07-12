import { env } from '@/lib/env';

export interface LLMProvider {
  name: string;
  available: boolean;
  priority: number;
  execute: (params: { prompt: string; language?: string }) => Promise<{ code: string; isFallback?: boolean; message?: string }>;
}

// Simple fallback response generator for common code assistance requests
export function generateSimpleFallback(prompt: string, language?: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Basic code templates for common requests
  if (lowerPrompt.includes('hello world')) {
    const templates: Record<string, string> = {
      javascript: 'console.log("Hello, World!");',
      python: 'print("Hello, World!")',
      java: 'System.out.println("Hello, World!");',
      cpp: 'std::cout << "Hello, World!" << std::endl;',
      go: 'fmt.Println("Hello, World!")',
      rust: 'println!("Hello, World!");',
    };
    return templates[language || 'javascript'] || templates.javascript;
  }
  
  if (lowerPrompt.includes('function') || lowerPrompt.includes('method')) {
    const templates: Record<string, string> = {
      javascript: `function exampleFunction(param) {
  // Add your code here
  return param;
}`,
      python: `def example_function(param):
    """Add your docstring here"""
    # Add your code here
    return param`,
      java: `public void exampleMethod(String param) {
    // Add your code here
}`,
    };
    return templates[language || 'javascript'] || templates.javascript;
  }
  
  // Default fallback message
  return `// Unable to generate code due to API limitations.
// Please try again later or implement manually.
// Request: ${prompt}`;
}

// Fallback provider that returns simple templates
export const fallbackProvider: LLMProvider = {
  name: 'fallback',
  available: true,
  priority: 999, // Lowest priority
  execute: async ({ prompt, language }: { prompt: string; language?: string }) => {
    return {
      code: generateSimpleFallback(prompt, language),
      isFallback: true,
      message: 'Using simplified fallback response due to API unavailability'
    };
  }
};

// Check which providers are available
export function getAvailableProviders(): LLMProvider[] {
  const providers: LLMProvider[] = [];
  
  // Gemini provider
  if (env.GEMINI_API_KEY) {
    providers.push({
      name: 'gemini',
      available: true,
      priority: 1,
      execute: async () => {
        // This will be called from the main API route
        throw new Error('Execute through main API route');
      }
    });
  }
  
  // OpenAI provider
  if (env.OPENAI_API_KEY) {
    providers.push({
      name: 'openai',
      available: true,
      priority: 2,
      execute: async () => {
        // This will be called from the main API route
        throw new Error('Execute through main API route');
      }
    });
  }
  
  // Always include fallback provider
  providers.push(fallbackProvider);
  
  return providers.sort((a, b) => a.priority - b.priority);
}

// Determine which provider to use based on availability and previous failures
export function selectProvider(
  preferredProvider?: string,
  failedProviders: string[] = []
): LLMProvider | null {
  const available = getAvailableProviders();
  
  // Try preferred provider first if specified and not failed
  if (preferredProvider) {
    const preferred = available.find(
      p => p.name === preferredProvider && !failedProviders.includes(p.name)
    );
    if (preferred) return preferred;
  }
  
  // Return first available provider that hasn't failed
  return available.find(p => !failedProviders.includes(p.name)) || null;
}

// Error recovery suggestions
export function getErrorRecoverySuggestions(error: Error & { status?: number; code?: string }): string[] {
  const suggestions: string[] = [];
  
  if (error.status === 429 || error.message?.includes('rate limit')) {
    suggestions.push('Wait a few moments before retrying');
    suggestions.push('Consider using a different LLM provider');
  }
  
  if (error.status === 503 || error.message?.includes('unavailable')) {
    suggestions.push('The service is temporarily unavailable');
    suggestions.push('Try again in a few minutes');
  }
  
  if (error.code === 'insufficient_quota') {
    suggestions.push('API quota has been exceeded');
    suggestions.push('Check your billing settings');
  }
  
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    suggestions.push('The request took too long to complete');
    suggestions.push('Try with a simpler prompt');
  }
  
  return suggestions;
}