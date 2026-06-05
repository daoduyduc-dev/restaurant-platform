-- Initial database schema creation

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id uuid PRIMARY KEY,
    created_date timestamp(6) NOT NULL,
    modified_date timestamp(6) NOT NULL,
    created_by varchar(255),
    modified_by varchar(255),
    code varchar(100) NOT NULL UNIQUE,
    description varchar(255) NOT NULL,
    module varchar(50) NOT NULL,
    active boolean NOT NULL
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id uuid PRIMARY KEY,
    created_date timestamp(6) NOT NULL,
    modified_date timestamp(6) NOT NULL,
    created_by varchar(255),
    modified_by varchar(255),
    name varchar(50) NOT NULL UNIQUE
);

-- Role-Permission junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY,
    created_date timestamp(6) NOT NULL,
    modified_date timestamp(6) NOT NULL,
    created_by varchar(255),
    modified_by varchar(255),
    name varchar(100) NOT NULL,
    password varchar(255) NOT NULL,
    email varchar(100) NOT NULL UNIQUE,
    phone varchar(20),
    address varchar(255),
    avatar_url varchar(255),
    active boolean NOT NULL,
    is_deleted boolean DEFAULT false
);

-- Create index for user email
CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);

-- User-Role junction table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY,
    created_date timestamp(6) NOT NULL,
    modified_date timestamp(6) NOT NULL,
    created_by varchar(255),
    modified_by varchar(255),
    name varchar(255) NOT NULL UNIQUE,
    description varchar(255),
    icon varchar(255),
    color varchar(50),
    sort_order integer,
    is_deleted boolean DEFAULT false
);

-- Menu Items table
CREATE TABLE IF NOT EXISTS menu_items (
    id uuid PRIMARY KEY,
    created_date timestamp(6) NOT NULL,
    modified_date timestamp(6) NOT NULL,
    created_by varchar(255),
    modified_by varchar(255),
    name varchar(255) NOT NULL,
    description varchar(255),
    price numeric(12, 2) NOT NULL,
    image_url varchar(255),
    preparation_time integer,
    category_id uuid,
    available boolean,
    is_deleted boolean DEFAULT false,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Create index for menu items
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category_id);

-- Combos table
CREATE TABLE IF NOT EXISTS combos (
    id uuid PRIMARY KEY,
    created_date timestamp(6) NOT NULL,
    modified_date timestamp(6) NOT NULL,
    created_by varchar(255),
    modified_by varchar(255),
    name varchar(255),
    description varchar(255),
    price numeric(12, 2),
    is_deleted boolean DEFAULT false
);

