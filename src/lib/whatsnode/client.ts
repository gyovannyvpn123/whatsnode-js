/**
 * WhatsNode Client
 * 
 * The main client class for interacting with WhatsApp Web.
 */

import { EventEmitter } from 'events';
import { AuthStrategy, AuthenticationManager } from './auth';
import { ConnectionManager } from './connection';
import { MessageManager } from './message';
import { MediaManager } from './media';
import { GroupManager } from './group';
import { ContactManager } from './contact';
import { SessionManager } from './session';
import { 
  WhatsNodeEvents, 
  WhatsNodeMessage, 
  WhatsNodeContact, 
  WhatsNodeChat, 
  WhatsNodeGroup 
} from './types';

export interface ClientOptions {
  /** Authentication strategy to use ('qr' or 'association-code') */
  authStrategy: AuthStrategy;
  
  /** Path to store session data */
  sessionPath?: string;
  
  /** Whether to automatically reconnect on disconnection */
  autoReconnect?: boolean;
  
  /** Reconnect interval in milliseconds */
  reconnectInterval?: number;
  
  /** Maximum reconnect attempts */
  maxReconnectAttempts?: number;
  
  /** Debug mode */
  debug?: boolean;
}

/**
 * Main WhatsNode client class
 * 
 * Provides methods to interact with WhatsApp Web and manage the connection.
 */
export class WhatsNodeClient extends EventEmitter {
  private readonly options: ClientOptions;
  private readonly connection: ConnectionManager;
  private readonly auth: AuthenticationManager;
  private readonly message: MessageManager;
  private readonly media: MediaManager;
  private readonly group: GroupManager;
  private readonly contact: ContactManager;
  private readonly session: SessionManager;
  
  private isConnected: boolean = false;
  private isReady: boolean = false;
  private clientId: string;
  
  /**
   * Create a new WhatsNode client
   * 
   * @param options Client configuration options
   */
  constructor(options: ClientOptions) {
    super();
    
    // Set default options with user options override
    this.options = {
      sessionPath: './whatsnode_session',
      autoReconnect: true,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      debug: false,
      // Override defaults with user options
      ...options,
      // Ensure authStrategy has a default if not provided
      authStrategy: options.authStrategy || 'qr'
    };
    
    // Generate a unique client ID
    this.clientId = `whatsnode_${Math.random().toString(36).substring(2, 10)}`;
    
    // Initialize managers
    this.connection = new ConnectionManager(this, this.options);
    this.auth = new AuthenticationManager(this, this.options, this.connection);
    this.session = new SessionManager(this, this.options);
    this.message = new MessageManager(this);
    this.media = new MediaManager(this);
    this.group = new GroupManager(this);
    this.contact = new ContactManager(this);
    
    // Setup event listeners
    this.connection.on('open', () => {
      this.isConnected = true;
      this.emit(WhatsNodeEvents.CONNECTION_OPENED);
      
      if (this.options.debug) {
        console.log('WhatsNode: Connection opened');
      }
    });
    
    this.connection.on('close', () => {
      this.isConnected = false;
      this.isReady = false;
      this.emit(WhatsNodeEvents.CONNECTION_CLOSED);
      
      if (this.options.debug) {
        console.log('WhatsNode: Connection closed');
      }
    });
    
    this.connection.on('ready', () => {
      this.isReady = true;
      this.emit(WhatsNodeEvents.READY);
      
      if (this.options.debug) {
        console.log('WhatsNode: Client is ready');
      }
    });
    
    this.auth.on('qr', (qr: string) => {
      this.emit(WhatsNodeEvents.QR_RECEIVED, qr);
      
      if (this.options.debug) {
        console.log('WhatsNode: QR Code received');
      }
    });
    
    // Forward authentication events
    this.auth.on('authenticated', () => {
      this.emit(WhatsNodeEvents.AUTHENTICATED);
      
      if (this.options.debug) {
        console.log('WhatsNode: Authenticated');
      }
    });
    
    this.auth.on('auth_failure', (error) => {
      this.emit(WhatsNodeEvents.AUTHENTICATION_FAILURE, error);
      
      if (this.options.debug) {
        console.error('WhatsNode: Authentication failed', error);
      }
    });
    
    // Forward message events
    this.message.on('message', (message: WhatsNodeMessage) => {
      this.emit(WhatsNodeEvents.MESSAGE, message);
      
      // Emit specific message type events
      if (message.hasMedia) {
        if (message.type === 'image') {
          this.emit(WhatsNodeEvents.MESSAGE_IMAGE, message);
        } else if (message.type === 'video') {
          this.emit(WhatsNodeEvents.MESSAGE_VIDEO, message);
        } else if (message.type === 'audio') {
          this.emit(WhatsNodeEvents.MESSAGE_AUDIO, message);
        } else if (message.type === 'document') {
          this.emit(WhatsNodeEvents.MESSAGE_DOCUMENT, message);
        }
      } else if (message.type === 'location') {
        this.emit(WhatsNodeEvents.MESSAGE_LOCATION, message);
      } else if (message.type === 'contact') {
        this.emit(WhatsNodeEvents.MESSAGE_CONTACT, message);
      }
    });
  }
  
