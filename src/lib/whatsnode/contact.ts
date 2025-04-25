/**
 * Contact Manager
 * 
 * Handles contact operations on WhatsApp.
 */

import { WhatsNodeClient } from './client';
import { WhatsNodeContact } from './types';

export class ContactManager {
  private readonly client: WhatsNodeClient;
  
  constructor(client: WhatsNodeClient) {
    this.client = client;
  }
  
  /**
   * Get contact by ID
   * 
   * @param contactId ID of the contact to get
   */
  public async getContact(contactId: string): Promise<WhatsNodeContact | null> {
    // Ensure the ID is a contact ID
    if (!contactId.endsWith('@c.us')) {
      throw new Error('Invalid contact ID format');
    }
    
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send get contact request via WebSocket
    connection.sendMessage({
      type: 'get_contact',
      data: {
        contactId
      }
    });
    
    // In a real implementation, we would wait for a response from the server
    // Here we're just creating a mock contact object
    return this.createMockContact(contactId);
  }
  
  /**
   * Get all contacts
   */
  public async getContacts(): Promise<WhatsNodeContact[]> {
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send get contacts request via WebSocket
    connection.sendMessage({
      type: 'get_contacts'
    });
    
    // In a real implementation, we would wait for a response from the server
    // Here we're just creating mock contact objects
    return [
      this.createMockContact('1234567890@c.us'),
      this.createMockContact('0987654321@c.us'),
      this.createMockContact('1122334455@c.us')
    ];
  }
  
  /**
   * Get contact about info
   * 
   * @param contactId ID of the contact
   */
  public async getContactAbout(contactId: string): Promise<string> {
    // Ensure the ID is a contact ID
    if (!contactId.endsWith('@c.us')) {
      throw new Error('Invalid contact ID format');
    }
    
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send get contact about request via WebSocket
    connection.sendMessage({
      type: 'get_contact_about',
      data: {
        contactId
      }
    });
    
    // In a real implementation, we would wait for a response from the server
    // Here we're just returning a mock about info
    return 'Hey there! I am using WhatsApp.';
  }
  
  /**
   * Get contact profile picture
   * 
   * @param contactId ID of the contact
   */
  public async getContactProfilePicture(contactId: string): Promise<string | null> {
    // Ensure the ID is a contact ID
    if (!contactId.endsWith('@c.us')) {
      throw new Error('Invalid contact ID format');
    }
    
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send get profile picture request via WebSocket
    connection.sendMessage({
      type: 'get_profile_picture',
      data: {
        contactId
      }
    });
    
    // In a real implementation, we would wait for a response from the server
    // Here we're just returning a mock profile picture URL
    return 'https://via.placeholder.com/200';
  }
  
  /**
   * Block a contact
   * 
   * @param contactId ID of the contact to block
   */
  public async blockContact(contactId: string): Promise<void> {
    // Ensure the ID is a contact ID
    if (!contactId.endsWith('@c.us')) {
      throw new Error('Invalid contact ID format');
    }
    
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send block contact request via WebSocket
    connection.sendMessage({
      type: 'block_contact',
      data: {
        contactId
      }
    });
    
    // In a real implementation, we would wait for a response from the server
  }
  
  /**
   * Unblock a contact
   * 
   * @param contactId ID of the contact to unblock
   */
  public async unblockContact(contactId: string): Promise<void> {
    // Ensure the ID is a contact ID
    if (!contactId.endsWith('@c.us')) {
      throw new Error('Invalid contact ID format');
    }
    
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send unblock contact request via WebSocket
    connection.sendMessage({
      type: 'unblock_contact',
      data: {
        contactId
      }
    });
    
    // In a real implementation, we would wait for a response from the server
  }
  
  /**
   * Create a mock contact object
   * 
   * @param id Contact ID
   */
  private createMockContact(id: string): WhatsNodeContact {
    // Extract the phone number from the ID
    const phoneNumber = id.replace('@c.us', '');
    
    return {
      id,
      name: `Contact ${phoneNumber.substring(0, 4)}`,
      number: phoneNumber,
      isBusiness: false,
      isBlocked: false,
      isMyContact: true,
      
      // Add methods for contact actions
      sendMessage: async (content: string) => {
        return this.client.sendMessage(id, content);
      },
      
      getAbout: async () => {
        return this.getContactAbout(id);
      },
      
      getProfilePicture: async () => {
        return this.getContactProfilePicture(id);
      },
      
      block: async () => {
        return this.blockContact(id);
      },
      
      unblock: async () => {
        return this.unblockContact(id);
      }
    };
  }
}
