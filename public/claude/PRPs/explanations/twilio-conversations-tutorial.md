# Twilio Conversations for CRM Integration: Complete Tutorial

## Table of Contents
1. [Overview](#overview)
2. [Architecture Design](#architecture-design)
3. [Setup and Configuration](#setup-and-configuration)
4. [Implementation Guide](#implementation-guide)
5. [Message Monitoring](#message-monitoring)
6. [AI Integration](#ai-integration)
7. [Automation Workflows](#automation-workflows)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Overview

This tutorial demonstrates how to build a CRM system that observes WhatsApp and Email conversations between agents and customers using Twilio Conversations API. The system acts as a "backend brain" to:

- Monitor conversations without being the primary interface
- Extract conversation context using AI
- Detect sales stages and action items
- Trigger automated responses and reminders
- Maintain conversation history for CRM purposes

## Architecture Design

### System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WhatsApp      │    │   Email Client   │    │   Agent Phone   │
│   Customer      │◄──►│   Customer       │◄──►│   Direct Comm   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Twilio Conversations  │
                    │      Service            │
                    └────────────┬────────────┘
                                 │ Webhooks
                    ┌────────────▼────────────┐
                    │     Your CRM System     │
                    │                         │
                    │  ┌─────────────────┐   │
                    │  │   AI Analysis   │   │
                    │  │   Engine        │   │
                    │  └─────────────────┘   │
                    │                         │
                    │  ┌─────────────────┐   │
                    │  │  Task Manager   │   │
                    │  │  & Scheduler    │   │
                    │  └─────────────────┘   │
                    └─────────────────────────┘
```

### Data Flow

1. **Message Sent**: Customer/Agent sends WhatsApp or Email
2. **Twilio Receives**: Twilio Conversations captures the message
3. **Webhook Triggered**: Real-time event sent to your CRM
4. **AI Analysis**: Extract stage, sentiment, action items
5. **CRM Action**: Update records, schedule tasks, send automated responses

## Setup and Configuration

### 1. Twilio Account Setup

```bash
# Install Twilio CLI
npm install -g twilio-cli

# Login to your account
twilio login

# Create a Conversations Service
twilio api:conversations:v1:services:create \
    --friendly-name "CRM Conversation Service"
```

### 2. Environment Variables

```env
# .env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_CONVERSATION_SERVICE_SID=your_service_sid
WEBHOOK_BASE_URL=https://your-crm-domain.com
```

### 3. Webhook Configuration

```javascript
// webhook-config.js
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function configureWebhooks() {
  try {
    // Configure service-level webhooks
    await client.conversations.v1
      .configuration()
      .webhooks()
      .update({
        postWebhookUrl: `${process.env.WEBHOOK_BASE_URL}/webhooks/conversations`,
        method: 'POST',
        filters: [
          'onMessageAdded',
          'onConversationUpdated',
          'onParticipantAdded',
          'onParticipantUpdated'
        ]
      });
    
    console.log('Webhooks configured successfully');
  } catch (error) {
    console.error('Webhook configuration failed:', error);
  }
}

configureWebhooks();
```

## Implementation Guide

### 1. Core CRM Integration

```javascript
// crm-integration.js
const express = require('express');
const twilio = require('twilio');
const app = express();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Webhook endpoint for Twilio events
app.post('/webhooks/conversations', async (req, res) => {
  const event = req.body;
  
  try {
    await handleConversationEvent(event);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Error processing webhook');
  }
});

async function handleConversationEvent(event) {
  const { EventType, ConversationSid, MessageSid, Body, Author } = event;
  
  switch (EventType) {
    case 'onMessageAdded':
      await processNewMessage({
        conversationId: ConversationSid,
        messageId: MessageSid,
        content: Body,
        author: Author,
        timestamp: new Date()
      });
      break;
      
    case 'onConversationUpdated':
      await updateConversationMetadata(ConversationSid, event);
      break;
      
    default:
      console.log(`Unhandled event type: ${EventType}`);
  }
}
```

### 2. Conversation Management

```javascript
// conversation-manager.js
class ConversationManager {
  constructor(twilioClient) {
    this.client = twilioClient;
  }

  // Create a new conversation for agent-customer pair
  async createConversation(agentId, customerId, customerPhone, customerEmail) {
    try {
      const conversation = await this.client.conversations.v1
        .services(process.env.TWILIO_CONVERSATION_SERVICE_SID)
        .conversations
        .create({
          friendlyName: `Agent-${agentId}-Customer-${customerId}`,
          attributes: JSON.stringify({
            agentId,
            customerId,
            stage: 'initial_contact',
            createdAt: new Date().toISOString()
          })
        });

      // Add WhatsApp participant if phone provided
      if (customerPhone) {
        await this.addWhatsAppParticipant(conversation.sid, customerPhone);
      }

      // Add Email participant if email provided
      if (customerEmail) {
        await this.addEmailParticipant(conversation.sid, customerEmail);
      }

      return conversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  async addWhatsAppParticipant(conversationSid, phoneNumber) {
    return await this.client.conversations.v1
      .services(process.env.TWILIO_CONVERSATION_SERVICE_SID)
      .conversations(conversationSid)
      .participants
      .create({
        'messagingBinding.address': `whatsapp:${phoneNumber}`,
        'messagingBinding.proxyAddress': process.env.TWILIO_WHATSAPP_NUMBER
      });
  }

  async addEmailParticipant(conversationSid, emailAddress) {
    return await this.client.conversations.v1
      .services(process.env.TWILIO_CONVERSATION_SERVICE_SID)
      .conversations(conversationSid)
      .participants
      .create({
        'messagingBinding.address': `email:${emailAddress}`,
        'messagingBinding.proxyAddress': process.env.TWILIO_EMAIL_ADDRESS
      });
  }

  // Retrieve conversation history
  async getConversationMessages(conversationSid, limit = 50) {
    return await this.client.conversations.v1
      .services(process.env.TWILIO_CONVERSATION_SERVICE_SID)
      .conversations(conversationSid)
      .messages
      .list({ limit });
  }

  // Send automated message
  async sendMessage(conversationSid, messageBody, author = 'system') {
    return await this.client.conversations.v1
      .services(process.env.TWILIO_CONVERSATION_SERVICE_SID)
      .conversations(conversationSid)
      .messages
      .create({
        body: messageBody,
        author: author
      });
  }
}
```

## Message Monitoring

### 1. Real-time Message Processing

```javascript
// message-processor.js
class MessageProcessor {
  constructor(aiEngine, taskManager) {
    this.aiEngine = aiEngine;
    this.taskManager = taskManager;
  }

  async processNewMessage(messageData) {
    const { conversationId, content, author, timestamp } = messageData;
    
    try {
      // Skip processing system messages
      if (author === 'system') return;

      // Get conversation context
      const conversationHistory = await this.getConversationContext(conversationId);
      
      // AI Analysis
      const analysis = await this.aiEngine.analyzeMessage({
        message: content,
        author,
        conversationHistory,
        timestamp
      });

      // Update CRM records
      await this.updateCRMRecords(conversationId, analysis);

      // Handle detected actions
      if (analysis.actionItems && analysis.actionItems.length > 0) {
        await this.handleActionItems(conversationId, analysis.actionItems);
      }

      // Update conversation stage if changed
      if (analysis.stageChange) {
        await this.updateConversationStage(conversationId, analysis.newStage);
      }

    } catch (error) {
      console.error('Message processing failed:', error);
    }
  }

  async getConversationContext(conversationId) {
    // Retrieve recent messages for context
    const conversationManager = new ConversationManager(client);
    const messages = await conversationManager.getConversationMessages(conversationId, 20);
    
    return messages.map(msg => ({
      author: msg.author,
      body: msg.body,
      timestamp: msg.dateCreated
    }));
  }

  async updateCRMRecords(conversationId, analysis) {
    // Update your CRM database
    await db.conversations.update(conversationId, {
      lastActivity: new Date(),
      sentiment: analysis.sentiment,
      stage: analysis.stage,
      confidence: analysis.confidence,
      summary: analysis.summary
    });
  }
}
```

### 2. Event Streaming Setup (Recommended)

```javascript
// event-streaming.js
const EventSource = require('eventsource');

class TwilioEventStreaming {
  constructor() {
    this.eventSource = null;
  }

  startListening() {
    const streamUrl = `https://events.twilio.com/v1/Subscriptions/${process.env.TWILIO_SUBSCRIPTION_SID}/Events`;
    
    this.eventSource = new EventSource(streamUrl, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`
      }
    });

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleStreamEvent(data);
    };

    this.eventSource.onerror = (error) => {
      console.error('Event stream error:', error);
      // Implement retry logic
      setTimeout(() => this.startListening(), 5000);
    };
  }

  async handleStreamEvent(eventData) {
    if (eventData.EventType === 'com.twilio.conversations.message.added') {
      await this.processConversationMessage(eventData);
    }
  }

  stop() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
```

## AI Integration

### 1. AI Analysis Engine

```javascript
// ai-engine.js
class AIAnalysisEngine {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async analyzeMessage(messageData) {
    const { message, author, conversationHistory } = messageData;
    
    const prompt = this.buildAnalysisPrompt(message, author, conversationHistory);
    
    try {
      const response = await this.callAIService(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getFallbackAnalysis(message);
    }
  }

  buildAnalysisPrompt(message, author, history) {
    return `
      Analyze this sales conversation message and extract:
      1. Current sales stage (initial_contact, qualification, negotiation, paperwork, closing)
      2. Sentiment (positive, neutral, negative)
      3. Action items for the agent
      4. Suggested automated responses
      5. Priority level (low, medium, high)
      
      Current message from ${author}: "${message}"
      
      Conversation history:
      ${history.map(h => `${h.author}: ${h.body}`).join('\n')}
      
      Respond in JSON format:
      {
        "stage": "current_stage",
        "stageChange": true/false,
        "newStage": "new_stage_if_changed",
        "sentiment": "sentiment_value",
        "confidence": 0.95,
        "actionItems": [
          {
            "action": "send_brochure",
            "priority": "medium",
            "dueDate": "2024-01-15",
            "description": "Customer requested product information"
          }
        ],
        "suggestedResponses": [
          "I'll send you the brochure right away. Is there anything specific you'd like to know?"
        ],
        "summary": "Customer expressed interest in product features"
      }
    `;
  }

  async callAIService(prompt) {
    // Replace with your AI service (OpenAI, Claude, etc.)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  parseAIResponse(response) {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.getFallbackAnalysis();
    }
  }

  getFallbackAnalysis(message = '') {
    return {
      stage: 'unknown',
      stageChange: false,
      sentiment: 'neutral',
      confidence: 0.5,
      actionItems: [],
      suggestedResponses: [],
      summary: `Message received: ${message.substring(0, 50)}...`
    };
  }
}
```

### 2. Stage Detection Rules

```javascript
// stage-detector.js
class StageDetector {
  constructor() {
    this.stageRules = {
      initial_contact: {
        keywords: ['interested', 'information', 'tell me more', 'hello', 'hi'],
        patterns: [/first time/i, /heard about/i, /looking for/i]
      },
      qualification: {
        keywords: ['budget', 'timeline', 'requirements', 'needs'],
        patterns: [/how much/i, /when do you need/i, /what kind of/i]
      },
      negotiation: {
        keywords: ['price', 'discount', 'deal', 'offer', 'consider'],
        patterns: [/can you do better/i, /think about it/i, /talk to/i]
      },
      paperwork: {
        keywords: ['contract', 'documents', 'sign', 'paperwork', 'forms'],
        patterns: [/send the contract/i, /ready to sign/i, /need documents/i]
      },
      closing: {
        keywords: ['agreed', 'deal', 'yes', 'proceed', 'go ahead'],
        patterns: [/let's do it/i, /move forward/i, /ready to proceed/i]
      }
    };
  }

  detectStage(message, currentStage) {
    const messageLower = message.toLowerCase();
    let bestMatch = { stage: currentStage, score: 0 };

    for (const [stage, rules] of Object.entries(this.stageRules)) {
      let score = 0;

      // Keyword matching
      rules.keywords.forEach(keyword => {
        if (messageLower.includes(keyword)) score += 1;
      });

      // Pattern matching
      rules.patterns.forEach(pattern => {
        if (pattern.test(message)) score += 2;
      });

      if (score > bestMatch.score) {
        bestMatch = { stage, score };
      }
    }

    return bestMatch.score > 0 ? bestMatch.stage : currentStage;
  }
}
```

## Automation Workflows

### 1. Task Management

```javascript
// task-manager.js
class TaskManager {
  constructor(scheduler) {
    this.scheduler = scheduler;
  }

  async createTask(conversationId, actionItem) {
    const task = {
      id: this.generateTaskId(),
      conversationId,
      type: actionItem.action,
      description: actionItem.description,
      priority: actionItem.priority,
      dueDate: new Date(actionItem.dueDate),
      status: 'pending',
      createdAt: new Date()
    };

    // Save to database
    await db.tasks.create(task);

    // Schedule reminder if needed
    if (task.dueDate > new Date()) {
      await this.scheduleReminder(task);
    }

    return task;
  }

  async scheduleReminder(task) {
    const reminderTime = new Date(task.dueDate.getTime() - (24 * 60 * 60 * 1000)); // 24 hours before
    
    await this.scheduler.schedule(reminderTime, {
      type: 'task_reminder',
      taskId: task.id,
      conversationId: task.conversationId
    });
  }

  async executeAutomatedResponse(conversationId, analysis) {
    if (analysis.suggestedResponses && analysis.suggestedResponses.length > 0) {
      const response = analysis.suggestedResponses[0];
      
      // Add delay to make it feel natural
      setTimeout(async () => {
        const conversationManager = new ConversationManager(client);
        await conversationManager.sendMessage(conversationId, response, 'assistant');
      }, 2000); // 2 second delay
    }
  }
}
```

### 2. Follow-up Scheduler

```javascript
// follow-up-scheduler.js
class FollowUpScheduler {
  constructor() {
    this.followUpRules = {
      negotiation: {
        noResponseHours: 48,
        message: "Hi! Just checking in. Did you have a chance to discuss with your partner?"
      },
      qualification: {
        noResponseHours: 24,
        message: "Hope you're doing well! Do you have any questions about our products?"
      },
      paperwork: {
        noResponseHours: 72,
        message: "Just following up on the documents. Let me know if you need any clarification!"
      }
    };
  }

  async scheduleFollowUp(conversationId, stage, lastMessageTime) {
    const rule = this.followUpRules[stage];
    if (!rule) return;

    const followUpTime = new Date(lastMessageTime.getTime() + (rule.noResponseHours * 60 * 60 * 1000));
    
    await this.scheduler.schedule(followUpTime, {
      type: 'follow_up',
      conversationId,
      message: rule.message,
      stage
    });
  }

  async handleScheduledFollowUp(scheduledEvent) {
    const { conversationId, message } = scheduledEvent;
    
    // Check if customer has responded since scheduling
    const lastMessage = await this.getLastCustomerMessage(conversationId);
    if (lastMessage && lastMessage.timestamp > scheduledEvent.scheduledTime) {
      return; // Customer has responded, skip follow-up
    }

    // Send follow-up message
    const conversationManager = new ConversationManager(client);
    await conversationManager.sendMessage(conversationId, message, 'assistant');
  }
}
```

## Best Practices

### 1. Security Considerations

```javascript
// security.js
const crypto = require('crypto');

class WebhookSecurity {
  static validateTwilioSignature(payload, signature, authToken) {
    const expectedSignature = crypto
      .createHmac('sha1', authToken)
      .update(Buffer.from(payload, 'utf-8'))
      .digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'base64'),
      Buffer.from(expectedSignature, 'base64')
    );
  }

  static sanitizeMessage(message) {
    // Remove potential XSS and injection attempts
    return message
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }
}

// Apply security middleware
app.use('/webhooks/conversations', (req, res, next) => {
  const signature = req.headers['x-twilio-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!WebhookSecurity.validateTwilioSignature(payload, signature, process.env.TWILIO_AUTH_TOKEN)) {
    return res.status(403).send('Forbidden');
  }
  
  next();
});
```

### 2. Error Handling and Retry Logic

```javascript
// error-handler.js
class ErrorHandler {
  static async withRetry(operation, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        await this.sleep(delay * attempt); // Exponential backoff
      }
    }
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async handleWebhookError(error, event) {
    // Log error with context
    console.error('Webhook processing error:', {
      error: error.message,
      stack: error.stack,
      event: event,
      timestamp: new Date().toISOString()
    });

    // Store failed event for retry
    await db.failedEvents.create({
      event,
      error: error.message,
      timestamp: new Date(),
      retryCount: 0
    });
  }
}
```

### 3. Rate Limiting and Performance

```javascript
// performance.js
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

// Rate limiting for webhooks
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many webhook requests'
});

// Caching for conversation data
const conversationCache = new NodeCache({ stdTTL: 300 }); // 5 minutes

class PerformanceOptimizer {
  static async getCachedConversation(conversationId) {
    const cached = conversationCache.get(conversationId);
    if (cached) return cached;

    const conversation = await db.conversations.findById(conversationId);
    conversationCache.set(conversationId, conversation);
    return conversation;
  }

  static async batchProcessMessages(messages) {
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < messages.length; i += batchSize) {
      batches.push(messages.slice(i, i + batchSize));
    }

    return Promise.all(
      batches.map(batch => 
        Promise.all(batch.map(message => this.processMessage(message)))
      )
    );
  }
}
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Webhook Delivery Failures

```javascript
// webhook-monitor.js
class WebhookMonitor {
  static async checkWebhookHealth() {
    try {
      const response = await fetch(`${process.env.WEBHOOK_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`Webhook endpoint unhealthy: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Webhook health check failed:', error);
      // Implement alerting logic
      await this.alertDevTeam('Webhook endpoint is down');
      return false;
    }
  }

  static async retryFailedWebhooks() {
    const failedEvents = await db.failedEvents.findUnprocessed();
    
    for (const event of failedEvents) {
      try {
        await handleConversationEvent(event.data);
        await db.failedEvents.markProcessed(event.id);
      } catch (error) {
        await db.failedEvents.incrementRetry(event.id);
      }
    }
  }
}
```

#### 2. Message Duplication Prevention

```javascript
// deduplication.js
class MessageDeduplicator {
  constructor() {
    this.processedMessages = new Set();
    this.cleanupInterval = setInterval(() => {
      this.processedMessages.clear();
    }, 10 * 60 * 1000); // Clear every 10 minutes
  }

  isDuplicate(messageId) {
    if (this.processedMessages.has(messageId)) {
      return true;
    }
    this.processedMessages.add(messageId);
    return false;
  }
}
```

#### 3. Debugging and Logging

```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage in webhook handler
app.post('/webhooks/conversations', async (req, res) => {
  const startTime = Date.now();
  const event = req.body;
  
  logger.info('Webhook received', {
    eventType: event.EventType,
    conversationSid: event.ConversationSid,
    timestamp: new Date().toISOString()
  });

  try {
    await handleConversationEvent(event);
    
    logger.info('Webhook processed successfully', {
      eventType: event.EventType,
      processingTime: Date.now() - startTime
    });
    
    res.status(200).send('OK');
  } catch (error) {
    logger.error('Webhook processing failed', {
      error: error.message,
      stack: error.stack,
      event,
      processingTime: Date.now() - startTime
    });
    
    res.status(500).send('Error processing webhook');
  }
});
```

## Complete Example Implementation

```javascript
// app.js - Complete implementation
const express = require('express');
const twilio = require('twilio');
const { ConversationManager } = require('./conversation-manager');
const { MessageProcessor } = require('./message-processor');
const { AIAnalysisEngine } = require('./ai-engine');
const { TaskManager } = require('./task-manager');

const app = express();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Initialize components
const aiEngine = new AIAnalysisEngine(process.env.OPENAI_API_KEY);
const taskManager = new TaskManager();
const messageProcessor = new MessageProcessor(aiEngine, taskManager);
const conversationManager = new ConversationManager(client);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Main webhook endpoint
app.post('/webhooks/conversations', async (req, res) => {
  try {
    const event = req.body;
    
    if (event.EventType === 'onMessageAdded') {
      await messageProcessor.processNewMessage({
        conversationId: event.ConversationSid,
        messageId: event.MessageSid,
        content: event.Body,
        author: event.Author,
        timestamp: new Date()
      });
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error');
  }
});

// API endpoints for your CRM
app.post('/api/conversations', async (req, res) => {
  const { agentId, customerId, customerPhone, customerEmail } = req.body;
  
  try {
    const conversation = await conversationManager.createConversation(
      agentId, customerId, customerPhone, customerEmail
    );
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/conversations/:id/messages', async (req, res) => {
  try {
    const messages = await conversationManager.getConversationMessages(req.params.id);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CRM Twilio Integration running on port ${PORT}`);
});
```

This comprehensive tutorial provides everything you need to implement a Twilio Conversations-based CRM system that can observe and act on WhatsApp and Email conversations between agents and customers.