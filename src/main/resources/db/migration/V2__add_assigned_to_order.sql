-- Add assigned_to column to orders and FK to users
ALTER TABLE orders
    ADD COLUMN assigned_to uuid;

-- add foreign key constraint if users table exists
ALTER TABLE orders
    ADD CONSTRAINT fk_orders_assigned_to_users FOREIGN KEY (assigned_to) REFERENCES users(id);
