/**
 * Type definitions for WhatsNode
 */

/**
 * WhatsNode events
 */
export enum WhatsNodeEvents {
  // Connection events
  CONNECTION_OPENED = 'connection_opened',
  CONNECTION_CLOSED = 'connection_closed',
  CONNECTION_FAILED = 'connection_failed',
  
  // Authentication events
  QR_RECEIVED = 'qr',
  AUTHENTICATED = 'authenticated',
  AUTHENTICATION_FAILURE = 'auth_failure',
  
  // Client state events
  READY = 'ready',
  
  // Message events
  MESSAGE = 'message',
  MESSAGE_ACK = 'message_ack',
  MESSAGE_CREATE = 'message_create',
  MESSAGE_REVOKE = 'message_revoke',
  
  // Media message events
  MESSAGE_IMAGE = 'message_image',
  MESSAGE_VIDEO = 'message_video',
  MESSAGE_AUDIO = 'message_audio',
  MESSAGE_DOCUMENT = 'message_document',
  MESSAGE_LOCATION = 'message_location',
  MESSAGE_CONTACT = 'message_contact',
  
  // Group events
  GROUP_CREATE = 'group_create',
  GROUP_UPDATE = 'group_update',
  GROUP_JOIN = 'group_join',
  GROUP_LEAVE = 'group_leave',
  GROUP_REMOVE = 'group_remove',
  
  // Contact events
  CONTACT_UPDATE = 'contact_update',
  
  // Presence events
  PRESENCE_UPDATE = 'presence_update'
}

/**
 * Message types
 */
export type WhatsNodeMessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'sticker';

/**
 * Message media data
 */
export interface WhatsNodeMedia {
  data: string;
  mimetype: string;
  filename?: string;
}

/**
 * Message object
 */
export interface WhatsNodeMessage {
  id: string;
  body: string;
  from: string;
  to: string;
  hasMedia: boolean;
  mediaUrl?: string;
  mimetype?: string;
  timestamp: string;
  type: WhatsNodeMessageType;
  isForwarded: boolean;
  isStatus: boolean;
  isGroup: boolean;
  
  // Methods
  reply: (content: string) => Promise<WhatsNodeMessage>;
  downloadMedia: () => Promise<WhatsNodeMedia>;
}

/**
 * Chat object
 */
export interface WhatsNodeChat {
  id: string;
  name: string;
  isGroup: boolean;
  timestamp: string;
  unreadCount: number;
  
  // Methods
  fetchMessages: (limit?: number) => Promise<WhatsNodeMessage[]>;
  sendMessage: (content: string) => Promise<WhatsNodeMessage>;
}

/**
 * Contact object
 */
export interface WhatsNodeContact {
  id: string;
  name: string;
  number: string;
  isBusiness: boolean;
  isBlocked: boolean;
  isMyContact: boolean;
  
  // Methods
  sendMessage: (content: string) => Promise<WhatsNodeMessage>;
  getAbout: () => Promise<string>;
  getProfilePicture: () => Promise<string | null>;
  block: () => Promise<void>;
  unblock: () => Promise<void>;
}

/**
 * Group participant
 */
export interface WhatsNodeGroupParticipant {
  id: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * Group object
 */
export interface WhatsNodeGroup {
  id: string;
  name: string;
  participants: WhatsNodeGroupParticipant[];
  created: string;
  description?: string;
  
  // Methods
  sendMessage: (content: string) => Promise<WhatsNodeMessage>;
  addParticipants: (participants: string[]) => Promise<void>;
  removeParticipants: (participants: string[]) => Promise<void>;
  promoteParticipants: (participants: string[]) => Promise<void>;
  demoteParticipants: (participants: string[]) => Promise<void>;
  getInviteCode: () => Promise<string>;
}
