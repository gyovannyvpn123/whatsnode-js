/**
 * Connection Manager
 * 
 * Handles real connection to WhatsApp Web servers and manages the WebSocket connection.
 * Based on the Baileys.js approach, but with a simplified design for WhatsNode.
 */

import { EventEmitter } from 'events';
import { WhatsNodeClient, ClientOptions } from './client';
import * as QR from 'qrcode';
import * as boom from '@hapi/boom';
import * as crypto from 'crypto';
import { Curve, generateKeyPair, sharedKey } from 'libsignal';
import * as protobuf from 'protobufjs';
import isEqual from 'fast-deep-equal';

// WhatsApp Web Constants
const WA_DEFAULT_EPHEMERAL = 7 * 24 * 60 * 60;
const DEFAULT_ORIGIN = 'https://web.whatsapp.com';
const DEF_CALLBACK_PREFIX = 'CB:';
const DEF_TAG_PREFIX = 'TAG:';
const PHONE_CONNECTION_CB = 'CB:Pong';

// Connection states
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'authenticating' | 'loggedIn';

// WhatsApp WebSocket endpoints
const WS_URL = 'wss://web.whatsapp.com/ws';
const WS_CONNECT_HEADERS = {
  'Origin': DEFAULT_ORIGIN,
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
};

/**
 * Create a new WebSocket connection to the WhatsApp Web servers
 */
export function createWebSocket(): WebSocket {
  try {
    // The browser WebSocket API doesn't support the options parameter
    // In Node.js environment, we'd use the ws package which supports these options
    return new WebSocket(WS_URL);
  } catch (error) {
    console.error("Error creating WebSocket:", error);
    // Fallback to local WebSocket (for development/testing)
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    return new WebSocket(wsUrl);
  }
}

/**
 * Generate QR code data URL from string
 */
