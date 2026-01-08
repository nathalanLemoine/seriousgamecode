const db = require('../config/db');

const generatePickupCode = () => {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
};


exports.createOrder = async (req, res) => {
    const { panier_id } = req.body;
    const user_id = req.user.id;

    try {
        const [panier] = await db.query('SELECT * FROM paniers WHERE id = ? AND status = "disponible"', [panier_id]);
        
        if (panier.length === 0) {
            return res.status(400).json({ message: 'Ce panier n\'est plus disponible ou n\'existe pas.' });
        }

        const pickup_code = generatePickupCode();

        const [orderResult] = await db.query(
            'INSERT INTO orders (user_id, panier_id, status, pickup_code) VALUES (?, ?, "PENDING", ?)',
            [user_id, panier_id, pickup_code]
        );

        await db.query('UPDATE paniers SET status = "reserve" WHERE id = ?', [panier_id]);

        res.status(201).json({
            message: 'Commande réservée avec succès !',
            order_id: orderResult.insertId,
            pickup_code,
            status: 'PENDING'
        });

    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la commande', error: error.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const query = `
            SELECT 
                o.id AS order_id, 
                o.status, 
                o.pickup_code, 
                o.order_date,
                p.id AS panier_id,
                p.titre, 
                p.store_name, 
                p.prix_vente, 
                p.image_url,
                -- C'est ICI que la magie opère : on calcule la valeur totale des produits d'origine
                COALESCE(SUM(prod.original_price * pi.quantity), 0) AS valeur_originale_totale
            FROM orders o
            JOIN paniers p ON o.panier_id = p.id
            LEFT JOIN panier_items pi ON p.id = pi.panier_id
            LEFT JOIN products prod ON pi.product_id = prod.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.order_date DESC
        `;

        const [orders] = await db.query(query, [userId]);
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur récupération commandes' });
    }
};

exports.payOrder = async (req, res) => {
    const { panierId } = req.body;
    const userId = req.user.id; 

    try {
        const [panier] = await db.query('SELECT * FROM paniers WHERE id = ? AND status = "disponible"', [panierId]);

        if (panier.length === 0) {
            return res.status(400).json({ message: 'Ce panier a déjà été vendu ou n\'existe plus.' });
        }

        const pickupCode = Math.random().toString(36).substring(2, 6).toUpperCase();

        await db.query(
            'INSERT INTO orders (user_id, panier_id, status, pickup_code) VALUES (?, ?, "PAID", ?)',
            [userId, panierId, pickupCode]
        );

        await db.query('UPDATE paniers SET status = "vendu" WHERE id = ?', [panierId]);


        res.status(201).json({ message: 'Paiement accepté', pickupCode });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur paiement', error: error.message });
    }
};

exports.collectOrder = async (req, res) => {
    const { pickup_code } = req.body;

    try {
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE pickup_code = ? AND status != "COLLECTED"', 
            [pickup_code]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Code invalide ou commande déjà récupérée.' });
        }

        const order = orders[0];

      
        const [financials] = await db.query(`
            SELECT p.prix_vente, SUM(prod.original_price * pi.quantity) as total_original_value
            FROM paniers p
            JOIN panier_items pi ON p.id = pi.panier_id
            JOIN products prod ON pi.product_id = prod.id
            WHERE p.id = ?
            GROUP BY p.id
        `, [order.panier_id]);

        const prixVente = financials[0].prix_vente;
        const valeurReelle = financials[0].total_original_value || prixVente;
        const impactEuros = valeurReelle - prixVente;
        const impactCO2 = impactEuros * 0.5; 

   
        await db.query('UPDATE orders SET status = "COLLECTED" WHERE id = ?', [order.id]);

        await db.query('UPDATE paniers SET status = "vendu" WHERE id = ?', [order.panier_id]);

    
        await db.query(
            'UPDATE users SET impact_euros = impact_euros + ?, impact_co2 = impact_co2 + ? WHERE id = ?',
            [impactEuros, impactCO2, order.user_id]
        );

        res.json({ 
            message: 'Commande validée et récupérée !', 
            impact_added: { euros: impactEuros, co2: impactCO2 } 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la validation', error: error.message });
    }
};