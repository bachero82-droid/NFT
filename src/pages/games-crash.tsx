import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStartCrash, useCashoutCrash, useGetMe, useGetGameHistory, getGetMeQueryKey, getGetGameHistoryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, TrendingUp, Loader2, Zap } from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts";
import { useToast } from "@/hooks/use-toast";

type GameState = "idle" | "betting" | "flying" | "crashed" | "cashedout";

interface ChartPoint {
  t: number;
  value: number;
}

export default function GamesCrash() {
  const { data: user } = useGetMe();
  const { data: history } = useGetGameHistory();
  const startMutation = useStartCrash();
  const cashoutMutation = useCashoutCrash();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [bet, setBet] = useState("50");
  const [gameState, setGameState] = useState<GameState>("idle");
  const [multiplier, setMultiplier] = useState(1.0);
  const [chartData, setChartData] = useState<ChartPoint[]>([{ t: 0, value: 1 }]);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [payout, setPayout] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const currentMultRef = useRef(1.0);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const calcMultiplier = (elapsedSec: number) => {
    return Math.round(Math.pow(Math.E, 0.06 * elapsedSec) * 100) / 100;
  };

  const startFlight = useCallback((cp: number, rid: string) => {
    setCrashPoint(cp);
    setRoundId(rid);
    setGameState("flying");
    setChartData([{ t: 0, value: 1 }]);
    startTimeRef.current = Date.now();
    currentMultRef.current = 1.0;

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const m = calcMultiplier(elapsed);
      currentMultRef.current = m;
      setMultiplier(m);
      setChartData(prev => [...prev.slice(-80), { t: Math.round(elapsed * 10) / 10, value: m }]);

      if (m >= cp) {
        stopInterval();
        setMultiplier(cp);
        setGameState("crashed");
        setResultMsg(`КРАШ x${cp.toFixed(2)}`);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetGameHistoryQueryKey() });
      }
    }, 100);
  }, [stopInterval, queryClient]);

  useEffect(() => () => stopInterval(), [stopInterval]);

  const handleStart = () => {
    const betVal = parseFloat(bet);
    if (!betVal || betVal <= 0) return;
    setGameState("betting");
    setResultMsg(null);
    setPayout(null);
    setMultiplier(1.0);
    setChartData([{ t: 0, value: 1 }]);

    startMutation.mutate({ data: { bet: betVal } }, {
      onSuccess: (data) => {
        startFlight(data.crashPoint, data.roundId);
      },
      onError: (err: any) => {
        setGameState("idle");
        toast({ variant: "destructive", title: "Ошибка", description: err?.data?.error || "Недостаточно средств" });
      }
    });
  };

  const handleCashout = () => {
    if (gameState !== "flying" || !roundId) return;
    stopInterval();
    const lockedMult = currentMultRef.current;
    setGameState("cashedout");

    cashoutMutation.mutate({ data: { roundId, multiplier: lockedMult } }, {
      onSuccess: (data) => {
        setPayout(data.payout);
        setResultMsg(`ЗАБРАЛ x${lockedMult.toFixed(2)}`);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetGameHistoryQueryKey() });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Ошибка при выводе" });
      }
    });
  };

  const reset = () => {
    setGameState("idle");
    setMultiplier(1.0);
    setCrashPoint(null);
    setRoundId(null);
    setResultMsg(null);
    setPayout(null);
    setChartData([{ t: 0, value: 1 }]);
  };

  const isCrashed = gameState === "crashed";
  const isCashedOut = gameState === "cashedout";
  const isFlying = gameState === "flying";
  const canBet = gameState === "idle" || isCrashed || isCashedOut;

  const multColor = isCrashed ? "text-red-600" : isCashedOut ? "text-emerald-500" : multiplier >= 2 ? "text-primary" : "text-black";
  const bgClass = isCrashed ? "bg-red-100" : isCashedOut ? "bg-emerald-100" : "bg-purple-100";
  const strokeColor = isCrashed ? "#dc2626" : isCashedOut ? "#10b981" : "#000000";

  const crashGames = history?.filter(g => g.gameType === "crash").slice(0, 5) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end gap-6 border-b-4 border-black pb-6">
        <Link href="/games">
          <button className="w-14 h-14 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform active:translate-y-0 active:shadow-none">
            <ArrowLeft size={28} className="text-black" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-5xl md:text-6xl font-black font-display tracking-tighter text-black uppercase drop-shadow-[2px_2px_0px_rgba(255,90,120,0.5)] flex items-center gap-4">
            <TrendingUp className="text-primary" size={48} /> КРАШ РАШ
          </h1>
          <p className="text-xl font-bold uppercase mt-2 bg-purple-300 inline-block px-3 py-1 border-2 border-black rotate-[-1deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
            ВЫЛЕТАЙ ВОВРЕМЯ. RTP ~97%
          </p>
        </div>
        <div className="font-mono font-black text-2xl text-black bg-white px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-2">
          БАЛАНС: {user?.balance?.toFixed(2)}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart + Multiplier */}
        <div className={`lg:col-span-2 hype-panel ${bgClass} rounded-[40px] p-8 flex flex-col min-h-[450px] relative border-8 border-black transition-colors duration-500`}>
          
          {/* Big multiplier display */}
          <div className="flex items-center justify-center mb-6 z-10 pt-4">
            <div className={`text-8xl md:text-[140px] font-display font-black tracking-tighter transition-colors duration-300 ${multColor} drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]`}>
              x{multiplier.toFixed(2)}
            </div>
          </div>

          {resultMsg && (
            <div className={`text-center font-black uppercase tracking-widest text-2xl md:text-3xl mb-4 bg-white py-2 px-6 rounded-xl border-4 border-black inline-block mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1 ${isCrashed ? 'text-red-600' : 'text-emerald-600'}`}>
              {resultMsg}{isCashedOut && payout != null ? ` → +${payout.toFixed(2)}` : ''}
            </div>
          )}

          {/* Chart */}
          <div className="flex-1 relative z-10 w-full mt-auto max-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: -20 }}>
                <XAxis dataKey="t" hide />
                <YAxis domain={[1, 'auto']} hide />
                {crashPoint && isCrashed && (
                  <ReferenceLine y={crashPoint} stroke="#dc2626" strokeWidth={4} strokeDasharray="8 8" />
                )}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={strokeColor}
                  strokeWidth={8}
                  dot={false}
                  isAnimationActive={false}
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div className="hype-panel bg-white p-8 space-y-6 border-4 border-black">
            <div className="bg-gray-50 p-6 border-4 border-black rounded-2xl">
              <label className="text-sm font-black uppercase text-black mb-3 block">РАЗМЕР СТАВКИ (VEX)</label>
              <div className="flex gap-3 mb-4">
                <input 
                  type="number" 
                  value={bet} 
                  onChange={(e) => setBet(e.target.value)} 
                  className="flex-1 bg-white border-4 border-black h-16 text-2xl font-mono font-black px-4 rounded-xl focus:outline-none shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]"
                  disabled={!canBet}
                />
              </div>
              <div className="flex gap-3">
                <button 
                  className="flex-1 h-12 bg-black text-white font-black text-xl rounded-xl border-4 border-black active:translate-y-1" 
                  onClick={() => setBet(String(Math.floor((user?.balance || 0) / 2)))} 
                  disabled={!canBet}
                >
                  ½
                </button>
                <button 
                  className="flex-1 h-12 bg-black text-white font-black text-xl rounded-xl border-4 border-black active:translate-y-1" 
                  onClick={() => setBet(String(Math.floor(user?.balance || 0)))} 
                  disabled={!canBet}
                >
                  MAX
                </button>
              </div>
            </div>

            {canBet ? (
              <button
                className="hype-button w-full h-20 text-2xl bg-primary flex items-center justify-center gap-3"
                onClick={handleStart}
                disabled={startMutation.isPending || gameState === "betting"}
              >
                {startMutation.isPending || gameState === "betting"
                  ? <Loader2 className="animate-spin w-8 h-8" />
                  : <><Zap size={28} className="fill-white" /> ПОГНАЛИ</>}
              </button>
            ) : isFlying ? (
              <button
                className="hype-button w-full h-24 text-3xl bg-emerald-400 text-black border-4 border-black animate-pulse shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                onClick={handleCashout}
                disabled={cashoutMutation.isPending}
              >
                {cashoutMutation.isPending ? <Loader2 className="animate-spin w-10 h-10 mx-auto" /> : `ЗАБРАТЬ x${multiplier.toFixed(2)}`}
              </button>
            ) : null}

            {(isCrashed || isCashedOut) && (
              <button className="w-full h-14 bg-white border-4 border-black font-black uppercase text-xl rounded-xl hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all" onClick={reset}>
                СЛЕДУЮЩИЙ РАУНД
              </button>
            )}
          </div>

          {/* History */}
          <div className="hype-panel bg-white p-6 border-4 border-black">
            <div className="hype-badge bg-black text-white mb-6 inline-block">ИСТОРИЯ КРАШЕЙ</div>
            <div className="space-y-3">
              {crashGames.length === 0 && <p className="font-bold uppercase text-gray-500 text-center py-4">НЕТ ИСТОРИИ</p>}
              {crashGames.map(g => (
                <div key={g.id} className="flex items-center justify-between font-mono font-black p-3 bg-gray-50 border-2 border-black rounded-lg">
                  <span className={g.result === "win" ? "text-emerald-500" : "text-red-500"}>
                    {g.result === "win" ? "WIN" : "CRASH"}
                  </span>
                  <span className="text-black bg-white px-2 py-0.5 border border-black rounded">x{g.multiplier?.toFixed(2) ?? "—"}</span>
                  <span className={g.result === "win" ? "text-emerald-500" : "text-gray-500"}>
                    {g.result === "win" ? `+${g.payout.toFixed(0)}` : `-${g.bet.toFixed(0)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