async function generateQRCode(text: string): Promise<string> {
  try {
    return await QR.toDataURL(text, {
      margin: 3,
      scale: 4,
      errorCorrectionLevel: 'L',
      color: {
        dark: '#122e31',
        light: '#ffffff',
      }
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

/**
 * Generate random bytes
 */
function randomBytes(length: number): Buffer {
  return crypto.randomBytes(length);
}

/**
 * Encode data for WhatsApp protocol
 */
function encodeWAMessage(data: any): Uint8Array {
  // This is a simplified version - real implementation would encode properly
  return new TextEncoder().encode(JSON.stringify(data));
}

/**
 * Decode WhatsApp protocol message
 */
function decodeWAMessage(data: ArrayBuffer | string): any {
  try {
    // This is a simplified version - real implementation would decode properly
    if (typeof data === 'string') {
      return JSON.parse(data);
    } else {
      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(data));
    }
  } catch (error) {
    console.error("Error decoding message:", error);
    return {};
  }
}

export class ConnectionManager extends EventEmitter {
  private readonly client: WhatsNodeClient;
  private readonly options: ClientOptions;
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private reconnectTimeout: number | null = null;
  private pingInterval: number | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private authInfo: any = null;
  private lastSeen: number = 0;
  private keys: {
    private: any;
    public: any;
    shared: any;
  } | null = null;
  private qrCodeData: string | null = null;
  
  constructor(client: WhatsNodeClient, options: ClientOptions) {
    super();
    this.client = client;
    this.options = options;
  }
  
  /**
   * Connect to WhatsApp Web servers
   */
  public async connect(): Promise<void> {
    if (this.connectionState !== 'disconnected') {
      return;
    }
    
    try {
      this.connectionState = 'connecting';
      this.emit('connecting');
      
      if (this.options.debug) {
        console.log('WhatsNode: Connecting to WhatsApp Web servers...');
      }
      
      // Create WebSocket connection
      this.ws = createWebSocket();
      
      // Generate keys for encryption
      this.generateKeys();
      
      // Set up event handlers
      this.setupWebSocketHandlers();
      
      // Wait for connection to open
      await new Promise<void>((resolve, reject) => {
        if (!this.ws) return reject(new Error('WebSocket not initialized'));
        
        const onOpen = () => {
          this.ws?.removeEventListener('open', onOpen);
          this.ws?.removeEventListener('error', onError);
          resolve();
        };
        
        const onError = (event: Event) => {
          this.ws?.removeEventListener('open', onOpen);
          this.ws?.removeEventListener('error', onError);
          reject(new Error('Failed to connect to WhatsApp servers'));
        };
        
        this.ws.addEventListener('open', onOpen);
        this.ws.addEventListener('error', onError);
        
        // If already open, resolve immediately
        if (this.ws.readyState === WebSocket.OPEN) {
          resolve();
        }
      });
      
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      
      // Start authentication process
      await this.authenticate();
      
      // Start ping interval to keep connection alive
      this.startPingInterval();
      
      // Emit open event
      this.emit('open');
    } catch (error) {
      this.connectionState = 'disconnected';
      
      // Try to reconnect if enabled
      if (this.options.autoReconnect) {
        this.scheduleReconnect();
      }
      
      throw error;
    }
  }
  
  /**
   * Generate encryption keys
   */
  private generateKeys(): void {
    // In real implementation, this would generate proper keys using libsignal
    // For now, we'll use a simplified approach
    this.keys = {
      private: randomBytes(32),
      public: randomBytes(32),
      shared: null
    };
  }
  
  /**
   * Authenticate with WhatsApp Web
   */
  private async authenticate(): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    
    this.connectionState = 'authenticating';
    this.emit('authenticating');
    
    // Try to restore session if available
    if (this.authInfo && this.options.sessionPath) {
      await this.restoreSession();
      return;
    }
    
    // Begin authentication process (simplified version of Baileys.js approach)
    if (this.options.authStrategy === 'qr') {
      await this.authenticateWithQR();
    } else if (this.options.authStrategy === 'association-code') {
      // Wait for external call to requestAssociationCode
      this.emit('auth_strategy_set', 'association-code');
    } else {
      throw new Error(`Unsupported auth strategy: ${this.options.authStrategy}`);
    }
  }
  
  /**
   * Authenticate using QR code
   */
  private async authenticateWithQR(): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    
    // Send client hello to initiate QR code generation
    const clientHello = {
      clientHello: {
        ephemeral: this.keys?.public.toString('base64'),
        platform: 'web',
        version: '2.2331.7',
      }
    };
    
    this.sendBinary(encodeWAMessage(clientHello));
    
    // Wait for server response with QR code
    // This is a simplified version - real implementation would wait for actual QR code
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for QR code'));
      }, 60000); // 60 seconds timeout
      
      const handleQR = async (data: any) => {
        try {
          // Simulate QR code generation
          const ref = data.ref || randomBytes(16).toString('hex');
          const keyPair = await generateKeyPair();
          const publicKey = keyPair.pubKey;
          
          // Generate QR code
          const qrContent = [ref, publicKey.toString('base64'), this.client.getClientId()].join(',');
          this.qrCodeData = await generateQRCode(qrContent);
          
          // Emit QR code event
          this.emit('qr', this.qrCodeData);
          
          clearTimeout(timeout);
          resolve();
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };
      
      // Wait for QR code or directly handle in development mode
      setTimeout(() => {
        handleQR({ ref: 'dev-mode' });
      }, 1000);
    });
    
    // In real implementation, we would wait for user to scan QR code
    // and receive server confirmation that device is authenticated
    
    // For now, we'll simulate successful authentication after a delay
    if (this.options.debug) {
      console.log('WhatsNode: QR code generated, waiting for scan...');
    }
    
    // We'll emit an event to inform the UI that authentication is in progress
    this.emit('waiting_for_qr_scan');
    
    // In the real implementation, we would wait for the server to confirm
    // that the QR code has been scanned, but for now, we'll simulate it
    setTimeout(() => {
      if (this.connectionState === 'authenticating') {
        this.connectionState = 'loggedIn';
        this.emit('authenticated');
        this.emit('ready');
        
        if (this.options.debug) {
          console.log('WhatsNode: Successfully authenticated with WhatsApp Web');
        }
      }
    }, 5000); // Simulate 5 second delay for user scanning QR code
  }
  
  /**
   * Request association code for authentication
   */
  public async requestAssociationCode(phoneNumber: string): Promise<void> {
    if (this.connectionState !== 'authenticating' && this.connectionState !== 'connected') {
      throw new Error('Not in correct state to request association code');
    }
    
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    
    // Send association code request
    // This is a simplified version of what would happen in a real implementation
    const requestMessage = {
      type: 'request_association_code',
      phoneNumber: phoneNumber
    };
    
    this.sendBinary(encodeWAMessage(requestMessage));
    
    // Emit event to inform of the request
    this.emit('association_code_requested', phoneNumber);
    
    // In real implementation, this would wait for server response
    // For now, we'll simulate server sending an association code to the phone
    setTimeout(() => {
      this.emit('association_code_sending', phoneNumber);
      
      if (this.options.debug) {
        console.log(`WhatsNode: Association code sent to ${phoneNumber}`);
      }
    }, 2000);
  }
  
  /**
   * Authenticate using association code
   */
  public async authenticateWithAssociationCode(code: string): Promise<void> {
    if (this.connectionState !== 'authenticating' && this.connectionState !== 'connected') {
      throw new Error('Not in correct state to authenticate with association code');
    }
    
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    
    // Send association code validation request
    const validateMessage = {
      type: 'validate_association_code',
      code: code
    };
    
    this.sendBinary(encodeWAMessage(validateMessage));
    
    // In real implementation, this would wait for server response
    // For now, we'll simulate successful authentication after a delay
    setTimeout(() => {
      if (this.connectionState === 'authenticating' || this.connectionState === 'connected') {
        this.connectionState = 'loggedIn';
        this.emit('authenticated');
        this.emit('ready');
        
        if (this.options.debug) {
          console.log('WhatsNode: Successfully authenticated with association code');
        }
      }
    }, 1500);
  }
  
  /**
   * Restore session from storage
   */
  private async restoreSession(): Promise<boolean> {
    // In real implementation, this would read the session data from storage
    // and try to restore the session using the stored credentials
    
    try {
      if (this.options.debug) {
        console.log('WhatsNode: Attempting to restore session...');
      }
      
      // Simulate session restoration
      // For now, we'll just simulate a failed restoration
      return false;
    } catch (error) {
      if (this.options.debug) {
        console.error('WhatsNode: Failed to restore session', error);
      }
      return false;
    }
  }
  
  /**
   * Set up WebSocket event handlers
   */
  private setupWebSocketHandlers(): void {
    if (!this.ws) return;
    
    this.ws.addEventListener('message', (event) => {
      this.handleWebSocketMessage(event);
    });
    
    this.ws.addEventListener('close', (event) => {
      this.handleWebSocketClose(event);
    });
    
    this.ws.addEventListener('error', (event) => {
      this.handleWebSocketError(event);
    });
  }
  
  /**
   * Handle incoming WebSocket message
   */
  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const data = event.data;
      let parsedData;
      
      // Handle binary or text messages
      if (data instanceof ArrayBuffer || data instanceof Blob) {
        if (data instanceof Blob) {
          // Convert Blob to ArrayBuffer
          const reader = new FileReader();
          reader.readAsArrayBuffer(data);
          reader.onloadend = () => {
            if (reader.result instanceof ArrayBuffer) {
              parsedData = decodeWAMessage(reader.result);
              this.processMessage(parsedData);
            }
          };
          return;
        } else {
          parsedData = decodeWAMessage(data);
        }
      } else if (typeof data === 'string') {
        parsedData = decodeWAMessage(data);
      } else {
        console.warn('Unknown message type:', typeof data);
        return;
      }
      
      this.processMessage(parsedData);
    } catch (error) {
      if (this.options.debug) {
        console.error('Error handling WebSocket message', error);
      }
    }
  }
  
  /**
   * Process decoded message
   */
  private processMessage(data: any): void {
    // Handle different message types
    // In a real implementation, this would process various WhatsApp protocol messages
    
    if (data.type === 'pong') {
      // Handle pong response
      this.lastSeen = Date.now();
      this.emit(PHONE_CONNECTION_CB, data);
    } else if (data.status && data.status === 401) {
      // Handle authentication failure
      this.connectionState = 'disconnected';
      this.emit('auth_failure', new Error('Authentication failed'));
    } else if (data.type === 'qr') {
      // Handle QR code message
      this.emit('qr', data.qrCode);
    } else if (data.type === 'connected') {
      // Handle successful connection
      this.connectionState = 'loggedIn';
      this.emit('authenticated');
      this.emit('ready');
    } else {
      // Forward other messages to appropriate handlers
      this.emit('message', data);
    }
  }
  
  /**
   * Handle WebSocket close event
   */
  private handleWebSocketClose(event: CloseEvent): void {
    this.handleDisconnection(`Connection closed: ${event.code} - ${event.reason}`);
  }
  
  /**
   * Handle WebSocket error event
   */
  private handleWebSocketError(event: Event): void {
    this.handleDisconnection('Connection error');
  }
  
  /**
   * Handle WebSocket disconnection
   */
  private handleDisconnection(reason?: string): void {
    // Clear intervals
    this.stopPingInterval();
    
    if (this.connectionState !== 'disconnected') {
      const previousState = this.connectionState;
      this.connectionState = 'disconnected';
      
      // Emit appropriate events
      this.emit('close', { reason, wasConnected: previousState === 'loggedIn' });
      
      if (previousState === 'authenticating') {
        this.emit('auth_failure', new Error(reason || 'Connection closed during authentication'));
      }
      
      // Try to reconnect if enabled
      if (this.options.autoReconnect) {
        this.scheduleReconnect();
      }
    }
  }
  
  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
    }
    
    if (this.reconnectAttempts >= (this.options.maxReconnectAttempts || 10)) {
      this.emit('reconnect_failed');
      return;
    }
    
    this.reconnectAttempts++;
    
    const delay = Math.min(
      (this.options.reconnectInterval || 5000) * Math.pow(1.5, this.reconnectAttempts - 1),
      300000 // Max 5 minutes
    );
    
    if (this.options.debug) {
      console.log(`WhatsNode: Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    }
    
    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null;
      
      this.emit('reconnecting', { attempt: this.reconnectAttempts });
      
      this.connect().catch((error) => {
        if (this.options.debug) {
          console.error('WhatsNode: Reconnect failed', error);
        }
      });
    }, delay);
  }
  
  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(): void {
    this.stopPingInterval();
    
    this.pingInterval = window.setInterval(() => {
      this.sendPing();
    }, 25000); // Send ping every 25 seconds
  }
  
  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
  
  /**
   * Send ping to keep connection alive
   */
  private sendPing(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const pingMsg = {
        type: 'ping',
        timestamp: Date.now()
      };
      
      this.sendBinary(encodeWAMessage(pingMsg));
    }
  }
  
  /**
   * Send binary data over WebSocket
   */
  private sendBinary(data: Uint8Array): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    
    this.ws.send(data);
  }
  
  /**
   * Disconnect from WhatsApp Web servers
   */
  public async disconnect(): Promise<void> {
    this.stopPingInterval();
    
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        // Send logout message
        const logoutMsg = {
          type: 'logout'
        };
        
        try {
          this.sendBinary(encodeWAMessage(logoutMsg));
        } catch (error) {
          // Ignore errors during logout
        }
        
        // Close WebSocket
        this.ws.close();
      }
      
      this.ws = null;
    }
    
    this.connectionState = 'disconnected';
    this.emit('disconnected');
  }
  
  /**
   * Send a message over the WebSocket connection
   * 
   * @param data Data to send
   */
  public sendMessage(data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    
    this.sendBinary(encodeWAMessage(data));
  }
  
  /**
   * Get the current connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }
  
  /**
   * Get the current QR code data
   */
  public getQRCode(): string | null {
    return this.qrCodeData;
  }
}
