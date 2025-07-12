import { EventEmitter } from 'events';

interface QueueItem {
  id: string;
  execute: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
  timestamp: number;
  retries: number;
}

export class RateLimiter extends EventEmitter {
  private queue: QueueItem[] = [];
  private processing: boolean = false;
  private requestsPerMinute: number;
  private requestsPerHour: number;
  private minuteWindow: number[] = [];
  private hourWindow: number[] = [];
  private concurrentRequests: number = 0;
  private maxConcurrent: number;
  private maxRetries: number;
  private retryDelay: number;

  constructor(options: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    maxConcurrent?: number;
    maxRetries?: number;
    retryDelay?: number;
  } = {}) {
    super();
    this.requestsPerMinute = options.requestsPerMinute || 60;
    this.requestsPerHour = options.requestsPerHour || 1000;
    this.maxConcurrent = options.maxConcurrent || 3;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const item: QueueItem = {
        id: Math.random().toString(36).substring(7),
        execute: fn as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
        timestamp: Date.now(),
        retries: 0
      };

      this.queue.push(item);
      this.emit('queued', { id: item.id, queueLength: this.queue.length });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      // Clean up old window entries
      const now = Date.now();
      this.minuteWindow = this.minuteWindow.filter(t => now - t < 60000);
      this.hourWindow = this.hourWindow.filter(t => now - t < 3600000);

      // Check rate limits
      if (this.minuteWindow.length >= this.requestsPerMinute) {
        const waitTime = 60000 - (now - this.minuteWindow[0]);
        this.emit('rate-limited', { waitTime, type: 'minute' });
        await this.delay(waitTime);
        continue;
      }

      if (this.hourWindow.length >= this.requestsPerHour) {
        const waitTime = 3600000 - (now - this.hourWindow[0]);
        this.emit('rate-limited', { waitTime, type: 'hour' });
        await this.delay(waitTime);
        continue;
      }

      // Check concurrent limit
      if (this.concurrentRequests >= this.maxConcurrent) {
        await this.delay(100);
        continue;
      }

      // Process next item
      const item = this.queue.shift()!;
      this.concurrentRequests++;
      this.minuteWindow.push(now);
      this.hourWindow.push(now);

      this.emit('processing', { id: item.id, concurrent: this.concurrentRequests });

      // Execute with retry logic
      this.executeWithRetry(item).finally(() => {
        this.concurrentRequests--;
        this.emit('completed', { id: item.id, concurrent: this.concurrentRequests });
      });
    }

    this.processing = false;
  }

  private async executeWithRetry(item: QueueItem): Promise<void> {
    try {
      const result = await item.execute();
      item.resolve(result);
    } catch (error) {
      item.retries++;
      
      // Check if we should retry
      const errorObj = error as { status?: number; message?: string };
      const shouldRetry = item.retries < this.maxRetries && 
        (errorObj.status === 429 || // Rate limit error
         errorObj.status === 503 || // Service unavailable
         (errorObj.status && errorObj.status >= 500));   // Server errors

      if (shouldRetry) {
        this.emit('retry', { 
          id: item.id, 
          attempt: item.retries, 
          error: errorObj.message || 'Unknown error' 
        });
        
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, item.retries - 1);
        await this.delay(delay);
        
        // Re-queue the item
        this.queue.unshift(item);
        this.concurrentRequests--;
      } else {
        item.reject(error);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    const now = Date.now();
    return {
      queueLength: this.queue.length,
      concurrentRequests: this.concurrentRequests,
      requestsLastMinute: this.minuteWindow.filter(t => now - t < 60000).length,
      requestsLastHour: this.hourWindow.filter(t => now - t < 3600000).length,
      limits: {
        perMinute: this.requestsPerMinute,
        perHour: this.requestsPerHour,
        maxConcurrent: this.maxConcurrent
      }
    };
  }

  clearQueue(): void {
    const items = [...this.queue];
    this.queue = [];
    items.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
    this.emit('queue-cleared', { count: items.length });
  }
}

// Create singleton instances for different LLM providers
export const geminiRateLimiter = new RateLimiter({
  requestsPerMinute: 30,
  requestsPerHour: 1000,
  maxConcurrent: 3,
  maxRetries: 3,
  retryDelay: 1000
});

export const openaiRateLimiter = new RateLimiter({
  requestsPerMinute: 60,
  requestsPerHour: 3000,
  maxConcurrent: 5,
  maxRetries: 3,
  retryDelay: 1000
});

// Optional: Log rate limiter events in development
if (process.env.NODE_ENV === 'development') {
  const logEvents = (limiter: RateLimiter, name: string) => {
    limiter.on('rate-limited', (data) => {
      console.log(`[${name}] Rate limited: ${data.type} window, wait ${data.waitTime}ms`);
    });
    limiter.on('retry', (data) => {
      console.log(`[${name}] Retrying request ${data.id}, attempt ${data.attempt}`);
    });
  };

  logEvents(geminiRateLimiter, 'Gemini');
  logEvents(openaiRateLimiter, 'OpenAI');
}