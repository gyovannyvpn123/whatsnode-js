/**
 * Authentication Manager
 * 
 * Handles authentication with WhatsApp Web servers using either
 * QR code or association code authentication.
 * 
 * This implementation is designed to work with the real WhatsApp
 * protocol based on Baileys.js approach.
 */

import { EventEmitter } from 'events';
import { WhatsNodeClient, ClientOptions } from './client';
import { ConnectionManager } from './connection';

export type AuthStrategy = 'qr' | 'association-code';

export class AuthenticationManager extends EventEmitter {
  private readonly client: WhatsNodeClient;
  private readonly options: ClientOptions;
  private readonly connection: ConnectionManager;
  private authState: 'disconnected' | 'connecting' | 'authenticating' | 'authenticated' = 'disconnected';
  private qrCode: string | null = null;
  private phoneNumber: string | null = null;
  
  constructor(client: WhatsNodeClient, options: ClientOptions, connection: ConnectionManager) {
    super();
    this.client = client;
    this.options = options;
    this.connection = connection;
    
    // Forward connection events related to authentication
    this.setupConnectionEvents();
  }
  
  /**
   * Setup event listeners for connection manager events
   */
  private setupConnectionEvents(): void {
    // Listen for QR code events
    this.connection.on('qr', (qrCode: string) => {
      this.qrCode = qrCode;
      this.emit('qr', qrCode);
      
      if (this.options.debug) {
        console.log('WhatsNode Auth: QR code received');
      }
    });
    
    // Listen for authentication events
    this.connection.on('authenticated', () => {
      this.authState = 'authenticated';
      this.emit('authenticated');
      
      if (this.options.debug) {
        console.log('WhatsNode Auth: Authentication successful');
      }
    });
    
    // Listen for auth failure events
    this.connection.on('auth_failure', (error: Error) => {
      this.authState = 'disconnected';
      this.emit('auth_failure', error);
      
      if (this.options.debug) {
        console.error('WhatsNode Auth: Authentication failed', error);
      }
    });
    
    // Listen for association code events
    this.connection.on('association_code_requested', (phoneNumber: string) => {
      this.phoneNumber = phoneNumber;
      this.emit('association_code_requested', phoneNumber);
      
      if (this.options.debug) {
        console.log(`WhatsNode Auth: Association code requested for ${phoneNumber}`);
      }
    });
    
    this.connection.on('association_code_sending', (phoneNumber: string) => {
      this.emit('association_code_sending', phoneNumber);
      
      if (this.options.debug) {
        console.log(`WhatsNode Auth: Association code is being sent to ${phoneNumber}`);
      }
    });
    
    // Listen for connection state changes
    this.connection.on('connecting', () => {
      this.authState = 'connecting';
      this.emit('connecting');
    });
    
    this.connection.on('authenticating', () => {
      this.authState = 'authenticating';
      this.emit('authenticating');
    });
    
    this.connection.on('disconnected', () => {
      this.authState = 'disconnected';
      this.emit('disconnected');
    });
  }
  
  /**
   * Start the authentication process based on the configured strategy
   */
  public async authenticate(): Promise<void> {
    try {
      // The connection manager now handles the connection and authentication
      // We just need to start the connection process
      await this.connection.connect();
    } catch (error) {
      this.authState = 'disconnected';
      this.emit('auth_failure', error);
      throw error;
    }
  }
  
  /**
   * Request an association code for authentication
   * 
   * @param phoneNumber The phone number to request the code for
   */
  public async requestAssociationCode(phoneNumber: string): Promise<void> {
    this.phoneNumber = phoneNumber;
    
    try {
      await this.connection.requestAssociationCode(phoneNumber);
    } catch (error) {
      this.emit('auth_failure', error);
      throw error;
    }
  }
  
  /**
   * Authenticate using an association code
   * 
   * @param code The association code received on the phone
   */
  public async authenticateWithAssociationCode(code: string): Promise<void> {
    if (!this.phoneNumber) {
      throw new Error('Phone number not set. Call requestAssociationCode first.');
    }
    
    try {
      await this.connection.authenticateWithAssociationCode(code);
    } catch (error) {
      this.emit('auth_failure', error);
      throw error;
    }
  }
  
  /**
   * Logout from WhatsApp Web
   */
  public async logout(): Promise<void> {
    await this.connection.disconnect();
    this.authState = 'disconnected';
    this.qrCode = null;
    this.phoneNumber = null;
  }
  
  /**
   * Delete the saved session
   */
  public async deleteSession(): Promise<boolean> {
    // In a real implementation, this would delete the session from storage
    // For now, we'll just simulate it
    this.qrCode = null;
    this.phoneNumber = null;
    
    return true;
  }
  
  /**
   * Get the current authentication state
   */
  public getAuthState(): string {
    return this.authState;
  }
  
  /**
   * Get the current QR code
   */
  public getQRCode(): string | null {
    return this.qrCode;
  }
}