  /**
   * Connect to WhatsApp Web
   * 
   * This initializes the connection and authentication process.
   */
  public async connect(): Promise<void> {
    try {
      if (this.options.debug) {
        console.log('WhatsNode: Connecting...');
      }
      
      // Try to restore session
      const restored = await this.session.restoreSession();
      
      if (!restored) {
        // If session not restored, start fresh authentication
        await this.auth.authenticate();
      } else {
        if (this.options.debug) {
          console.log('WhatsNode: Session restored');
        }
      }
      
      // Connect to WhatsApp servers
      await this.connection.connect();
    } catch (error) {
      if (this.options.debug) {
        console.error('WhatsNode: Connection failed', error);
      }
      
      this.emit(WhatsNodeEvents.CONNECTION_FAILED, error);
      throw error;
    }
  }
  
  /**
   * Disconnect from WhatsApp Web
   */
  public async disconnect(): Promise<void> {
    try {
      await this.connection.disconnect();
      this.isConnected = false;
      this.isReady = false;
      
      if (this.options.debug) {
        console.log('WhatsNode: Disconnected');
      }
    } catch (error) {
      if (this.options.debug) {
        console.error('WhatsNode: Disconnect failed', error);
      }
      
      throw error;
    }
  }
  
  /**
   * Check if the client is connected
   */
  public isClientConnected(): boolean {
    return this.isConnected;
  }
  
  /**
   * Check if the client is ready to use
   */
  public isClientReady(): boolean {
    return this.isReady;
  }
  
  /**
   * Get the authentication manager
   */
  public getAuthManager(): AuthenticationManager {
    return this.auth;
  }
  
  /**
   * Get the connection manager
   */
  public getConnectionManager(): ConnectionManager {
    return this.connection;
  }
  
  /**
   * Get the client ID (used for QR code generation)
   */
  public getClientId(): string {
    return this.clientId;
  }
  
  /**
   * Request an association code for authentication
   * 
   * @param phoneNumber The phone number to request the code for
   */
  public async requestAssociationCode(phoneNumber: string): Promise<void> {
    return this.auth.requestAssociationCode(phoneNumber);
  }
  
  /**
   * Authenticate using an association code
   * 
   * @param code The association code received on the phone
   */
  public async authenticateWithAssociationCode(code: string): Promise<void> {
    return this.auth.authenticateWithAssociationCode(code);
  }
  
