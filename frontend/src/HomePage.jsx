import React, { useEffect, useState } from 'react';
import { Search, MapPin, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from './FreshConnect_Logo-Photoroom.png'; 

export default function HomePage() {
  const navigate = useNavigate();
  const [paniers, setPaniers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchPaniersComplets();
  }, []);

  const fetchPaniersComplets = async () => {
    const token = localStorage.getItem('token');
    try {
      // 1. On récupère la liste simple
      const res = await fetch('http://localhost:5000/api/paniers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const basicData = await res.json();
      
      // 2. On récupère les détails pour chaque panier
      const detailedPaniers = await Promise.all(
        basicData.map(async (panier) => {
            // Génération CO2 aléatoire stable
            const randomCO2 = (1.8 + Math.random() * 1.4).toFixed(1);

            try {
                const detailRes = await fetch(`http://localhost:5000/api/paniers/${panier.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (detailRes.ok) {
                    const detailData = await detailRes.json();
                    // On retourne le détail complet (qui contient .items) + le CO2
                    return { ...detailData, co2Val: randomCO2 };
                }
                // Si échec du détail, on rend le panier de base + CO2
                return { ...panier, co2Val: randomCO2 };
            } catch (err) {
                console.error(`Erreur détail panier ${panier.id}`, err);
                return { ...panier, co2Val: randomCO2 };
            }
        })
      );

      // 3. Tri
      const sortedData = detailedPaniers.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      console.log("Paniers chargés avec détails :", sortedData); // VÉRIFIE ICI DANS LA CONSOLE F12
      setPaniers(sortedData);
    } catch (error) {
      console.error("Erreur fetch paniers:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/400x200/e2e8f0/gray?text=No+Image';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  const filteredPaniers = paniers.filter(panier => {
    const term = searchTerm.toLowerCase();
    return panier.titre.toLowerCase().includes(term) || 
           (panier.store_name && panier.store_name.toLowerCase().includes(term));
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative">
      
      {/* --- HEADER --- */}
      <div className="bg-white p-6 pb-4 sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo FreshConnect" className="h-12 w-auto object-contain" />
            <h1 className="text-xl font-bold text-gray-900">FreshConnect</h1>
          </div>
          
          <button 
            onClick={() => navigate('/profile')}
            className="w-10 h-10 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center text-sm font-bold text-primary uppercase hover:bg-green-50 transition-colors"
          >
             {user.prenom ? user.prenom[0] : (user.nom ? user.nom[0] : 'U')}
          </button>
        </div>

        <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
            <div className="flex-1 flex items-center px-3">
                <Search className="text-gray-400 w-4 h-4 mr-2" />
                <input 
                    type="text" 
                    placeholder="Cherche ton magasin HyperFresh..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent w-full text-sm text-gray-800 placeholder-gray-400 outline-none py-2"
                />
            </div>
        </div>
      </div>

      {/* --- LISTE DES PANIERS --- */}
      <div className="px-6 pt-4">
        <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-gray-900">Paniers disponibles</h2>
            <span className="text-xs text-gray-500">{filteredPaniers.length} près de toi</span>
        </div>

        <div className="space-y-5">
            {loading ? (
                <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                    <span className="mb-2">Chargement complet...</span>
                </div>
            ) : filteredPaniers.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    Aucun panier trouvé 😢
                </div>
            ) : filteredPaniers.map((panier) => {
                
                // --- CALCUL DU PRIX ROBUSTE ---
                const sellingPrice = parseFloat(panier.prix_vente);
                let realOriginalPrice = 0;

                // 1. Priorité aux items (Calcul précis)
                if (panier.items && Array.isArray(panier.items) && panier.items.length > 0) {
                    realOriginalPrice = panier.items.reduce((total, item) => {
                        return total + (parseFloat(item.original_price) * (item.quantity || 1));
                    }, 0);
                } 
                // 2. Sinon valeur backend
                else if (panier.valeur_totale) {
                    realOriginalPrice = parseFloat(panier.valeur_totale);
                }

                // 3. Vérification Finale & Fallback
                // Si le prix calculé est 0, invalide, ou inférieur au prix de vente (impossible pour une promo)
                // On force le prix fictif (Prix Vente * 1.3)
                if (!realOriginalPrice || isNaN(realOriginalPrice) || realOriginalPrice <= sellingPrice) {
                    realOriginalPrice = sellingPrice * 1.3;
                }

                const originalPriceDisplay = realOriginalPrice.toFixed(2);
                const discount = Math.round(((realOriginalPrice - sellingPrice) / realOriginalPrice) * 100);
                
                return (
                    <div key={panier.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        
                        <div className="relative h-32 w-full bg-gray-200">
                            <img 
                                src={getImageUrl(panier.image_url)} 
                                alt={panier.titre} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = 'https://placehold.co/400x200/e2e8f0/gray?text=Image+Indisponible';
                                }}
                            />
                            {discount > 0 && (
                                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                                    -{discount}%
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 truncate">
                                {panier.titre}
                            </h3>
                            
                            <div className="flex items-center text-gray-500 text-xs mb-3">
                                <MapPin size={12} className="mr-1" />
                                <span className="font-medium mr-1 truncate max-w-[150px]">
                                    {panier.store_name}
                                </span>
                                <span>• 500m</span>
                            </div>

                            <div className="flex items-end justify-between mb-3">
                                <div className="flex items-baseline gap-2">
                                    {/* Prix Barré */}
                                    <span className="text-gray-400 text-sm line-through decoration-gray-400">
                                        {originalPriceDisplay}€
                                    </span>
                                    {/* Prix Vente */}
                                    <span className="text-xl font-extrabold text-gray-900">
                                        {panier.prix_vente}€
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                    <span className="w-3 h-3 border border-gray-400 rounded-full flex items-center justify-center text-[8px]">🕒</span>
                                    Retrait avant 19h
                                </div>
                                <div className="flex items-center gap-1 text-primary font-medium">
                                    <Leaf size={12} />
                                    {panier.co2Val}kg CO₂
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate(`/panier/${panier.id}`)}
                                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-green-600 active:scale-[0.98] transition-all shadow-md shadow-green-100"
                            >
                                Réserver
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
}