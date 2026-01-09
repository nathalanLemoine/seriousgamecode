import React, { useEffect, useState } from 'react';
import { LogOut, ShoppingBag, MapPin, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const [resProfile, resOrders] = await Promise.all([
          fetch('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/api/orders/myorders', { 
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (resProfile.status === 401 || resOrders.status === 401) {
          throw new Error("Session expirée");
        }

        if (!resProfile.ok || !resOrders.ok) {
          console.error("Erreur Profile:", resProfile.status);
          console.error("Erreur Orders:", resOrders.status);
          throw new Error("Erreur lors du chargement des données");
        }

        const userData = await resProfile.json();
        const ordersData = await resOrders.json();

        setUser(userData);
        setOrders(ordersData);

      } catch (err) {
        console.error(err);
        if (err.message === "Session expirée") {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COLLECTED': return 'bg-green-100 text-green-700';
      case 'PAID': return 'bg-blue-100 text-blue-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COLLECTED': return 'Récupéré';
      case 'PAID': return 'À récupérer';
      case 'PENDING': return 'En attente';
      default: return status;
    }
  };
  
  const totalSavings = orders.reduce((acc, order) => {
      const originalValue = parseFloat(order.valeur_originale_totale) || 0;
      const paidPrice = parseFloat(order.prix_vente) || 0;
      const saving = originalValue - paidPrice;

      return acc + (saving > 0 ? saving : 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-primary bg-gray-50">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <p className="text-red-500 mb-4">{error || "Impossible de charger le profil"}</p>
        <button onClick={() => window.location.reload()} className="bg-primary text-white px-4 py-2 rounded-lg">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative pb-24">
      
      {/* --- HEADER VERT --- */}
      <div className="bg-primary h-64 w-full rounded-b-[2.5rem] relative flex flex-col items-center pt-10 px-6 text-white shadow-lg shrink-0">
        
        {/* Avatar (Initiales) */}
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary text-2xl font-bold border-4 border-green-300 shadow-md mb-3 uppercase">
          {user.prenom ? user.prenom[0] : ''}{user.nom ? user.nom[0] : ''}
        </div>
        
        {/* Nom & Email */}
        <h1 className="text-2xl font-bold capitalize">
            {user.prenom || 'Utilisateur'} {user.nom || ''}
        </h1>
        <p className="text-green-100 text-sm">{user.email}</p>

        {/* Barre de niveau */}
        <div className="w-full max-w-xs mt-4">
            <div className="flex justify-between text-xs font-medium text-green-100 mb-1">
                <span>Niveau Sauveteur</span>
                <span>Expert</span>
            </div>
            <div className="h-2 bg-green-800/30 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[70%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            </div>
        </div>
      </div>

      {/* --- BOITE STATS --- */}
      <div className="px-6 -mt-10 mb-6 relative z-10 shrink-0">
        <div className="bg-white rounded-2xl shadow-xl p-6 flex justify-around text-center items-center">
            
            {/* Stat 1: Paniers */}
            <div className="flex flex-col items-center w-1/2">
                <span className="text-3xl font-bold text-primary">{orders.length}</span>
                <span className="text-xs text-gray-400 uppercase font-semibold mt-1">Paniers sauvés</span>
            </div>

            {/* Séparateur vertical */}
            <div className="w-px bg-gray-100 h-12"></div>

            {/* Stat 2: Euros (Calculé précisément) */}
            <div className="flex flex-col items-center w-1/2">
                <span className="text-3xl font-bold text-yellow-500">{totalSavings.toFixed(2)}€</span>
                <span className="text-xs text-gray-400 uppercase font-semibold mt-1">Économisés</span>
            </div>
        </div>
      </div>

      {/* --- LISTE DES COMMANDES --- */}
      <div className="px-6 flex-1 overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary"/>
            Mes commandes
        </h2>

        {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-xl border border-gray-100 p-6">
                <p>Aucune commande pour le moment.</p>
                <p className="text-xs mt-2">Réservez votre premier panier !</p>
            </div>
        ) : (
            <div className="space-y-3 pb-4">
                {orders.map((order) => {
                    const originalVal = parseFloat(order.valeur_originale_totale) || 0;
                    const paid = parseFloat(order.prix_vente) || 0;
                    const saved = originalVal - paid;

                    return (
                        <div key={order.order_id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Icône Panier */}
                                <div className={`p-2 rounded-lg ${getStatusColor(order.status)} bg-opacity-20`}>
                                    <ShoppingBag size={20} />
                                </div>
                                
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{order.titre}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <MapPin size={10} />
                                        <span className="truncate max-w-[100px]">{order.store_name}</span>
                                        <span>•</span>
                                        <span>{formatDate(order.order_date)}</span>
                                    </div>
                                    <div className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full w-fit ${getStatusColor(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <span className="block font-bold text-gray-900">{order.prix_vente}€</span>
                                {saved > 0 && (
                                    <span className="text-[10px] text-green-600 font-medium block">
                                        -{saved.toFixed(2)}€ éco
                                    </span>
                                )}
                                {order.pickup_code && (
                                    <span className="block text-xs font-mono text-gray-500 mt-1 bg-gray-50 px-1 rounded">Code: {order.pickup_code}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        {/* Bouton Déconnexion */}
        <button 
            onClick={handleLogout}
            className="mt-4 mb-8 w-full flex items-center justify-center gap-2 text-red-500 font-medium py-3 rounded-xl hover:bg-red-50 transition-colors border border-red-100"
        >
            <LogOut size={20} />
            Se déconnecter
        </button>
      </div>
    </div>
  );
}