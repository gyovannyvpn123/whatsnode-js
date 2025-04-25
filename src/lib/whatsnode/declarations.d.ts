/**
 * Type declarations for modules without TypeScript definitions
 */

declare module 'libsignal' {
  interface KeyPair {
    pubKey: Buffer;
    privKey: Buffer;
  }

  export function generateKeyPair(): Promise<KeyPair>;
  export function sharedKey(privateKey: Buffer, publicKey: Buffer): Buffer;
  
  export const Curve: {
    generateKeyPair(): KeyPair;
    sharedKey(privateKey: Buffer, publicKey: Buffer): Buffer;
    sign(privateKey: Buffer, message: Buffer): Buffer;
    verify(publicKey: Buffer, message: Buffer, signature: Buffer): boolean;
  };
}