/**
 * WhatsNode - A JavaScript library for interacting with WhatsApp Web
 * 
 * This is the main entry point for the WhatsNode library.
 */

import { WhatsNodeClient, ClientOptions } from './whatsnode/client';

/**
 * Creates a new WhatsNode client instance
 * 
 * @param options Client configuration options
 * @returns A new WhatsNode client instance
 */
export function createClient(options: ClientOptions): WhatsNodeClient {
  return new WhatsNodeClient(options);
}

// Export types and interfaces
export * from './whatsnode/types';

// Export individual modules for advanced usage
export * as auth from './whatsnode/auth';
export * as message from './whatsnode/message';
export * as media from './whatsnode/media';
export * as group from './whatsnode/group';
export * as contact from './whatsnode/contact';
export * as session from './whatsnode/session';
export * as utils from './whatsnode/utils';
