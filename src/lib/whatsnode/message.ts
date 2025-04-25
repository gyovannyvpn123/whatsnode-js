/**
 * Message Manager
 * 
 * Handles sending and receiving messages on WhatsApp.
 */

import { EventEmitter } from 'events';
import { WhatsNodeClient } from './client';
import { 
  WhatsNodeMessage, 
  WhatsNodeChat,
  WhatsNodeMessageType
} from './types';

export class MessageManager extends EventEmitter {
  private readonly client: WhatsNodeClient;
  
  constructor(client: WhatsNodeClient) {
    super();
    this.client = client;
    
    // Set up event listener for incoming messages
    this.client.getConnectionManager().on('message', (data) => {
      if (data.type === 'message') {
        const message = this.parseMessage(data.message);
        this.emit('message', message);
      }
    });
  }
  
  /**
   * Parse a raw message into a WhatsNodeMessage
   * 
   * @param rawMessage Raw message data from the server
   */
  private parseMessage(rawMessage: any): WhatsNodeMessage {
    // In a real implementation, this would parse the message protocol
    // Here we're just creating a mock message object
    return {
      id: rawMessage.id || `mock_message_${Date.now()}`,
      body: rawMessage.body || '',
      from: rawMessage.from || '',
      to: rawMessage.to || '',
      hasMedia: !!rawMessage.mediaUrl,
      mediaUrl: rawMessage.mediaUrl,
      mimetype: rawMessage.mimetype,
      timestamp: rawMessage.timestamp || new Date().toISOString(),
      type: (rawMessage.type as WhatsNodeMessageType) || 'text',
      isForwarded: !!rawMessage.isForwarded,
      isStatus: !!rawMessage.isStatus,
      isGroup: rawMessage.from?.endsWith('@g.us') || false,
      
      // Add reply method
      reply: async (content: string) => {
        return this.sendMessage(rawMessage.from, content);
      },
      
      // Add download media method
      downloadMedia: async () => {
        if (!rawMessage.mediaUrl) {
          throw new Error('Message has no media');
        }
        
        // In a real implementation, this would download the media
        return {
          data: 'mock_data',
          mimetype: rawMessage.mimetype || 'application/octet-stream',
          filename: rawMessage.filename || 'file'
        };
      }
    };
  }
  
  /**
   * Send a text message
   * 
   * @param to Chat ID to send the message to
   * @param content Message content
   */
  public async sendMessage(to: string, content: string): Promise<WhatsNodeMessage> {
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send message via WebSocket
    connection.sendMessage({
      type: 'send_message',
      data: {
        to,
        content
      }
    });
    
    // In a real implementation, we would wait for an acknowledgement from the server
    // Here we're just creating a mock message object for the sent message
    return this.createMockOutgoingMessage(to, content, 'text');
  }
  
  /**
   * Send a location message
   * 
   * @param to Chat ID to send the location to
   * @param latitude Latitude coordinate
   * @param longitude Longitude coordinate
   * @param name Optional name for the location
   */
  public async sendLocation(to: string, latitude: number, longitude: number, name?: string): Promise<WhatsNodeMessage> {
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send location message via WebSocket
    connection.sendMessage({
      type: 'send_location',
      data: {
        to,
        latitude,
        longitude,
        name
      }
    });
    
    // Create mock message for the sent location
    return this.createMockOutgoingMessage(
      to,
      name || `Location: ${latitude}, ${longitude}`,
      'location'
    );
  }
  
  /**
   * Send a contact card
   * 
   * @param to Chat ID to send the contact to
   * @param contactId ID of the contact to send
   */
  public async sendContact(to: string, contactId: string): Promise<WhatsNodeMessage> {
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send contact message via WebSocket
    connection.sendMessage({
      type: 'send_contact',
      data: {
        to,
        contactId
      }
    });
    
    // Create mock message for the sent contact
    return this.createMockOutgoingMessage(
      to,
      `Contact: ${contactId}`,
      'contact'
    );
  }
  
  /**
   * Create a mock outgoing message
   * 
   * @param to Recipient of the message
   * @param content Content of the message
   * @param type Type of the message
   */
  private createMockOutgoingMessage(to: string, content: string, type: WhatsNodeMessageType): WhatsNodeMessage {
    const messageId = `mock_outgoing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: messageId,
      body: content,
      from: 'me',
      to,
      hasMedia: false,
      timestamp: new Date().toISOString(),
      type,
      isForwarded: false,
      isStatus: false,
      isGroup: to.endsWith('@g.us'),
      
      // Add reply method
      reply: async (replyContent: string) => {
        return this.sendMessage(to, replyContent);
      },
      
      // Add download media method (not applicable for outgoing text messages)
      downloadMedia: async () => {
        throw new Error('Message has no media');
      }
    };
  }
  
  /**
   * Get chat by ID
   * 
   * @param chatId ID of the chat to get
   */
  public async getChat(chatId: string): Promise<WhatsNodeChat | null> {
    // In a real implementation, this would fetch the chat from WhatsApp
    // Here we're just creating a mock chat object
    return {
      id: chatId,
      name: `Chat ${chatId.substring(0, 4)}`,
      isGroup: chatId.endsWith('@g.us'),
      timestamp: new Date().toISOString(),
      unreadCount: 0,
      
      // Add fetch messages method
      fetchMessages: async (limit = 20) => {
        // Mock implementation that returns empty array
        return [];
      },
      
      // Add send message method
      sendMessage: async (content: string) => {
        return this.sendMessage(chatId, content);
      }
    };
  }
  
  /**
   * Get all chats
   */
  public async getChats(): Promise<WhatsNodeChat[]> {
    // In a real implementation, this would fetch all chats from WhatsApp
    // Here we're just creating mock chat objects
    return [
      {
        id: '1234567890@c.us',
        name: 'John Doe',
        isGroup: false,
        timestamp: new Date().toISOString(),
        unreadCount: 0,
        fetchMessages: async () => [],
        sendMessage: async (content) => this.sendMessage('1234567890@c.us', content)
      },
      {
        id: '0987654321@g.us',
        name: 'Family Group',
        isGroup: true,
        timestamp: new Date().toISOString(),
        unreadCount: 2,
        fetchMessages: async () => [],
        sendMessage: async (content) => this.sendMessage('0987654321@g.us', content)
      }
    ];
  }
}
