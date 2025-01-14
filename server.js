const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Initialize database tables
db.serialize(() => {
    // Drop existing tables first
    db.run("DROP TABLE IF EXISTS products");
    db.run("DROP TABLE IF EXISTS wishlist");
    db.run("DROP TABLE IF EXISTS cart");

    // Create tables with updated schema
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image_url TEXT,
        category TEXT,
        sizes TEXT,
        featured BOOLEAN DEFAULT 0
    )`, [], (err) => {
        if (err) {
            console.error('Error creating tables:', err);
            return;
        }

        // Check if products exist
        db.get("SELECT COUNT(*) as count FROM products", [], (err, row) => {
            if (err) {
                console.error('Error checking products:', err);
                return;
            }
            
            if (row.count === 0) {
                console.log('Populating database with sample products...');
                populateDatabase();
            }
        });
    });

    // Create other tables
    db.run(`CREATE TABLE IF NOT EXISTS wishlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        FOREIGN KEY(product_id) REFERENCES products(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        quantity INTEGER DEFAULT 1,
        FOREIGN KEY(product_id) REFERENCES products(id)
    )`);
});

function populateDatabase() {
    const sampleProducts = [
        {
            name: 'Premium Satin Royal Blue Shirt',
            price: 2999.99,
            description: 'Designed by Royal & Loyal People of India',
            image_url: '/images/purple.jpg',
            category: 'Shirt',
            sizes: ['S', 'M', 'L', 'XL'],
            featured: true
        },
        {
            name: 'Designer Red Fur Jacket',
            price: 11499.99,
            description: 'Premium Italian Red Fur Jacket',
            image_url: '/images/red.jpg',
            category: 'Jacket',
            sizes: ['M', 'L', 'XL', 'XXL'],
            featured: true
        },
        {
            name: 'Designer Green Denim Jacket',
            price: 7499.99,
            description: 'Elegant French-designed Evening Gown',
            image_url: '/images/green.jpg',
            category: 'Dress',
            sizes: ['S', 'M', 'L'],
            featured: true
        },

        // Collection Products
        {
            name: 'Classic White Oxford Shirt',
            price: 2499.99,
            description: 'Premium Cotton Business Shirt',
            image_url: '/images/white.jpg',
            category: 'Shirt',
            sizes: ['S', 'M', 'L', 'XL'],
            featured: false
        },
        {
            name: 'Vintage Leather Bomber',
            price: 8999.99,
            description: 'Classic Brown Leather Jacket',
            image_url: '/images/leather-jacket.JPG',
            category: 'Jacket',
            sizes: ['M', 'L', 'XL'],
            featured: false
        },
        {
            name: 'Floral Summer Dress',
            price: 3999.99,
            description: 'Light and Elegant Floral Pattern Dress',
            image_url: '/images/floral-dress.JPG',
            category: 'Dress',
            sizes: ['XS', 'S', 'M', 'L'],
            featured: false
        },
        {
            name: 'Striped Business Shirt',
            price: 2799.99,
            description: 'Professional Striped Cotton Shirt',
            image_url: '/images/striped-shirt.JPG',
            category: 'Shirt',
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            featured: false
        },
        {
            name: 'Denim Trucker Jacket',
            price: 4999.99,
            description: 'Classic Blue Denim Jacket',
            image_url: '/images/denim-jacket.JPG',
            category: 'Jacket',
            sizes: ['S', 'M', 'L', 'XL'],
            featured: false
        },
        {
            name: 'Cocktail Party Dress',
            price: 6999.99,
            description: 'Elegant Evening Cocktail Dress',
            image_url: '/images/cocktail-dress.JPG',
            category: 'Dress',
            sizes: ['XS', 'S', 'M', 'L'],
            featured: false
        },
        {
            name: 'Linen Summer Shirt',
            price: 3299.99,
            description: 'Breathable Pure Linen Casual Shirt',
            image_url: '/images/linen-shirt.JPG',
            category: 'Shirt',
            sizes: ['S', 'M', 'L', 'XL'],
            featured: false
        },
        {
            name: 'Winter Parka Jacket',
            price: 12999.99,
            description: 'Warm Winter Parka with Fur Hood',
            image_url: '/images/parka-jacket.JPG',
            category: 'Jacket',
            sizes: ['M', 'L', 'XL', 'XXL'],
            featured: false
        },
        {
            name: 'Maxi Evening Gown',
            price: 8999.99,
            description: 'Full Length Evening Gown',
            image_url: '/images/maxi-gown.JPG',
            category: 'Dress',
            sizes: ['S', 'M', 'L'],
            featured: false
        }
    ];

    const insertProduct = db.prepare('INSERT INTO products (name, price, description, image_url, category, sizes, featured) VALUES (?, ?, ?, ?, ?, ?, ?)');
    
    sampleProducts.forEach(product => {
        insertProduct.run([
            product.name, 
            product.price, 
            product.description, 
            product.image_url, 
            product.category,
            JSON.stringify(product.sizes),
            product.featured ? 1 : 0
        ]);
    });

    insertProduct.finalize();
    console.log('Database populated successfully!');
}

// API Routes
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/test-products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Wishlist routes
app.get('/api/wishlist', (req, res) => {
    db.all(`
        SELECT products.* 
        FROM products 
        JOIN wishlist ON products.id = wishlist.product_id
    `, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/wishlist/add', (req, res) => {
    const { productId } = req.body;
    db.run('INSERT INTO wishlist (product_id) VALUES (?)', [productId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Added to wishlist' });
    });
});

app.delete('/api/wishlist/remove/:id', (req, res) => {
    const productId = req.params.id;
    db.run('DELETE FROM wishlist WHERE product_id = ?', [productId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Removed from wishlist' });
    });
});

app.post('/api/cart/add', (req, res) => {
    const { productId, quantity } = req.body;
    db.run('INSERT INTO cart (product_id, quantity) VALUES (?, ?)', 
        [productId, quantity], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Added to cart' });
    });
});

// Update the products table schema
db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT,
    sizes TEXT,
    featured BOOLEAN DEFAULT 0
)`);

// Add separate routes for featured and collection products
app.get('/api/products/featured', (req, res) => {
    db.all('SELECT * FROM products WHERE featured = 1', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/products/collection', (req, res) => {
    db.all('SELECT * FROM products WHERE featured = 0', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// This catch-all route should be LAST
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
}); 