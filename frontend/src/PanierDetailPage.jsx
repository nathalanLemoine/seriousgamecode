import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Loader, CreditCard, Apple } from 'lucide-react';

export default function PanierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [panier, setPanier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:5000/api/paniers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setPanier(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/400x200/e2e8f0/gray?text=No+Image';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  const handlePayment = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:5000/api/orders/pay', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ panierId: panier.id })
        });

        if (res.ok) {
            setShowPayModal(false);
            navigate('/orders');
        } else {
            const err = await res.json();
            alert(err.message || "Erreur lors du paiement");
        }
    } catch (error) {
        console.error(error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary"><Loader className="animate-spin" /></div>;
  if (!panier) return <div className="min-h-screen flex items-center justify-center text-gray-500">Panier introuvable</div>;

  let realOriginalPrice;

  if (panier.items && panier.items.length > 0) {
      realOriginalPrice = panier.items.reduce((total, item) => {
          return total + (parseFloat(item.original_price) * item.quantity);
      }, 0);
  } 
  else if (panier.valeur_totale) {
      realOriginalPrice = parseFloat(panier.valeur_totale);
  }
  else {
      realOriginalPrice = panier.prix_vente * 1.3;
  }

  if (realOriginalPrice <= panier.prix_vente) {
      realOriginalPrice = panier.prix_vente * 1.3;
  }

  const originalPriceDisplay = realOriginalPrice.toFixed(2);
  const discount = Math.round(((realOriginalPrice - panier.prix_vente) / realOriginalPrice) * 100);

  return (
    <div className="min-h-screen bg-white relative flex flex-col pb-24">
      
      {/* --- HEADER IMAGE --- */}
      <div className="relative h-72 w-full shrink-0">
        <img 
            src={getImageUrl(panier.image_url)} 
            alt={panier.titre} 
            className="w-full h-full object-cover"
            onError={(e) => e.target.src='https://placehold.co/400x300/e2e8f0/gray?text=Image+Indisponible'}
        />
        <button 
            onClick={() => navigate(-1)} 
            className="absolute top-6 left-6 bg-white/90 p-2 rounded-full shadow-md text-gray-800 hover:bg-white transition-transform active:scale-95"
        >
            <ArrowLeft size={20} />
        </button>
        <div className="absolute bottom-6 right-6 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
            -{discount}%
        </div>
      </div>

      {/* --- CONTENU --- */}
      <div className="-mt-10 bg-white rounded-t-[2.5rem] px-6 pt-8 flex-1 relative z-10 flex flex-col">
        
        {/* Titre et Prix */}
        <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold text-gray-900 w-3/4 leading-tight">{panier.titre}</h1>
            <div className="text-right">
                <span className="block text-gray-400 text-sm line-through decoration-gray-400">
                    {originalPriceDisplay}€
                </span>
                <span className="block text-2xl font-extrabold text-primary">{panier.prix_vente}€</span>
            </div>
        </div>

        {/* Magasin */}
        <div className="flex items-center text-gray-500 text-sm mb-8 border-b border-gray-100 pb-4">
            <div className="bg-green-50 p-1.5 rounded-full mr-2 text-primary">
                <MapPin size={14} />
            </div>
            <span className="font-medium mr-1 text-gray-800">{panier.store_name}</span>
            <span>• À 500m</span>
        </div>

        {/* Liste des Ingrédients */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Ce que contient ce panier</h2>
        
        <div className="flex-1 overflow-y-auto pb-4">
            {(!panier.items || panier.items.length === 0) ? (
                <div className="bg-gray-50 p-6 rounded-2xl text-gray-500 text-sm text-center border border-dashed border-gray-200">
                    <span className="block text-2xl mb-2">🎁</span>
                    Surprise ! Le commerçant n'a pas listé le détail exact.
                </div>
            ) : (
                <div className="space-y-3">
                    {panier.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-2xl shadow-sm bg-white">
                            <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                <img 
                                    src={getImageUrl(item.image_url)} 
                                    onError={(e) => e.target.src='https://placehold.co/100?text=?'}
                                    alt={item.name} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                                <p className="text-xs text-gray-400">Prix original : {item.original_price}€</p>
                            </div>
                            <div className="bg-green-50 text-primary font-bold px-3 py-1 rounded-lg text-xs">
                                x{item.quantity}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* --- BOUTON D'ACHAT --- */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 z-40 rounded-b-[2.5rem]">
         <button 
            onClick={() => setShowPayModal(true)}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-green-600 active:scale-[0.98] transition-all shadow-lg shadow-green-200 flex justify-between px-6 items-center"
         >
            <span>Acheter maintenant</span>
            <span>{panier.prix_vente}€</span>
         </button>
      </div>

      {/* --- MODALE --- */}
      {showPayModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowPayModal(false)}
            ></div>

            <div className="bg-white w-full max-w-[390px] rounded-t-[2rem] p-6 animate-slide-up pb-10 relative z-10">
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <h3 className="text-xl font-bold text-center mb-6 text-gray-900">Moyen de paiement</h3>

                <div className="space-y-3 mb-8">
                    <button className="w-full bg-black text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold hover:opacity-90 transition transform active:scale-[0.99]">
                        <Apple size={20} fill="white" /> Pay
                    </button>
                    <button className="w-full bg-white border border-gray-200 text-gray-700 py-4 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-gray-50 transition shadow-sm transform active:scale-[0.99]">
                        <span className="flex items-center gap-1 text-lg"><span className="text-blue-500 font-bold">G</span>Pay</span>
                    </button>
                     <button className="w-full bg-white border border-gray-200 text-gray-700 py-4 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-gray-50 transition shadow-sm transform active:scale-[0.99]">
                        <CreditCard size={20} /> Carte Bancaire
                    </button>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowPayModal(false)}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={handlePayment} 
                        className="flex-[2] bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-600 transition"
                    >
                        Confirmer {panier.prix_vente}€
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}