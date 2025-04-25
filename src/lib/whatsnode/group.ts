/**
 * Group Manager
 * 
 * Handles group chat operations on WhatsApp.
 */

import { WhatsNodeClient } from './client';
import { WhatsNodeGroup } from './types';

export class GroupManager {
  private readonly client: WhatsNodeClient;
  
  constructor(client: WhatsNodeClient) {
    this.client = client;
  }
  
  /**
   * Create a group
   * 
   * @param name Name of the group
   * @param participants Array of contact IDs to add to the group
   */
  public async createGroup(name: string, participants: string[]): Promise<WhatsNodeGroup> {
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send create group request via WebSocket
    connection.sendMessage({
      type: 'create_group',
      data: {
        name,
        participants
      }
    });
    
    // In a real implementation, we would wait for a response from the server
    // with the created group details. Here we're just creating a mock group object.
    const groupId = `${Date.now()}@g.us`;
    
    return this.createMockGroup(groupId, name, participants);
  }
  
  /**
   * Get group by ID
   * 
   * @param groupId ID of the group to get
   */
  public async getGroup(groupId: string): Promise<WhatsNodeGroup | null> {
    // Ensure the ID is a group ID
    if (!groupId.endsWith('@g.us')) {
      throw new Error('Invalid group ID format');
    }
    
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send get group request via WebSocket
    connection.sendMessage({
      type: 'get_group',
      data: {
        groupId
      }
    });
    
    // In a real implementation, we would wait for a response from the server
    // Here we're just creating a mock group object
    return this.createMockGroup(groupId, `Group ${groupId.substring(0, 4)}`, []);
  }
  
  /**
   * Get all groups
   */
  public async getGroups(): Promise<WhatsNodeGroup[]> {
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send get groups request via WebSocket
    connection.sendMessage({
      type: 'get_groups'
    });
    
    // In a real implementation, we would wait for a response from the server
    // Here we're just creating mock group objects
    return [
      this.createMockGroup('123456789@g.us', 'Family Group', ['1234567890@c.us', '0987654321@c.us']),
      this.createMockGroup('987654321@g.us', 'Work Team', ['1122334455@c.us', '5544332211@c.us']),
    ];
  }
  
  /**
   * Add participants to a group
   * 
   * @param groupId ID of the group
   * @param participants Array of contact IDs to add
   */
  public async addParticipants(groupId: string, participants: string[]): Promise<void> {
    // Ensure the ID is a group ID
    if (!groupId.endsWith('@g.us')) {
      throw new Error('Invalid group ID format');
    }
    
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send add participants request via WebSocket
    connection.sendMessage({
      type: 'add_participants',
      data: {
        groupId,
        participants
      }
    });
    
    // In a real implementation, we would wait for a response from the server
  }
  
  /**
   * Remove participants from a group
   * 
   * @param groupId ID of the group
   * @param participants Array of contact IDs to remove
   */
  public async removeParticipants(groupId: string, participants: string[]): Promise<void> {
    // Ensure the ID is a group ID
    if (!groupId.endsWith('@g.us')) {
      throw new Error('Invalid group ID format');
    }
    
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send remove participants request via WebSocket
    connection.sendMessage({
      type: 'remove_participants',
      data: {
        groupId,
        participants
      }
    });
    
    // In a real implementation, we would wait for a response from the server
  }
  
  /**
   * Make participants admins in a group
   * 
   * @param groupId ID of the group
   * @param participants Array of contact IDs to promote
   */
  public async promoteParticipants(groupId: string, participants: string[]): Promise<void> {
    // Ensure the ID is a group ID
    if (!groupId.endsWith('@g.us')) {
      throw new Error('Invalid group ID format');
    }
    
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send promote participants request via WebSocket
    connection.sendMessage({
      type: 'promote_participants',
      data: {
        groupId,
        participants
      }
    });
    
    // In a real implementation, we would wait for a response from the server
  }
  
  /**
   * Remove admin status from participants in a group
   * 
   * @param groupId ID of the group
   * @param participants Array of contact IDs to demote
   */
  public async demoteParticipants(groupId: string, participants: string[]): Promise<void> {
    // Ensure the ID is a group ID
    if (!groupId.endsWith('@g.us')) {
      throw new Error('Invalid group ID format');
    }
    
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send demote participants request via WebSocket
    connection.sendMessage({
      type: 'demote_participants',
      data: {
        groupId,
        participants
      }
    });
    
    // In a real implementation, we would wait for a response from the server
  }
  
  /**
   * Get the invite code for a group
   * 
   * @param groupId ID of the group
   */
  public async getGroupInviteCode(groupId: string): Promise<string> {
    // Ensure the ID is a group ID
    if (!groupId.endsWith('@g.us')) {
      throw new Error('Invalid group ID format');
    }
    
    // Ensure connection manager is ready
    const connection = this.client.getConnectionManager();
    
    if (connection.getConnectionState() !== 'connected') {
      throw new Error('Not connected to WhatsApp');
    }
    
    // Send get invite code request via WebSocket
    connection.sendMessage({
      type: 'get_invite_code',
      data: {
        groupId
      }
    });
    
    // In a real implementation, we would wait for a response from the server
    // Here we're just returning a mock invite code
    return 'AB1CdEfGh2IjK3Lm';
  }
  
  /**
   * Create a mock group object
   * 
   * @param id Group ID
   * @param name Group name
   * @param participants Array of participant IDs
   */
  private createMockGroup(id: string, name: string, participants: string[]): WhatsNodeGroup {
    return {
      id,
      name,
      participants: participants.map(p => ({
        id: p,
        isAdmin: false,
        isSuperAdmin: false
      })),
      created: new Date().toISOString(),
      description: `Description for ${name}`,
      
      // Add send message method
      sendMessage: async (content: string) => {
        return this.client.sendMessage(id, content);
      },
      
      // Add methods for participant management
      addParticipants: async (newParticipants: string[]) => {
        return this.addParticipants(id, newParticipants);
      },
      
      removeParticipants: async (participantsToRemove: string[]) => {
        return this.removeParticipants(id, participantsToRemove);
      },
      
      promoteParticipants: async (participantsToPromote: string[]) => {
        return this.promoteParticipants(id, participantsToPromote);
      },
      
      demoteParticipants: async (participantsToDemote: string[]) => {
        return this.demoteParticipants(id, participantsToDemote);
      },
      
      getInviteCode: async () => {
        return this.getGroupInviteCode(id);
      }
    };
  }
}
