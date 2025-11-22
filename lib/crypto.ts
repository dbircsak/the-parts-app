import { webcrypto } from "crypto";
const crypto = webcrypto;

const SALT_LENGTH = 16;

async function pbkdf2(
  password: string,
  salt: Uint8Array,
  iterations: number,
  length: number
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new Uint8Array(salt),
      iterations,
      hash: "SHA-256",
    },
    passwordKey,
    length * 8
  );

  return new Uint8Array(bits);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const hash = await pbkdf2(password, salt, 100000, 64);
  return bytesToHex(salt) + ":" + bytesToHex(hash);
}

export async function comparePasswords(
  password: string,
  hash: string
): Promise<boolean> {
  const [saltHex, hashHex] = hash.split(":");
  const salt = hexToBytes(saltHex);
  const computed = await pbkdf2(password, salt, 100000, 64);
  return bytesToHex(computed) === hashHex;
}

export function validatePassword(
  password: string
): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }
  return { valid: true };
}
