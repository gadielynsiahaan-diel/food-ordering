-- =====================================================
-- FOOD ORDERING TERAS LA
-- FINAL DATABASE
-- VERSION 1.0
-- Compatible : TiDB Cloud
-- =====================================================

DROP DATABASE IF EXISTS food_ordering;

CREATE DATABASE food_ordering;

USE food_ordering;

-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE users (

    id INT AUTO_INCREMENT PRIMARY KEY,

    nama VARCHAR(100) NOT NULL,

    email VARCHAR(100) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    role ENUM(

        'buyer',

        'seller',

        'admin'

    ) NOT NULL,

    foto VARCHAR(255)
    DEFAULT 'default-profile.png',

    no_hp VARCHAR(20),

    alamat TEXT,

    is_active BOOLEAN
    DEFAULT TRUE,

    created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP

);

-- =====================================================
-- TENANTS
-- =====================================================

CREATE TABLE tenants (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    nama VARCHAR(150) NOT NULL,

    kategori VARCHAR(100),

    deskripsi TEXT,

    logo VARCHAR(255)
    DEFAULT 'default-tenant.jpg',

    banner VARCHAR(255)
    DEFAULT 'default-banner.jpg',

    jam_buka TIME,

    jam_tutup TIME,

    estimasi_waktu VARCHAR(30)
    DEFAULT '15-20 Menit',

    minimal_pesanan DECIMAL(12,2)
    DEFAULT 0,

    rating DECIMAL(2,1)
    DEFAULT 0.0,

    total_review INT
    DEFAULT 0,

    status ENUM(

        'open',

        'close'

    ) DEFAULT 'open',

    created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tenant_user

    FOREIGN KEY(user_id)

    REFERENCES users(id)

    ON UPDATE CASCADE

    ON DELETE CASCADE

);

-- =====================================================
-- MENUS
-- =====================================================

CREATE TABLE menus (

    id INT AUTO_INCREMENT PRIMARY KEY,

    tenant_id INT NOT NULL,

    nama VARCHAR(150) NOT NULL,

    kategori VARCHAR(100),

    harga DECIMAL(12,2) NOT NULL,

    deskripsi TEXT,

    gambar VARCHAR(255)
    DEFAULT 'default-menu.jpg',

    stok INT
    DEFAULT 0,

    is_recommend BOOLEAN
    DEFAULT FALSE,

    status ENUM(

        'Tersedia',

        'Habis'

    ) DEFAULT 'Tersedia',

    created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_menu_tenant

    FOREIGN KEY(tenant_id)

    REFERENCES tenants(id)

    ON UPDATE CASCADE

    ON DELETE CASCADE

);

-- =====================================================
-- INDEX USERS
-- =====================================================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_role
ON users(role);

-- =====================================================
-- INDEX TENANTS
-- =====================================================

CREATE INDEX idx_tenant_user
ON tenants(user_id);

CREATE INDEX idx_tenant_status
ON tenants(status);

CREATE INDEX idx_tenant_nama
ON tenants(nama);

-- =====================================================
-- INDEX MENUS
-- =====================================================

CREATE INDEX idx_menu_tenant
ON menus(tenant_id);

CREATE INDEX idx_menu_status
ON menus(status);

CREATE INDEX idx_menu_nama
ON menus(nama);

CREATE INDEX idx_menu_kategori
ON menus(kategori);

-- =====================================================
-- CARTS
-- =====================================================

CREATE TABLE carts (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    menu_id INT NOT NULL,

    qty INT NOT NULL DEFAULT 1,

    harga DECIMAL(12,2) NOT NULL,

    catatan TEXT,

    created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_user

    FOREIGN KEY(user_id)

    REFERENCES users(id)

    ON UPDATE CASCADE

    ON DELETE CASCADE,

    CONSTRAINT fk_cart_menu

    FOREIGN KEY(menu_id)

    REFERENCES menus(id)

    ON UPDATE CASCADE

    ON DELETE CASCADE,

    -- Satu user hanya boleh memiliki satu baris
    -- untuk menu yang sama
    CONSTRAINT uq_cart_user_menu

    UNIQUE(user_id, menu_id),

    -- Qty minimal 1
    CONSTRAINT chk_cart_qty

    CHECK (qty > 0)

);

-- =====================================================
-- INDEX CARTS
-- =====================================================

CREATE INDEX idx_cart_user
ON carts(user_id);

CREATE INDEX idx_cart_menu
ON carts(menu_id);

-- =====================================================
-- ORDERS
-- =====================================================

