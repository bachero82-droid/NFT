import React, { useState } from "react";
import { usePlayCoinflip, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Coins } from "lucide-react";
import { Link } from "wouter";

export default function GamesCoinflip() {
  const { data: user } = useGetMe();
  const playMutation = usePlayCoinflip();
  const queryClient = useQueryClient();

  const [bet, setBet] = useState("10");
  const [side, setSide] = useState<"heads" | "tails">("heads");
  
  // Animation states
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handlePlay = () => {
    if (!bet || parseFloat(bet) <= 0) return;
    
    setIsFlipping(true);
    setResult(null);

    playMutation.mutate({
      data: { bet: parseFloat(bet), side }
    }, {
      onSuccess: (data) => {
        // Fake delay for animation
        setTimeout(() => {
          setResult(data);
          setIsFlipping(false);
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        }, 2000);
      },
      onError: () => {
        setIsFlipping(false);
      }
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end gap-6 border-b-4 border-black pb-6">
        <Link href="/games">
          <button className="w-14 h-14 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform active:translate-y-0 active:shadow-none">
            <ArrowLeft size={28} className="text-black" />
          </button>
        </Link>
        <div>
          <h1 className="text-5xl md:text-6xl font-black font-display tracking-tighter text-black uppercase drop-shadow-[2px_2px_0px_rgba(255,210,0,0.5)] flex items-center gap-4">
            <Coins className="text-yellow-400" size={48} /> ОРЁЛ И РЕШКА
          </h1>
          <p className="text-xl font-bold uppercase mt-2 bg-yellow-300 inline-block px-3 py-1 border-2 border-black rotate-[-1deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
            ШАНС 50%. МНОЖИТЕЛЬ 2X.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
        {/* Game Area */}
        <div className="hype-panel bg-cyan-100 rounded-[40px] flex flex-col items-center justify-center p-12 min-h-[500px] relative overflow-hidden border-8 border-black">
          {/* Result Overlay */}
          {result && !isFlipping && (
            <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-md animate-in fade-in zoom-in duration-300 ${result.won ? 'bg-emerald-300/90' : 'bg-rose-400/90'}`}>
              <div className={`text-6xl md:text-8xl font-display font-black mb-4 uppercase text-black rotate-[-2deg] drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]`}>
                {result.won ? 'ПОБЕДА!' : 'СЛИВ'}
              </div>
              <div className="font-mono font-black text-4xl text-black bg-white px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-2">
                {result.won ? '+' : '-'}{result.won ? result.payout.toFixed(2) : result.bet.toFixed(2)} VEX
              </div>
              <button 
                className="hype-button mt-12 px-10 py-5 text-2xl bg-black text-white" 
                onClick={() => setResult(null)}
              >
                КРУТИТЬ ЕЩЕ 🔥
              </button>
            </div>
          )}

          {/* Coin 3D representation (CSS) */}
          <div className="perspective-1000 w-64 h-64 relative">
            <div 
              className={`w-full h-full relative transform-style-3d transition-transform duration-[2000ms] ease-in-out`}
              style={{
                transform: isFlipping ? `rotateY(${360 * 5}deg)` : (result?.result === 'tails' ? 'rotateY(180deg)' : 'rotateY(0deg)')
              }}
            >
              {/* Heads (Орёл) */}
              <div className="absolute inset-0 backface-hidden rounded-full bg-yellow-400 border-8 border-black flex items-center justify-center shadow-[inset_-10px_-10px_0px_rgba(0,0,0,0.2),10px_10px_0px_rgba(0,0,0,0.2)]">
                <div className="text-8xl font-display font-black text-black">О</div>
              </div>
              
              {/* Tails (Решка) - Rotated 180 */}
              <div className="absolute inset-0 backface-hidden rounded-full bg-white border-8 border-black flex items-center justify-center shadow-[inset_-10px_-10px_0px_rgba(0,0,0,0.1),10px_10px_0px_rgba(0,0,0,0.2)]" style={{ transform: 'rotateY(180deg)' }}>
                <div className="text-8xl font-display font-black text-black">Р</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col justify-center">
          <div className="hype-panel bg-white p-8 space-y-8 border-4 border-black">
            <div className="flex justify-between items-center bg-gray-100 p-4 border-2 border-black rounded-xl">
              <span className="text-black font-black uppercase text-sm">ДОСТУПНЫЙ БАЛАНС</span>
              <span className="font-mono font-black text-xl text-primary bg-white px-3 py-1 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                {user?.balance.toFixed(2)} VEX
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <button 
                  className={`flex-1 py-6 rounded-2xl font-black uppercase text-2xl border-4 transition-all ${side === 'heads' ? 'bg-yellow-400 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'bg-gray-100 border-gray-300 text-gray-400 hover:bg-gray-200 hover:border-gray-400'}`}
                  onClick={() => setSide('heads')}
                  disabled={isFlipping}
                >
                  ОРЁЛ
                </button>
                <button 
                  className={`flex-1 py-6 rounded-2xl font-black uppercase text-2xl border-4 transition-all ${side === 'tails' ? 'bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'bg-gray-100 border-gray-300 text-gray-400 hover:bg-gray-200 hover:border-gray-400'}`}
                  onClick={() => setSide('tails')}
                  disabled={isFlipping}
                >
                  РЕШКА
                </button>
              </div>

              <div className="bg-gray-50 p-6 border-4 border-black rounded-2xl">
                <label className="text-sm font-black uppercase text-black mb-3 block">РАЗМЕР СТАВКИ (VEX)</label>
                <div className="flex gap-3">
                  <input 
                    type="number" 
                    value={bet} 
                    onChange={(e) => setBet(e.target.value)} 
                    className="flex-1 bg-white border-4 border-black h-16 text-2xl font-mono font-black px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]"
                    disabled={isFlipping}
                  />
                  <button 
                    className="h-16 px-6 bg-black text-white font-black text-xl rounded-xl border-4 border-black hover:bg-gray-800 transition-colors active:translate-y-1" 
                    onClick={() => setBet((user?.balance || 0).toString())} 
                    disabled={isFlipping}
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>

            <button 
              className="hype-button w-full h-20 text-2xl"
              onClick={handlePlay}
              disabled={isFlipping || playMutation.isPending}
            >
              {isFlipping || playMutation.isPending ? <Loader2 className="animate-spin w-8 h-8 mx-auto" /> : "БРОСИТЬ МОНЕТУ 🎲"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
