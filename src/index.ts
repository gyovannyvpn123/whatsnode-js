/**
 * WhatsNode.js - O bibliotecă JavaScript robustă pentru interacțiunea cu WhatsApp Web
 * 
 * Acest fișier este punctul de intrare principal pentru biblioteca WhatsNode.js
 */

// Exportă funcția principală de creare client
export { createClient } from './lib/whatsnode';

// Exportă tipuri utile
export {
  WhatsNodeClient,
  ClientOptions
} from './lib/whatsnode/client';

export {
  WhatsNodeEvents,
  WhatsNodeMessage,
  WhatsNodeChat,
  WhatsNodeContact,
  WhatsNodeGroup
} from './lib/whatsnode/types';

export {
  AuthStrategy
} from './lib/whatsnode/auth';

// Exportă versiunea bibliotecii
export const version = '1.0.0';