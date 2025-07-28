import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';

export interface Message {
  id: string;
  topic: string;
  sender: string;
  content: any;
  metadata?: Record<string, any>;
  timestamp: Date;
  ttl?: number; // Time to live in milliseconds
}

export interface Subscription {
  id: string;
  subscriber: string;
  topic: string;
  filter?: (message: Message) => boolean;
  handler: (message: Message) => void | Promise<void>;
}

export class MessageBroker extends EventEmitter {
  private subscriptions: Map<string, Subscription[]>;
  private messageHistory: Map<string, Message[]>;
  private messageQueue: Map<string, Message[]>;
  private maxHistorySize: number;
  private processingInterval: NodeJS.Timeout | null;

  constructor(maxHistorySize: number = 1000) {
    super();
    this.subscriptions = new Map();
    this.messageHistory = new Map();
    this.messageQueue = new Map();
    this.maxHistorySize = maxHistorySize;
    this.processingInterval = null;

    this.startProcessing();
  }

  publish(
    topic: string,
    sender: string,
    content: any,
    metadata?: Record<string, any>
  ): void {
    const message: Message = {
      id: uuidv4(),
      topic,
      sender,
      content,
      metadata,
      timestamp: new Date(),
    };

    // Add to queue
    if (!this.messageQueue.has(topic)) {
      this.messageQueue.set(topic, []);
    }
    this.messageQueue.get(topic)!.push(message);

    // Add to history
    this.addToHistory(topic, message);

    logger.debug('Message published', {
      messageId: message.id,
      topic,
      sender,
    });

    this.emit('message.published', message);
  }

  subscribe(
    subscriber: string,
    topic: string,
    handler: (message: Message) => void | Promise<void>,
    filter?: (message: Message) => boolean
  ): string {
    const subscription: Subscription = {
      id: uuidv4(),
      subscriber,
      topic,
      filter,
      handler,
    };

    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, []);
    }
    this.subscriptions.get(topic)!.push(subscription);

    logger.debug('Subscription created', {
      subscriptionId: subscription.id,
      subscriber,
      topic,
    });

    this.emit('subscription.created', subscription);
    return subscription.id;
  }

  unsubscribe(subscriptionId: string): boolean {
    for (const [topic, subs] of this.subscriptions.entries()) {
      const index = subs.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        subs.splice(index, 1);
        if (subs.length === 0) {
          this.subscriptions.delete(topic);
        }

        logger.debug('Subscription removed', { subscriptionId, topic });
        this.emit('subscription.removed', { subscriptionId, topic });
        return true;
      }
    }
    return false;
  }

  unsubscribeAll(subscriber: string): number {
    let count = 0;

    for (const [topic, subs] of this.subscriptions.entries()) {
      const toRemove = subs.filter(sub => sub.subscriber === subscriber);

      for (const sub of toRemove) {
        if (this.unsubscribe(sub.id)) {
          count++;
        }
      }
    }

    return count;
  }

  async request(
    topic: string,
    sender: string,
    content: any,
    timeout: number = 5000
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const responseId = uuidv4();
      const responseTopic = `${topic}.response.${responseId}`;

      let timeoutHandle: NodeJS.Timeout;
      let subscriptionId: string;

      // Subscribe to response
      subscriptionId = this.subscribe(sender, responseTopic, message => {
        clearTimeout(timeoutHandle);
        this.unsubscribe(subscriptionId);
        resolve(message.content);
      });

      // Set timeout
      timeoutHandle = setTimeout(() => {
        this.unsubscribe(subscriptionId);
        reject(new Error(`Request timeout for topic ${topic}`));
      }, timeout);

      // Publish request
      this.publish(topic, sender, content, {
        responseId,
        responseTopic,
      });
    });
  }

  respond(originalMessage: Message, responder: string, response: any): void {
    if (originalMessage.metadata?.['responseTopic']) {
      this.publish(
        originalMessage.metadata['responseTopic'],
        responder,
        response,
        {
          originalMessageId: originalMessage.id,
          responseId: originalMessage.metadata['responseId'],
        }
      );
    }
  }

  getHistory(topic: string, limit?: number): Message[] {
    const history = this.messageHistory.get(topic) || [];

    if (limit && limit > 0) {
      return history.slice(-limit);
    }

    return [...history];
  }

  clearHistory(topic?: string): void {
    if (topic) {
      this.messageHistory.delete(topic);
    } else {
      this.messageHistory.clear();
    }
  }

  private startProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processQueues();
    }, 10);
  }

  private async processQueues(): Promise<void> {
    for (const [topic, messages] of this.messageQueue.entries()) {
      if (messages.length === 0) continue;

      const subscriptions = this.subscriptions.get(topic) || [];
      const subscriptionPatterns = this.getPatternSubscriptions(topic);
      const allSubscriptions = [...subscriptions, ...subscriptionPatterns];

      while (messages.length > 0) {
        const message = messages.shift()!;

        // Check TTL
        if (
          message.ttl &&
          Date.now() - message.timestamp.getTime() > message.ttl
        ) {
          logger.debug('Message expired', { messageId: message.id, topic });
          continue;
        }

        // Process subscriptions
        for (const subscription of allSubscriptions) {
          if (!subscription.filter || subscription.filter(message)) {
            try {
              await subscription.handler(message);

              this.emit('message.delivered', {
                messageId: message.id,
                subscriptionId: subscription.id,
              });
            } catch (error) {
              logger.error('Message handler error', {
                error,
                messageId: message.id,
                subscriptionId: subscription.id,
              });

              this.emit('message.error', {
                messageId: message.id,
                subscriptionId: subscription.id,
                error,
              });
            }
          }
        }
      }
    }
  }

  private getPatternSubscriptions(topic: string): Subscription[] {
    const patterns: Subscription[] = [];

    // Support wildcard subscriptions (e.g., "agent.*" matches "agent.created")
    for (const [pattern, subs] of this.subscriptions.entries()) {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
        if (regex.test(topic)) {
          patterns.push(...subs);
        }
      }
    }

    return patterns;
  }

  private addToHistory(topic: string, message: Message): void {
    if (!this.messageHistory.has(topic)) {
      this.messageHistory.set(topic, []);
    }

    const history = this.messageHistory.get(topic)!;
    history.push(message);

    // Limit history size
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {
      topics: this.subscriptions.size,
      totalSubscriptions: 0,
      queuedMessages: 0,
      historySize: 0,
    };

    for (const subs of this.subscriptions.values()) {
      metrics.totalSubscriptions += subs.length;
    }

    for (const messages of this.messageQueue.values()) {
      metrics.queuedMessages += messages.length;
    }

    for (const history of this.messageHistory.values()) {
      metrics.historySize += history.length;
    }

    return metrics;
  }
}
