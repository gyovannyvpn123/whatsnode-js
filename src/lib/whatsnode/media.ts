/**
 * Media Manager
 * 
 * Handles sending and receiving media messages on WhatsApp.
 */

import { WhatsNodeClient } from './client';
import { WhatsNodeMessage } from './types';

export class MediaManager {
  private readonly client: WhatsNodeClient;
  
  constructor(client: WhatsNodeClient) {
    this.client = client;
  }
  
  /**
   * Send an image
   * 
   * @param to Chat ID to send the image to
   * @param imagePath Path to the image
   * @param caption Optional caption for the image
   */
  public async sendImage(to: string, imagePath: string, caption?: string): Promise<WhatsNodeMessage> {
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // In a real implementation, this would read the file, encode it, and send it
    // For this example, we'll just send a message via the WebSocket
    connection.sendMessage({
      type: 'send_image',
      data: {
        to,
        imagePath,
        caption
      }
    });
    
    // Create mock message for the sent image
    return this.createMockMediaMessage(to, caption || '', 'image', imagePath);
  }
  
  /**
   * Send an image from a URL
   * 
   * @param to Chat ID to send the image to
   * @param url URL of the image
   * @param caption Optional caption for the image
   */
  public async sendImageFromUrl(to: string, url: string, caption?: string): Promise<WhatsNodeMessage> {
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send message via WebSocket
    connection.sendMessage({
      type: 'send_image_url',
      data: {
        to,
        url,
        caption
      }
    });
    
    // Create mock message for the sent image
    return this.createMockMediaMessage(to, caption || '', 'image', url);
  }
  
  /**
   * Send a video
   * 
   * @param to Chat ID to send the video to
   * @param videoPath Path to the video
   * @param caption Optional caption for the video
   */
  public async sendVideo(to: string, videoPath: string, caption?: string): Promise<WhatsNodeMessage> {
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send message via WebSocket
    connection.sendMessage({
      type: 'send_video',
      data: {
        to,
        videoPath,
        caption
      }
    });
    
    // Create mock message for the sent video
    return this.createMockMediaMessage(to, caption || '', 'video', videoPath);
  }
  
  /**
   * Send a document
   * 
   * @param to Chat ID to send the document to
   * @param documentPath Path to the document
   * @param filename Optional filename for the document
   */
  public async sendDocument(to: string, documentPath: string, filename?: string): Promise<WhatsNodeMessage> {
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send message via WebSocket
    connection.sendMessage({
      type: 'send_document',
      data: {
        to,
        documentPath,
        filename
      }
    });
    
    // Create mock message for the sent document
    return this.createMockMediaMessage(
      to,
      filename || documentPath.split('/').pop() || 'document',
      'document',
      documentPath
    );
  }
  
  /**
   * Create a mock media message
   * 
   * @param to Recipient of the message
   * @param caption Caption or body of the message
   * @param type Type of the media
   * @param mediaUrl URL or path of the media
   */
  private createMockMediaMessage(to: string, caption: string, type: 'image' | 'video' | 'audio' | 'document', mediaUrl: string): WhatsNodeMessage {
    const messageId = `mock_media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let mimetype = '';
    
    // Set mimetype based on media type and file extension
    switch (type) {
      case 'image':
        mimetype = 'image/jpeg';
        break;
      case 'video':
        mimetype = 'video/mp4';
        break;
      case 'audio':
        mimetype = 'audio/ogg';
        break;
      case 'document':
        mimetype = 'application/pdf';
        break;
    }
    
    return {
      id: messageId,
      body: caption,
      from: 'me',
      to,
      hasMedia: true,
      mediaUrl,
      mimetype,
      timestamp: new Date().toISOString(),
      type,
      isForwarded: false,
      isStatus: false,
      isGroup: to.endsWith('@g.us'),
      
      // Add reply method
      reply: async (content: string) => {
        return this.client.sendMessage(to, content);
      },
      
      // Add download media method
      downloadMedia: async () => {
        // In a real implementation, this would download the media
        return {
          data: 'mock_data',
          mimetype,
          filename: mediaUrl.split('/').pop() || 'file'
        };
      }
    };
  }
}
