import {pool} from '../db/index.js';

const createTable = async() => {
    try {
        await pool.query(
            `CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_id INT DEFAULT NULL,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                refresh_token TEXT NOT NULL,
                role ENUM('admin', 'staff') DEFAULT 'staff',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP DEFAULT NULL,
                FOREIGN KEY (company_id) REFERENCES companies(id)
            );`
        )
        console.log("users table created successfully");

        await pool.query(
            `CREATE TABLE IF NOT EXISTS customers(
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP DEFAULT NULL
            );`
        )
        console.log("customers table created successfully");

        await pool.query(
            `CREATE TABLE IF NOT EXISTS suppliers(
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                email VARCHAR(150) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                address TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP DEFAULT NULL
            );`
        )
        console.log("suppliers table created successfully");

        await pool.query(
            `CREATE TABLE IF NOT EXISTS products(
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                category VARCHAR(100),
                price DECIMAL(10, 2) NOT NULL,
                stock VARCHAR(100) DEFAULT "0",
                min_stock VARCHAR(100) DEFAULT "0",
                image_url VARCHAR(255),
                stock_status ENUM('in_stock', 'out_of_stock', 'low_stock') DEFAULT 'in_stock',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP DEFAULT NULL
            );`
        )
        console.log("products table created successfully");
        
        // purchases (when business buys stock from supplier)
        await pool.query(
            `CREATE TABLE IF NOT EXISTS purchases(
                id INT AUTO_INCREMENT PRIMARY KEY,
                supplier_id INT NOT NULL,
                created_by INT,
                total_amount DECIMAL(12, 2) DEFAULT 0,
                price_updated TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
                FOREIGN KEY (created_by) REFERENCES users(id)
            );`
        )
        console.log("purchases table created successfully");


        // drafts table (like purchases but status is "draft")
        await pool.query(
            `CREATE TABLE IF NOT EXISTS purchase_drafts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                supplier_id INT NOT NULL,
                created_by INT,
                purchase_id INT DEFAULT NULL,
                status ENUM('draft', 'ordered', 'delivered') DEFAULT 'draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP DEFAULT NULL,
                FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
                FOREIGN KEY (created_by) REFERENCES users(id)
            );`
        )

        // draft_items (like purchase_items)
        await pool.query(
            `CREATE TABLE IF NOT EXISTS purchase_draft_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                draft_id INT NOT NULL,
                product_id INT NOT NULL,
                purchase_id INT DEFAULT NULL,
                quantity INT NOT NULL,
                FOREIGN KEY (draft_id) REFERENCES purchase_drafts(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id)
            );`
        )

        
        // purchase_items (line items for purchase)
        await pool.query(
            `CREATE TABLE IF NOT EXISTS purchase_items(
                id INT AUTO_INCREMENT PRIMARY KEY,
                purchase_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id)  
            );`
        )
        console.log("purchase_items table created successfully");
        
        // sales (when customer buys from business)
        await pool.query(
            `CREATE TABLE IF NOT EXISTS sales(
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT,
                total_amount DECIMAL(12, 2) NOT NULL,
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP DEFAULT NULL,
                FOREIGN KEY (customer_id) REFERENCES customers(id),
                FOREIGN KEY (created_by) REFERENCES users(id)
            );`
        )
        console.log("sales table created successfully");
        
        // sale_items (line items for each sale)
        await pool.query(
            `CREATE TABLE IF NOT EXISTS sale_items(
                id INT AUTO_INCREMENT PRIMARY KEY,
                sale_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                deleted_at TIMESTAMP DEFAULT NULL,
                FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id)
            );`
        )
        console.log("sale_items table created successfully");

        await pool.query(
            `CREATE TABLE IF NOT EXISTS companies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_name VARCHAR(150) NOT NULL,
                company_email VARCHAR(150) UNIQUE NOT NULL,
                no_of_staff INT DEFAULT 0,
                no_of_admin INT DEFAULT 1,
                plan ENUM('free', 'starter', 'enterprise') DEFAULT 'free',
                created_by INT NULL,
                tokens TEXT DEFAULT NULL,
                address TEXT DEFAULT NULL,
                timezoneFrom VARCHAR(50) DEFAULT NULL,
                timezoneTo VARCHAR(50) DEFAULT NULL,
                otp VARCHAR(10) DEFAULT NULL,
                otpExpiry DATETIME DEFAULT NULL,
                isVerified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP DEFAULT NULL,
                FOREIGN KEY (created_by) REFERENCES users(id)
            );`
        );
        console.log("companies table created successfully");

        await pool.query(
            `CREATE TABLE IF NOT EXISTS logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                action_type VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );`
        );
        console.log("logs table created successfully");


    } catch (error) {
        console.log("Something went wrong", error);
    }
}

export {createTable};