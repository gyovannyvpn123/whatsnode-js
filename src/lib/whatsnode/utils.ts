/**
 * Utility functions for WhatsNode
 */

/**
 * Validate a phone number
 * 
 * @param phoneNumber Phone number to validate
 * @returns Whether the phone number is valid
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic validation - this should be enhanced for production use
  return /^\+?\d{10,15}$/.test(phoneNumber);
}

/**
 * Format a phone number to WhatsApp ID format
 * 
 * @param phoneNumber Phone number to format
 * @returns WhatsApp ID
 */
export function formatToWhatsAppId(phoneNumber: string): string {
  // Remove any non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  return `${digits}@c.us`;
}

/**
 * Validate a WhatsApp ID
 * 
 * @param id ID to validate
 * @returns Whether the ID is valid
 */
export function isValidWhatsAppId(id: string): boolean {
  return /^\d+@(c\.us|g\.us)$/.test(id);
}

/**
 * Check if an ID is a group ID
 * 
 * @param id ID to check
 * @returns Whether the ID is a group ID
 */
export function isGroupId(id: string): boolean {
  return id.endsWith('@g.us');
}

/**
 * Check if an ID is a contact ID
 * 
 * @param id ID to check
 * @returns Whether the ID is a contact ID
 */
export function isContactId(id: string): boolean {
  return id.endsWith('@c.us');
}

/**
 * Generate a random message ID
 * 
 * @returns Random message ID
 */
export function generateMessageId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${timestamp}.${random}`;
}

/**
 * Sleep for a specified number of milliseconds
 * 
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a retry function that will retry a function until it succeeds or
 * the maximum number of retries is reached
 * 
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries
 * @param delay Delay between retries in milliseconds
 * @returns Function that will retry the original function
 */
export function createRetryFunction<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): () => Promise<T> {
  return async (): Promise<T> => {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries - 1) {
          await sleep(delay);
        }
      }
    }
    
    throw lastError;
  };
}
