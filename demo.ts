import { sql, SQL } from "drizzle-orm";
import { db, pool, ENCRYPTION_KEY, HMAC_KEY } from "./db";

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const customers = [
  {
    name: "Kumaresan",
    phone: "9876543210",
  },
  {
    name: "Arun",
    phone: "9123456780",
  },
  {
    name: "Priya",
    phone: "9988776655",
  },
];

const tickets = [
  {
    subject: "Login Issue",
    phone: "9876543210",
  },
  {
    subject: "Payment Failed",
    phone: "9876543210",
  },
  {
    subject: "App Crash",
    phone: "9123456780",
  },
];

/* -------------------------------------------------------------------------- */
/*                               Helper Methods                               */
/* -------------------------------------------------------------------------- */

function printTitle(title: string) {
  console.log(`\n========== ${title} ==========\n`);
}

function phoneHashSql(phone: string | SQL) {
  return sql`
    encode(
      hmac(${phone}, ${HMAC_KEY}, 'sha256'),
      'hex'
    )
  `;
}

function decryptPhoneSql(column: SQL = sql.raw("phone_encrypted")) {
  return sql`
    pgp_sym_decrypt(
      ${column},
      ${ENCRYPTION_KEY}
    )::text
  `;
}

/* -------------------------------------------------------------------------- */
/*                                   Seed                                     */
/* -------------------------------------------------------------------------- */

async function seed() {
  printTitle("SEED CUSTOMERS");

  await db.execute(sql`
    INSERT INTO customers (
      name,
      phone_encrypted,
      phone_hash
    )
    VALUES
    ${sql.join(
      customers.map(
        (customer) => sql`
        (
          ${customer.name},
          pgp_sym_encrypt(
            ${customer.phone},
            ${ENCRYPTION_KEY}
          ),
          ${phoneHashSql(customer.phone)}
        )
      `,
      ),
      sql`,`,
    )}
    ON CONFLICT (phone_hash)
    DO NOTHING;
  `);

  console.log("✅ Customers inserted.");

  printTitle("SEED TICKETS");

  await db.execute(sql`
    INSERT INTO tickets (
      subject,
      customer_phone_hash
    )
    VALUES
    ${sql.join(
      tickets.map(
        (ticket) => sql`
        (
          ${ticket.subject},
          ${phoneHashSql(ticket.phone)}
        )
      `,
      ),
      sql`,`,
    )};
  `);

  console.log("✅ Tickets inserted.");
}

/* -------------------------------------------------------------------------- */
/*                              Search Customer                               */
/* -------------------------------------------------------------------------- */

async function searchCustomer(phone: string) {
  printTitle("SEARCH CUSTOMER");

  const result = await db.execute(sql`
    SELECT
      id,
      name,
      ${decryptPhoneSql()} AS phone
    FROM customers
    WHERE phone_hash = ${phoneHashSql(phone)};
  `);

  if (result.rows.length === 0) {
    console.log("❌ Customer not found.");
    return;
  }

  console.table(result.rows);
}

/* -------------------------------------------------------------------------- */
/*                               Customer Tickets                             */
/* -------------------------------------------------------------------------- */

async function getTickets(phone: string) {
  printTitle("CUSTOMER TICKETS");

  const result = await db.execute(sql`
    SELECT
      t.id,
      t.subject,
      c.name,
      ${decryptPhoneSql(sql.raw("c.phone_encrypted"))} AS phone
    FROM tickets t
    INNER JOIN customers c
      ON c.phone_hash = t.customer_phone_hash
    WHERE c.phone_hash = ${phoneHashSql(phone)};
  `);

  if (result.rows.length === 0) {
    console.log("❌ No tickets found.");
    return;
  }

  console.table(result.rows);
}

/* -------------------------------------------------------------------------- */
/*                               Dump Customers                               */
/* -------------------------------------------------------------------------- */

async function dumpCustomers() {
  printTitle("RAW DATABASE");

  const result = await db.execute(sql`
    SELECT
      id,
      name,
      phone_encrypted,
      phone_hash,
      created_at
    FROM customers;
  `);

  console.table(result.rows);
}

/* -------------------------------------------------------------------------- */
/*                                Dump Tickets                                */
/* -------------------------------------------------------------------------- */

async function dumpTickets() {
  printTitle("RAW TICKETS");

  const result = await db.execute(sql`
    SELECT
      *
    FROM tickets;
  `);

  console.table(result.rows);
}

/* -------------------------------------------------------------------------- */
/*                                    Main                                    */
/* -------------------------------------------------------------------------- */

async function main() {
  console.log("\n=====================================");
  console.log(" PostgreSQL pgcrypto Demo ");
  console.log("=====================================");

  // Run once after migration
  // await seed();

  await searchCustomer("9876543210");

  await getTickets("9876543210");

  await dumpCustomers();

  await dumpTickets();

  await pool.end();

  console.log("\n✅ Demo completed.\n");
}

main().catch(async (error) => {
  console.error("❌ Error:", error);
  await pool.end();
  process.exit(1);
});