  /**
   * Send a text message
   * 
   * @param to Chat ID to send the message to
   * @param content Message content
   */
  public async sendMessage(to: string, content: string): Promise<WhatsNodeMessage> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.message.sendMessage(to, content);
  }
  
  /**
   * Send an image
   * 
   * @param to Chat ID to send the image to
   * @param imagePath Path to the image
   * @param caption Optional caption for the image
   */
  public async sendImage(to: string, imagePath: string, caption?: string): Promise<WhatsNodeMessage> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.media.sendImage(to, imagePath, caption);
  }
  
  /**
   * Send an image from a URL
   * 
   * @param to Chat ID to send the image to
   * @param url URL of the image
   * @param caption Optional caption for the image
   */
  public async sendImageFromUrl(to: string, url: string, caption?: string): Promise<WhatsNodeMessage> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.media.sendImageFromUrl(to, url, caption);
  }
  
  /**
   * Send a video
   * 
   * @param to Chat ID to send the video to
   * @param videoPath Path to the video
   * @param caption Optional caption for the video
   */
  public async sendVideo(to: string, videoPath: string, caption?: string): Promise<WhatsNodeMessage> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.media.sendVideo(to, videoPath, caption);
  }
  
  /**
   * Send a document
   * 
   * @param to Chat ID to send the document to
   * @param documentPath Path to the document
   * @param filename Optional filename for the document
   */
  public async sendDocument(to: string, documentPath: string, filename?: string): Promise<WhatsNodeMessage> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.media.sendDocument(to, documentPath, filename);
  }
  
  /**
   * Send a location
   * 
   * @param to Chat ID to send the location to
   * @param latitude Latitude coordinate
   * @param longitude Longitude coordinate
   * @param name Optional name for the location
   */
  public async sendLocation(to: string, latitude: number, longitude: number, name?: string): Promise<WhatsNodeMessage> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.message.sendLocation(to, latitude, longitude, name);
  }
  
  /**
   * Send a contact card
   * 
   * @param to Chat ID to send the contact to
   * @param contactId ID of the contact to send
   */
  public async sendContact(to: string, contactId: string): Promise<WhatsNodeMessage> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.message.sendContact(to, contactId);
  }
  
  /**
   * Get chat by ID
   * 
   * @param chatId ID of the chat to get
   */
  public async getChat(chatId: string): Promise<WhatsNodeChat | null> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.message.getChat(chatId);
  }
  
  /**
   * Get all chats
   */
  public async getChats(): Promise<WhatsNodeChat[]> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.message.getChats();
  }
  
  /**
   * Get contact by ID
   * 
   * @param contactId ID of the contact to get
   */
  public async getContact(contactId: string): Promise<WhatsNodeContact | null> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.contact.getContact(contactId);
  }
  
  /**
   * Get all contacts
   */
  public async getContacts(): Promise<WhatsNodeContact[]> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.contact.getContacts();
  }
  
  /**
   * Create a group
   * 
   * @param name Name of the group
   * @param participants Array of contact IDs to add to the group
   */
  public async createGroup(name: string, participants: string[]): Promise<WhatsNodeGroup> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.group.createGroup(name, participants);
  }
  
  /**
   * Get group by ID
   * 
   * @param groupId ID of the group to get
   */
  public async getGroup(groupId: string): Promise<WhatsNodeGroup | null> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.group.getGroup(groupId);
  }
  
  /**
   * Get all groups
   */
  public async getGroups(): Promise<WhatsNodeGroup[]> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.group.getGroups();
  }
  
  /**
   * Add participants to a group
   * 
   * @param groupId ID of the group
   * @param participants Array of contact IDs to add
   */
  public async addParticipants(groupId: string, participants: string[]): Promise<void> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.group.addParticipants(groupId, participants);
  }
  
  /**
   * Remove participants from a group
   * 
   * @param groupId ID of the group
   * @param participants Array of contact IDs to remove
   */
  public async removeParticipants(groupId: string, participants: string[]): Promise<void> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.group.removeParticipants(groupId, participants);
  }
  
  /**
   * Make participants admins in a group
   * 
   * @param groupId ID of the group
   * @param participants Array of contact IDs to promote
   */
  public async promoteParticipants(groupId: string, participants: string[]): Promise<void> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.group.promoteParticipants(groupId, participants);
  }
  
  /**
   * Remove admin status from participants in a group
   * 
   * @param groupId ID of the group
   * @param participants Array of contact IDs to demote
   */
  public async demoteParticipants(groupId: string, participants: string[]): Promise<void> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.group.demoteParticipants(groupId, participants);
  }
  
  /**
   * Get the invite code for a group
   * 
   * @param groupId ID of the group
   */
  public async getGroupInviteCode(groupId: string): Promise<string> {
    if (!this.isReady) {
      throw new Error('Client is not ready');
    }
    
    return this.group.getGroupInviteCode(groupId);
  }
}
