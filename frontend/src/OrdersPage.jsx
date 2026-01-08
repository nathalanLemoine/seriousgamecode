import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingBag, MapPin, Calendar, Loader, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
        return;
    }

    try {
      // On utilise ton endpoint existant
      const res = await fetch('http://localhost:5000/api/orders/myorders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Erreur chargement commandes");
      
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Helpers pour l'affichage
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit'
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'À récupérer' };
      case 'COLLECTED': return { bg: 'bg-green-50', text: 'text-green-700', label: 'Récupéré' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', label: status };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-6 py-8 pb-24">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes Commandes</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
             <Loader className="animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-60">
            <Ticket size={64} className="mb-4" strokeWidth={1} />
            <p>Aucune commande pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusStyle = getStatusStyle(order.status);
            
            return (
              <div key={order.order_id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                
                {/* Ligne du haut : Titre et Prix */}
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                        <div className="bg-green-50 p-2 rounded-xl text-primary">
                            <ShoppingBag size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{order.titre}</h3>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <MapPin size={12} />
                                {order.store_name}
                            </div>
                        </div>
                    </div>
                    <span className="font-bold text-lg text-gray-900">{order.prix_vente}€</span>
                </div>

                <div className="h-px bg-gray-100 w-full my-1"></div>

                {/* Ligne du bas : Date, Code et Statut */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar size={14} />
                        <span>{formatDate(order.order_date)}</span>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.label}
                    </div>
                </div>

                {/* Affichage du Code de Retrait si la commande n'est pas encore récupérée */}
                {order.status === 'PENDING' && (
                    <div className="mt-2 bg-gray-900 text-white p-3 rounded-xl text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Code de retrait</p>
                        <p className="text-2xl font-mono font-bold tracking-widest">{order.pickup_code}</p>
                    </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}