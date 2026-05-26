import React, { useState } from "react";
import { useGetMe, useGetMyStats, useUpdateProfile, getGetMeQueryKey } from "@workspace/api-client-react";
import { User, Shield, Activity, Target, Loader2, ShoppingCart, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { data: user } = useGetMe();
  const { data: stats } = useGetMyStats();
  const updateProfileMutation = useUpdateProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    updateProfileMutation.mutate({
      data: { avatarUrl }
    }, {
      onSuccess: () => {
        toast({ title: "Успех", description: "Профиль ярко обновлен!" });
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Ошибка", description: err.message });
      }
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <header className="flex flex-col border-b-4 border-black pb-6 mb-8">
        <h1 className="text-5xl md:text-7xl font-black font-display tracking-tighter text-black uppercase drop-shadow-[2px_2px_0px_rgba(255,90,120,0.5)]">ПРОФИЛЬ</h1>
        <p className="text-xl font-bold uppercase mt-4 bg-cyan-300 inline-block px-4 py-2 border-2 border-black rotate-[-1deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] self-start text-black">
          ТВОЯ БАЗА ДАННЫХ И СТАТИСТИКА
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* User Info */}
        <div className="hype-panel bg-white rounded-[40px] flex flex-col items-center text-center relative overflow-hidden border-8 border-black">
          <div className="absolute top-0 w-full h-40 bg-gradient-to-br from-primary to-accent border-b-8 border-black" />
          
          <div className="w-40 h-40 mt-20 rounded-3xl border-8 border-black bg-white relative z-10 overflow-hidden flex items-center justify-center mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-3">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <User size={64} className="text-gray-300" />
            )}
          </div>

          <div className="px-8 w-full pb-10">
            <h2 className="text-4xl font-black font-display tracking-tighter uppercase text-black mb-2 leading-none">{user?.username}</h2>
            <div className="inline-block bg-black text-white font-bold text-sm px-4 py-1 rounded-full border-2 border-black mb-8 rotate-[-2deg]">
              {user?.email}
            </div>

            <div className="w-full space-y-6 text-left">
              {isEditing ? (
                <div className="bg-gray-100 p-6 rounded-2xl border-4 border-black">
                  <div className="mb-4">
                    <label className="text-sm font-black uppercase text-black mb-2 block">АВАТАР URL</label>
                    <input 
                      type="url"
                      value={avatarUrl}
                      onChange={e => setAvatarUrl(e.target.value)}
                      className="w-full bg-white border-4 border-black h-14 font-bold text-sm px-4 rounded-xl focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 py-4 font-black uppercase border-4 border-black rounded-xl bg-white hover:bg-gray-200 transition-colors" onClick={() => setIsEditing(false)}>
                      ОТМЕНА
                    </button>
                    <button className="hype-button flex-1 py-4 text-lg" onClick={handleSave} disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? <Loader2 className="animate-spin mx-auto" /> : "СОХРАНИТЬ"}
                    </button>
                  </div>
                </div>
              ) : (
                <button className="w-full py-4 text-lg font-black uppercase border-4 border-black rounded-xl bg-gray-100 hover:bg-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all" onClick={() => setIsEditing(true)}>
                  РЕДАКТИРОВАТЬ
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="hype-panel bg-purple-200 p-8 border-4 border-black flex flex-col relative overflow-hidden">
            <Shield size={120} className="absolute -bottom-10 -right-10 text-purple-300/50 -rotate-12 pointer-events-none" />
            <div className="hype-badge bg-black text-white self-start mb-6">КОЛЛЕКЦИЯ NFT</div>
            <div className="text-6xl font-black font-mono mt-auto relative z-10">{stats?.totalCards || 0}</div>
            <div className="font-bold text-black uppercase mt-2 relative z-10">АКТИВНЫХ КАРТ</div>
          </div>

          <div className="hype-panel bg-blue-200 p-8 border-4 border-black flex flex-col relative overflow-hidden">
            <ShoppingCart size={120} className="absolute -bottom-10 -right-10 text-blue-300/50 rotate-12 pointer-events-none" />
            <div className="hype-badge bg-black text-white self-start mb-6">МАРКЕТ</div>
            <div className="text-6xl font-black font-mono mt-auto relative z-10">{stats?.cardsSold || 0}</div>
            <div className="font-bold text-black uppercase mt-2 relative z-10">ПРОДАЖ НА РЫНКЕ</div>
          </div>

          <div className="hype-panel bg-yellow-300 p-8 border-4 border-black flex flex-col relative overflow-hidden">
            <Activity size={120} className="absolute -bottom-10 -right-10 text-yellow-400/50 -rotate-6 pointer-events-none" />
            <div className="hype-badge bg-black text-white self-start mb-6">АКТИВНОСТЬ</div>
            <div className="text-6xl font-black font-mono mt-auto relative z-10">{stats?.totalGamesPlayed || 0}</div>
            <div className="font-bold text-black uppercase mt-2 flex gap-4 relative z-10">
              <span className="bg-emerald-400 px-2 py-1 border-2 border-black rounded">W: {stats?.totalWon || 0}</span>
              <span className="bg-rose-400 px-2 py-1 border-2 border-black rounded text-white">L: {stats?.totalLost || 0}</span>
            </div>
          </div>

          <div className="hype-panel bg-emerald-200 p-8 border-4 border-black flex flex-col relative overflow-hidden">
            <Target size={120} className="absolute -bottom-10 -right-10 text-emerald-300/50 rotate-6 pointer-events-none" />
            <div className="hype-badge bg-black text-white self-start mb-6">ПРОФИТ</div>
            <div className="text-5xl lg:text-6xl font-black font-mono mt-auto relative z-10 truncate">
              {(stats?.netProfit || 0) > 0 ? '+' : ''}{(stats?.netProfit || 0).toFixed(0)}
            </div>
            <div className="font-bold text-black uppercase mt-2 relative z-10 bg-white inline-block self-start px-2 py-1 border-2 border-black rounded-lg">
              МАКС. ВИН: {(stats?.biggestWin || 0).toFixed(0)} VEX
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
