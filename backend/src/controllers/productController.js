const db = require('../config/db');
const upload = require('../middleware/multer');

exports.createProduct = async (req, res) => {
    try {
        const { name, barcode, expiration_date, original_price } = req.body;
        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const query = `
            INSERT INTO products (name, barcode, expiration_date, original_price, image_url) 
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            name, 
            barcode, 
            expiration_date, 
            original_price, 
            imageUrl
        ]);

        res.status(201).json({ 
            message: 'Produit créé avec succès', 
            productId: result.insertId,
            image: imageUrl
        });

    } catch (error) {
        res.status(500).json({ message: 'Erreur création produit', error: error.message });
    }
};


exports.getAllProducts = async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products ORDER BY expiration_date ASC');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};


exports.getProductByBarcode = async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products WHERE barcode = ?', [req.params.barcode]);
        if (products.length === 0) return res.status(404).json({ message: 'Produit non trouvé' });
        res.json(products[0]);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.updateProduct = async (req, res) => {
    const { name, barcode, expiration_date, original_price, image_url } = req.body;
    const productId = req.params.id;

    try {
        const [product] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
        if (product.length === 0) return res.status(404).json({ message: 'Produit non trouvé' });

        await db.query(
            'UPDATE products SET name=?, barcode=?, expiration_date=?, original_price=?, image_url=? WHERE id=?',
            [name, barcode, expiration_date, original_price, image_url, productId]
        );

        res.json({ message: 'Produit mis à jour' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        res.json({ message: 'Produit supprimé du stock' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Impossible de supprimer ce produit car il est présent dans un ou plusieurs paniers.' });
        }
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};