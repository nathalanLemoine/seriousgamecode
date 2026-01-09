import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Star, Zap } from 'lucide-react';

export default function PaillettePage() {
  const navigate = useNavigate();

  // On génère 50 particules avec des positions aléatoires
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    animationDuration: Math.random() * 3 + 1 + 's',
    delay: Math.random() * 2 + 's',
    size: Math.random() * 20 + 10 + 'px',
    color: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000'][Math.floor(Math.random() * 4)]
  }));

  return (
    <div className="min-h-screen bg-pink-500 overflow-hidden relative flex flex-col items-center justify-center text-center p-4">
      
      {/* CSS INLINE pour les animations spécifiques à cette page cringe */}
      <style>{`
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        @keyframes spin-crazy {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.5); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .bg-rainbow {
          background: linear-gradient(270deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff);
          background-size: 400% 400%;
          animation: rainbow 3s ease infinite;
        }
        .text-cringe {
          font-family: "Comic Sans MS", "Comic Sans", cursive;
          text-shadow: 2px 2px 0px #FF00FF, -2px -2px 0px #00FFFF;
        }
        .shake-it {
          animation: shake 0.5s infinite;
        }
        .spin-it {
            animation: spin-crazy 2s linear infinite;
        }
      `}</style>

      {/* FOND ARC EN CIEL ANIMÉ */}
      <div className="absolute inset-0 bg-rainbow opacity-50 z-0"></div>

      {/* PARTICULES FLOTTANTES */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute z-0 animate-bounce"
          style={{
            left: p.left,
            top: p.top,
            fontSize: p.size,
            color: p.color,
            animationDuration: p.animationDuration,
            animationDelay: p.delay
          }}
        >
          {p.id % 2 === 0 ? '✨' : (p.id % 3 === 0 ? '🦄' : '💖')}
        </div>
      ))}

      {/* CONTENU PRINCIPAL */}
      <div className="relative z-10 bg-white/80 p-8 rounded-3xl border-8 border-yellow-400 shadow-[0_0_50px_#FF00FF] max-w-md w-full">
        
        <div className="flex justify-center mb-6">
            <Sparkles size={64} className="text-yellow-400 spin-it" />
        </div>

        <h1 className="text-5xl font-extrabold text-cringe text-pink-600 mb-6 leading-tight shake-it">
          METS DES PAILLETTES DANS MA VIE !!!
        </h1>

        <p className="text-xl font-bold text-purple-600 mb-8 font-serif italic">
          Kevin, des moulures au plafond ! ✨
        </p>

        <div className="flex justify-center gap-4 mb-8">
            <div className="animate-spin text-4xl">💎</div>
            <div className="animate-ping text-4xl">💅</div>
            <div className="animate-spin text-4xl">💎</div>
        </div>

        <button 
          onClick={() => navigate(-1)}
          className="w-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white font-black text-xl py-4 rounded-full shadow-lg transform transition hover:scale-110 active:scale-90 border-4 border-white"
        >
          J'AI COMPRIS, PARDON 😭
        </button>

        <p className="mt-4 text-xs text-gray-500">
            Attention, l'abus de paillettes est dangereux pour la santé mentale.
        </p>
      </div>

    </div>
  );
}