-- Combo Items table
CREATE TABLE IF NOT EXISTS combo_items (
    id uuid PRIMARY KEY,
    created_date timestamp(6) NOT NULL,
    modified_date timestamp(6) NOT NULL,
    created_by varchar(255),
    modified_by varchar(255),
    combo_id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    quantity integer NOT NULL,
    is_deleted boolean DEFAULT false,
    FOREIGN KEY (combo_id) REFERENCES combos(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Tables table
CREATE TABLE IF NOT EXISTS tables (
    id uuid PRIMARY KEY,
    created_date timestamp(6) NOT NULL,
    modified_date timestamp(6) NOT NULL,
    created_by varchar(255),
    modified_by varchar(255),
    name varchar(255) NOT NULL UNIQUE,
    capacity integer NOT NULL,
    status varchar(50),
    position_x double precision,
    position_y double precision,
    zone varchar(255),
    floor integer,
    type varchar(20) NOT NULL,
    is_deleted boolean DEFAULT false
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id uuid PRIMARY KEY,
    created_date timestamp(6) NOT NULL,
    modified_date timestamp(6) NOT NULL,
    created_by varchar(255),
    modified_by varchar(255),
    customer_name varchar(255),
    phone varchar(20),
    reservation_time timestamp(6) NOT NULL,
    end_time timestamp(6) NOT NULL,
    number_of_guests integer,
    table_id uuid NOT NULL,
    user_id uuid,
    notes varchar(255),
    status varchar(50),
    is_deleted boolean DEFAULT false,
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create index for reservations
CREATE INDEX IF NOT EXISTS idx_table_time ON reservations(table_id, reservation_time, end_time);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY,
    created_date timestamp(6) NOT NULL,
    modified_date timestamp(6) NOT NULL,
    created_by varchar(255),
    modified_by varchar(255),
    table_id uuid NOT NULL,
    reservation_id uuid,
    status varchar(50) NOT NULL,
    total_amount numeric(12, 2),
    assigned_to uuid,
    is_deleted boolean DEFAULT false,
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_order_table ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_order_reservation ON orders(reservation_id);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY,
    created_date timestamp(6) NOT NULL,
    modified_date timestamp(6) NOT NULL,
    created_by varchar(255),
    modified_by varchar(255),
    order_id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    quantity integer NOT NULL,
    price numeric(12, 2) NOT NULL,
    is_deleted boolean DEFAULT false,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Create indexes for order items
CREATE INDEX IF NOT EXISTS idx_order_item_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_item_menu ON order_items(menu_item_id);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY,
    created_date timestamp(6) NOT NULL,
    modified_date timestamp(6) NOT NULL,
    created_by varchar(255),
    modified_by varchar(255),
    order_id uuid NOT NULL,
    method varchar(50) NOT NULL,
    status varchar(50) NOT NULL,
    amount numeric(12, 2) NOT NULL,
    transaction_id varchar(255),
    payment_url varchar(255),
    is_deleted boolean DEFAULT false,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Create index for payments
CREATE INDEX IF NOT EXISTS idx_payment_order ON payments(order_id);

-- Refresh Tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id bigserial PRIMARY KEY,
    token varchar(255) NOT NULL UNIQUE,
    username varchar(255),
    expiry_date timestamp(6),
    revoked boolean
);

-- Blacklisted Tokens table
CREATE TABLE IF NOT EXISTS blacklisted_tokens (
    id bigserial PRIMARY KEY,
    token varchar(255) NOT NULL UNIQUE,
    expiry_date timestamp(6)
);

-- Password Reset Tokens table
CREATE TABLE IF NOT EXISTS password_reset_token (
    id bigserial PRIMARY KEY,
    token varchar(255),
    email varchar(255),
    expiry_date timestamp(6),
    used boolean
);

-- Loyalty Accounts table
CREATE TABLE IF NOT EXISTS loyalty_accounts (
    user_id uuid PRIMARY KEY,
    points numeric(12, 2) NOT NULL,
    tier varchar(50) NOT NULL,
    total_points_earned numeric(12, 2) NOT NULL,
    total_points_redeemed numeric(12, 2) NOT NULL,
    total_spent numeric(12, 2) NOT NULL,
    last_updated timestamp(6) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Loyalty Transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,
    points numeric(12, 2) NOT NULL,
    type varchar(50) NOT NULL,
    description varchar(255),
    created_date timestamp(6) NOT NULL
);

-- Create index for loyalty transactions
CREATE INDEX IF NOT EXISTS idx_loyalty_user ON loyalty_transactions(user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY,
    created_date timestamp(6) NOT NULL,
    modified_date timestamp(6) NOT NULL,
    created_by varchar(255),
    modified_by varchar(255),
    user_id uuid NOT NULL,
    type varchar(50) NOT NULL,
    title varchar(255) NOT NULL,
    message TEXT NOT NULL,
    content TEXT,
    is_read boolean NOT NULL,
    notification_channel varchar(50) NOT NULL,
    is_deleted boolean DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notification_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON notifications(created_date);
CREATE INDEX IF NOT EXISTS idx_notification_is_read ON notifications(is_read);

-- Restaurant Settings table
CREATE TABLE IF NOT EXISTS restaurant_settings (
    id uuid PRIMARY KEY,
    created_date timestamp(6) NOT NULL,
    modified_date timestamp(6) NOT NULL,
    created_by varchar(255),
    modified_by varchar(255),
    restaurant_name varchar(150) NOT NULL,
    email varchar(150) NOT NULL,
    phone varchar(50) NOT NULL,
    address varchar(255) NOT NULL,
    opening_time varchar(10) NOT NULL,
    closing_time varchar(10) NOT NULL,
    no_show_grace_period integer NOT NULL,
    default_reservation_duration integer NOT NULL,
    loyalty_points_per_dollar integer NOT NULL,
    auto_assign_waiter boolean NOT NULL,
    email_notifications boolean NOT NULL,
    sms_notifications boolean NOT NULL,
    dark_mode boolean NOT NULL,
    language varchar(10) NOT NULL,
    vip_table_fee numeric(12, 2) NOT NULL DEFAULT 25.00
);
