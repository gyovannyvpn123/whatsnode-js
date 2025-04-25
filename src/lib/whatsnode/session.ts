/**
 * Session Manager
 * 
 * Handles session persistence for WhatsApp Web connections.
 */

import { WhatsNodeClient, ClientOptions } from './client';

export class SessionManager {
  private readonly client: WhatsNodeClient;
  private readonly options: ClientOptions;
  
  constructor(client: WhatsNodeClient, options: ClientOptions) {
    this.client = client;
    this.options = options;
  }
  
  /**
   * Save the current session
   * 
   * @param sessionData Session data to save
   */
  public async saveSession(sessionData: any): Promise<void> {
    if (!this.options.sessionPath) {
      if (this.options.debug) {
        console.warn('Session path not specified, session will not be saved');
      }
      return;
    }
    
    try {
      // In a browser environment, we can use localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          `whatsnode_session_${this.options.sessionPath}`,
          JSON.stringify(sessionData)
        );
      }
      
      // In a real implementation, we would save to file or server
      if (this.options.debug) {
        console.log('Session saved successfully');
      }
    } catch (error) {
      if (this.options.debug) {
        console.error('Failed to save session', error);
      }
      
      throw new Error('Failed to save session: ' + error);
    }
  }
  
  /**
   * Restore a saved session
   * 
   * @returns Whether a session was restored
   */
  public async restoreSession(): Promise<boolean> {
    if (!this.options.sessionPath) {
      if (this.options.debug) {
        console.warn('Session path not specified, cannot restore session');
      }
      return false;
    }
    
    try {
      let sessionData: any = null;
      
      // In a browser environment, we can use localStorage
      if (typeof localStorage !== 'undefined') {
        const storedSession = localStorage.getItem(`whatsnode_session_${this.options.sessionPath}`);
        
        if (storedSession) {
          sessionData = JSON.parse(storedSession);
        }
      }
      
      // In a real implementation, we would read from file or server
      
      if (!sessionData) {
        if (this.options.debug) {
          console.log('No saved session found');
        }
        return false;
      }
      
      // Send session data to server
      const connection = this.client.getConnectionManager();
      connection.sendMessage({
        type: 'restore_session',
        data: {
          sessionData
        }
      });
      
      if (this.options.debug) {
        console.log('Session restored successfully');
      }
      
      return true;
    } catch (error) {
      if (this.options.debug) {
        console.error('Failed to restore session', error);
      }
      
      return false;
    }
  }
  
  /**
   * Delete the saved session
   */
  public async deleteSession(): Promise<void> {
    if (!this.options.sessionPath) {
      if (this.options.debug) {
        console.warn('Session path not specified, cannot delete session');
      }
      return;
    }
    
    try {
      // In a browser environment, we can use localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`whatsnode_session_${this.options.sessionPath}`);
      }
      
      // In a real implementation, we would delete the file or remove from server
      
      if (this.options.debug) {
        console.log('Session deleted successfully');
      }
    } catch (error) {
      if (this.options.debug) {
        console.error('Failed to delete session', error);
      }
      
      throw new Error('Failed to delete session: ' + error);
    }
  }
}
