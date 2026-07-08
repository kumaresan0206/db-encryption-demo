-- ============================================================
-- Enable pgcrypto extension
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Drop old tables (for demo only)
-- ============================================================
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS customers;

-- ============================================================
-- Customers
-- ============================================================
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,

    name TEXT NOT NULL,

    -- Encrypted using pgp_sym_encrypt()
    phone_encrypted BYTEA NOT NULL,

    -- HMAC hash for searching
    phone_hash VARCHAR(64) NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_phone_hash
ON customers(phone_hash);

-- ============================================================
-- Tickets
-- ============================================================
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,

    subject TEXT NOT NULL,

    customer_phone_hash VARCHAR(64) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_phone_hash
ON tickets(customer_phone_hash);

-- ============================================================
-- Verify pgcrypto is installed
-- ============================================================
SELECT extname
FROM pg_extension
WHERE extname = 'pgcrypto';