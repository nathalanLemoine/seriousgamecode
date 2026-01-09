import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom'; // <--- AJOUT DE Link ICI

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white px-6 py-8 flex flex-col">
      
      {/* Header avec bouton retour */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-700">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Conditions Générales</h1>
      </div>

      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
            <div className="flex items-center gap-2 text-primary font-semibold mb-1">
                <FileText size={18} />
                <span>Dernière mise à jour</span>
            </div>
            <p className="text-xs text-gray-500">08 Janvier 2026</p>
        </div>

        <section>
          <h2 className="text-gray-900 font-bold mb-2">1. Objet</h2>
          <p>
            Les présentes CGU ont pour objet de définir les modalités de mise à disposition des services de l'application FreshConnect.
          </p>
        </section>

        <section>
          <h2 className="text-gray-900 font-bold mb-2">2. Services</h2>
          <p>
            L'application met en relation des utilisateurs et des commerçants. Nous ne garantissons pas la disponibilité spécifique des produits.
          </p>
        </section>

        <section>
          <h2 className="text-gray-900 font-bold mb-2">3. Responsabilité</h2>
          <p>
            L'utilisateur s'engage à récupérer sa commande dans les horaires indiqués.
          </p>
        </section>

        {/* --- CORRECTION ICI : UTILISATION DE <Link> --- */}
        <section className="bg-pink-50 p-4 rounded-xl border border-pink-100">
          <h2 className="text-pink-900 font-bold mb-2">4. Clause Spéciale</h2>
          <p>
            En acceptant ces conditions, l'utilisateur reconnaît qu'il est strictement interdit d'utiliser la fonction{' '}
            {/* Le composant Link gère la navigation sans recharger la page */}
            <Link 
                to="/paillettes"
                className="text-pink-600 font-bold underline decoration-wavy cursor-pointer hover:text-pink-800 transition-colors"
            >
                Paillette
            </Link>{' '}
            sans une autorisation spéciale de l'administration. Tout usage abusif entraînera une pluie de confettis virtuels non désirable.
          </p>
        </section>

        <section>
          <h2 className="text-gray-900 font-bold mb-2">5. Données personnelles</h2>
          <p>
            Vos données sont précieuses. Nous les utilisons uniquement pour le bon fonctionnement du service.
          </p>
        </section>
        
        <div className="pt-8 pb-4 text-center text-xs text-gray-400">
            FreshConnect Inc. © 2026
        </div>

      </div>
    </div>
  );
}