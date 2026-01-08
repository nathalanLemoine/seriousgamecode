const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

exports.registerUser = async (req, res) => {
    const { email, password, nom, prenom, role } = req.body;

    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRole = role || 'student';
        const [result] = await db.query(
            'INSERT INTO users (email, password, nom, prenom, role) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, nom, prenom, userRole]
        );

        res.status(201).json({
            id: result.insertId,
            email,
            role: userRole,
            token: generateToken(result.insertId, userRole)
        });

    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.registerManager = async (req, res) => {
    const { email, password, nom, prenom, role } = req.body;

    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRole = role || 'store_manager';
        const [result] = await db.query(
            'INSERT INTO users (email, password, nom, prenom, role) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, nom, prenom, userRole]
        );

        res.status(201).json({
            id: result.insertId,
            email,
            role: userRole,
            token: generateToken(result.insertId, userRole)
        });

    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role,
                impact_co2: user.impact_co2,
                impact_euros: user.impact_euros,
                token: generateToken(user.id, user.role)
            });
        } else {
            res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.registerAdmin = async (req, res) => {
    const { email, password, nom, prenom, role } = req.body;

    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRole = role || 'admin';
        const [result] = await db.query(
            'INSERT INTO users (email, password, nom, prenom, role) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, nom, prenom, userRole]
        );

        res.status(201).json({
            id: result.insertId,
            email,
            role: userRole,
            token: generateToken(result.insertId, userRole)
        });

    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};


exports.getUserProfile = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, email, nom, prenom, role, impact_co2, impact_euros, created_at FROM users WHERE id = ?', [req.user.id]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};


exports.logoutUser = (req, res) => {
    res.status(200).json({ message: 'Déconnexion réussie' });
};

exports.updateUserProfile = async (req, res) => {
    const { email } = req.body;
    const userId = req.user.id;

    try {
        if (email) {
            const [existingUser] = await db.query('SELECT * FROM users WHERE email = ? AND id != ?', [email, userId]);
            if (existingUser.length > 0) {
                return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
            }
        }

        await db.query('UPDATE users SET email = ? WHERE id = ?', [email, userId]);

        const [updatedUser] = await db.query('SELECT id, email, role, impact_co2, impact_euros FROM users WHERE id = ?', [userId]);
        
        res.json({ message: 'Profil mis à jour', user: updatedUser[0] });

    } catch (error) {
        res.status(500).json({ message: 'Erreur mise à jour profil', error: error.message });
    }
};

exports.deleteUserAccount = async (req, res) => {
    const userId = req.user.id;

    try {
        await db.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: 'Compte supprimé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur suppression compte', error: error.message });
    }
};