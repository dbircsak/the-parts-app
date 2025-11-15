import crypto from "crypto";

const SALT_LENGTH = 16;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256");
  return salt.toString("hex") + ":" + hash.toString("hex");
}

export async function comparePasswords(
  password: string,
  hash: string
): Promise<boolean> {
  const [saltHex, hashHex] = hash.split(":");
  const salt = Buffer.from(saltHex, "hex");
  const computed = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256");
  return computed.toString("hex") === hashHex;
}
