import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  customType,
} from "drizzle-orm/pg-core";

/**
 * PostgreSQL BYTEA type
 */
const bytea = customType<{
  data: Buffer;
  driverData: Buffer;
}>({
  dataType() {
    return "bytea";
  },
});

/**
 * Customers table
 */
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),

  name: text("name").notNull(),

  /**
   * Encrypted phone number.
   *
   * Stored using:
   * pgp_sym_encrypt(phone, encryptionKey)
   */
  phoneEncrypted: bytea("phone_encrypted").notNull(),

  /**
   * Used only for searching.
   *
   * Generated using:
   * hmac(phone, hashKey, 'sha256')
   */
  phoneHash: varchar("phone_hash", {
    length: 64,
  }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Tickets table
 */
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),

  subject: text("subject").notNull(),

  /**
   * Stores only the customer's phone hash.
   * Never stores the actual phone number.
   */
  customerPhoneHash: varchar("customer_phone_hash", {
    length: 64,
  }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
