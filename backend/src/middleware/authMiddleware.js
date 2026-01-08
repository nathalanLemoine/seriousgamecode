const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Vérifier le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decoded; 

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Non autorisé, token invalide' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Non autorisé, aucun token fourni' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Le rôle ${req.user.role} n'a pas accès à cette route` });
        }
        next();
    }
};

module.exports = { protect, authorize };