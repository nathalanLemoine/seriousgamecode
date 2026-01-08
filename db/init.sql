
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'store_manager', 'admin') DEFAULT 'student',
    impact_co2 FLOAT DEFAULT 0,
    impact_euros FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(50), -- Code barre
    expiration_date DATE NOT NULL,
    original_price FLOAT NOT NULL,
    image_url VARCHAR(255)
);

CREATE TABLE paniers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(100) NOT NULL,
    prix_vente FLOAT NOT NULL, -- Prix réduit
    store_name VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    status ENUM('disponible', 'reserve', 'vendu') DEFAULT 'disponible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE panier_items (
    panier_id INT,
    product_id INT,
    quantity INT DEFAULT 1,
    PRIMARY KEY (panier_id, product_id),
    FOREIGN KEY (panier_id) REFERENCES paniers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Ou UUID
    user_id INT NOT NULL,
    panier_id INT NOT NULL,
    status ENUM('PENDING', 'PAID', 'COLLECTED') DEFAULT 'PENDING',
    pickup_code VARCHAR(10),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (panier_id) REFERENCES paniers(id)
);