CREATE TABLE orders (

    id INT AUTO_INCREMENT PRIMARY KEY,

    kode_order VARCHAR(30) NOT NULL UNIQUE,

    user_id INT NOT NULL,

    tenant_id INT NOT NULL,

    nomor_meja VARCHAR(10),

    total DECIMAL(12,2) NOT NULL,

    metode_pembayaran ENUM(

        'Cash',

        'QRIS'

    ) DEFAULT 'Cash',

    status ENUM(

        'Pending',

        'Diproses',

        'Siap Diambil',

        'Selesai',

        'Dibatalkan'

    ) DEFAULT 'Pending',

    catatan TEXT,

    tanggal_selesai DATETIME NULL,

    created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_user

    FOREIGN KEY(user_id)

    REFERENCES users(id)

    ON UPDATE CASCADE

    ON DELETE RESTRICT,

    CONSTRAINT fk_order_tenant

    FOREIGN KEY(tenant_id)

    REFERENCES tenants(id)

    ON UPDATE CASCADE

    ON DELETE RESTRICT

);

-- =====================================================
-- ORDER ITEMS
-- =====================================================

CREATE TABLE order_items (

    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL UNIQUE,

    menu_id INT NOT NULL,

    nama_menu VARCHAR(150) NOT NULL,

    qty INT NOT NULL,

    harga DECIMAL(12,2) NOT NULL,

    subtotal DECIMAL(12,2) NOT NULL,

    catatan TEXT,

    created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_item_order

    FOREIGN KEY(order_id)

    REFERENCES orders(id)

    ON UPDATE CASCADE

    ON DELETE CASCADE,

    CONSTRAINT fk_order_item_menu

    FOREIGN KEY(menu_id)

    REFERENCES menus(id)

    ON UPDATE CASCADE

    ON DELETE RESTRICT

);

-- =====================================================
-- INDEX ORDERS
-- =====================================================

CREATE INDEX idx_order_user
ON orders(user_id);

CREATE INDEX idx_order_tenant
ON orders(tenant_id);

CREATE INDEX idx_order_status
ON orders(status);

CREATE INDEX idx_order_created
ON orders(created_at);

CREATE INDEX idx_order_kode
ON orders(kode_order);

-- =====================================================
-- INDEX ORDER ITEMS
-- =====================================================

CREATE INDEX idx_order_item_order
ON order_items(order_id);

CREATE INDEX idx_order_item_menu
ON order_items(menu_id);

-- =====================================================
-- REVIEWS
-- =====================================================

CREATE TABLE reviews (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    tenant_id INT NOT NULL,

    order_id INT NOT NULL UNIQUE,

    rating TINYINT NOT NULL,

    komentar TEXT,

    created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_user

    FOREIGN KEY(user_id)

    REFERENCES users(id)

    ON UPDATE CASCADE

    ON DELETE CASCADE,

    CONSTRAINT fk_review_tenant

    FOREIGN KEY(tenant_id)

    REFERENCES tenants(id)

    ON UPDATE CASCADE

    ON DELETE CASCADE,

    CONSTRAINT fk_review_order

    FOREIGN KEY(order_id)

    REFERENCES orders(id)

    ON UPDATE CASCADE

    ON DELETE CASCADE

);

-- =====================================================
-- PAYMENTS
-- =====================================================

CREATE TABLE payments (

    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL UNIQUE,

    metode ENUM(

        'Cash',

        'QRIS'

    ) NOT NULL,

    jumlah DECIMAL(12,2) NOT NULL,

    status ENUM(

        'Pending',

        'Berhasil',

        'Gagal'

    ) DEFAULT 'Pending',

    provider_reference VARCHAR(100),

    waktu_bayar DATETIME,

    created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_order

    FOREIGN KEY(order_id)

    REFERENCES orders(id)

    ON UPDATE CASCADE

    ON DELETE CASCADE

);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    judul VARCHAR(100) NOT NULL,

    pesan TEXT NOT NULL,

    tipe ENUM(

        'order',

        'payment',

        'promo',

        'system'

    ) DEFAULT 'system',

    is_read BOOLEAN
    DEFAULT FALSE,

    created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user

    FOREIGN KEY(user_id)

    REFERENCES users(id)

    ON UPDATE CASCADE

    ON DELETE CASCADE

);

-- =====================================================
-- INDEX REVIEWS
-- =====================================================

CREATE INDEX idx_review_user
ON reviews(user_id);

CREATE INDEX idx_review_tenant
ON reviews(tenant_id);

CREATE INDEX idx_review_order
ON reviews(order_id);

-- =====================================================
-- INDEX PAYMENTS
-- =====================================================

CREATE INDEX idx_payment_order
ON payments(order_id);

CREATE INDEX idx_payment_status
ON payments(status);

CREATE INDEX idx_payment_metode
ON payments(metode);

-- =====================================================
-- INDEX NOTIFICATIONS
-- =====================================================

CREATE INDEX idx_notification_user
ON notifications(user_id);

CREATE INDEX idx_notification_read
ON notifications(is_read);