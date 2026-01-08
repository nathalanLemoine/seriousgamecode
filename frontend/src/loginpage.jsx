import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  // États
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // On efface les erreurs précédentes
    setIsLoading(true);

    try {
      // 1. Appel au Backend
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // 2. Vérification de l'erreur
      if (!response.ok) {
        throw new Error(data.message || "Email ou mot de passe incorrect");
      }

      // 3. Succès : On stocke le token
      console.log("Connexion réussie :", data);
      localStorage.setItem('token', data.token);
      
      // Si le backend renvoie aussi les infos user, on les stocke
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // 4. Redirection vers le profil
      navigate('/profile');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-8 flex flex-col">
      
      {/* Flèche retour (revient à l'accueil si besoin, ou désactivé ici) */}
      <button className="mb-8 text-gray-700 w-fit">
        <ArrowLeft size={24} />
      </button>

      {/* Titre */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Bon retour ! 👋
      </h1>
      <p className="text-gray-500 mb-8">
        Connecte-toi pour continuer à sauver des paniers
      </p>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleLogin} className="space-y-6">
        
        {/* Champ Email */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton.email@exemple.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              required
            />
          </div>
        </div>

        {/* Champ Mot de passe */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Mot de passe</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              required
            />
          </div>
          <div className="flex justify-end mt-2">
            <a href="#" className="text-sm text-primary font-medium hover:underline">
              Mot de passe oublié ?
            </a>
          </div>
        </div>

        {/* Bouton Se connecter */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full text-white font-semibold py-4 rounded-xl shadow-lg shadow-green-100 transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-green-600'}`}
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>

      </form>
    </div>
  );
}