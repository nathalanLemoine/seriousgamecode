import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import des pages
import LoginPage from './loginpage';
import RegisterPage from './RegisterPage';
import TermsPage from './TermsPage';
import ProfilePage from './ProfilePage';
import HomePage from './HomePage';
import OrdersPage from './OrdersPage';
import PanierDetailPage from './PanierDetailPage';
import PaillettePage from './PaillettePage';

// Import de la barre de navigation
import BottomNav from './BottomNav';

// --- COMPOSANT LAYOUT INTELLIGENT ---
const Layout = ({ children }) => {
  const location = useLocation();

  // Fonction pour déterminer si on doit cacher le menu du bas
  const shouldHideNav = () => {
    // 1. Pages fixes sans menu
    const hiddenPaths = ['/login', '/register', '/terms'];
    if (hiddenPaths.includes(location.pathname)) return true;

    // 2. Pages dynamiques (Détail Panier)
    // Si l'URL commence par "/panier/", on cache le menu pour laisser place au bouton "Acheter"
    if (location.pathname.startsWith('/panier/')) return true;

    return false;
  };

  const hideNav = shouldHideNav();

  return (
    <div className="h-full w-full relative flex flex-col bg-gray-50">
      
      {/* Zone de contenu principal */}
      {/* Si le menu est affiché, on ajoute du padding en bas (pb-20) pour ne pas cacher le contenu */}
      {/* Si le menu est caché, on enlève le padding pour que la page utilise tout l'écran */}
      <div className={`flex-1 overflow-y-auto scrollbar-hide ${!hideNav ? 'pb-20' : ''}`}>
        {children}
      </div>

      {/* Le menu du bas ne s'affiche que si hideNav est faux */}
      {!hideNav && <BottomNav />}
      
    </div>
  );
};

// --- APPLICATION PRINCIPALE ---
function App() {
  return (
    // CADRE SMARTPHONE
    <div className="relative w-[390px] max-w-full h-[800px] max-h-[95vh] bg-white rounded-[3rem] border-8 border-gray-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden ring-1 ring-gray-900/5 mx-auto my-auto">
      
      {/* Encoche iPhone */}
      <div className="absolute top-0 inset-x-0 h-6 bg-gray-800 rounded-b-3xl mx-auto w-32 z-50 pointer-events-none"></div>

      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Redirection par défaut */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/terms" element={<TermsPage />} />
            
            {/* App */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Page Détail Panier (Sans menu du bas grâce au Layout) */}
            <Route path="/panier/:id" element={<PanierDetailPage />} />
            <Route path="/paillettes" element={<PaillettePage />} />
          </Routes>
        </Layout>
      </BrowserRouter>

    </div>
  );
}

export default App;