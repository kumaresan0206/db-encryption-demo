import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * PostgreSQL connection
 */
export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://postgres:Kuman%4002@localhost/postgres",
});

/**
 * Drizzle ORM instance
 */
export const db = drizzle(pool);

/**
 * pgcrypto encryption key
 *
 * Used with:
 * pgp_sym_encrypt()
 * pgp_sym_decrypt()
 */
export const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ??
  "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";

/**
 * pgcrypto HMAC key
 *
 * Used with:
 * hmac(data, key, 'sha256')
 */
export const HMAC_KEY =
  process.env.HMAC_LOOKUP_KEY ??
  "ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100";

/**
 * Validate required environment variables.
 */
if (!ENCRYPTION_KEY) {
  console.warn(
    "⚠️ ENCRYPTION_KEY not found. Using default demo key."
  );
}

if (!HMAC_KEY) {
  console.warn(
    "⚠️ HMAC_LOOKUP_KEY not found. Using default demo key."
  );
}