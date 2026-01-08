import React from 'react';
import { Home, Receipt, User } from 'lucide-react'; // Import de Receipt (Ticket)
import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  const navItems = [
    { icon: Home, label: "Accueil", path: "/home" },
    { icon: Receipt, label: "Commandes", path: "/orders" }, // Nouvelle page
    { icon: User, label: "Profil", path: "/profile" },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 px-6 flex justify-between items-center z-50 w-full rounded-b-[2.5rem]">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors w-1/3 ${
              isActive ? "text-primary font-medium" : "text-gray-400 hover:text-gray-600"
            }`
          }
        >
          <item.icon size={24} strokeWidth={2.5} />
          <span className="text-[10px]">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}