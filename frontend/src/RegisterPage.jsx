import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, Gift, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();
  
  // États du formulaire
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // États pour la gestion UI (chargement et erreurs)
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // On efface les erreurs précédentes

    // 1. Validation locale
    if (!termsAccepted) {
      setError("Tu dois accepter les conditions générales !");
      return;
    }

    setIsLoading(true);

    try {
      // 2. Préparation des données pour le backend
      // Attention : on mappe firstName -> prenom et lastName -> nom
      const userData = {
        email: email,
        password: password,
        prenom: firstName, 
        nom: lastName,
        role: 'student' // Rôle par défaut
      };

      // 3. Appel au Backend
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      // 4. Gestion de la réponse
      if (!response.ok) {
        // Si erreur (ex: 400 - Email déjà pris), on affiche le message du back
        throw new Error(data.message || "Une erreur est survenue");
      }

      // 5. Succès ! (Code 201)
      console.log("Inscription réussie :", data);
      
      // On sauvegarde le token pour que l'utilisateur soit considéré comme connecté
      localStorage.setItem('token', data.token);
      
      // On peut aussi sauvegarder les infos user si besoin
      localStorage.setItem('user', JSON.stringify({ 
        id: data.id, 
        email: data.email, 
        role: data.role,
        prenom: firstName,
        nom: lastName
      }));

      // Redirection vers le profil (ou l'accueil)
      navigate('/profile');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-8 flex flex-col">
      <button onClick={() => navigate(-1)} className="mb-6 text-gray-700 w-fit">
        <ArrowLeft size={24} />
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue ! 🎉</h1>
      <p className="text-gray-500 mb-6">Crée ton compte pour commencer à économiser</p>

      {/* Message d'erreur s'il y en a un */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Bannière Offre */}
      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6 flex items-center gap-4">
        <div className="bg-white p-2 rounded-full shadow-sm text-yellow-500">
            <Gift size={24} />
        </div>
        <div>
            <h3 className="font-bold text-gray-900 text-sm">Offre de bienvenue</h3>
            <p className="text-gray-600 text-xs">-2€ sur ton premier panier</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="flex gap-4">
            <div className="w-1/2">
                <label className="block text-sm text-gray-600 mb-1">Prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Marie"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
            </div>
            <div className="w-1/2">
                <label className="block text-sm text-gray-600 mb-1">Nom</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dubois"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
            </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="marie.dubois@email.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Mot de passe</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
            <input 
                type="checkbox" 
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="terms" className="text-sm text-gray-500">
                J'accepte les <Link to="/terms" className="text-primary font-bold hover:underline">CGU</Link>
            </label>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full text-white font-semibold py-4 rounded-xl shadow-lg shadow-green-100 transition-colors mt-2 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-green-600'}`}
        >
          {isLoading ? 'Création en cours...' : 'Créer mon compte'}
        </button>

        <div className="text-center mt-4">
          <p className="text-gray-600 text-sm">
            Déjà un compte ? <Link to="/login" className="text-primary font-bold hover:underline">Se connecter</Link>
          </p>
        </div>

      </form>
    </div>
  );
}