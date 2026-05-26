import React from "react";
import { Link } from "wouter";
import { Coins, TrendingUp } from "lucide-react";

export default function Games() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <header className="flex flex-col border-b-4 border-black pb-6 mb-12">
        <h1 className="text-5xl md:text-7xl font-black font-display tracking-tighter text-black uppercase drop-shadow-[2px_2px_0px_rgba(255,90,120,0.5)]">ИГРОВАЯ ЗОНА</h1>
        <p className="text-xl font-bold uppercase mt-4 bg-primary text-white inline-block px-4 py-2 border-2 border-black rotate-[-1deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] self-start">
          РИСК И НАГРАДА. УМНОЖАЙ КАПИТАЛ.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <Link href="/games/coinflip">
          <div className="hype-panel bg-white group cursor-pointer relative overflow-hidden flex flex-col h-full border-4 border-black">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none" />
            
            <div className="p-10 flex-1 relative z-10">
              <div className="w-24 h-24 rounded-3xl bg-yellow-300 border-4 border-black flex items-center justify-center mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-2 group-hover:rotate-12 transition-transform">
                <Coins size={48} className="text-black" />
              </div>
              <h2 className="text-4xl font-black font-display text-black mb-4 uppercase leading-none">ОРЁЛ И РЕШКА</h2>
              <p className="text-lg font-bold text-gray-600 uppercase">Классический коинфлип. Шанс 50/50. Удвойте ставку в одно мгновение.</p>
            </div>
            
            <div className="bg-yellow-300 border-t-4 border-black p-6 group-hover:bg-yellow-400 transition-colors">
              <div className="font-black text-xl tracking-widest text-black flex items-center justify-between">
                <span>ИГРАТЬ СЕЙЧАС</span>
                <span className="text-3xl">&rarr;</span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/games/crash">
          <div className="hype-panel bg-white group cursor-pointer relative overflow-hidden flex flex-col h-full border-4 border-black">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-400 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none" />
            
            <div className="p-10 flex-1 relative z-10">
              <div className="w-24 h-24 rounded-3xl bg-red-400 border-4 border-black flex items-center justify-center mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-2 group-hover:-rotate-12 transition-transform">
                <TrendingUp size={48} className="text-black" />
              </div>
              <h2 className="text-4xl font-black font-display text-black mb-4 uppercase leading-none">КРАШ РАШ</h2>
              <p className="text-lg font-bold text-gray-600 uppercase">Наблюдай как растет множитель. Забери деньги до того, как график рухнет.</p>
            </div>
            
            <div className="bg-red-400 border-t-4 border-black p-6 group-hover:bg-red-500 transition-colors">
              <div className="font-black text-xl tracking-widest text-black flex items-center justify-between">
                <span>ЗАПУСТИТЬ КРАШ</span>
                <span className="text-3xl">&rarr;</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
