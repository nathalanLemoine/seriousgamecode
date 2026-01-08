const db = require('../config/db');
const upload = require('../middleware/multer');

exports.createPanier = async (req, res) => {
    // On récupère 'products' en plus du reste
    // ATTENTION : Avec form-data, 'products' arrive sous forme de texte (JSON String)
    const { titre, prix_vente, store_name, products } = req.body;
    
    let imageUrl = null;
    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
    }

    // On commence une connexion pour pouvoir faire des requêtes successives
    // Idéalement il faudrait une transaction ici, mais restons simple pour l'instant.
    try {
        // 1. CRÉATION DU PANIER
        const [result] = await db.query(
            'INSERT INTO paniers (titre, prix_vente, store_name, status, image_url) VALUES (?, ?, ?, "disponible", ?)',
            [titre, prix_vente, store_name, imageUrl]
        );
        
        const panierId = result.insertId;

        // 2. AJOUT DES PRODUITS (Si fournis)
        if (products) {
            let productsParsed;
            try {
                // On transforme le texte "[{id:1, qty:2}]" en véritable objet JS
                productsParsed = JSON.parse(products);
            } catch (e) {
                return res.status(400).json({ message: "Format des produits invalide (JSON attendu)" });
            }

            // On boucle sur chaque produit pour l'ajouter dans la table de liaison
            // On utilise Promise.all pour attendre que toutes les insertions soient finies
            await Promise.all(productsParsed.map(async (item) => {
                await db.query(
                    'INSERT INTO panier_items (panier_id, product_id, quantity) VALUES (?, ?, ?)',
                    [panierId, item.id, item.quantity || 1] // Quantité 1 par défaut
                );
            }));
        }

        res.status(201).json({ 
            id: panierId, 
            message: 'Panier créé avec ses produits !' 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur création panier', error: error.message });
    }
};


exports.addItemToPanier = async (req, res) => {
    console.log("ID reçu du Panier :", req.params.id);
    const panierId = req.params.id;
    const { product_id, quantity } = req.body;

    try {
        const [existing] = await db.query(
            'SELECT * FROM panier_items WHERE panier_id = ? AND product_id = ?', 
            [panierId, product_id]
        );

        if (existing.length > 0) {
            await db.query(
                'UPDATE panier_items SET quantity = quantity + ? WHERE panier_id = ? AND product_id = ?',
                [quantity || 1, panierId, product_id]
            );
        } else {
            await db.query(
                'INSERT INTO panier_items (panier_id, product_id, quantity) VALUES (?, ?, ?)',
                [panierId, product_id, quantity || 1]
            );
        }

        res.status(200).json({ message: 'Produit ajouté au panier' });
    } catch (error) {
        res.status(500).json({ message: 'Impossible d\'ajouter le produit', error: error.message });
    }
};


exports.getAvailablePaniers = async (req, res) => {
    try {
        // Cette requête récupère les paniers ET calcule la somme des prix originaux des produits
        const query = `
            SELECT 
                p.*,
                COALESCE(SUM(pr.original_price * pi.quantity), 0) AS valeur_totale
            FROM paniers p
            LEFT JOIN panier_items pi ON p.id = pi.panier_id
            LEFT JOIN products pr ON pi.product_id = pr.id
            WHERE p.status = 'disponible'
            GROUP BY p.id
            ORDER BY p.created_at ASC
        `;

        const [paniers] = await db.query(query);
        res.json(paniers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};


exports.getPanierDetails = async (req, res) => {
    try {
        // 1. Récupérer les infos du panier
        const [panier] = await db.query('SELECT * FROM paniers WHERE id = ?', [req.params.id]);
        
        if (panier.length === 0) return res.status(404).json({ message: 'Panier introuvable' });

        // 2. Récupérer les produits dedans
        const [products] = await db.query(
            `SELECT p.id, p.name, p.image_url, p.original_price, pi.quantity 
             FROM products p 
             JOIN panier_items pi ON p.id = pi.product_id 
             WHERE pi.panier_id = ?`,
            [req.params.id]
        );

        // 3. CALCUL DU TOTAL EN JS (Simple et efficace ici)
        // On additionne : prix du produit * quantité
        const totalValue = products.reduce((acc, item) => {
            return acc + (item.original_price * item.quantity);
        }, 0);

        // 4. On renvoie le panier, les items, ET la valeur calculée
        res.json({ 
            ...panier[0], 
            items: products,
            valeur_totale: totalValue // On ajoute ça pour le frontend
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.updatePanier = async (req, res) => {
    const { titre, prix_vente, status } = req.body;
    const panierId = req.params.id;

    try {
        const [existing] = await db.query('SELECT * FROM paniers WHERE id = ?', [panierId]);
        if (existing.length === 0) return res.status(404).json({ message: 'Panier introuvable' });

        const newTitre = titre || existing[0].titre;
        const newPrix = prix_vente || existing[0].prix_vente;
        const newStatus = status || existing[0].status;

        await db.query(
            'UPDATE paniers SET titre = ?, prix_vente = ?, status = ? WHERE id = ?',
            [newTitre, newPrix, newStatus, panierId]
        );

        res.json({ message: 'Panier mis à jour avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.deletePanier = async (req, res) => {
    try {       
        const [result] = await db.query('DELETE FROM paniers WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Panier introuvable' });
        }

        res.json({ message: 'Panier supprimé' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Impossible de supprimer ce panier car il est lié à une commande en cours ou passée.' });
        }
        res.status(500).json({ message: 'Erreur suppression', error: error.message });
    }
};